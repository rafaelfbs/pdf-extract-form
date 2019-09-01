const path = require("path");
const childProc = require("child_process");

function startDoc(ctx) {
  if (ctx.field) {
    ctx.fields.push(ctx.field);
  }
  ctx.field = {};
}

function parseFieldLine(line, ctx) {
  const [attr, value] = line.split(": ");
  ctx.field[attr] = value;
}

function extract(line, ctx) {
  if (line === "---") return startDoc(ctx);
  return parseFieldLine(line, ctx);
}

function extractFromLines(lines) {
  const ctx = { fields: [] };
  lines.forEach(line => extract(line, ctx));
  return ctx;
}

function parseDump(str) {
  const lines = str.split(/\r?\n/);
  const ctx = extractFromLines(lines);

  const doc = {};
  for (const field of ctx.fields) {
    doc[field.FieldName] = field.FieldValue;
  }

  return doc;
}

function dumpDataFields(pdfPath) {
  const { stdout, stderr, status } = childProc.spawnSync("pdftk", [path.resolve(pdfPath), "dump_data_fields"]);

  if (status !== 0) {
    throw new Error(stderr.toString().trim());
  } else {
    return parseDump(stdout.toString());
  }
}

console.log(JSON.stringify(dumpDataFields(process.argv[2]), null, 4));
