// Next.js "standalone" output doesn't bundle static assets or /public by
// design (https://nextjs.org/docs/app/api-reference/config/next-config-js/output) —
// they must be copied in manually so the standalone server can serve them.
import { cpSync, existsSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const standaloneDir = join(root, ".next", "standalone");

if (!existsSync(standaloneDir)) {
  console.error('.next/standalone not found — run "next build" first.');
  process.exit(1);
}

cpSync(join(root, ".next", "static"), join(standaloneDir, ".next", "static"), {
  recursive: true,
});
cpSync(join(root, "public"), join(standaloneDir, "public"), { recursive: true });

console.log("Copied .next/static and public/ into .next/standalone/");
