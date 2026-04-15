import { config as loadEnv } from "dotenv";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// `vercel dev` serverless subprocess often does not inherit root `.env.local`.
const projectRoot = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
loadEnv({ path: join(projectRoot, ".env.local") });
loadEnv({ path: join(projectRoot, ".env") });
