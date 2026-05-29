# Emergency Weather Dashboard

Static-first weather, emergency, and ham radio dashboard for Puerto Vallarta.

## Modes

- Static only: deploy the frontend as static files. Some feeds may be limited by browser restrictions.
- Static plus Cloudflare Worker: deploy the frontend and Worker. This is recommended for reliable feed normalization, caching, and CORS handling.

## Local Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

The static output is written to `dist/`.

## Cloudflare Worker

```bash
npx wrangler dev --config worker/wrangler.toml
npx wrangler deploy --config worker/wrangler.toml
```

Set the dashboard Worker endpoint in `src/config/defaultConfig.ts` or through the settings panel.

## Configuration

Edit `src/config/defaultConfig.ts` for deploy-time defaults. Use the dashboard settings button for per-device browser overrides.

## Legacy Dashboard

The previous Hamdash static files are preserved in `legacy/` for reference during the migration.
