# DASHU interactive prototype

## Client comparison / October 25

`/revision-03.html` adds an independent comparison with graphite buttons while retaining version 02's blue brand accents. All three landings have a comparison switch. Links from version 03 open `/stylist.html?buttons=graphite`, which applies the same button palette without changing the default stylist theme or its API. Rebuild in order: `build-revision-02.py`, `build-revision-03.py`, `build-stylist-page.py`.

`/font-01.html` is the approved Unbounded + Onest baseline. `/revision-02.html` is the separate revision with a muted stone/cobalt palette, sticky blue brand strip, horizontal product catalogue immediately after the hero, earlier guides, larger prices and purchase controls, and a dedicated stylist section. Both pages and the root landing have a two-version comparison switch. The baseline content, layout and media are preserved; only its comparison navigation changed. Existing commerce and stylist pages are shared by the variants.

The revision uses its own `assets/revision-02/design.css` and `design.js`; it does not load or change the baseline's styling. New self-hosted stock video and photography replace the previous campaign in this variant only; media sources are recorded in `assets/revision-02/SOURCES.md`. The small-screen video is 317 KB. Rebuild the page with `python scripts/build-revision-02.py`; this only regenerates the new landing and the comparison bars. The older typography generator intentionally refuses to overwrite the approved comparison baseline once a revision exists.

Typography alternatives are available at `/font-01.html` (Unbounded + Onest) and `/font-02.html` (Manrope + Golos Text), each with two locally hosted font families and a comparison switch. They preserve the current dark landing's composition and content. The main landing and saved light version are not replaced. Sources, licences and rebuild commands are in `assets/typography/SOURCES.md`.

The current landing retains the original sixth design: dark background, original typography, section order and product layout. The former hero portrait is replaced with a locally hosted Daily Routine video; official DASHU photography replaces the generated portrait. `assets/refinement.css` and `assets/refinement.js` contain bounded visual changes and the mobile menu. Media provenance is recorded in `assets/campaign/SOURCES.md`.

The light experiment is preserved separately at `/concept-light/` for customer comparison. It has frozen copies of its seven pages, styles and scripts; photography and fonts are shared. It is an alternative concept, not the approved main direction.

Chosen monochrome design 06. Static HTML, CSS and JavaScript; no build step. Serve the repository root.

Pages: homepage, 23-product catalogue, product details with volume selection, cart, checkout demo and brand story.

Products, descriptions, specifications and photographs are extracted from the supplied DASHU presentation. Prices are illustrative, benchmarked against Russian Reuzel retail prices; they are not an approved DASHU price list. Delivery rates and order flow are demonstrations.

Cart contains only product IDs, volume choices and quantities, saved in localStorage. Checkout and partnership forms do not transmit or persist personal information. There is no payment processing or real order submission.

Academy images are AI-generated demonstration assets. Existing versions remain in the separate local presentation archive.

Images use WebP with responsive width variants, explicit dimensions and asynchronous decoding. The hero has high fetch priority; lower sections and product grids load images lazily. Product volume changes update both the image and its responsive sources. Original PNG/JPEG files are retained as source material. Run `python scripts/optimize-images.py` with Pillow installed to rebuild WebP assets, the image manifest and catalogue image metadata. Active full-size images total about 1.15 MB instead of 13.44 MB; smaller responsive candidates reduce transfer further.

## Personal stylist

`stylist.html` provides a conversational product selection with optional hair photo upload. It calls the same-origin Vercel Function `/api/stylist`, which uses DeepSeek V4.1 Flash (`deepseek-flash`). Recommendations are restricted to real hair products in the shared catalogue. There is no simulated model fallback.

Set `DEEPSEEK_API_KEY` in the Vercel project's Environment Variables for Production and Preview, then redeploy. Never put the key in frontend code or commit it. Optional `STYLIST_ACCESS_CODE` protects a private client demonstration; the UI requests this code when configured.

For local development, copy `.env.example` to `.env.local`, enter the key, and run `node scripts/dev-server.cjs`. It serves the site and API at `http://127.0.0.1:8766`. The server reads the ignored local key file without exposing it over HTTP.

Photos are resized to at most 1400 pixels and converted to JPEG in the browser, removing embedded metadata. Uploading alone does not send the photo; explicit consent and sending a message are required. Photos and conversation history stay in browser memory and are sent to DeepSeek through the server for each turn. The site does not persist or log them. Provider handling is governed by DeepSeek's policies. Reloading or resetting clears the consultation.

Requests have body/message limits and a 40-second provider timeout. A best-effort in-memory limit allows 30 requests per IP per 10 minutes per function instance; it is not a distributed spending cap. For a public launch, configure Vercel WAF rate limits and the provider's spending controls. Use the optional access code for a closed preview.

Run `node --test tests/stylist.test.cjs` for validation, recommendation filtering and provider-adapter checks. These tests mock provider responses; a real key is required for live verification.

## FTP hosting

For static FTP hosting, upload the seven HTML pages and `assets/`. PHP is not required. In the hosting copy of `stylist.html`, add `data-api-endpoint="https://dashu-stylist-service.vercel.app/api/stylist"` to `#stylist-form` and update the script cache version. The public endpoint is also recorded in `hosting/config.json`. Do not upload `.env` files, Git data, Node source, tests or development scripts.

The separate Vercel project `dashu-stylist-service` contains `api/stylist.js`, `lib/stylist.cjs`, `assets/catalog-data.js` and `vercel.json`; its `DEEPSEEK_API_KEY` stays in the Production environment. Keep that project active. It permits browser requests only from its own origin and the exact HTTPS origin `https://dashurussia.ru`, handles JSON preflight requests and preserves input validation, catalogue restrictions and per-IP rate limits. Browser conversations and photos still remain in memory and are sent to DeepSeek through Vercel without being logged or persisted by the application. Serve the public site over trusted HTTPS.
