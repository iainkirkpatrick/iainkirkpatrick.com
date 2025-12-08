#!/usr/bin/env bun

import { spawn } from 'node:child_process';

function parseArgs() {
  const args = process.argv.slice(2);
  const parsed: Record<string, string | boolean> = {};

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (!arg.startsWith('--')) {
      continue;
    }

    const next = args[i + 1];
    if (next && !next.startsWith('--')) {
      parsed[arg] = next;
      i += 1;
    } else {
      parsed[arg] = true;
    }
  }

  return parsed;
}

const args = parseArgs();
const branch = (args['--branch'] as string | undefined) ?? process.env.PAGES_BRANCH ?? 'main';
const directory = (args['--directory'] as string | undefined)
  ?? (args['--dir'] as string | undefined)
  ?? './dist';

let projectName = (args['--project-name'] as string | undefined)
  ?? (args['--project'] as string | undefined);

if (!projectName) {
  if (branch !== 'main') {
    projectName = process.env.PAGES_PROJECT_NAME_STAGING ?? process.env.PAGES_PROJECT_NAME;
  } else {
    projectName = process.env.PAGES_PROJECT_NAME;
  }
}

if (!projectName) {
  console.error('Missing Pages project name. Set PAGES_PROJECT_NAME (and optionally PAGES_PROJECT_NAME_STAGING) or pass --project-name.');
  process.exit(1);
}

const cmd = ['wrangler@latest', 'pages', 'deploy', directory, '--project-name', projectName, '--branch', branch];

const child = spawn('bunx', cmd, {
  stdio: 'inherit',
  env: process.env,
});

child.on('exit', (code) => {
  process.exit(code ?? 0);
});
