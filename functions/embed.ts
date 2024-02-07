import { Ai } from '@cloudflare/ai'
import type { EventContext } from '@cloudflare/workers-types'

import type { Env } from '../src/types/env';

// TODO: endpoint for generating embeddings
// secure with a secret that must be passed, to prevent abuse?
// also - a script locally to call this endpoint and generate embeddings for all the data at build time (should be able to use ids to avoid duplication)
// headers are used in local dev for CORS
export async function onRequestPost (context: EventContext<Env, '', {}>, headers?: any) {
  try {
    const input: { text: string | Array<string> } = await context.request.json()
    const ai = new Ai(context.env.AI);
		
    const embeddings = await ai.run('@cf/baai/bge-base-en-v1.5', input)

    return Response.json({ embeddings }, headers ? { headers } : undefined);
  } catch (error: any) {
    return new Response(error.message || error.toString(), { status: 500 });
  }
}