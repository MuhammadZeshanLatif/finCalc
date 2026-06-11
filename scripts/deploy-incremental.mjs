/**
 * Incremental deploy via SFTP (shared hosting / jailshell — no rsync on server).
 * Uses ONE connection by default — parallel SFTP often triggers ECONNRESET on jailshell.
 *
 * Env: DEPLOY_HOST, DEPLOY_USER, DEPLOY_REMOTE_DIR, DEPLOY_LOCAL_DIR, DEPLOY_KEY_PATH
 * Optional: DEPLOY_PORT (default 22), DEPLOY_CONCURRENCY (default 1), DEPLOY_RETRIES (default 5)
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import SftpClient from "ssh2-sftp-client";

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
const port = Number((process.env.DEPLOY_PORT || "22").trim());
const user = process.env.DEPLOY_USER.trim();
const remoteBase = process.env.DEPLOY_REMOTE_DIR.trim().replace(/\/$/, "");
const localDir = path.resolve(root, process.env.DEPLOY_LOCAL_DIR.trim());
const keyPath = path.resolve(process.env.DEPLOY_KEY_PATH.trim());
const concurrency = Math.max(1, Math.min(2, Number(process.env.DEPLOY_CONCURRENCY || "1")));
const maxRetries = Math.max(1, Number(process.env.DEPLOY_RETRIES || "5"));

if (!existsSync(localDir)) {
  console.error(`Local deploy dir not found: ${localDir}`);
  process.exit(1);
}
if (!existsSync(keyPath)) {
  console.error(`SSH key not found: ${keyPath}`);
  process.exit(1);
}

const privateKey = readFileSync(keyPath, "utf8");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isTransientError(err) {
  const msg = String(err?.message || err?.code || err).toLowerCase();
  return (
    msg.includes("econnreset") ||
    msg.includes("econnrefused") ||
    msg.includes("etimedout") ||
    msg.includes("connection lost") ||
    msg.includes("not connected") ||
    msg.includes("socket") ||
    msg.includes("closed")
  );
}

async function withRetry(label, fn) {
  let lastErr;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (!isTransientError(err) || attempt === maxRetries) throw err;
      const wait = Math.min(15000, 2000 * attempt);
      console.warn(`${label} failed (attempt ${attempt}/${maxRetries}): ${err.message}. Retry in ${wait}ms...`);
      await sleep(wait);
    }
  }
  throw lastErr;
}

function walkLocalFiles(dir, base = dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    const rel = path.relative(base, full).split(path.sep).join("/");
    if (entry.isDirectory()) {
      walkLocalFiles(full, base, out);
    } else if (entry.isFile()) {
      out.push({ local: full, rel });
    }
  }
  return out;
}

async function ensureRemoteDir(sftp, remotePath) {
  const normalized = remotePath.replace(/\\/g, "/");
  const parts = normalized.split("/").filter(Boolean);
  let current = normalized.startsWith("/") ? "" : "";
  for (const part of parts) {
    current = current ? `${current}/${part}` : `/${part}`;
    try {
      await sftp.mkdir(current, true);
    } catch (err) {
      const msg = String(err?.message || err);
      if (!msg.toLowerCase().includes("already exists")) {
        throw err;
      }
    }
  }
}

async function remoteFileNeedsUpload(sftp, localPath, remotePath) {
  try {
    const local = statSync(localPath);
    const remote = await sftp.stat(remotePath);
    const remoteMtime =
      typeof remote.modifyTime === "number"
        ? remote.modifyTime
        : Number(remote.mtime || 0) * 1000;
    return local.size !== remote.size || local.mtimeMs > remoteMtime + 1000;
  } catch {
    return true;
  }
}

async function listRemoteFiles(sftp, remoteDir, prefix = "") {
  const results = [];
  let listing;
  try {
    listing = await sftp.list(remoteDir);
  } catch {
    return results;
  }

  for (const item of listing) {
    if (item.name === "." || item.name === "..") continue;
    const rel = prefix ? `${prefix}/${item.name}` : item.name;
    const full = `${remoteDir}/${item.name}`.replace(/\/+/g, "/");
    if (item.type === "d") {
      results.push(...(await listRemoteFiles(sftp, full, rel)));
    } else {
      results.push(rel);
    }
  }
  return results;
}

function connectConfig() {
  return {
    host,
    port,
    username: user,
    privateKey,
    readyTimeout: 60000,
    keepaliveInterval: 10000,
    keepaliveCountMax: 5,
    algorithms: {
      serverHostKey: ["ssh-rsa", "ssh-ed25519", "ecdsa-sha2-nistp256", "ecdsa-sha2-nistp384", "ecdsa-sha2-nistp521"],
    },
  };
}

class SftpSession {
  constructor() {
    this.client = new SftpClient();
    this.connected = false;
  }

  async connect() {
    if (this.connected) return;
    await withRetry("SFTP connect", async () => {
      await this.client.connect(connectConfig());
      this.connected = true;
    });
  }

  async end() {
    if (!this.connected) return;
    try {
      await this.client.end();
    } catch {
      /* ignore */
    }
    this.connected = false;
  }

  async reconnect() {
    await this.end();
    this.client = new SftpClient();
    await this.connect();
  }

  async run(action) {
    try {
      await this.connect();
      return await action(this.client);
    } catch (err) {
      if (isTransientError(err)) {
        await this.reconnect();
        return await action(this.client);
      }
      throw err;
    }
  }
}

const files = walkLocalFiles(localDir);
const localSet = new Set(files.map((f) => f.rel));

console.log(
  `Deploy (SFTP): ${localDir}/ -> ${user}@${host}:${remoteBase}/ (${files.length} files, concurrency ${concurrency})`,
);

let uploaded = 0;
let skipped = 0;
const session = new SftpSession();

try {
  await session.connect();
  await ensureRemoteDir(session.client, remoteBase);

  const remoteDirs = new Set(
    files.map((f) => {
      const dir = path.posix.dirname(f.rel);
      return dir === "." ? remoteBase : `${remoteBase}/${dir}`;
    }),
  );
  for (const dir of [...remoteDirs].sort()) {
    await ensureRemoteDir(session.client, dir);
  }

  for (const file of files) {
    const remotePath = `${remoteBase}/${file.rel}`.replace(/\/+/g, "/");
    await withRetry(`upload ${file.rel}`, async () => {
      await session.run(async (sftp) => {
        if (await remoteFileNeedsUpload(sftp, file.local, remotePath)) {
          await sftp.fastPut(file.local, remotePath);
          uploaded++;
          console.log(`UP ${file.rel}`);
        } else {
          skipped++;
        }
      });
    });
    await sleep(50);
  }

  const remoteFiles = await session.run((sftp) => listRemoteFiles(sftp, remoteBase));
  let deleted = 0;
  for (const rel of remoteFiles) {
    if (!localSet.has(rel)) {
      await withRetry(`delete ${rel}`, async () => {
        await session.run((sftp) =>
          sftp.delete(`${remoteBase}/${rel}`.replace(/\/+/g, "/")),
        );
      });
      deleted++;
      console.log(`DEL ${rel}`);
    }
  }

  console.log(`Done: uploaded ${uploaded}, skipped ${skipped}, deleted ${deleted}`);
} catch (err) {
  console.error("Deploy failed:", err?.message || err);
  process.exit(1);
} finally {
  await session.end();
}
