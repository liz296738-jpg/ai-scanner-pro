import { createServer } from 'vite';
createServer({ root: process.cwd(), logLevel: 'silent', configFile: 'vite.config.ts' })
  .then(s => { console.log('SERVER OK'); s.close(); })
  .catch(e => { console.log('SERVER FAIL:', e.stack?.split('\n').slice(0,6).join('\n') || e.message); });
