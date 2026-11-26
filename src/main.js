const catalog = {
  "house-plants": [
    { id: "monstera-deliciosa", symbol: "🪴", tag: "Low light", name: "Monstera Deliciosa", description: "Split leaves, big personality", detail: "14 to 28 days", price: 6.5 },
    { id: "snake-plant", symbol: "🌿", tag: "Beginner", name: "Snake Plant", description: "Nearly indestructible", detail: "21 to 35 days", price: 5 },
    { id: "spider-plant", symbol: "🌱", tag: "Pet friendly", name: "Spider Plant", description: "Cascading baby plantlets", detail: "10 to 21 days", price: 4.5 },
    { id: "aloe-vera", symbol: "🌵", tag: "Bright light", name: "Aloe Vera", description: "Soothing succulent gel", detail: "14 to 30 days", price: 5.5 },
    { id: "maidenhair-fern", symbol: "🍃", tag: "Moody", name: "Maidenhair Fern", description: "Delicate, humidity loving", detail: "30 to 60 days", price: 6 },
    { id: "peace-lily", symbol: "🤍", tag: "Flowering", name: "Peace Lily", description: "White blooms in shade", detail: "21 to 40 days", price: 7 }
  ],
  vegetables: [
    { id: "black-krim-tomato", symbol: "🍅", tag: "Heirloom", name: "Black Krim Tomato", description: "Smoky, deep mahogany fruit", detail: "70 to 85 days", price: 3.9 },
    { id: "purple-dragon-carrot", symbol: "🥕", tag: "Heirloom", name: "Purple Dragon Carrot", description: "Violet skin, orange heart", detail: "70 to 80 days", price: 3.5 },
    { id: "lacinato-kale", symbol: "🥬", tag: "Cool season", name: "Lacinato Kale", description: "Dinosaur kale, frost sweetened", detail: "55 to 65 days", price: 3.2 },
    { id: "jalapeno-pepper", symbol: "🌶️", tag: "Spicy", name: "Jalapeño Pepper", description: "Warm, never reckless", detail: "70 to 80 days", price: 3.8 },
    { id: "lemon-cucumber", symbol: "🥒", tag: "Prolific", name: "Lemon Cucumber", description: "Round, crisp and mild", detail: "60 to 70 days", price: 3.4 },
    { id: "golden-sweet-corn", symbol: "🌽", tag: "Warm season", name: "Sweet Corn ‘Golden’", description: "Summer on a cob", detail: "75 to 90 days", price: 3.6 }
  ],
  fruit: [
    { id: "alpine-strawberry", symbol: "🍓", tag: "Perennial", name: "Alpine Strawberry", description: "Tiny, intensely sweet", detail: "90 to 120 days", price: 4.2 },
    { id: "sugar-baby-watermelon", symbol: "🍉", tag: "Warm season", name: "Sugar Baby Watermelon", description: "Compact, ice-box size", detail: "75 to 85 days", price: 3.9 },
    { id: "charentais-melon", symbol: "🍈", tag: "Heirloom", name: "Charentais Melon", description: "Perfumed orange flesh", detail: "80 to 90 days", price: 4 },
    { id: "meyer-lemon", symbol: "🍋", tag: "Long game", name: "Meyer Lemon", description: "Patio tree, fragrant blooms", detail: "2 to 3 years", price: 7.5 },
    { id: "blueberry-bush", symbol: "🫐", tag: "Perennial", name: "Blueberry Bush", description: "Acid-loving, bird-loved", detail: "2 to 3 years", price: 6.8 },
    { id: "ground-cherry", symbol: "🟠", tag: "Curious", name: "Ground Cherry", description: "Husked golden pineapple-ish treats", detail: "70 to 80 days", price: 3.7 }
  ],
  "hemp-seeds": [
    { id: "sloth-og", symbol: "🍃", tag: "Indica-dom", name: "Sloth OG", description: "Heavy, calming hybrid", detail: "Pack of 5 · Feminized", price: 38 },
    { id: "slowpoke-haze", symbol: "🌿", tag: "Sativa", name: "Slowpoke Haze", description: "Bright, long-flowering sativa", detail: "Pack of 5 · Feminized", price: 42 },
    { id: "lazy-sunday-auto", symbol: "☁️", tag: "Autoflower", name: "Lazy Sunday Auto", description: "Easygoing autoflower", detail: "Pack of 5 · Auto", price: 35 },
    { id: "midnight-moss", symbol: "🌑", tag: "Indica", name: "Midnight Moss", description: "Earthy and deep, dark foliage", detail: "Pack of 5 · Feminized", price: 40 },
    { id: "couch-cake", symbol: "🍰", tag: "Hybrid", name: "Couch Cake", description: "Sweet, dessert-leaning hybrid", detail: "Pack of 5 · Feminized", price: 45 },
    { id: "dozy-diesel", symbol: "⛽", tag: "Hybrid", name: "Dozy Diesel", description: "Classic sour, mellow finish", detail: "Pack of 5 · Regular", price: 39 }
  ],
  merch: [
    { id: "plant-then-pause-tee", symbol: "👕", tag: "Heavyweight", name: "Plant Then Pause Tee", description: "Forest green, boxy fit", detail: "Sizes S to 3XL", price: 28 },
    { id: "slow-garden-cap", symbol: "🧢", tag: "One size", name: "Slow Garden Cap", description: "Embroidered sprout mark", detail: "Adjustable strap", price: 24 },
    { id: "seed-packet-tote", symbol: "👜", tag: "Canvas", name: "Seed Packet Tote", description: "Carries twelve packets, easily", detail: "16 oz canvas", price: 18 },
    { id: "grow-slowly-hoodie", symbol: "🧥", tag: "Brushed fleece", name: "Grow Slowly Hoodie", description: "Oat heather, kangaroo pocket", detail: "Sizes S to 3XL", price: 46 },
    { id: "sprout-enamel-pin", symbol: "📌", tag: "Hard enamel", name: "Sprout Enamel Pin", description: "Gold sprout on forest green", detail: "1.25 inch", price: 12 },
    { id: "garden-journal", symbol: "📓", tag: "Lay-flat", name: "Garden Journal", description: "Dated pages for slow seasons", detail: "96 pages", price: 16 }
  ]
};

