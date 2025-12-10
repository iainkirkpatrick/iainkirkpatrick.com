import type { ExecutionContext } from '@cloudflare/workers-types';

import type { Env } from '../src/types/env';

import { onRequest as ask } from './ask';

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		// handle CORS, see https://developers.cloudflare.com/workers/examples/cors-header-proxy/ and https://stackoverflow.com/questions/66486610/how-to-set-cors-in-cloudflare-workers
		const corsHeaders = {
			'Access-Control-Allow-Headers': '*',
			'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
			'Access-Control-Allow-Origin': '*', // allow all URL's in dev
		}

		const reqUrl = new URL(request.url);

		// Handle CORS preflight requests.
		if (request.method === "OPTIONS") {
			return new Response(null, {
				headers: corsHeaders,
			});
		}
		
		// Handle our custom API routes
		if (reqUrl.pathname === '/ask') {
			// @ts-ignore: not quite the right type for ask, but has enough overlap
			return ask({ request, env, ctx }, corsHeaders)
		}

		// For all other routes, serve static assets
		// The ASSETS binding will handle serving files from dist/
		// and will properly serve Astro's SSR pages through dist/_worker.js
		return env.ASSETS.fetch(request);
	},
};
