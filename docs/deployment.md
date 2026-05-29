# Deployment

## Cloudflare Pages

1. Connect this repository to Cloudflare Pages.
2. Use `npm run build` as the build command.
3. Use `dist` as the output directory.
4. Point `jorgecedi.com` at the Pages project when the preview is verified.

## Cloudflare Worker

1. Deploy the Worker with `npx wrangler deploy --config worker/wrangler.toml`.
2. Configure a route or subdomain for the Worker.
3. Set the dashboard Worker endpoint to the Worker `/api` base URL.

## Static-Only Copy

Users who do not want a Worker can leave `workerEndpoint` undefined in `src/config/defaultConfig.ts`. The dashboard still renders tiles and local settings, but normalized feed reliability is reduced.
