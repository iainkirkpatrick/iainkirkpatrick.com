// import { Ai } from '@cloudflare/ai'
import type { EventContext } from '@cloudflare/workers-types'

import type { Env } from '../src/types/env';

// headers are used in local dev for CORS
export async function onRequest (context: EventContext<Env, '', {}>, headers?: any) {
  try {
    // const ai = new Ai(context.env.AI);
    const { searchParams } = new URL(context.request.url)
    const input = searchParams.get('input')

    if (!input) {
      throw new Error('No input provided')
    } else {
      // embed their input, compare to all embeddings, retrieve matches that are above a certain threshold from the database, and add to prompt context
      const embeddings = await context.env.AI.run('@cf/baai/bge-base-en-v1.5', { text: input })
      const vectors = embeddings.data[0]

      const SIMILARITY_CUTOFF = 0.50
      const vectorQuery = await context.env.VECTORIZE_INDEX.query(vectors, { topK: 5 });
      const vecIds = vectorQuery.matches
        .filter((v: any) => v.score > SIMILARITY_CUTOFF)
        .map((v: any) => v.id)

      let contextMessage = ""
      if (vecIds.length > 0) {
        const query = `SELECT * FROM texts WHERE id IN (${vecIds.join(", ")})`
        const { results } = await context.env.DB.prepare(query).bind().all()
        if (results) {
          const matchedTexts = results.map((v: any) => v.text)
          contextMessage = matchedTexts.length
            ? `Context:\n${matchedTexts.map((t: any) => `- ${t}`).join("\n")}`
            : ""
        }
      }

      const systemPrompt = `When answering the question or responding, use any following context provided, if it is provided and relevant. If the question refers to Iain, use any following context to answer it.`
      // TODO: consider feeding in the previous conversation context?
      const response = await context.env.AI.run('@cf/meta/llama-3-8b-instruct', {
        messages: [
          { role: 'system', content: `${systemPrompt}\n\n${contextMessage}` },
          { role: 'user', content: input },
        ],
        stream: true
      }, {
        gateway: {
          id: context.env.CLF_AI_GATEWAY_ID,
          cache: 60000
        }
      })

      return new Response(
        // @ts-ignore: TODO fix response type
        response,
        {
          headers: {
            ...(headers || {}),
            "content-type": "text/event-stream"
          }
        }
      );
    }
  } catch (error: any) {
    console.log({ error })
    return new Response(error.message || error.toString(), { status: 500 });
  }
}