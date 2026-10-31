import { spawn } from 'node:child_process';
const server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '--hostname', '127.0.0.1', '--port', '3101'], { env: {...process.env, VERCEL: '1'}, stdio: ['ignore','ignore','pipe'] });
let serverError = ''; server.stderr.on('data', chunk => serverError += chunk.toString());
try {
  let ready = false;
  for (let i = 0; i < 50; i++) {
    try { if ((await fetch('http://127.0.0.1:3101/import')).ok) { ready = true; break; } } catch {}
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  if (!ready) throw new Error('Server did not start: ' + serverError);
  await import('./upload-repair.mjs');
  await import('./reading-flow.mjs');
} finally { server.kill('SIGTERM'); }
