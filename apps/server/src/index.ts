import { showHelp, showVersion, commands } from "./cli";
import { createServer } from "./server";

// @ts-ignore
import pkg from "../../../package.json";

const VERSION = pkg.version;
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001;

// ─── CLI Mode ───────────────────────────────────────────────
const args = process.argv.slice(2);
const command = args[0];

if (command === "--help" || command === "help") showHelp(VERSION);
if (args.includes("-v") || args.includes("--version")) showVersion(VERSION);
if (!command && !process.env.RUN_AS_SERVICE) showHelp(VERSION);

if (command && commands[command]) {
  await commands[command](PORT);
  process.exit(0);
}

// ─── Server Mode ────────────────────────────────────────────
export default createServer(VERSION, PORT);
