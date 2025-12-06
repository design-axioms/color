/* eslint-disable */
const fs = require("fs");
const path = require("path");
const https = require("https");

const GRAMMARS_DIR = path.join(__dirname, "../grammars");
const NODE_MODULES_GRAMMARS = path.join(
  __dirname,
  "../node_modules/tree-sitter-wasms/out",
);
const WEB_TREE_SITTER_WASM = path.join(
  __dirname,
  "../node_modules/web-tree-sitter/tree-sitter.wasm",
);

const WANTED_GRAMMARS = [
  "tree-sitter-html.wasm",
  "tree-sitter-css.wasm",
  "tree-sitter-javascript.wasm",
  "tree-sitter-typescript.wasm",
  "tree-sitter-tsx.wasm",
  "tree-sitter-vue.wasm",
];

const DOWNLOAD_GRAMMARS = {
  // 'tree-sitter-svelte.wasm': 'https://raw.githubusercontent.com/Himujjal/tree-sitter-svelte/gh-pages/tree-sitter-svelte.wasm',
  // 'tree-sitter-astro.wasm': 'https://raw.githubusercontent.com/virchau13/tree-sitter-astro/gh-pages/tree-sitter-astro.wasm',
};

if (!fs.existsSync(GRAMMARS_DIR)) {
  fs.mkdirSync(GRAMMARS_DIR, { recursive: true });
}

// Copy tree-sitter.wasm
if (fs.existsSync(WEB_TREE_SITTER_WASM)) {
  fs.copyFileSync(
    WEB_TREE_SITTER_WASM,
    path.join(GRAMMARS_DIR, "tree-sitter.wasm"),
  );
  console.log("Copied tree-sitter.wasm");
} else {
  console.error("Missing tree-sitter.wasm in node_modules/web-tree-sitter");
}

// Copy from node_modules
WANTED_GRAMMARS.forEach((file) => {
  const src = path.join(NODE_MODULES_GRAMMARS, file);
  const dest = path.join(GRAMMARS_DIR, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`Copied ${file}`);
  } else {
    console.error(`Missing ${file} in node_modules`);
  }
});

// Download missing
const downloadFile = (url, dest) => {
  const fileStream = fs.createWriteStream(dest);
  console.log(`Downloading ${path.basename(dest)}...`);

  const request = https
    .get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        const location = response.headers.location;
        const newUrl = new URL(location, url).toString();
        downloadFile(newUrl, dest);
        return;
      }
      if (response.statusCode !== 200) {
        console.error(
          `Failed to download ${path.basename(dest)}: ${response.statusCode}`,
        );
        return;
      }
      response.pipe(fileStream);
      fileStream.on("finish", () => {
        fileStream.close();
        console.log(`Downloaded ${path.basename(dest)}`);
      });
    })
    .on("error", (err) => {
      fs.unlink(dest, () => {});
      console.error(`Error downloading ${path.basename(dest)}: ${err.message}`);
    });
};

Object.entries(DOWNLOAD_GRAMMARS).forEach(([file, url]) => {
  const dest = path.join(GRAMMARS_DIR, file);
  downloadFile(url, dest);
});
