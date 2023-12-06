import { Ai } from '@cloudflare/ai'
import type { EventContext } from '@cloudflare/workers-types'

interface Env {
  AI: any
}

export async function onRequestPost (context: EventContext<Env, '', {}>) {
  try {
    const input: { prompt: string } = await context.request.json()
    const ai = new Ai(context.env.AI);

    const answer = await ai.run('@cf/meta/llama-2-7b-chat-int8', input)

    return Response.json(answer);
  } catch (error: any) {
    return new Response(error.message || error.toString(), { status: 500 });
  }
}