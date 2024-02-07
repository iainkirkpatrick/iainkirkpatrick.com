// A script to initialise RAG data - acts as a seed, in that each time we wipe data and start from scratch
// Roughly follows sections of https://developers.cloudflare.com/workers-ai/tutorials/build-a-retrieval-augmented-generation-ai/#4-adding-embeddings-using-cloudflare-d1-and-vectorize
// uses the REST API's to interact with D1 and Vectorize
// see Willison's paragraph-level embeddings article for idea of embedding paragraphs from text https://til.simonwillison.net/llms/embed-paragraphs
// TODO: import project descriptions and generate embeddings for them

import fs from 'fs';
import rehypeStringify from 'rehype-stringify'
import remarkGfm from 'remark-gfm'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import {unified} from 'unified'

import { extractParagraphsFromHtmlString } from '../lib/extractParagraphsFromHtmlString';

import initData from '../data/init.json';

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

		// get paragraphs from mdx files
		// TODO: loop over thoughts mdx files
		const mdxFiles = [
			'./src/pages/about.mdx',
		]
		// flatten afterwards
		const mdxParagraphs = await Promise.all(mdxFiles.map(f => {
			const mdxContent = fs.readFileSync(f, 'utf8');
			return unified()
			.use(remarkParse)
			.use(remarkGfm)
			.use(remarkRehype)
			.use(rehypeStringify)
			.process(mdxContent)
			.then(file => extractParagraphsFromHtmlString(file.value.toString()))
		})).then(paragraphs => paragraphs.flat())

		// add each of the init data and the mdx paragraphs to D1, to store and have an id reference
		const dbInserts = await Promise.all([
			...initData.init,
			...mdxParagraphs
		].map(d => {
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