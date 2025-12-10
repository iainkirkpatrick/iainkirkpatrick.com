// import { Ai } from '@cloudflare/ai'
import type { EventContext } from '@cloudflare/workers-types'

import type { Env } from '../src/types/env';

const textEncoder = new TextEncoder();

function streamResponse(message: string | Record<string, unknown>, headers?: Record<string, string>) {
  const payload = typeof message === 'string' ? { response: message } : message;

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(textEncoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
      controller.enqueue(textEncoder.encode('data: [DONE]\n\n'));
      controller.close();
    }
  });

  return new Response(stream, {
    headers: {
      ...(headers || {}),
      "content-type": "text/event-stream"
    }
  });
}

// headers are used when testing locally or via dev Workers
export async function onRequest (context: EventContext<Env, '', {}>, headers?: any) {
  try {
    // const ai = new Ai(context.env.AI);
    const { searchParams } = new URL(context.request.url)
    const input = searchParams.get('input')

    if (!input) {
      throw new Error('No input provided')
    } else {
      console.log('[ask] received input', { input })

      const embeddings = await context.env.AI.run('@cf/baai/bge-base-en-v1.5', { text: input })
      const vectors = embeddings?.data?.[0]

      if (!vectors) {
        throw new Error('Unable to generate embeddings for query input')
      }

      const SIMILARITY_CUTOFF = 0.75
      const vectorQuery = await context.env.VECTORIZE_INDEX.query(vectors, { topK: 5, returnMetadata: true });
      const matchSummaries = (vectorQuery?.matches || []).slice(0, 5).map((match: any) => ({
        id: match.id,
        score: match.score,
        hasMetadata: !!match.metadata,
        question: match.metadata?.question,
      }))
      console.log('[ask] similarity results', { input, matches: matchSummaries })

      const metadataMatches = (vectorQuery?.matches || [])
        .filter((match: any) => match.score > SIMILARITY_CUTOFF)
        .filter((match: any) => typeof match.metadata?.answer === 'string')

      if (!metadataMatches.length) {
        return streamResponse("Hmm, I'm not sure about that yet. Try asking about my background, interests, or projects.", headers)
      }

      const bestMatch = metadataMatches[0]
      console.log('[ask] best match selected', {
        input,
        matchId: bestMatch.id,
        score: bestMatch.score,
        question: bestMatch.metadata?.question,
      })

      const answer = (bestMatch.metadata.answer as string).trim()

      if (!answer.length) {
        return streamResponse("Hmm, I'm not sure about that yet. Try asking about my background, interests, or projects.", headers)
      }

      const isDevelopment = context.env.APP_ENV === 'development'
      const responsePayload: Record<string, unknown> = {
        response: answer,
      }

      if (isDevelopment) {
        const referenceQuestion = typeof bestMatch.metadata.question === 'string' ? bestMatch.metadata.question : undefined
        responsePayload.reference = referenceQuestion
        responsePayload.confidence = bestMatch.score
      }

      return streamResponse(responsePayload, headers)
    }
  } catch (error: any) {
    console.log({ error })
    return new Response(error.message || error.toString(), { status: 500 });
  }
}
