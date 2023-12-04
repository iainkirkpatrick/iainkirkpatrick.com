import { Ai } from '@cloudflare/ai'

interface Env {
  AI: any;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  console.log('logging:', JSON.stringify(context, null, 2))
  const ai = new Ai(context.env.AI);

  const input = { prompt: "What is the origin of the phrase Hello, World" }
  // const input = { prompt: context.request.body.question }

  const answer = await ai.run('@cf/meta/llama-2-7b-chat-int8', input)

  return Response.json(answer);
}