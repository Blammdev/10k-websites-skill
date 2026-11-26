/* Lethargic Gardens: pickup ordering + POS sync queue.
   Runs after main.js (which owns the catalog and the bag).
   Orders and POS settings persist in this browser only until a real POS is connected. */

(function () {
  const form = document.querySelector("[data-order-form]");
  if (!form) return;

  const orderMoney = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
  const ordersKey = "lethargic-gardens-orders-v1";
  const posKey = "lethargic-gardens-pos-v1";
  const logKey = "lethargic-gardens-sync-log-v1";
  const counterKey = "lethargic-gardens-order-counter-v1";

  const categoryLabels = {
    "house-plants": "House plants",
    vegetables: "Vegetables",
    fruit: "Fruit",
    "hemp-seeds": "Hemp seeds",
    merch: "Merch",
  };

  const itemsElement = document.querySelector("[data-order-items]");
  const totalElement = document.querySelector("[data-order-total]");
  const messageElement = document.querySelector("[data-order-message]");
  const daySelect = document.querySelector("[data-order-day]");
  const ticket = document.querySelector("[data-ticket]");
  const queueList = document.querySelector("[data-queue-list]");
  const syncLogElement = document.querySelector("[data-sync-log]");
  const posStatus = document.querySelector("[data-pos-status]");

  const sourceCatalog = window.LG_CATALOG || (typeof catalog !== "undefined" ? catalog : {});
  const sourceProducts = window.LG_PRODUCTS || (typeof productById !== "undefined" ? productById : new Map());

  function readJson(key, fallback) {
    try {
      const value = JSON.parse(localStorage.getItem(key) || "null");
      return value === null || value === undefined ? fallback : value;
    } catch {
      return fallback;
    }
  }

  function writeJson(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage unavailable: the queue still works in memory for this visit.
    }
  }

  let orders = readJson(ordersKey, []);
  if (!Array.isArray(orders)) orders = [];
  let posConfig = readJson(posKey, { provider: "", endpoint: "", location: "", key: "" });
  let syncLog = readJson(logKey, []);
  if (!Array.isArray(syncLog)) syncLog = [];
  let draft = {};

  function makeEl(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }

  function logSync(message) {
    const stamp = new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    syncLog.unshift({ stamp, message });
    syncLog = syncLog.slice(0, 50);
    writeJson(logKey, syncLog);
    renderLog();
  }

  function renderLog() {
    syncLogElement.replaceChildren();
    if (syncLog.length === 0) {
      syncLogElement.append(makeEl("li", "", "No sync activity yet. Place an order, then sync when you are ready."));
      return;
    }
    syncLog.forEach((entry) => {
      const item = makeEl("li");
      item.append(makeEl("strong", "", entry.stamp), document.createTextNode(` — ${entry.message}`));
      syncLogElement.append(item);
    });
  }

  function renderDays() {
    const days = [];
    const now = new Date();
    for (let offset = 0; offset < 3; offset += 1) {
      const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset);
      const label = offset === 0 ? "Today" : offset === 1 ? "Tomorrow" : "Day after tomorrow";
      const pretty = date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
      days.push({ value: `${label} · ${pretty}`, label: `${label} (${pretty})` });
    }
    daySelect.replaceChildren();
    days.forEach((day) => {
      const option = makeEl("option", "", day.label);
      option.value = day.value;
      daySelect.append(option);
    });
  }

  function draftTotal() {
    return Object.entries(draft).reduce((sum, [id, quantity]) => {
      const product = sourceProducts.get(id);
      return product ? sum + product.price * quantity : sum;
    }, 0);
  }

  function renderPicker() {
    itemsElement.replaceChildren();
    Object.entries(sourceCatalog).forEach(([key, products]) => {
      itemsElement.append(makeEl("p", "order-items__group", categoryLabels[key] || key));
      products.forEach((product) => {
        const quantity = draft[product.id] || 0;
        const row = makeEl("div", "order-item");
        const mark = makeEl("span", "order-item__mark", product.symbol);
        mark.setAttribute("aria-hidden", "true");
        const info = makeEl("div");
        info.append(
          makeEl("p", "order-item__name", product.name),
          makeEl("p", "order-item__price", `${orderMoney.format(product.price)} each`),
        );
        const stepper = makeEl("div", "order-item__stepper");
        const decrease = makeEl("button", "", "−");
        decrease.type = "button";
        decrease.dataset.step = "-1";
        decrease.dataset.productId = product.id;
        decrease.setAttribute("aria-label", `Remove one ${product.name}`);
        const qty = makeEl("span", "order-item__qty", String(quantity));
        qty.setAttribute("aria-label", `Quantity ${quantity}`);
        const increase = makeEl("button", "", "+");
        increase.type = "button";
        increase.dataset.step = "1";
        increase.dataset.productId = product.id;
        increase.setAttribute("aria-label", `Add one ${product.name}`);
        stepper.append(decrease, qty, increase);
        const line = makeEl("span", "order-item__line", orderMoney.format(product.price * quantity));
        row.append(mark, info, stepper, line);
        itemsElement.append(row);
      });
    });
    totalElement.textContent = orderMoney.format(draftTotal());
  }

  itemsElement.addEventListener("click", (event) => {
    const button = event.target.closest("[data-step]");
    if (!button) return;
    const id = button.dataset.productId;
    const next = (draft[id] || 0) + Number(button.dataset.step);
    if (next <= 0) delete draft[id];
    else draft[id] = Math.min(next, 99);
    messageElement.textContent = "";
    renderPicker();
  });

  function orderLines(order) {
    return order.items.map((item) => {
      const product = sourceProducts.get(item.id);
      return { name: product ? product.name : item.id, quantity: item.quantity, price: item.price };
    });
  }

  function renderQueue() {
    queueList.replaceChildren();
    if (orders.length === 0) {
      queueList.append(makeEl("p", "queue-empty", "No orders yet. Place a pickup order above and it will wait here for sync."));
      return;
    }
    [...orders].reverse().forEach((order) => {
      const item = makeEl("article", "queue-item");
      const top = makeEl("div", "queue-item__top");
      top.append(makeEl("span", "queue-item__number", order.number));
      const chip = makeEl("span", `status-chip status-chip--${order.status}`, order.status);
      top.append(chip);
      const meta = makeEl("p", "queue-item__meta", `${order.name} · ${order.pickup} · ${order.items.reduce((n, line) => n + line.quantity, 0)} items`);
      const total = makeEl("span", "queue-item__total", orderMoney.format(order.total));
      item.append(top, meta, total);
      queueList.append(item);
    });
  }

  function renderTicket(order) {
    ticket.hidden = false;
    document.querySelector("[data-ticket-number]").textContent = order.number;
    const status = document.querySelector("[data-ticket-status]");
    status.textContent = order.status === "synced" ? "Synced to POS" : "Queued for POS";
    status.className = `status-chip status-chip--${order.status}`;

    const meta = document.querySelector("[data-ticket-meta]");
    meta.replaceChildren();
    [
      ["Name", order.name],
      ["Phone", order.phone],
      ["Pickup", order.pickup],
      ["Placed", new Date(order.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })],
    ].forEach(([term, value]) => {
      const wrap = makeEl("div");
      wrap.append(makeEl("dt", "", term), makeEl("dd", "", value));
      meta.append(wrap);
    });
    if (order.notes) {
      const wrap = makeEl("div");
      wrap.append(makeEl("dt", "", "Notes"), makeEl("dd", "", order.notes));
      meta.append(wrap);
    }

    const lines = document.querySelector("[data-ticket-lines]");
    lines.replaceChildren();
    orderLines(order).forEach((line) => {
      const row = makeEl("li");
      row.append(
        makeEl("span", "", `${line.quantity} × ${line.name}`),
        makeEl("span", "", orderMoney.format(line.price * line.quantity)),
      );
      lines.append(row);
    });
    document.querySelector("[data-ticket-total]").textContent = orderMoney.format(order.total);
    if (typeof ticket.scrollIntoView === "function") ticket.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  const nameInput = form.elements.namedItem("name");
  const phoneInput = form.elements.namedItem("phone");
  const dayInput = form.elements.namedItem("day");
  const timeInput = form.elements.namedItem("time");
  const notesInput = form.elements.namedItem("notes");

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();
    const entries = Object.entries(draft).filter(([, quantity]) => quantity > 0);
    if (!name) {
      messageElement.textContent = "Add your name so we know whose order to pack.";
      nameInput.focus();
      return;
    }
    if (!phone) {
      messageElement.textContent = "Add a phone number so we can text you when it is ready.";
      phoneInput.focus();
      return;
    }
    if (entries.length === 0) {
      messageElement.textContent = "Pick at least one item for your order.";
      return;
    }

    const counter = (readJson(counterKey, 1000) || 1000) + 1;
    writeJson(counterKey, counter);
    const order = {
      number: `LG-${counter}`,
      name,
      phone,
      pickup: `${dayInput.value} · ${timeInput.value}`,
      notes: notesInput.value.trim(),
      items: entries.map(([id, quantity]) => ({ id, quantity, price: sourceProducts.get(id).price })),
      total: draftTotal(),
      status: "queued",
      createdAt: new Date().toISOString(),
    };
    orders.push(order);
    writeJson(ordersKey, orders);
    draft = {};
    form.reset();
    renderDays();
    renderPicker();
    renderQueue();
    renderTicket(order);
    logSync(`Order ${order.number} placed for ${order.name}, queued for POS sync.`);
    messageElement.textContent = "";
  });

  document.querySelector("[data-print-ticket]").addEventListener("click", () => window.print());
  document.querySelector("[data-new-order]").addEventListener("click", () => {
    ticket.hidden = true;
    document.querySelector("#order-builder").scrollIntoView?.({ behavior: "smooth" });
    nameInput.focus();
  });

  /* POS connection */

  const providerSelect = document.querySelector("#pos-provider");
  const endpointInput = document.querySelector("#pos-endpoint");
  const locationInput = document.querySelector("#pos-location");
  const keyInput = document.querySelector("#pos-key");

  function loadPosConfig() {
    providerSelect.value = posConfig.provider || "";
    endpointInput.value = posConfig.endpoint || "";
    locationInput.value = posConfig.location || "";
    keyInput.value = posConfig.key || "";
    renderPosStatus();
  }

  function renderPosStatus() {
    if (!posConfig.provider) {
      posStatus.textContent = "No POS connected yet. Orders stay in this browser until you connect one.";
      return;
    }
    const label = providerSelect.options[providerSelect.selectedIndex]?.textContent || posConfig.provider;
    posStatus.textContent = `Connected to ${label}${posConfig.location ? ` · Location ${posConfig.location}` : ""}. Sync pushes queued orders to the register.`;
  }

  document.querySelector("[data-pos-save]").addEventListener("click", () => {
    posConfig = {
      provider: providerSelect.value,
      endpoint: endpointInput.value.trim(),
      location: locationInput.value.trim(),
      key: keyInput.value,
    };
    writeJson(posKey, posConfig);
    renderPosStatus();
    logSync(posConfig.provider ? `POS connection saved (${posConfig.provider}).` : "POS disconnected. Orders stay in this browser.");
  });

  document.querySelector("[data-pos-test]").addEventListener("click", async () => {
    const endpoint = endpointInput.value.trim();
    if (!posConfig.provider) {
      logSync("Connection test skipped: choose a POS provider first.");
      return;
    }
    if (!endpoint) {
      logSync("Connection test skipped: add the POS API endpoint URL first.");
      return;
    }
    logSync(`Testing connection to ${endpoint} …`);
    try {
      const controller = new AbortController();
      const timer = window.setTimeout(() => controller.abort(), 6000);
      await fetch(endpoint, { method: "GET", mode: "no-cors", signal: controller.signal });
      window.clearTimeout(timer);
      logSync(`Connection test reached ${endpoint}. Browser security may still block the actual sync POST; use a server relay for live POS sync.`);
    } catch {
      logSync(`Connection test could not reach ${endpoint}. Check the URL and that the POS allows browser requests.`);
    }
  });

  document.querySelector("[data-sync-now]").addEventListener("click", async () => {
    const queued = orders.filter((order) => order.status === "queued");
    if (queued.length === 0) {
      logSync("Sync requested: nothing queued. All orders are already synced.");
      return;
    }
    if (!posConfig.provider || !posConfig.endpoint) {
      queued.forEach((order) => { order.status = "synced"; });
      writeJson(ordersKey, orders);
      renderQueue();
      logSync(`Demo sync complete: ${queued.length} order${queued.length === 1 ? "" : "s"} marked synced locally. Connect a POS to push them to the register.`);
      return;
    }
    logSync(`Syncing ${queued.length} order${queued.length === 1 ? "" : "s"} to ${posConfig.endpoint} …`);
    for (const order of queued) {
      try {
        const controller = new AbortController();
        const timer = window.setTimeout(() => controller.abort(), 8000);
        const response = await fetch(posConfig.endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...(posConfig.key ? { Authorization: `Bearer ${posConfig.key}` } : {}) },
          body: JSON.stringify({ location_id: posConfig.location || undefined, order }),
          signal: controller.signal,
        });
        window.clearTimeout(timer);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        order.status = "synced";
        logSync(`Order ${order.number} synced to POS.`);
      } catch (error) {
        order.status = "failed";
        logSync(`Order ${order.number} failed to sync (${error.message || "network error"}). It stays queued for a retry.`);
      }
    }
    writeJson(ordersKey, orders);
    renderQueue();
  });

  function download(filename, content, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  document.querySelector("[data-export-json]").addEventListener("click", () => {
    download("lethargic-gardens-orders.json", JSON.stringify(orders, null, 2), "application/json");
    logSync(`Exported ${orders.length} orders as JSON.`);
  });

  document.querySelector("[data-export-csv]").addEventListener("click", () => {
    const rows = [["number", "name", "phone", "pickup", "items", "total", "status", "created"]];
    orders.forEach((order) => {
      rows.push([
        order.number,
        order.name,
        order.phone,
        order.pickup,
        order.items.map((line) => `${line.quantity}x ${line.id}`).join("; "),
        order.total.toFixed(2),
        order.status,
        order.createdAt,
      ]);
    });
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
    download("lethargic-gardens-orders.csv", csv, "text/csv");
    logSync(`Exported ${orders.length} orders as CSV.`);
  });

  document.querySelector("[data-clear-synced]").addEventListener("click", () => {
    const before = orders.length;
    orders = orders.filter((order) => order.status !== "synced");
    writeJson(ordersKey, orders);
    renderQueue();
    logSync(`Cleared ${before - orders.length} synced orders from the queue.`);
  });

  renderDays();
  renderPicker();
  renderQueue();
  renderLog();
  loadPosConfig();
})();
