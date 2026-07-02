const fs = require('node:fs/promises');
const { execSync } = require('node:child_process');

const TARGET_FILE = './content/platform-orchestrator/docs/architecture/self-hosting.md';
const BEGIN_MARKER = '<!-- BEGIN_HELM_README -->';
const END_MARKER = '<!-- END_HELM_README -->';

const main = async () => {
  const rawReadme = execSync(
    'gh api repos/Platform-Orchestrator/platform-orchestrator-helm-chart/contents/README.md --header "Accept: application/vnd.github.raw+json"',
    { encoding: 'utf8' }
  );

  const transformed = rawReadme
    .split('\n')
    .map(line => (line.startsWith('# ') ? `#${line}` : line))
    .join('\n');

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

main().then(undefined, (e) => {
  console.error(e);
  process.exit(1);
});
