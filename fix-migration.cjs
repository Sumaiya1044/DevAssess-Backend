const fs = require("fs");

const file = "migrations/app/20260927T1810_sync_devassess_schema/migration.ts";
let s = fs.readFileSync(file, "utf8");

const start = s.indexOf("  override get operations() {");
const end = s.indexOf("\n  }\n}\n\nMigrationCLI.run", start);

if (start === -1 || end === -1) {
  throw new Error("operations getter not found");
}

const body = s.slice(start, end);
const lines = body.split("\n");

const ops = [];
let current = [];

for (const line of lines.slice(1)) {
  if (line.startsWith("    this.")) {
    if (current.length) ops.push(current);
    current = [line];
  } else if (current.length) {
    current.push(line);
  }
}

if (current.length) ops.push(current);

const result = ops.map(op => {
  const copy = [...op];

  for (let i = copy.length - 1; i >= 0; i--) {
    if (copy[i].trim()) {
      copy[i] = copy[i].replace(/;\s*$/, ",");
      if (!copy[i].trim().endsWith(",")) copy[i] += ",";
      break;
    }
  }

  return copy.join("\n");
});

const newBody =
  "  override get operations() {\n" +
  "    return [\n" +
  result.join("\n") +
  "\n    ];\n" +
  "  }";

s = s.slice(0, start) + newBody + s.slice(end + 5);

fs.writeFileSync(file, s);

console.log(`Converted ${ops.length} operations.`);
