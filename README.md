# Lethargic Gardens

A small, dependency-free storefront for Lethargic Gardens, rebuilt from the supplied Arena reference. The site keeps the reference's seed collections and copy, including the hemp-seed compliance note, and uses locally stored editorial imagery.

## Pages

- `/` — Seed storefront: house plants, vegetables, fruit and hemp seeds, with a browser-persisted bag.
- `/merch` — Merch shelf: tees, caps, totes, a hoodie, an enamel pin and a garden journal. Merch shares the same bag as seeds.
- `/order` — Online ordering / POS sync: a pickup order builder (name, phone, pickup day and time, items, notes) that issues order numbers and tickets, plus a POS sync panel. Orders land in a sync queue in the browser, then sync to the register. Connect Square, Clover, Toast, Shopify POS or a custom webhook by entering the POS API endpoint, location ID and key on the page. Until connected, sync runs in demo mode and logs every step. Orders can be exported as JSON or CSV, and tickets can be printed.

Source lives in `src/`; `bash build.sh` copies it into `public/`, matching the Vercel project's configured output directory. The editorial photos are kept in `src/images/` (house plants, vegetables, fruit, hemp and the hero) and copied into `public/images/` on every build, so a clean checkout still ships with all four collection images in the shop-section order.

## Build and preview

```sh
bash build.sh
python3 -m http.server 4173 --bind 0.0.0.0 --directory public
```

The build outputs a static site into `public/`, matching the Vercel project's configured output directory. Product-bag contents persist in the current browser. Checkout and newsletter delivery are intentionally called out as not connected; no customer or order data is sent.
