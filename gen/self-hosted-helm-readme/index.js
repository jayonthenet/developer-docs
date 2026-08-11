const fs = require('node:fs/promises');
const { execSync } = require('node:child_process');

const TARGET_FILE = './content/platform-orchestrator/docs/architecture/self-hosting.md';
const BEGIN_MARKER = '<!-- BEGIN_HELM_README -->';
const END_MARKER = '<!-- END_HELM_README -->';
const REPOSITORY_URL = 'https://github.com/stellwerk-labs/platform-orchestrator-helm-chart';

const rewriteRelativeLink = (target) => {
  if (/^(?:[a-z]+:|#|\/)/i.test(target)) {
    return target;
  }

  const release = target.match(/^docs\/releases\/(v\d+\.\d+\.\d+)\.md$/);
  if (release) {
    return `${REPOSITORY_URL}/releases/tag/${release[1]}`;
  }

  const separator = target.indexOf('#');
  const path = separator === -1 ? target : target.slice(0, separator);
  const fragment = separator === -1 ? '' : target.slice(separator);
  const view = /\.[^/]+$/.test(path) ? 'blob' : 'tree';
  return `${REPOSITORY_URL}/${view}/main/${path}${fragment}`;
};

const transformReadme = (rawReadme) => rawReadme
  .split('\n')
  .map(line => (line.startsWith('# ') ? `#${line}` : line))
  .map(line => line.replace(/\]\(([^)\s]+)\)/g, (_, target) => `](${rewriteRelativeLink(target)})`))
  .join('\n');

const loadReadme = async (sourcePath) => {
  if (sourcePath) {
    return fs.readFile(sourcePath, 'utf8');
  }

  return execSync(
    'gh api repos/stellwerk-labs/platform-orchestrator-helm-chart/contents/README.md --header "Accept: application/vnd.github.raw+json"',
    { encoding: 'utf8' },
  );
};

const main = async () => {
  const rawReadme = await loadReadme(process.argv[2]);

  const transformed = transformReadme(rawReadme);

  const doc = await fs.readFile(TARGET_FILE, 'utf8');

  const beginIdx = doc.indexOf(BEGIN_MARKER);
  const endIdx = doc.indexOf(END_MARKER);

  if (beginIdx === -1 || endIdx === -1) {
    throw new Error(`Markers not found in ${TARGET_FILE}`);
  }

  const newDoc =
    doc.slice(0, beginIdx + BEGIN_MARKER.length) +
    '\n\n' +
    transformed.trimEnd() +
    '\n\n' +
    doc.slice(endIdx);

  await fs.writeFile(TARGET_FILE, newDoc);
  console.log('Helm README inserted into', TARGET_FILE);
};

if (require.main === module) {
  main().then(undefined, (e) => {
    console.error(e);
    process.exit(1);
  });
}

module.exports = { loadReadme, rewriteRelativeLink, transformReadme };
