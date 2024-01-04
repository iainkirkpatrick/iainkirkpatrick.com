/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import type { ExecutionContext } from '@cloudflare/workers-types';

import type { Env } from '../src/types/env';

import { onRequest as ask } from '../functions/ask';
import { onRequestPost as embed } from '../functions/embed';

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
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
			} else if (reqUrl.pathname === '/embed') {
				// @ts-ignore: not quite the right type for ask, but has enough overlap
				return embed({ request, env, ctx })
			} else {
				return new Response('no matching route!');
			}
		}
	},
};
