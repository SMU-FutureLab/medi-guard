// 웹 빌드(dist/)를 claude.ai 아티팩트로 올릴 수 있게 바꾼다 → artifact-web/
// - 페이지 본문만 남긴다 (아티팩트가 <html><head><body>를 감싸 줌)
// - "/_expo/…", "/assets/…" 절대 경로를 상대 경로로 바꾼다
// 사용법: npm run build:artifact
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join, sep } from 'node:path';

const SRC = 'dist';
const OUT = 'artifact-web';
if (!existsSync(join(SRC, 'index.html'))) throw new Error('먼저 npx expo export --platform web 을 실행하세요.');
// 폴더 자체는 두고 안의 내용만 지운다 (OneDrive·열린 창이 폴더를 잡고 있어도 동작하도록)
mkdirSync(OUT, { recursive: true });
for (const name of readdirSync(OUT)) rmSync(join(OUT, name), { recursive: true, force: true, maxRetries: 3 });

// 아티팩트는 '_'로 시작하는 경로를 쓸 수 없어서 _expo/ → expo/ 로 바꾼다
const relative = (s) => s.replaceAll('"/_expo/', '"expo/').replaceAll('"/assets/', '"assets/');
const outPath = (rel) => rel.replace(/^_expo\//, 'expo/');

// 1) JS·이미지·폰트 복사 (JS는 경로 수정)
const files = [];
function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else files.push(p);
  }
}
walk(SRC);
for (const p of files) {
  const rel = p.slice(SRC.length + 1).split(sep).join('/');
  if (rel === 'index.html' || rel === 'metadata.json' || rel === 'favicon.ico') continue;
  const dest = join(OUT, outPath(rel));
  mkdirSync(join(dest, '..'), { recursive: true });
  if (rel.endsWith('.js')) writeFileSync(dest, relative(readFileSync(p, 'utf8')));
  else cpSync(p, dest);
}

// 2) 페이지 본문
const html = readFileSync(join(SRC, 'index.html'), 'utf8');
const scripts = [...html.matchAll(/<script src="\/([^"]+)" defer><\/script>/g)].map((m) => m[1]);
// 앱이 주소를 /search 등으로 바꿔도 사진·폰트 같은 상대 경로가 처음 페이지 폴더 기준으로 풀리도록 <base>를 고정한다
const page = `<title>MEDI GUARD</title>
<script>(function(){var b=document.createElement('base');b.href=location.href.replace(/[?#].*$/,'').replace(/[^/]*$/,'');document.head.insertBefore(b,document.head.firstChild);})();</script>
<meta name="description" content="공식 의약품 정보를 AI가 쉬운 말로 설명하는 MEDI GUARD 앱 프로토타입" />
<style>
  :root { --bg: #ffffff; }
  @media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { --bg: #0c110e; color-scheme: dark; } }
  :root[data-theme="dark"] { --bg: #0c110e; color-scheme: dark; }
  html, body { height: 100%; }
  body { overflow: hidden; background: var(--bg); }
  #root { display: flex; height: 100%; flex: 1; }
</style>
<noscript>이 앱을 보려면 JavaScript가 필요해요.</noscript>
<div id="root"></div>
${scripts.map((s) => `<script src="${outPath(s)}" defer></script>`).join('\n')}
`;
writeFileSync(join(OUT, 'index.html'), page);

const count = files.length;
console.log(`${OUT}/ 완성 — 파일 ${count}개, 스크립트 ${scripts.length}개`);
