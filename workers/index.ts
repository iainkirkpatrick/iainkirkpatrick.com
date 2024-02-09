import type { ExecutionContext } from '@cloudflare/workers-types';

import type { Env } from '../src/types/env';

import { onRequest as ask } from './ask';

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		// handle CORS, see https://developers.cloudflare.com/workers/examples/cors-header-proxy/ and https://stackoverflow.com/questions/66486610/how-to-set-cors-in-cloudflare-workers
		const corsHeaders = {
			'Access-Control-Allow-Headers': '*',
			'Access-Control-Allow-Methods': 'POST',
			'Access-Control-Allow-Origin': '*', // allow all URL's in dev
		}

		// Handle CORS preflight requests.
		if (request.method === "OPTIONS") {
			return new Response(null, {
				headers: corsHeaders,
			});
		} else {
			const reqUrl = new URL(request.url) 
			if (reqUrl.pathname === '/ask') {
				// @ts-ignore: not quite the right type for ask, but has enough overlap
				return ask({ request, env, ctx }, corsHeaders)
			} else {
				return new Response('no matching route!');
			}
		}
	},
};
