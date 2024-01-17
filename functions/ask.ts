import { Ai } from '@cloudflare/ai'
import type { EventContext } from '@cloudflare/workers-types'

import type { Env } from '../src/types/env';

// headers are used in local dev for CORS
export async function onRequest (context: EventContext<Env, '', {}>, headers?: any) {
  try {
    const ai = new Ai(context.env.AI);
    const { searchParams } = new URL(context.request.url)
    const input = searchParams.get('input')

    if (!input) {
      throw new Error('No input provided')
    } else {
      // TODO: consider feeding in the previous conversation context?
      const response = await ai.run('@cf/mistral/mistral-7b-instruct-v0.1', {
        prompt: input,
        stream: true,
      })

      return new Response(
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