const allProducts = Object.values(catalog).flat();
const productById = new Map(allProducts.map((product) => [product.id, product]));

// Exposed for the order page (order.js) so pickup ordering uses this same catalog.
window.LG_CATALOG = catalog;
window.LG_PRODUCTS = productById;
const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const storageKey = "lethargic-gardens-bag-v1";

function makeElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function renderProductCard(product) {
  const card = makeElement("article", "product-card");
  const top = makeElement("div", "product-card__top");
  const mark = makeElement("span", "product-card__mark", product.symbol);
  mark.setAttribute("aria-hidden", "true");
  const tag = makeElement("span", "product-card__tag", product.tag);
  top.append(mark, tag);

  const name = makeElement("h3", "", product.name);
  const description = makeElement("p", "product-card__description", product.description);
  const detail = makeElement("div", "product-card__meta");
  const clock = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  clock.setAttribute("viewBox", "0 0 20 20");
  clock.setAttribute("fill", "none");
  clock.setAttribute("aria-hidden", "true");
  const clockCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  clockCircle.setAttribute("cx", "10");
  clockCircle.setAttribute("cy", "10");
  clockCircle.setAttribute("r", "7");
  clockCircle.setAttribute("stroke", "currentColor");
  clockCircle.setAttribute("stroke-width", "1.2");
  const clockHands = document.createElementNS("http://www.w3.org/2000/svg", "path");
  clockHands.setAttribute("d", "M10 6v4l2.6 1.7");
  clockHands.setAttribute("stroke", "currentColor");
  clockHands.setAttribute("stroke-width", "1.2");
  clockHands.setAttribute("stroke-linecap", "round");
  clock.append(clockCircle, clockHands);
  detail.append(clock, makeElement("span", "", product.detail));

  const bottom = makeElement("div", "product-card__bottom");
  const price = makeElement("span", "product-card__price", money.format(product.price));
  const add = makeElement("button", "product-card__add");
  add.type = "button";
  add.dataset.add = product.id;
  add.setAttribute("aria-label", `Add ${product.name} to your bag for ${money.format(product.price)}`);
  const plus = makeElement("span", "", "+");
  plus.setAttribute("aria-hidden", "true");
  add.append(plus, makeElement("span", "", "Add"));
  bottom.append(price, add);
  card.append(top, name, description, detail, bottom);
  return card;
}

