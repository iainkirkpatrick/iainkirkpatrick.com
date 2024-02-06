// A script to initialise RAG data - acts as a seed, in that each time we wipe data and start from scratch
// Roughly follows sections of https://developers.cloudflare.com/workers-ai/tutorials/build-a-retrieval-augmented-generation-ai/#4-adding-embeddings-using-cloudflare-d1-and-vectorize
// uses the REST API's to interact with D1 and Vectorize

import initData from '../data/init.json';

// TODO: import "about" and all thoughts, and generate embeddings for them
// possibly similar to Willison's paragraph-level embeddings https://til.simonwillison.net/llms/embed-paragraphs

async function embed () {
  try {
		// clear D1
		const clearResult = await fetch(`https://api.cloudflare.com/client/v4/accounts/${process.env.CLF_ACCOUNT_ID}/d1/database/${process.env.CLF_DB_ID}/query`, {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${process.env.CLF_API_TOKEN}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					sql: 'DELETE FROM texts;'
				})
		})
		.then(response => response.json()) 

		if (!clearResult.success) {
			throw new Error('could not clear the database')
		}

		// add each init data to D1, to store and have an id reference
		const dbInserts = await Promise.all(initData.init.map(d => {
			return fetch(`https://api.cloudflare.com/client/v4/accounts/${process.env.CLF_ACCOUNT_ID}/d1/database/${process.env.CLF_DB_ID}/query`, {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${process.env.CLF_API_TOKEN}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					params: [d],
					sql: 'INSERT INTO texts (text) VALUES (?) RETURNING *;'
				})
			})
			.then(response => response.json()) 
		}))

		if (!dbInserts.every(d => !!d.success)) {
			throw new Error('could not insert all texts into database')
		}

		// generate embeddings for each init data
		const embeddings = await fetch(`https://api.cloudflare.com/client/v4/accounts/${process.env.CLF_ACCOUNT_ID}/ai/run/@cf/baai/bge-base-en-v1.5`, {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${process.env.CLF_API_TOKEN}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ text: dbInserts.map(d => d.result[0].results[0].text) }),
		})
		.then((response) => response.json())

		if (!embeddings.success) {
			throw new Error('no embeddings generated')
		}

		// store vectors in vectorize, with id as reference
		const vectors = dbInserts.map((d, i) => ({
			id: d.result[0].results[0].id.toString(),
			values: embeddings.result.data[i]
		}))
		const vectorizeInserts = await Promise.all(vectors.map(v => {
			return fetch(`https://api.cloudflare.com/client/v4/accounts/${process.env.CLF_ACCOUNT_ID}/vectorize/indexes/${process.env.CLF_VECTORIZE_INDEX}/upsert`, {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${process.env.CLF_API_TOKEN}`,
					'Content-Type': 'application/x-ndjson'
				},
				body: JSON.stringify(v)
			})
			.then(response => response.json()) 
		}))

		if (!vectorizeInserts.every(v => !!v.success)) {
			throw new Error('could not upsert all vectors into database')
		}

		console.log('texts saved to db, and respective vectors upserted to vector db')
		process.exit(0)
  } catch (error: any) {
		console.error(error)
		process.exit(1)
  }
}

embed()