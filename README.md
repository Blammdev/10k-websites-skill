# Costello Painting Inc.

Marketing site for Costello Painting Inc., a painting and remodeling company in Mulliken, Michigan.

Rebuilt from the supplied Arena reference and shipped as a dependency-free static site. All copy,
contact details, services, FAQ answers and gallery captions match the reference. Photography uses
the client's own project photos, stored locally in `src/images/`.

## Pages

- `/` — Single-page site: hero, about, services accordion, filterable work gallery with lightbox,
  four-step process, FAQ and a quote request form that composes an email to
  `costellopaintinginc@yahoo.com`.

Contact details: (901) 210-3709 · costellopaintinginc@yahoo.com · 10623 Boyer Road, Mulliken, MI 48861.

## Build and preview

```sh
bash build.sh
python3 -m http.server 4173 --bind 0.0.0.0 --directory public
```

`build.sh` copies `src/` into `public/`, which is the Vercel project's configured output directory.
`vercel.json` pins the build command and output directory so the static site deploys without a
framework preset.

The quote form hands the message to the visitor's email app (no server, no stored customer data).
