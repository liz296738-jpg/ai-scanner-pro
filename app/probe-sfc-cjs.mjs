import { createRequire } from 'node:module';
const r = createRequire(import.meta.url);
try { const c = r('vue/compiler-sfc'); console.log('SFC REQUIRE OK keys=', Object.keys(c).length); }
catch (e) { console.log('SFC REQUIRE FAIL:', e.message); }
try { const p = r('vue/package.json'); console.log('PKG REQUIRE OK', p.version); }
catch (e) { console.log('PKG FAIL:', e.message); }
try { const pv = r('@vitejs/plugin-vue'); console.log('PV REQUIRE OK'); }
catch (e) { console.log('PV FAIL:', e.message); }
