import { Ai } from '@cloudflare/ai'
import type { Fetcher, Request } from '@cloudflare/workers-types'

interface Env {
	ASSETS: Fetcher
  AI: any
}

export default {
	async fetch(request: Request, env: Env) {
		const url = new URL(request.url)

		if (url.pathname === '/ask') {
  		try {
				const input: { prompt: string } = await request.json()
				const ai = new Ai(env.AI);

				const { response } = await ai.run('@cf/meta/llama-2-7b-chat-int8', input)

				return Response.json({ answer: response });
			} catch (error: any) {
    		return new Response(error.message || error.toString(), { status: 500 });
			}
		} else if (url.pathname === '/embed') {
			try {
				const input: { text: string | Array<string> } = await request.json()
				const ai = new Ai(env.AI);
				
				const embeddings = await ai.run('@cf/baai/bge-base-en-v1.5', input)

				return Response.json({ embeddings });
			} catch (error: any) {
				return new Response(error.message || error.toString(), { status: 500 });
			}
		} else {
		  // serve static assets
			return env.ASSETS.fetch(request)
			// return new Response('Not Found', { status: 404 })
		}
	}
}