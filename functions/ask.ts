import { Ai } from '@cloudflare/ai'

interface Env {
  AI: any;
}

// export const onRequest: PagesFunction<Env> = async (context) => {
export async function onRequestPost (context) {
  const data = await context.request.json()
  // console.log('logging:', JSON.stringify(context.request, null, 2))
  console.log({ data })
  const ai = new Ai(context.env.AI);

  const input = { prompt: "What is the origin of the phrase Hello, World" }
  // const input = { prompt: context.request.body.question }

  const answer = await ai.run('@cf/meta/llama-2-7b-chat-int8', input)

  return Response.json(answer);
}