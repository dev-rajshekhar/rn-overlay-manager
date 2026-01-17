const fs = require("fs");
const path = require("path");

const target = path.join(__dirname, "..", "dist", "index.cjs");
const contents = "module.exports = require('./cjs/index.js');\n";

fs.writeFileSync(target, contents);
