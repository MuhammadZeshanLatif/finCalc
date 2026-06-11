/**
 * Incremental deploy via SFTP (shared hosting / jailshell — no rsync on server).
 *
 * Env: DEPLOY_HOST, DEPLOY_USER, DEPLOY_REMOTE_DIR, DEPLOY_LOCAL_DIR, DEPLOY_KEY_PATH
 * Optional: DEPLOY_PORT (default 22), DEPLOY_CONCURRENCY (default 8)
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
const concurrency = Math.max(1, Number(process.env.DEPLOY_CONCURRENCY || "8"));

if (!existsSync(localDir)) {
  console.error(`Local deploy dir not found: ${localDir}`);
  process.exit(1);
}
if (!existsSync(keyPath)) {
  console.error(`SSH key not found: ${keyPath}`);
  process.exit(1);
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
    privateKey: readFileSync(keyPath, "utf8"),
    readyTimeout: 30000,
    retries: 2,
    retry_factor: 2,
  };
}

async function openSftpPool(size) {
  const clients = [];
  for (let i = 0; i < size; i++) {
    const client = new SftpClient();
    await client.connect(connectConfig());
    clients.push(client);
  }
  return clients;
}

async function uploadWithPool(pool, items) {
  await Promise.all(
    pool.map(async (client, workerId) => {
      for (let i = workerId; i < items.length; i += pool.length) {
        await uploadOne(client, items[i]);
      }
    }),
  );
}

const files = walkLocalFiles(localDir);
const localSet = new Set(files.map((f) => f.rel));

console.log(
  `Deploy (SFTP): ${localDir}/ -> ${user}@${host}:${remoteBase}/ (${files.length} files, concurrency ${concurrency})`,
);

let uploaded = 0;
let skipped = 0;

async function uploadOne(client, file) {
  const remotePath = `${remoteBase}/${file.rel}`.replace(/\/+/g, "/");
  if (await remoteFileNeedsUpload(client, file.local, remotePath)) {
    await client.fastPut(file.local, remotePath);
    uploaded++;
    console.log(`UP ${file.rel}`);
  } else {
    skipped++;
  }
}

const pool = await openSftpPool(concurrency);
const main = pool[0];

try {
  await ensureRemoteDir(main, remoteBase);

  const remoteDirs = new Set(
    files.map((f) => {
      const dir = path.posix.dirname(f.rel);
      return dir === "." ? remoteBase : `${remoteBase}/${dir}`;
    }),
  );
  for (const dir of [...remoteDirs].sort()) {
    await ensureRemoteDir(main, dir);
  }

  await uploadWithPool(pool, files);

  const remoteFiles = await listRemoteFiles(main, remoteBase);
  let deleted = 0;
  for (const rel of remoteFiles) {
    if (!localSet.has(rel)) {
      await main.delete(`${remoteBase}/${rel}`.replace(/\/+/g, "/"));
      deleted++;
      console.log(`DEL ${rel}`);
    }
  }

  console.log(`Done: uploaded ${uploaded}, skipped ${skipped}, deleted ${deleted}`);
} catch (err) {
  console.error("Deploy failed:", err?.message || err);
  process.exit(1);
} finally {
  await Promise.all(pool.map((c) => c.end()));
}
