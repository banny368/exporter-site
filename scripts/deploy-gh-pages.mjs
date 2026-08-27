/**
 * Build and publish the static export to the `gh-pages` branch.
 *
 * This is the deployment path that needs no special token permissions — pushing a file
 * under `.github/workflows/` requires the `workflow` OAuth scope, which the account this
 * site is deployed from does not have. `deploy/github-pages-workflow.yml` holds the
 * Actions workflow for when that scope is available; see DEPLOY.md.
 *
 * The owner and repository name are read from the `origin` remote, so renaming the repo
 * or moving it to another account needs no edit here.
 *
 * Run: npm run deploy
 */
import { execFileSync } from "node:child_process";
import { existsSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "out");

function run(command, args, options = {}) {
  return execFileSync(command, args, {
    cwd: options.cwd ?? ROOT,
    env: { ...process.env, ...options.env },
    stdio: options.capture ? ["ignore", "pipe", "pipe"] : "inherit",
    encoding: "utf8",
    shell: process.platform === "win32",
  });
}

function capture(command, args, options = {}) {
  return run(command, args, { ...options, capture: true }).trim();
}

const remote = capture("git", ["remote", "get-url", "origin"]);
const match = remote.match(/github\.com[/:]([^/]+)\/(.+?)(?:\.git)?$/);
if (!match) throw new Error(`Could not read owner and repo from the origin remote: ${remote}`);

const [, owner, repo] = match;
// A project site is served from /<repo>; a user site (owner.github.io) from the root.
const isUserSite = repo.toLowerCase() === `${owner.toLowerCase()}.github.io`;
const basePath = isUserSite ? "" : `/${repo}`;
const siteUrl = `https://${owner.toLowerCase()}.github.io`;

console.log(`Deploying ${owner}/${repo}`);
console.log(`  base path: ${basePath || "(root)"}`);
console.log(`  site URL:  ${siteUrl}${basePath}/`);
console.log("");

if (existsSync(OUT)) rmSync(OUT, { recursive: true, force: true });
rmSync(path.join(ROOT, ".next"), { recursive: true, force: true });

run("npm", ["run", "build"], {
  env: { NEXT_PUBLIC_BASE_PATH: basePath, NEXT_PUBLIC_SITE_URL: siteUrl },
});

if (!existsSync(path.join(OUT, "index.html"))) {
  throw new Error("Build produced no out/index.html — refusing to publish.");
}

// A throwaway repository inside out/. The parent .gitignore already excludes out/, so
// this never interferes with the source history.
rmSync(path.join(OUT, ".git"), { recursive: true, force: true });
run("git", ["init", "-q"], { cwd: OUT });
run("git", ["checkout", "-q", "-B", "gh-pages"], { cwd: OUT });
run("git", ["add", "-A"], { cwd: OUT });
run(
  "git",
  ["-c", "user.name=deploy", "-c", "user.email=deploy@localhost", "commit", "-q", "-m", `Deploy ${new Date().toISOString()}`],
  { cwd: OUT },
);
run("git", ["push", "--force", "--quiet", remote, "gh-pages:gh-pages"], { cwd: OUT });
rmSync(path.join(OUT, ".git"), { recursive: true, force: true });

console.log("");
console.log(`Published to gh-pages. Live at ${siteUrl}${basePath}/`);
console.log("If this is the first deploy, set Pages source to the gh-pages branch.");
