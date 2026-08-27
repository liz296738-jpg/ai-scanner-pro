// deploy-copy.mjs — 将 app/dist 拷贝到仓库根 dist（Render publishPath 用仓库根）。
// 同时删除 dist 中与服务端无关的运行时文件（app/dist 已含 sw/opencv）。
import { cpSync, rmSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const APP_DIST = join(ROOT, 'app', 'dist');
const ROOT_DIST = join(ROOT, 'dist');

if (!existsSync(APP_DIST)) {
  console.error('app/dist not found. Did the build run?');
  process.exit(1);
}

rmSync(ROOT_DIST, { recursive: true, force: true });
cpSync(APP_DIST, ROOT_DIST, { recursive: true });

console.log('deploy-copy: app/dist -> dist OK');
console.log('dist files:', readdirSync(ROOT_DIST).join(', '));