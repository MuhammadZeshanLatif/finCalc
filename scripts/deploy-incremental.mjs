/**
 * Incremental deploy over SSH (rsync).
 * No separate "clear remote folder" step — --delete removes stale files safely.
 *
 * Env: DEPLOY_HOST, DEPLOY_USER, DEPLOY_REMOTE_DIR, DEPLOY_LOCAL_DIR, DEPLOY_KEY_PATH
 * Optional: DEPLOY_PORT (default 22)
 */
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const required = [
  "DEPLOY_HOST",
  "DEPLOY_USER",
  "DEPLOY_REMOTE_DIR",
  "DEPLOY_LOCAL_DIR",
  "DEPLOY_KEY_PATH",
];

for (const key of required) {
  if (!process.env[key]?.trim()) {
    console.error(`Missing env: ${key}`);
    process.exit(1);
  }
}

const host = process.env.DEPLOY_HOST.trim();
const port = (process.env.DEPLOY_PORT || "22").trim();
const user = process.env.DEPLOY_USER.trim();
const remoteDir = process.env.DEPLOY_REMOTE_DIR.trim().replace(/\/?$/, "/");
const localDir = path.resolve(root, process.env.DEPLOY_LOCAL_DIR.trim());
const keyPath = path.resolve(process.env.DEPLOY_KEY_PATH.trim());

if (!existsSync(localDir)) {
  console.error(`Local deploy dir not found: ${localDir}`);
  process.exit(1);
}
if (!existsSync(keyPath)) {
  console.error(`SSH key not found: ${keyPath}`);
  process.exit(1);
}

const sshCmd = [
  "ssh",
  "-i",
  keyPath,
  "-p",
  port,
  "-o",
  "StrictHostKeyChecking=yes",
  "-o",
  "BatchMode=yes",
  "-o",
  "ConnectTimeout=30",
].join(" ");

const rsyncArgs = [
  "-avz",
  "--delete",
  "--omit-dir-times",
  "-e",
  sshCmd,
  `${localDir}/`,
  `${user}@${host}:${remoteDir}`,
];

console.log(`Deploy: ${localDir}/ -> ${user}@${host}:${remoteDir}`);

const result = spawnSync("rsync", rsyncArgs, { stdio: "inherit" });
if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}
process.exit(result.status ?? 1);
