# DASHU interactive prototype

Chosen monochrome design 06. Static HTML, CSS and JavaScript; no build step. Serve the repository root.

Pages: homepage, 23-product catalogue, product details with volume selection, cart, checkout demo and brand story.

Products, descriptions, specifications and photographs are extracted from the supplied DASHU presentation. Prices are illustrative, benchmarked against Russian Reuzel retail prices; they are not an approved DASHU price list. Delivery rates and order flow are demonstrations.

Cart contains only product IDs, volume choices and quantities, saved in localStorage. Checkout and partnership forms do not transmit or persist personal information. There is no payment processing or real order submission.

Academy images are AI-generated demonstration assets. Existing versions remain in the separate local presentation archive.

## Personal stylist

`stylist.html` provides a conversational product selection with optional hair photo upload. It calls the same-origin Vercel Function `/api/stylist`, which uses DeepSeek V4.1 Flash (`deepseek-flash`). Recommendations are restricted to real hair products in the shared catalogue. There is no simulated model fallback.

Set `DEEPSEEK_API_KEY` in the Vercel project's Environment Variables for Production and Preview, then redeploy. Never put the key in frontend code or commit it. Optional `STYLIST_ACCESS_CODE` protects a private client demonstration; the UI requests this code when configured.

For local development, copy `.env.example` to `.env.local`, enter the key, and run `node scripts/dev-server.cjs`. It serves the site and API at `http://127.0.0.1:8766`. The server reads the ignored local key file without exposing it over HTTP.

Photos are resized to at most 1400 pixels and converted to JPEG in the browser, removing embedded metadata. Uploading alone does not send the photo; explicit consent and sending a message are required. Photos and conversation history stay in browser memory and are sent to DeepSeek through the server for each turn. The site does not persist or log them. Provider handling is governed by DeepSeek's policies. Reloading or resetting clears the consultation.

Requests have body/message limits and a 40-second provider timeout. A best-effort in-memory limit allows 30 requests per IP per 10 minutes per function instance; it is not a distributed spending cap. For a public launch, configure Vercel WAF rate limits and the provider's spending controls. Use the optional access code for a closed preview.

Run `node --test tests/stylist.test.cjs` for validation, recommendation filtering and provider-adapter checks. These tests mock provider responses; a real key is required for live verification.

## FTP hosting

For PHP shared hosting, upload the seven HTML pages and `assets/`, and place `hosting/stylist.php` at `api/stylist.php`. In the hosting copy of `stylist.html`, add `data-api-endpoint="/api/stylist.php"` to `#stylist-form` and update the script cache version. Apache hosts can also use `hosting/.htaccess`; Nginx hosts need the explicit PHP URL. Enable PHP execution for the domain in the hosting panel. Do not upload `.env` files, Git data, Node source, tests or development scripts.

The PHP gateway forwards consultation requests over verified HTTPS to the existing `dashu-showcase-one.vercel.app` backend. The DeepSeek key remains in Vercel; the FTP host does not need a copy. The gateway stores neither photos nor conversations and preserves the backend's validation and response format. Keep that Vercel project active. Its existing per-instance consultation rate limit also applies to requests through the gateway. Enable a trusted TLS certificate for the public domain before accepting personal photos.
