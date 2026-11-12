import { spawn } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const action = process.argv[2];
if (!['config', 'login'].includes(action)) {
  console.error('Usage: node dsh/setup.mjs config | login');
  process.exit(2);
}

const bridgeDir = fileURLToPath(new URL('./node_modules/mcp-remote/', import.meta.url));
let manifest;
try {
  manifest = JSON.parse(await readFile(path.join(bridgeDir, 'package.json'), 'utf8'));
} catch {
  console.error('Install the bridge first: npm install --prefix dsh --ignore-scripts');
  process.exit(1);
}
if (manifest.version !== '0.16.6') {
  console.error('Reinstall the bridge version declared in dsh/package.json.');
  process.exit(1);
}

const endpoint = 'https://trygateway.sh/mcp';
const flags = [endpoint, '--transport', 'http-only', '--auth-timeout', '180',
  '--static-oauth-client-metadata', JSON.stringify({ token_endpoint_auth_method: 'none' })];
const env = { MCP_REMOTE_CONFIG_DIR: path.join(homedir(), '.mcp-auth', 'gateway-ssh') };
const binary = (name) => path.join(bridgeDir, manifest.bin[name]);

if (action === 'config') {
  const config = {
    serverName: 'gateway',
    transport: 'stdio',
    command: process.execPath,
    args: [binary('mcp-remote'), ...flags],
    env,
  };
  console.log(JSON.stringify(config, null, 2));
} else {
  const child = spawn(process.execPath, [binary('mcp-remote-client'), ...flags], {
    stdio: 'inherit',
    env: { ...process.env, ...env },
  });
  child.once('error', (error) => { console.error(error.message); process.exitCode = 1; });
  child.once('exit', (code, signal) => { process.exitCode = code ?? (signal ? 1 : 0); });
}
