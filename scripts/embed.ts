import initData from '../data/init.json';

// TODO: endpoint for generating embeddings
// secure with a secret that must be passed, to prevent abuse?
// also - a script locally to call this endpoint and generate embeddings for all the data at build time (should be able to use ids to avoid duplication)
// headers are used in local dev for CORS
async function embed () {
  try {
		const data = await fetch(`${process.env.PUBLIC_DEV_API_URL}/embed`, {
			method: 'POST',
			body: JSON.stringify({ text: initData.init }),
		})
		.then((response) => response.json())

		console.log({ data })
		process.exit(0)
  } catch (error: any) {
		console.error(error)
		process.exit(1)
  }
}

embed()