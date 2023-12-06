import { Ai } from '@cloudflare/ai'
import types from '@cloudflare/workers-types'

export async function onRequestPost (context) {
  try {
    const data = await context.request.json()
    const ai = new Ai(context.env.AI);

    // const input = { prompt: "What is the origin of the phrase Hello, World" }
    const input = { prompt: data.question }

    const answer = await ai.run('@cf/meta/llama-2-7b-chat-int8', input)

    return Response.json(answer);
  } catch (error) {
    return new Response(error.message || error.toString(), { status: 500 });
  }
}