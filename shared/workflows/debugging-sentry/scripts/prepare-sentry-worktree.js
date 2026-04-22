#!/usr/bin/env node
'use strict';

const path = require('path');
const { resolveExecutionContext } = require('./sentry-worktree');

const parseArgs = (argv) => {
  const options = {
    projectDir: process.cwd(),
    branch: null,
    json: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--branch') {
      options.branch = argv[i + 1] || null;
      i += 1;
      continue;
    }
    if (arg === '--project-dir') {
      options.projectDir = path.resolve(argv[i + 1] || process.cwd());
      i += 1;
      continue;
    }
    if (arg === '--json') {
      options.json = true;
      continue;
    }
    if (arg === '--help' || arg === '-h') {
      console.log(`Usage:
  node scripts/prepare-sentry-worktree.js [--branch <name>] [--project-dir <path>] [--json]

Behavior:
  - If the current branch is rd2, the current repo is reused.
  - If the current branch is not rd2 and no --branch is provided, the script exits and tells the caller to ask the user.
  - If --branch differs from the current branch, the script prepares ../sentry-issues-worktree on the requested branch.`);
      process.exit(0);
    }
  }

  return options;
};

const printText = (context) => {
  if (context.needsBranchSelection) {
    console.error(context.prompt);
    process.exit(2);
  }

  console.log(`Repo root: ${context.repoRoot}`);
  console.log(`Current branch: ${context.currentBranch}`);
  console.log(`Execution branch: ${context.targetBranch}`);
  console.log(`Execution dir: ${context.executionDir}`);
  console.log(`Using dedicated worktree: ${context.usesWorktree ? 'yes' : 'no'}`);
  if (context.usesWorktree) {
    console.log(`Worktree status: ${context.worktreeStatus}`);
  }
};

const run = () => {
  const options = parseArgs(process.argv.slice(2));
  const context = resolveExecutionContext({
    projectDir: options.projectDir,
    targetBranch: options.branch,
  });

  if (options.json) {
    console.log(JSON.stringify(context, null, 2));
    if (context.needsBranchSelection) {
      process.exit(2);
    }
    return;
  }

  printText(context);
};

run();
