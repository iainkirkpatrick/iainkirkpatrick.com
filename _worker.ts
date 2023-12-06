import { Ai } from '@cloudflare/ai'

interface Env {
  AI: any
}

export default {
	async fetch(request: Request, env: Env) {
		const url = new URL(request.url)
		const path = url.pathname

		if (path === '/ask') {
  		try {
				const input = await request.json()
				const ai = new Ai(env.AI);

				const answer = await ai.run('@cf/meta/llama-2-7b-chat-int8', input)
				console.log({ answer })

				return Response.json(answer);
			} catch (error: any) {
    		return new Response(error.message || error.toString(), { status: 500 });
			}
		} else {
			return new Response('Not Found', { status: 404 })
		}
	}
}