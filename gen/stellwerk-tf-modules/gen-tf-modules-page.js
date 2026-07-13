#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const yaml = require('yaml');

const ORG = 'stellwerk-tf-modules';
const TEMPLATE = path.join(__dirname, 'public-tf-modules.md');
const CONFIG = path.join(__dirname, 'repos.yaml');
const OUTPUT = path.join(__dirname, '../../content/platform-orchestrator/docs/integrations/public-tf-modules.md');
function fetchRepos() {
  const result = execSync(
    `gh repo list ${ORG} --visibility=public --json name,description --limit 1000`,
    { encoding: 'utf-8' }
  );
  return JSON.parse(result);
}

function loadConfig() {
  const raw = fs.readFileSync(CONFIG, 'utf-8');
  const parsed = yaml.parse(raw);

  const orchestratorConfig = parsed['orchestrator-configuration'] || [];
  const moduleSources = parsed['module-source'] || [];
  const ignored = parsed['ignore'] || [];

  // Detect duplicates across all sections
  const allEntries = [...orchestratorConfig, ...moduleSources, ...ignored];
  const seen = new Set();
  for (const name of allEntries) {
    if (seen.has(name)) {
      console.error(`Could not render list of stellwerk-tf-modules: repo "${name}" appears more than once in repos.yaml`);
      process.exit(1);
    }
    seen.add(name);
  }

  return {
    orchestratorConfig: new Set(orchestratorConfig),
    moduleSources: new Set(moduleSources),
    ignored: new Set(ignored),
  };
}

function buildTable(repos) {
  const sorted = [...repos].sort((a, b) => a.name.localeCompare(b.name));

  const rows = sorted.map(({ name, description }) => {
    const url = `https://github.com/${ORG}/${name}`;
    const link = `[${name}](${url})`;
    const about = (description || '')
      .replace(/Humanitec/g, 'Stellwerk')
      .replace(/\|/g, '\\|');
    return `| ${link} | ${about} |`;
  });

  return [
    '| Module | About |',
    '| --- | --- |',
    ...rows,
  ].join('\n');
}

const allRepos = fetchRepos();
const { orchestratorConfig, moduleSources, ignored } = loadConfig();

const fetchedNames = new Set(allRepos.map(r => r.name));
const unknown = [...orchestratorConfig, ...moduleSources].filter(name => !fetchedNames.has(name));
if (unknown.length > 0) {
  console.error(`Could not render list of stellwerk-tf-modules: repos.yaml references repos not found in the GitHub org: ${unknown.join(', ')}`);
  process.exit(1);
}

const orchestratorRepos = [];
const moduleSourceRepos = [];

for (const repo of allRepos) {
  if (ignored.has(repo.name)) continue;

  if (orchestratorConfig.has(repo.name)) {
    orchestratorRepos.push(repo);
  } else if (moduleSources.has(repo.name)) {
    moduleSourceRepos.push(repo);
  } else {
    console.error(`Could not render list of stellwerk-tf-modules: repo "${repo.name}" found but not configured`);
    process.exit(1);
  }
}

const template = fs.readFileSync(TEMPLATE, 'utf-8');
const output = template
  .replace('MODULE_LIST_ORCHESTRATOR_CONFIG_GOES_HERE', buildTable(orchestratorRepos))
  .replace('MODULE_LIST_MODULE_SOURCES_GOES_HERE', buildTable(moduleSourceRepos));

fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
fs.writeFileSync(OUTPUT, output, 'utf-8');

console.log(`Written ${orchestratorRepos.length} orchestrator-configuration and ${moduleSourceRepos.length} module-source repos to ${OUTPUT}`);
