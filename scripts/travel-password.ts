import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { fileURLToPath } from "node:url";

const path = fileURLToPath(new URL("../.env.local", import.meta.url));
const current = existsSync(path) ? readFileSync(path, "utf8") : "";
if (/^TRAVEL_ADMIN_PASSWORD=/m.test(current)) {
  console.log(
    "TRAVEL_ADMIN_PASSWORD is already set in .env.local. Edit that value to change it; changing it signs out existing sessions.",
  );
} else {
  const password = randomBytes(24).toString("base64url");
  writeFileSync(
    path,
    `${current.trimEnd()}\n\n# Travel editor — keep private; also set this in your hosting environment.\nTRAVEL_ADMIN_PASSWORD=${password}\n`,
    { mode: 0o600 },
  );
  console.log(
    `Your travel admin password: ${password}\n\nSaved to .env.local. Restart the dev server, then open /admin/travel.\nFor production, add TRAVEL_ADMIN_PASSWORD to your hosting environment and redeploy.`,
  );
}
