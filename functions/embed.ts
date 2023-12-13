import { Ai } from '@cloudflare/ai'
import type { EventContext } from '@cloudflare/workers-types'

interface Env {
  AI: any
}

// TODO: endpoint for generating embeddings
// secure with a secret that must be passed, to prevent abuse?
// also - a script locally to call this endpoint and generate embeddings for all the data at build time (should be able to use ids to avoid duplication)
export async function onRequestPost (context: EventContext<Env, '', {}>) {
  try {
    const input: { text: string | Array<string> } = await context.request.json()
    const ai = new Ai(context.env.AI);
		
    const embeddings = await ai.run('@cf/baai/bge-base-en-v1.5', input)

    return Response.json({ embeddings });
  } catch (error: any) {
    return new Response(error.message || error.toString(), { status: 500 });
  }
}