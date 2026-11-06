// App simples para a aula de balanceamento: mostra qual instância respondeu.
const http = require("http");
const os = require("os");

const PORT = process.env.PORT || 3000;
const NOME = process.env.NOME_INSTANCIA || os.hostname();
const inicio = Date.now();
let visitas = 0; // contador na MEMÓRIA desta instância (de propósito: mostra o problema de estado)

function pagina() {
  return `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${NOME}</title>
<style>
  body{font-family:system-ui,sans-serif;background:#0B0E14;color:#E6E9F0;display:grid;place-items:center;min-height:100vh;margin:0}
  .card{background:#141925;border:1px solid #262D3D;border-radius:16px;padding:40px 56px;text-align:center}
  h1{font-size:64px;margin:0 0 8px;color:#6C8CFF}
  p{margin:6px 0;color:#9AA3B5} b{color:#E6E9F0}
</style></head><body><div class="card">
  <p>Quem respondeu esta requisição:</p>
  <h1>${NOME}</h1>
  <p>Visitas <b>nesta instância</b>: ${visitas}</p>
  <p>No ar há ${Math.round((Date.now() - inicio) / 1000)} s</p>
</div></body></html>`;
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, "http://x");
  console.log(`${new Date().toISOString()} ${NOME} ${req.method} ${url.pathname}`);

  if (url.pathname === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ status: "ok", instancia: NOME }));
  }
  if (url.pathname === "/api") {
    visitas++;
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ instancia: NOME, visitas }));
  }
  if (url.pathname === "/lento") { // /lento?ms=3000 simula requisição demorada (para testar least_conn)
    const ms = Math.min(parseInt(url.searchParams.get("ms")) || 3000, 15000);
    return setTimeout(() => {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ instancia: NOME, demorou_ms: ms }));
    }, ms);
  }
  visitas++;
  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  res.end(pagina());
});

server.listen(PORT, () => console.log(`${NOME} ouvindo na porta ${PORT}`));
process.on("SIGTERM", () => server.close(() => process.exit(0)));
