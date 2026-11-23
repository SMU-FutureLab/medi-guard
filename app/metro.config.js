// 개발 서버 설정.
// 웹 개발 중에는 앱이 백엔드를 직접 부르지 않고, 개발 서버의 같은 주소(/api/...)로 부른다.
// 개발 서버가 그 요청을 EXPO_PUBLIC_API_BASE_URL(백엔드)로 그대로 전달하므로 브라우저 CORS 제한을 받지 않는다.
// (휴대폰 앱은 CORS 제한이 없어서 백엔드를 직접 부른다 — src/api/client.ts 참고)
const http = require('http');
const path = require('path');
const https = require('https');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// 빌드 결과물 폴더는 개발 서버가 살펴볼 필요가 없다.
// (OneDrive 동기화 중인 파일을 읽다가 개발 서버가 멈추는 문제 방지)
// 이 프로젝트 바로 아래의 artifact-web/, dist/ 만 막는다 (node_modules 안의 dist는 그대로 둔다)
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const ignoreBuildOutput = ['artifact-web', 'dist'].map(
  (dir) => new RegExp(`^${escapeRe(path.join(__dirname, dir))}[\\\\/].*`),
);
const existing = config.resolver.blockList;
config.resolver.blockList = [...(Array.isArray(existing) ? existing : existing ? [existing] : []), ...ignoreBuildOutput];

const backend = process.env.EXPO_PUBLIC_API_BASE_URL;

if (backend) {
  const target = new URL(backend);
  const client = target.protocol === 'https:' ? https : http;
  const previous = config.server?.enhanceMiddleware;

  config.server = {
    ...config.server,
    enhanceMiddleware: (middleware, server) => {
      const base = previous ? previous(middleware, server) : middleware;
      return (req, res, next) => {
        if (!req.url || !req.url.startsWith('/api/')) return base(req, res, next);

        const upstream = client.request(
          {
            protocol: target.protocol,
            hostname: target.hostname,
            port: target.port || (target.protocol === 'https:' ? 443 : 80),
            path: req.url,
            method: req.method,
            headers: { ...req.headers, host: target.host },
          },
          (r) => {
            res.writeHead(r.statusCode ?? 502, r.headers);
            r.pipe(res);
          },
        );
        upstream.on('error', (e) => {
          res.writeHead(502, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ detail: `백엔드 서버(${target.host})에 연결할 수 없어요. 서버가 켜져 있는지 확인해 주세요.`, cause: e.message }));
        });
        req.pipe(upstream);
      };
    },
  };
}

module.exports = config;
