[iainkirkpatrick.com](http://iainkirkpatrick.com)

### todo:
- [ ] ai-generated thoughts images derived from the content?
- [ ] change LLM to just running against gpt-4, better results?

### embeddings workflow
1. Edit `data/qa_corpus.json` to add or tweak question/answer pairs.
2. Run `bun run build:qa` (requires `CLF_ACCOUNT_ID`, `CLF_API_TOKEN`, and `CLF_VECTORIZE_INDEX`). This writes:
   - `data/qa_with_embeddings.json` for inspection/versioning.
   - `data/qa_vectorize.ndjson` ready for import into Vectorize.
3. Import to Cloudflare: `wrangler vectorize import <index> ./data/qa_vectorize.ndjson`
4. Deploy updated Worker: `bun run deploy-functions`

The Worker now reads metadata directly from Vectorize, so you only need to keep the corpus + embeddings artifacts in sync.

> **Note**
> The Cloudflare adapter now opts into KV-backed sessions. Both prod and staging entries in `wrangler.toml` expect a `SESSION` namespace, so run `wrangler kv namespace create SESSION` (and again with `--env staging`) if you haven't provisioned them already.

### staging deployments
**Provision resources**
1. Create an isolated Vectorize index (bge-base emits 768 dims): `wrangler vectorize create iainkirkpatrick-staging --dimensions 768 --metric cosine`
2. Create a staging D1 database: `wrangler d1 create iainkirkpatrick-db-staging`
3. Create a KV namespace for sessions (Cloudflare adapter now expects the `SESSION` binding): `wrangler kv namespace create SESSION --env staging`
4. Update `wrangler.toml` with the generated staging D1 `database_id` and KV `id` (see `[env.staging]`).
5. Initialize the schema: `wrangler d1 execute iainkirkpatrick-db-staging --env staging --remote --command "CREATE TABLE IF NOT EXISTS texts (id INTEGER PRIMARY KEY AUTOINCREMENT, text TEXT);"`
6. Store staging secrets: `wrangler secret put --env staging OPENAI_API_KEY` (repeat for anything else).

**Deploy flow**
1. Set `CLF_VECTORIZE_INDEX=iainkirkpatrick-staging` (and any other staging vars) when running `bun run build:qa`.
2. Upsert embeddings to staging: `wrangler vectorize upsert iainkirkpatrick-staging --file ./data/qa_vectorize.ndjson`
3. Deploy the staging Worker: `bun run deploy-functions:staging`
4. Configure the Astro frontend (Cloudflare Pages preview or another hosting target) with `PUBLIC_API_URL=https://iainkirkpatrick-dot-com-workers-staging.<your-subdomain>.workers.dev` so the client hits the staging Worker.
5. Optionally create a Pages “preview” deployment tied to the `embeddings` branch so every push ships a fresh staging build.

**Frontend tips**
- The site defaults to `window.location.origin` when `PUBLIC_API_URL` is missing, so local/staging previews automatically hit their own host.
- Override `PUBLIC_API_URL` per Pages environment (Preview vs Production) for deterministic routing.

### deployment scripts
Set the following environment variables before running deployments:
- `CLOUDFLARE_ACCOUNT_ID` / `CLOUDFLARE_API_TOKEN` with permissions for Workers, D1, Vectorize, and Pages.
- `PAGES_PROJECT_NAME` (and optionally `PAGES_PROJECT_NAME_STAGING` if you use a separate Pages project for staging).

Common scripts:
- `bun run deploy:prod` – builds Astro, regenerates prod embeddings, upserts them, deploys the Worker, and publishes Pages to the `main` branch.
- `bun run deploy:staging` – same flow targeting the staging Vectorize index, D1, Worker env, and Pages `staging` branch.
- Individual steps are exposed via `build:qa:*`, `vector:upsert:*`, `deploy:worker:*`, and `deploy:pages:*` if you want granular control.

### notes
- could in theory avoid needing a regular db if all data (init, static pages, thoughts) was publically accessible / hosted? store the hash of the data in vectorize, then compare to hashed public data? Not sure there's much point... especially given how cheap D1 is
