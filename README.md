[iainkirkpatrick.com](http://iainkirkpatrick.com)

### todo:
- [ ] ai-generated posts images derived from the content?
- [ ] enrich `qa_corpus.json` with more projects + writing references

### development workflows
- `bun dev` runs Astro + `wrangler dev --env development`, so the Worker uses the remote-development bindings (Vectorize, AI, etc.).
- If you need to point dev builds at production resources instead, override the command or run Wrangler manually with `--env production`.

### cloudflare pages runtime
- Cloudflare’s v3 build image ships Node 22 by default but supports "any" version via `.nvmrc`/`NODE_VERSION` overrides ([docs](https://developers.cloudflare.com/pages/configuration/build-image/#supported-languages-and-tools)); we run on the latest LTS (Node `24.11.1`) so Astro 5, Wrangler 4, and oxfmt stay within supported ranges.
- Use `nvm use` (or your preferred version manager) – the repo ships a `.nvmrc` pinning Node `24.11.1`, and `package.json` enforces `engines.node >=24.11.1 <25`.
- Make sure the Pages project respects that version (Pages auto-detects `.nvmrc`, or set `NODE_VERSION=24.11.1` in the dashboard to force it).
- The Worker runtime itself is V8-based, so specifying Node 24 only affects the Pages build/install environment and Wrangler CLI, not the deployed Worker execution environment.
- `wrangler.toml` declares `pages_build_output_dir = "./dist"` so Pages treats the Worker config as valid when reading build settings.

### embeddings workflow
1. Edit `data/qa_corpus.json` to add or tweak question/answer pairs.
2. Run `bun run build:qa` (requires `CLF_ACCOUNT_ID`, `CLF_API_TOKEN`, and `CLF_VECTORIZE_INDEX`). This writes:
   - `data/qa_with_embeddings.json` for inspection/versioning.
   - `data/qa_vectorize.ndjson` ready for import into Vectorize.
3. Import to Cloudflare: `wrangler vectorize import <index> ./data/qa_vectorize.ndjson`
4. Deploy updated Worker: `bun run deploy-functions`

The Worker now responds exclusively with the stored metadata answers from Vectorize, so you only need to keep the corpus + embeddings artifacts in sync.

> **Note**
> The Cloudflare adapter no longer uses KV-backed sessions, so there’s no `SESSION` namespace to provision for either environment.

### development cloud environment
**Provision resources**
1. Create an isolated Vectorize index (bge-base emits 768 dims): `wrangler vectorize create iainkirkpatrick-development --dimensions 768 --metric cosine`
2. Update `wrangler.toml` with the generated development Vectorize `index_name` (if it differs).
3. Store development secrets as needed for Workers/Pages: `wrangler secret put --env development <SECRET_NAME>`.

**Deploy flow**
1. Set `CLF_VECTORIZE_INDEX=iainkirkpatrick-development` (and any other dev vars) when running `bun run build:qa` (or `bun run build:qa:development`).
2. Upsert embeddings to the development index: `wrangler vectorize upsert iainkirkpatrick-development --file ./data/qa_vectorize.ndjson --env development` (or `bun run vector:upsert:development`).
3. Deploy the development Worker: `bun run deploy-functions:development`.
4. Configure the Astro frontend (Cloudflare Pages preview or another hosting target) with `PUBLIC_API_URL=https://iainkirkpatrick-dot-com-workers-development.<your-subdomain>.workers.dev` so the client hits the dev Worker.
5. Optionally create a Pages “preview” deployment tied to the `embeddings` branch so every push ships a fresh development build.

**Frontend tips**
- The site defaults to `window.location.origin` when `PUBLIC_API_URL` is missing, so dev previews automatically hit their own host.
- Override `PUBLIC_API_URL` per Pages environment (Preview vs Production) for deterministic routing.

### deployment scripts
Set the following environment variables before running deployments:
- `CLOUDFLARE_ACCOUNT_ID` / `CLOUDFLARE_API_TOKEN` with permissions for Workers, Vectorize, and Pages.
- `PAGES_PROJECT_NAME` (and optionally `PAGES_PROJECT_NAME_DEVELOPMENT` if you use a separate Pages project for the development environment).

Common scripts:
- `bun run deploy:prod` – builds Astro, regenerates prod embeddings, upserts them, deploys the Worker, and publishes Pages to the `main` branch.
- `bun run deploy:development` – same flow targeting the development Vectorize index, Worker env, and Pages `development` branch.
- Individual steps are exposed via `build:qa:*`, `vector:upsert:*`, `deploy:worker:*`, and `deploy:pages:*` if you want granular control.

### notes
- Everything is now powered directly from Vectorize metadata, so there is no D1 dependency in the embeddings workflow anymore.
