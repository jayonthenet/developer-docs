import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  chmodSync,
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const packageJson = JSON.parse(readFileSync(join(repositoryRoot, 'package.json'), 'utf8'));
const version = packageJson.otherDependencies.hugo;
if (version !== '0.142.0') {
  throw new Error(`Hugo ${version} has no reviewed checksums in scripts/install-hugo.mjs`);
}

const assets = {
  'darwin-arm64': {
    name: `hugo_extended_${version}_darwin-universal.tar.gz`,
    sha256: 'c95781cc70314e66070add4ad454f378f1b435490c12880582bedf04f7140986',
  },
  'darwin-x64': {
    name: `hugo_extended_${version}_darwin-universal.tar.gz`,
    sha256: 'c95781cc70314e66070add4ad454f378f1b435490c12880582bedf04f7140986',
  },
  'linux-arm64': {
    name: `hugo_extended_${version}_linux-arm64.tar.gz`,
    sha256: '341941d16c896bcfd49994253fd4a3f9ce75b32181fa2f216c234a0a8bd7c9c2',
  },
  'linux-x64': {
    name: `hugo_extended_${version}_linux-amd64.tar.gz`,
    sha256: '7e0d180a7004519cc794ab76f1c70fa6c9572838528d9787fb13ab4934f4af28',
  },
};

const platform = `${process.platform}-${process.arch}`;
const asset = assets[platform];
if (!asset) {
  throw new Error(`Hugo installation is not supported on ${platform}`);
}

const url = `https://github.com/gohugoio/hugo/releases/download/v${version}/${asset.name}`;
const temporaryDirectory = mkdtempSync(join(tmpdir(), 'stellwerk-hugo-'));
const archivePath = join(temporaryDirectory, asset.name);
const destination = join(repositoryRoot, 'node_modules', '.bin', 'hugo', 'hugo');

try {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Hugo download failed with HTTP ${response.status}`);
  }

  const archive = Buffer.from(await response.arrayBuffer());
  const actualChecksum = createHash('sha256').update(archive).digest('hex');
  if (actualChecksum !== asset.sha256) {
    throw new Error(`Hugo checksum mismatch: expected ${asset.sha256}, got ${actualChecksum}`);
  }

  writeFileSync(archivePath, archive);
  execFileSync('tar', ['-xzf', archivePath, '-C', temporaryDirectory], { stdio: 'inherit' });
  mkdirSync(dirname(destination), { recursive: true });
  copyFileSync(join(temporaryDirectory, 'hugo'), destination);
  chmodSync(destination, 0o755);
} finally {
  rmSync(temporaryDirectory, { force: true, recursive: true });
}
