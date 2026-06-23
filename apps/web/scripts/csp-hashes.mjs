// output: "static" → no per-request nonce, so CSP allows JSON-LD via per-route hash instead.
import { createHash } from "node:crypto";
import { readFile, readdir, appendFile, stat } from "node:fs/promises";
import { join, relative, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const distDir = join(root, "..", "dist");
const headersFile = join(distDir, "_headers");

const SCRIPT_RE =
  /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/g;

async function findHtmlFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await findHtmlFiles(full)));
    } else if (entry.name.endsWith(".html")) {
      files.push(full);
    }
  }
  return files;
}

function toRoute(htmlPath) {
  const rel = relative(distDir, htmlPath).replaceAll("\\", "/");
  if (rel === "index.html") return "/";
  if (rel.endsWith("/index.html"))
    return `/${rel.slice(0, -"index.html".length)}`;
  return `/${rel}`;
}

async function main() {
  if (!(await stat(distDir).catch(() => false))) {
    console.error("dist/ not found — run `astro build` first");
    process.exit(1);
  }

  const htmlFiles = await findHtmlFiles(distDir);
  const overrides = [];

  for (const file of htmlFiles) {
    const html = await readFile(file, "utf8");
    const hashes = [];
    for (const match of html.matchAll(SCRIPT_RE)) {
      const hash = createHash("sha256").update(match[1]).digest("base64");
      hashes.push(`'sha256-${hash}'`);
    }
    if (hashes.length > 0) {
      overrides.push({ route: toRoute(file), hashes });
    }
  }

  if (overrides.length === 0) {
    console.log("No inline JSON-LD scripts found, nothing to do.");
    return;
  }

  const baseHeaders = await readFile(headersFile, "utf8");
  const cspLineMatch = baseHeaders.match(
    /^ {2}Content-Security-Policy: (.+)$/m,
  );
  if (!cspLineMatch) {
    throw new Error(
      "Could not find base Content-Security-Policy line in _headers",
    );
  }

  let out = "\n";
  for (const { route, hashes } of overrides) {
    const csp = cspLineMatch[1].replace(
      "script-src 'self';",
      `script-src 'self' ${hashes.join(" ")};`,
    );
    out += `${route}\n  Content-Security-Policy: ${csp}\n`;
  }

  await appendFile(headersFile, out);
  console.log(
    `Appended CSP hash overrides for ${overrides.length} route(s) to dist/_headers`,
  );
}

main();
