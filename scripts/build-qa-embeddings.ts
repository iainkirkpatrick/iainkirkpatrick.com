import fs from 'fs/promises';

interface QAEntry {
  id?: string;
  question: string;
  answer: string;
  tags?: string[];
}

interface CorpusFile {
  entries: QAEntry[];
}

const AI_ENDPOINT = '@cf/baai/bge-base-en-v1.5';
const OUTPUT_JSON = new URL('../data/qa_with_embeddings.json', import.meta.url);
const OUTPUT_NDJSON = new URL('../data/qa_vectorize.ndjson', import.meta.url);
const CORPUS_PATH = new URL('../data/qa_corpus.json', import.meta.url);

const runtimeEnv = (process as { env: Record<string, string | undefined> }).env;
const runtimeExit = (process as unknown as { exit: (code?: number) => never }).exit;

async function loadCorpus(): Promise<CorpusFile> {
  const path = CORPUS_PATH;
  const content = await fs.readFile(path, 'utf-8');
  return JSON.parse(content);
}

function ensureEnv(name: string): string {
  const value = runtimeEnv[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

async function generateEmbeddings(entries: QAEntry[]): Promise<number[][]> {
  const accountId = ensureEnv('CLF_ACCOUNT_ID');
  const apiToken = ensureEnv('CLF_API_TOKEN');

  const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${AI_ENDPOINT}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text: entries.map((entry) => entry.question) }),
  });

  if (!response.ok) {
    throw new Error(`Embedding request failed with status ${response.status}`);
  }

  const payload = await response.json();

  if (!payload.success || !payload.result?.data) {
    throw new Error('Embedding response missing data');
  }

  if (payload.result.data.length !== entries.length) {
    throw new Error('Embedding count does not match corpus entry count');
  }

  return payload.result.data;
}

async function writeArtifacts(enriched: Array<QAEntry & { id: string; embedding: number[] }>) {
  const formattedJson = JSON.stringify({ entries: enriched }, null, 2);
  await fs.writeFile(OUTPUT_JSON, `${formattedJson}\n`, 'utf-8');

  const ndjsonLines = enriched.map((entry) => JSON.stringify({
    id: entry.id,
    values: entry.embedding,
    metadata: {
      question: entry.question,
      answer: entry.answer,
      tags: entry.tags ?? [],
    },
  }));
  await fs.writeFile(OUTPUT_NDJSON, `${ndjsonLines.join('\n')}\n`, 'utf-8');
}

async function main() {
  const corpus = await loadCorpus();
  if (!Array.isArray(corpus.entries) || corpus.entries.length === 0) {
    throw new Error('Corpus is empty. Add at least one QA entry.');
  }

  const embeddings = await generateEmbeddings(corpus.entries);

  const enrichedEntries = corpus.entries.map((entry, index) => ({
    ...entry,
    id: entry.id ?? `qa-${index + 1}`,
    embedding: embeddings[index],
  }));

  await writeArtifacts(enrichedEntries);

  const vectorizeIndex = ensureEnv('CLF_VECTORIZE_INDEX');

  console.log('Embeddings built successfully.');
  console.log('Next steps:');
  console.log(`1. Import vectors: wrangler vectorize import ${vectorizeIndex} ./data/qa_vectorize.ndjson`);
  console.log('2. Redeploy the Worker so it can use the updated metadata.');
}

main().catch((error) => {
  console.error(error);
  runtimeExit(1);
});
