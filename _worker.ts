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
			// if (request.method === 'OPTIONS') {
      //   return new Response(null, {
      //     status: 204,
      //     headers: {
      //       'Access-Control-Allow-Credentials': 'true',
      //       'Access-Control-Allow-Methods': 'GET',
      //       'Access-Control-Allow-Origin': 'http://localhost:3000',
      //       'Access-Control-Allow-Headers': 'Content-Type'
      //     }
      //   });
    	// } else {
				try {
					const ai = new Ai(env.AI);
					const { searchParams } = new URL(request.url)
					const input = searchParams.get('input')

					if (!input) {
						throw new Error('No input provided')
					} else {
						const response = await ai.run('@cf/meta/llama-2-7b-chat-int8', {
							prompt: input,
							stream: true,
						})


						return new Response(
							response,
							{ headers: { "content-type": "text/event-stream" } }
						);
					}
				} catch (error: any) {
					console.log({ error })
					return new Response(error.message || error.toString(), { status: 500 });
				}
			// }
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