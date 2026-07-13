// Update the Platform Orchestrator runner image version in config.toml.
const fs = require('node:fs/promises')

const main = async () => {
  if (process.argv.length !== 3) {
    throw new Error('Usage: node index.js <version>');
  }

  let version = process.argv[2];
  // Remove 'v' prefix if present
  if (version.startsWith('v')) {
    version = version.slice(1);
  }

  const config =  await fs.readFile('./config/_default/config.toml', 'utf8');

  const newConfig = config.replace(
    /platformOrchestratorRunnerImageVersion = ".*"/,
    `platformOrchestratorRunnerImageVersion = "${version}"`,
  );
  await fs.writeFile('./config/_default/config.toml', newConfig);

  return version;
}

main().then((version) => {
  console.log('Version updated to:', version);
}, (e) => {
  console.log('Update failed');
  console.error(e);
  process.exit(1);
});
