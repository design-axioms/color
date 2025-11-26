import { spawn } from "child_process";
import http from "http";
import httpProxy from "http-proxy";

const MDBOOK_PORT = 3001;
const VITE_PORT = 3002;
const PROXY_PORT = 3000;

// Start mdbook
console.log(`Starting mdbook on port ${MDBOOK_PORT}...`);
const mdbook = spawn(
  "mdbook",
  ["serve", "docs/guide", "-p", MDBOOK_PORT.toString()],
  {
    stdio: "inherit",
    shell: true,
  }
);

// Start Vite
console.log(`Starting Vite on port ${VITE_PORT}...`);
const vite = spawn(
  "pnpm",
  ["exec", "vite", "--port", VITE_PORT.toString(), "--strictPort"],
  {
    cwd: "demo",
    stdio: "inherit",
    shell: true,
  }
);

// Create Proxy
const proxy = httpProxy.createProxyServer({});

// Error handling for proxy
proxy.on("error", (err, _req, res) => {
  console.error("Proxy error:", err);
  if (res instanceof http.ServerResponse && !res.headersSent) {
    res.writeHead(500, { "Content-Type": "text/plain" });
    res.end("Proxy error: " + err.message);
  }
});

const server = http.createServer((req, res) => {
  if (req.url?.startsWith("/demo/")) {
    // Forward to Vite
    // Note: Vite expects /demo/ base, so we don't need to strip the prefix if we configured base: '/demo/'
    proxy.web(req, res, { target: `http://localhost:${VITE_PORT}` });
  } else {
    // Forward to mdbook
    proxy.web(req, res, { target: `http://localhost:${MDBOOK_PORT}` });
  }
});

console.log(
  `\n🚀 Unified Dev Server running at http://localhost:${PROXY_PORT}\n`
);
server.listen(PROXY_PORT);

// Handle cleanup
const cleanup = (): void => {
  console.log("\nStopping servers...");
  mdbook.kill();
  vite.kill();
  process.exit();
};

process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);
