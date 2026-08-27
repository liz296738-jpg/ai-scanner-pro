// postinstall-restore.mjs — 修复 OneDrive（目录联结/文件占位）导致的 bun install 空壳包问题。
// 依赖安装后调用：把缓存中保持完整载荷的包复制回 node_modules，保证 vite/vue/esbuild 可用。
import { cpSync, existsSync, readdirSync, mkdirSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { homedir } from 'node:os';

const CACHE = join(homedir(), '.bun', 'install', 'cache');
const NM = join(process.cwd(), 'node_modules');

// package name -> exact cache version dir 前缀
const PACKAGES = {
  vue: 'vue@3.5.41',
  picomatch: 'picomatch@4.0.5',
  postcss: 'postcss@8.5.26',
  entities: 'entities@7.0.1',
  'estree-walker': 'estree-walker@2.0.2',
  'magic-string': 'magic-string@0.30.21',
  'source-map-js': 'source-map-js@1.2.1',
  tinyglobby: 'tinyglobby@0.2.17',
  fdir: 'fdir@6.5.0',
  nanoid: 'nanoid@3.3.18',
  picocolors: 'picocolors@1.1.1',
  csstype: 'csstype@3.2.3',
  '@babel/parser': '@babel/parser@7.29.8',
  '@jridgewell/sourcemap-codec': '@jridgewell/sourcemap-codec@1.5.5',
};

const SCOPED = {
  '@vue': {
    pkgs: ['compiler-core', 'compiler-dom', 'compiler-sfc', 'compiler-ssr', 'reactivity', 'runtime-core', 'runtime-dom', 'server-renderer', 'shared'],
    ver: '3.5.41',
  },
  '@babel': { pkgs: ['parser'], ver: '7.29.8' },
  '@jridgewell': { pkgs: ['sourcemap-codec'], ver: '1.5.5' },
};

function copyFromCache(name, cacheKey) {
  const cacheDir = join(CACHE, cacheKey + '@@@1');
  const target = join(NM, name);
  if (!existsSync(cacheDir)) {
    console.warn(`[postinstall-restore] SKIP (no cache): ${name}`);
    return;
  }
  rmSync(target, { recursive: true, force: true });
  mkdirSync(dirname(target), { recursive: true });
  cpSync(cacheDir, target, { recursive: true });
  console.log(`[postinstall-restore] restored ${name} (${cacheKey})`);
}

for (const [name, cacheKey] of Object.entries(PACKAGES)) copyFromCache(name, cacheKey);
for (const [scope, cfg] of Object.entries(SCOPED)) {
  for (const sub of cfg.pkgs) {
    copyFromCache(`${scope}/${sub}`, `${scope}/${sub}@${cfg.ver}`);
  }
}

// @esbuild/win32-x64（独立原生绑定包）
function findCacheDir(pattern) {
  return readdirSync(CACHE)
    .filter((d) => d.startsWith(pattern) && /@@@1$/.test(d))
    .sort((a, b) => (a > b ? -1 : 1))[0];
}
const esbDir = findCacheDir('@esbuild/win32-x64@');
if (esbDir) {
  const target = join(NM, '@esbuild', 'win32-x64');
  rmSync(target, { recursive: true, force: true });
  mkdirSync(dirname(target), { recursive: true });
  cpSync(join(CACHE, esbDir), target, { recursive: true });
  console.log(`[postinstall-restore] restored @esbuild/win32-x64 (${esbDir.replace(/@@@1$/, '')})`);
} else {
  console.warn('[postinstall-restore] no cache for @esbuild/win32-x64');
}

// esbuild + native binding（走查目录自动匹配）
for (const name of ['esbuild', '@esbuild/win32-x64']) {
  const base = name.startsWith('@') ? dirname(name) : '';
  const leaf = name.startsWith('@') ? name.split('/')[1] : name;
  if (base) continue; // @esbuild 已单独处理
  const matches = readdirSync(CACHE).filter((d) => d.startsWith(`${leaf}@`) && /@@@1$/.test(d));
  if (matches.length) {
    matches.sort((a, b) => (a > b ? -1 : 1));
    const cacheDir = join(CACHE, matches[0]);
    const target = join(NM, leaf);
    rmSync(target, { recursive: true, force: true });
    mkdirSync(dirname(target), { recursive: true });
    cpSync(cacheDir, target, { recursive: true });
    console.log(`[postinstall-restore] restored ${name} (${matches[0].replace(/@@@1$/, '')})`);
  } else {
    console.warn(`[postinstall-restore] no cache for ${name}`);
  }
}

console.log('[postinstall-restore] done');