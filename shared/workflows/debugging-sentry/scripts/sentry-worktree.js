'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const DEFAULT_SAFE_BRANCH = 'rd2';
const DEFAULT_WORKTREE_DIR_NAME = 'sentry-issues-worktree';

const runGit = (repoDir, args) => {
  return execFileSync('git', args, {
    cwd: repoDir,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
};

const pathExists = (targetPath) => {
  try {
    fs.accessSync(targetPath);
    return true;
  } catch (_) {
    return false;
  }
};

const ensureDir = (dirPath) => {
  fs.mkdirSync(dirPath, { recursive: true });
};

const normalizePath = (targetPath) => path.resolve(targetPath);

const getRepoRoot = (projectDir) => runGit(projectDir, ['rev-parse', '--show-toplevel']);

const getCurrentBranch = (repoRoot) => runGit(repoRoot, ['branch', '--show-current']);

const localBranchExists = (repoRoot, branch) => {
  try {
    runGit(repoRoot, ['show-ref', '--verify', '--quiet', `refs/heads/${branch}`]);
    return true;
  } catch (_) {
    return false;
  }
};

const remoteBranchExists = (repoRoot, branch) => {
  try {
    runGit(repoRoot, ['ls-remote', '--exit-code', '--heads', 'origin', branch]);
    return true;
  } catch (_) {
    return false;
  }
};

const listWorktrees = (repoRoot) => {
  const output = runGit(repoRoot, ['worktree', 'list', '--porcelain']);
  if (!output) {
    return [];
  }

  const blocks = output.split('\n\n').filter(Boolean);
  return blocks.map((block) => {
    const entry = {};
    block.split('\n').forEach((line) => {
      const [key, ...rest] = line.split(' ');
      const value = rest.join(' ').trim();
      if (key === 'worktree') {
        entry.worktree = normalizePath(value);
      } else if (key === 'branch') {
        entry.branch = value.replace('refs/heads/', '');
      } else if (key === 'HEAD') {
        entry.head = value;
      } else if (key) {
        entry[key] = value || true;
      }
    });
    return entry;
  });
};

const worktreeDirForRepo = (repoRoot, worktreeDirName = DEFAULT_WORKTREE_DIR_NAME) => {
  return path.join(path.dirname(repoRoot), worktreeDirName);
};

const ensureRemoteBranch = (repoRoot, branch) => {
  runGit(repoRoot, ['fetch', 'origin', branch]);
  if (!remoteBranchExists(repoRoot, branch)) {
    throw new Error(`Branch "${branch}" was not found on origin.`);
  }
};

const checkoutBranchInWorktree = (worktreeDir, repoRoot, branch) => {
  if (getCurrentBranch(worktreeDir) === branch) {
    return;
  }

  if (localBranchExists(repoRoot, branch)) {
    runGit(worktreeDir, ['checkout', branch]);
    return;
  }

  runGit(worktreeDir, ['checkout', '-b', branch, `origin/${branch}`]);
};

const ensureCleanWorktreeTarget = (repoRoot, worktreeDir) => {
  const normalized = normalizePath(worktreeDir);
  const existing = listWorktrees(repoRoot).find((entry) => entry.worktree === normalized);
  if (existing) {
    return existing;
  }

  if (!pathExists(normalized)) {
    return null;
  }

  const entries = fs.readdirSync(normalized).filter((name) => name !== '.DS_Store');
  if (entries.length > 0) {
    throw new Error(`Existing directory at ${normalized} is not a git worktree. Move or clean it before reusing it for Sentry fixes.`);
  }

  return null;
};

const ensureWorktreeForBranch = ({ repoRoot, targetBranch, worktreeDir }) => {
  ensureRemoteBranch(repoRoot, targetBranch);
  ensureDir(path.dirname(worktreeDir));

  const existing = ensureCleanWorktreeTarget(repoRoot, worktreeDir);
  if (!existing) {
    if (localBranchExists(repoRoot, targetBranch)) {
      runGit(repoRoot, ['worktree', 'add', worktreeDir, targetBranch]);
    } else {
      runGit(repoRoot, ['worktree', 'add', '-b', targetBranch, worktreeDir, `origin/${targetBranch}`]);
    }
    runGit(worktreeDir, ['pull', '--ff-only', 'origin', targetBranch]);
    return {
      created: true,
      updated: false,
      worktreeDir,
    };
  }

  checkoutBranchInWorktree(worktreeDir, repoRoot, targetBranch);
  runGit(worktreeDir, ['pull', '--ff-only', 'origin', targetBranch]);

  return {
    created: false,
    updated: true,
    worktreeDir,
  };
};

const resolveExecutionContext = ({
  projectDir = process.cwd(),
  targetBranch = null,
  safeBranch = DEFAULT_SAFE_BRANCH,
  worktreeDirName = DEFAULT_WORKTREE_DIR_NAME,
} = {}) => {
  const repoRoot = getRepoRoot(projectDir);
  const currentBranch = getCurrentBranch(repoRoot);
  const requestedBranch = targetBranch ? targetBranch.trim() : null;

  if (!requestedBranch && currentBranch !== safeBranch) {
    return {
      repoRoot,
      currentBranch,
      targetBranch: null,
      executionDir: repoRoot,
      usesWorktree: false,
      worktreeDir: null,
      worktreeStatus: 'not-needed',
      needsBranchSelection: true,
      prompt: `Current branch is "${currentBranch}", not "${safeBranch}". Ask the user which branch to run the Sentry workflow on, then rerun with --branch <name>.`,
    };
  }

  const finalBranch = requestedBranch || currentBranch;
  if (finalBranch === currentBranch) {
    return {
      repoRoot,
      currentBranch,
      targetBranch: finalBranch,
      executionDir: repoRoot,
      usesWorktree: false,
      worktreeDir: null,
      worktreeStatus: 'not-needed',
      needsBranchSelection: false,
      prompt: null,
    };
  }

  const worktreeDir = worktreeDirForRepo(repoRoot, worktreeDirName);
  const worktreeResult = ensureWorktreeForBranch({
    repoRoot,
    targetBranch: finalBranch,
    worktreeDir,
  });

  return {
    repoRoot,
    currentBranch,
    targetBranch: finalBranch,
    executionDir: worktreeDir,
    usesWorktree: true,
    worktreeDir,
    worktreeStatus: worktreeResult.created ? 'created' : 'updated',
    needsBranchSelection: false,
    prompt: null,
  };
};

module.exports = {
  DEFAULT_SAFE_BRANCH,
  DEFAULT_WORKTREE_DIR_NAME,
  resolveExecutionContext,
  worktreeDirForRepo,
};
