import { Ai } from '@cloudflare/ai'
import type { EventContext } from '@cloudflare/workers-types'

interface Env {
  AI: any
}

export async function onRequest (context: EventContext<Env, '', {}>) {
  try {
  //   const input: { prompt: string } = await context.request.json()
  //   const ai = new Ai(context.env.AI);

  //   const { response } = await ai.run('@cf/meta/llama-2-7b-chat-int8', input)

  //   return Response.json({ answer: response });
  // } catch (error: any) {
  //   return new Response(error.message || error.toString(), { status: 500 });
  // }
  try {
    const ai = new Ai(context.env.AI);
    const { searchParams } = new URL(context.request.url)
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
}