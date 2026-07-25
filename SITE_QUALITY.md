# Open AIDoc site quality standard

This standard turns the GA findings into release gates. Its purpose is to
prevent avoidable 404 traffic, restore search discoverability, and keep
measurement trustworthy as upstream documentation is synchronized.

## Release gates

1. `pnpm docs:check` must pass before deployment.
2. Internal dead links are build-breaking. The only exception is
   `localhost` URLs used as runnable documentation examples.
3. Critical entry routes must render: the site home, every language home,
   and the Kotlin, Ktor, KMP, and Koog entry pages.
4. `robots.txt` must allow crawling and declare the production sitemap.
5. Every content page must render a canonical URL and an `x-default`
   language alternate. Existing translations must be linked with `hreflang`.
6. Page titles belong in `<head>` only. Writerside `<title>` metadata must
   become headings or section labels and must never render inside `<body>`.
7. Google Analytics must load once on every critical page with measurement
   ID `G-HLCXSW4HH1`.

## Kotlin CN satellite

1. `pnpm kotlin-cn:check` must pass before publishing the satellite.
2. Link rewriting happens during Markdown compilation. Static HTML must not
   depend on client-side JavaScript to convert `/kotlin`, `/kmp`, or `/koog`
   routes into the satellite's `/docs/*` layout.
3. The Kotlin, Kotlin Multiplatform, and Koog entry pages require
   page-specific titles and descriptions.
4. Canonical URLs, sitemap generation, and analytics remain blocked until
   the satellite has an explicit production hostname and analytics property.

## Synchronization rules

- Fix recurring upstream path shapes in the relevant sync strategy or link
  rewriter, not only in translated output files.
- Localize links only when the corresponding translated file exists.
- When an upstream page is intentionally not mirrored, use its verified
  official URL instead of manufacturing a local route.
- Directory index pages use trailing-slash routes; ordinary Markdown pages
  use clean URLs without `.html`.
- Empty Markdown destinations are text placeholders, not self-links.

## Measurement follow-up

Review these GA reports after each deployment:

- 404 page title, broken location, and referrer;
- landing pages and acquisition channels;
- engagement and retention by documentation family and language;
- outbound clicks to official API references.

Conversion events are intentionally not prescribed here. They should be
chosen from the site's product goal (for example, documentation depth,
repository visits, or returning readers) before being added to GA.