function renderCatalog() {
  document.querySelectorAll("[data-product-grid]").forEach((grid) => {
    const products = catalog[grid.dataset.productGrid] || [];
    grid.replaceChildren(...products.map(renderProductCard));
  });
}

function loadBag() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || "{}");
    if (!saved || typeof saved !== "object" || Array.isArray(saved)) return {};
    return Object.fromEntries(
      Object.entries(saved)
        .filter(([id, quantity]) => productById.has(id) && Number.isInteger(quantity) && quantity > 0 && quantity < 100)
        .map(([id, quantity]) => [id, quantity])
    );
  } catch {
    return {};
  }
}

let bag = loadBag();
const cartDrawer = document.querySelector("[data-cart-drawer]");
const cartBackdrop = document.querySelector("[data-cart-backdrop]");
const cartItemsElement = document.querySelector("[data-cart-items]");
const cartCountElement = document.querySelector("[data-cart-count]");
const cartTotalElement = document.querySelector("[data-cart-total]");
const toast = document.querySelector("[data-toast]");
let toastTimeout;
let closeDrawerTimeout;
let lastCartTrigger = null;

function saveBag() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(bag));
  } catch {
    // The bag still works in memory when browser storage is unavailable.
  }
}

function getBagItems() {
  return Object.entries(bag)
    .map(([id, quantity]) => ({ product: productById.get(id), quantity }))
    .filter((item) => item.product);
}

function bagQuantity() {
  return Object.values(bag).reduce((sum, quantity) => sum + quantity, 0);
}

function renderBag() {
  const items = getBagItems();
  const count = bagQuantity();
  cartCountElement.textContent = String(count);
  cartCountElement.setAttribute("aria-label", `${count} ${count === 1 ? "item" : "items"} in bag`);
  cartItemsElement.replaceChildren();

  if (items.length === 0) {
    const empty = makeElement("div", "cart-empty");
    const flower = makeElement("span", "cart-empty__icon", "✳");
    flower.setAttribute("aria-hidden", "true");
    empty.append(
      flower,
      makeElement("h3", "", "Nothing in your bag yet."),
      makeElement("p", "", "Seeds like their space. Take a slow look around and find a little something to grow."),
    );
    const browse = makeElement("a", "", "Browse the seed shelves ↗");
    browse.href = "#collections";
    browse.dataset.closeCart = "";
    empty.append(browse);
    cartItemsElement.append(empty);
    cartTotalElement.textContent = money.format(0);
    return;
  }

  const fragment = document.createDocumentFragment();
  let subtotal = 0;
  items.forEach(({ product, quantity }) => {
    subtotal += product.price * quantity;
    const row = makeElement("article", "cart-item");
    const mark = makeElement("span", "cart-item__mark", product.symbol);
    mark.setAttribute("aria-hidden", "true");
    const info = makeElement("div", "cart-item__info");
    info.append(
      makeElement("h3", "cart-item__name", product.name),
      makeElement("p", "cart-item__price", `${money.format(product.price)} each`)
    );
    const controls = makeElement("div", "cart-item__controls");
    const decrease = makeElement("button", "", "−");
    decrease.type = "button";
    decrease.dataset.change = "-1";
    decrease.dataset.productId = product.id;
    decrease.setAttribute("aria-label", `Remove one ${product.name}`);
    const quantityLabel = makeElement("span", "cart-item__quantity", String(quantity));
    quantityLabel.setAttribute("aria-label", `Quantity ${quantity}`);
    const increase = makeElement("button", "", "+");
    increase.type = "button";
    increase.dataset.change = "1";
    increase.dataset.productId = product.id;
    increase.setAttribute("aria-label", `Add one ${product.name}`);
    controls.append(decrease, quantityLabel, increase);
    info.append(controls);

    const total = makeElement("span", "cart-item__total", money.format(product.price * quantity));
    row.append(mark, info, total);
    fragment.append(row);
  });
  cartItemsElement.append(fragment);
  cartTotalElement.textContent = money.format(subtotal);
}

function announce(message, includeBagLink = true) {
  window.clearTimeout(toastTimeout);
  toast.replaceChildren(document.createTextNode(message));
  if (includeBagLink) {
    const viewBag = makeElement("button", "", "View bag ↗");
    viewBag.type = "button";
    viewBag.dataset.openCart = "";
    viewBag.setAttribute("aria-controls", "cart-drawer");
    viewBag.setAttribute("aria-expanded", "false");
    toast.append(viewBag);
  }
  toast.classList.add("is-visible");
  toastTimeout = window.setTimeout(() => toast.classList.remove("is-visible"), 4200);
}

