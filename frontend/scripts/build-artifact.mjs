// dist/ 빌드 결과(JS·CSS)를 HTML 파일 하나로 합친다. claude.ai 아티팩트로 공유할 때 사용.
// 사용법: npm run build:artifact  →  artifact/medi-guard.html
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const assets = join('dist', 'assets');
const files = readdirSync(assets);
const css = files.filter((f) => f.endsWith('.css')).map((f) => readFileSync(join(assets, f), 'utf8')).join('\n');
const js = files.filter((f) => f.endsWith('.js')).map((f) => readFileSync(join(assets, f), 'utf8')).join('\n');
if (/<\/script/i.test(js)) throw new Error('JS 안에 </script 문자열이 있어 인라인할 수 없습니다.');

const html = `<title>MEDI GUARD</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link href="https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700&family=Noto+Sans+KR:wght@400;500;700;800&display=swap" rel="stylesheet" />
<style>
${css}
</style>
<div id="root"></div>
<script type="module">
${js}
</script>
`;

mkdirSync('artifact', { recursive: true });
writeFileSync(join('artifact', 'medi-guard.html'), html);
console.log(`artifact/medi-guard.html (${(html.length / 1024).toFixed(0)} KB)`);
