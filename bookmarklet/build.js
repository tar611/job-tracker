// Regenerates the bookmarklet link from tracker.js. Run after editing
// tracker.js (e.g. changing API_URL): `node bookmarklet/build.js`
const fs = require("fs");
const path = require("path");

const srcPath = path.join(__dirname, "tracker.js");
const src = fs.readFileSync(srcPath, "utf8");

// Only strips full lines that are pure comments (start with //) — never
// touches inline "//" inside strings like "http://localhost:4000".
const minified = src
  .split("\n")
  .filter((line) => !line.trim().startsWith("//"))
  .join(" ")
  .replace(/\s+/g, " ")
  .trim();

const href = "javascript:" + encodeURIComponent(minified);

const templatePath = path.join(__dirname, "install.template.html");
const outPath = path.join(__dirname, "install.html");
const template = fs.readFileSync(templatePath, "utf8");
fs.writeFileSync(outPath, template.replace("__BOOKMARKLET_HREF__", href));

console.log("Wrote", outPath, `(href length: ${href.length})`);