function addToBag(productId) {
  const product = productById.get(productId);
  if (!product) return;
  bag[productId] = (bag[productId] || 0) + 1;
  saveBag();
  renderBag();
  const addButton = document.querySelector(`[data-add="${CSS.escape(productId)}"]`);
  if (addButton) {
    addButton.classList.add("is-added");
    window.setTimeout(() => addButton.classList.remove("is-added"), 900);
  }
  announce(`${product.name} added to your bag.`);
}

function focusableInDrawer() {
  return [...cartDrawer.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])')]
    .filter((element) => !element.hasAttribute("hidden"));
}

function openCart(trigger = document.querySelector("[data-open-cart]")) {
  window.clearTimeout(closeDrawerTimeout);
  lastCartTrigger = trigger;
  cartBackdrop.hidden = false;
  cartDrawer.hidden = false;
  document.body.classList.add("cart-open");
  renderBag();
  requestAnimationFrame(() => {
    cartBackdrop.classList.add("is-visible");
    cartDrawer.classList.add("is-open");
    document.querySelectorAll("[data-open-cart]").forEach((button) => button.setAttribute("aria-expanded", "true"));
    cartDrawer.querySelector("[data-close-cart]")?.focus();
  });
}

function closeCart() {
  if (cartDrawer.hidden) return;
  cartDrawer.classList.remove("is-open");
  cartBackdrop.classList.remove("is-visible");
  document.body.classList.remove("cart-open");
  document.querySelectorAll("[data-open-cart]").forEach((button) => button.setAttribute("aria-expanded", "false"));
  closeDrawerTimeout = window.setTimeout(() => {
    cartDrawer.hidden = true;
    cartBackdrop.hidden = true;
  }, 310);
  if (lastCartTrigger && document.contains(lastCartTrigger)) lastCartTrigger.focus();
}

function changeQuantity(productId, delta) {
  if (!productById.has(productId)) return;
  const next = (bag[productId] || 0) + delta;
  if (next <= 0) delete bag[productId];
  else bag[productId] = next;
  saveBag();
  renderBag();
}

renderCatalog();
renderBag();

document.addEventListener("click", (event) => {
  const addButton = event.target.closest("[data-add]");
  if (addButton) {
    addToBag(addButton.dataset.add);
    return;
  }

  const openButton = event.target.closest("[data-open-cart]");
  if (openButton) {
    openCart(openButton);
    return;
  }

  if (event.target.closest("[data-close-cart]") || event.target.closest("[data-cart-backdrop]")) {
    closeCart();
    return;
  }

  const quantityButton = event.target.closest("[data-change]");
  if (quantityButton) {
    changeQuantity(quantityButton.dataset.productId, Number(quantityButton.dataset.change));
  }
});

const menuToggle = document.querySelector("[data-menu-toggle]");
const mobileNav = document.querySelector("[data-mobile-nav]");
menuToggle.addEventListener("click", () => {
  const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isExpanded));
  menuToggle.setAttribute("aria-label", isExpanded ? "Open menu" : "Close menu");
  mobileNav.hidden = isExpanded;
});
mobileNav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    mobileNav.hidden = true;
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open menu");
  });
});

document.querySelector("[data-checkout]").addEventListener("click", () => {
  const note = document.querySelector("[data-cart-note]");
  note.textContent = "Online checkout isn’t connected yet. For pickup orders, head to the order page.";
  announce("Checkout isn’t connected yet. For pickup, try the order page.", false);
});

document.querySelector("[data-newsletter-form]").addEventListener("submit", (event) => {
  event.preventDefault();
  const message = document.querySelector("[data-newsletter-message]");
  message.textContent = "Thanks for the note. Newsletter delivery isn’t connected yet, so this address hasn’t been sent.";
  event.currentTarget.reset();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeCart();
    if (!mobileNav.hidden) {
      mobileNav.hidden = true;
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Open menu");
    }
  }

  if (event.key === "Tab" && !cartDrawer.hidden) {
    const focusable = focusableInDrawer();
    if (focusable.length === 0) {
      event.preventDefault();
      cartDrawer.focus();
      return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
});
