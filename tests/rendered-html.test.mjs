import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${pathname}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${pathname}`, { headers: { accept: "text/html" } }),
    {
      ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
    },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the truthful public landing contract", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /PrismEthics/);
  assert.match(html, /Thinking that/);
  assert.match(html, /carries/);
  assert.match(html, /Begin a Work Object/);
  assert.match(html, /device-local Workbench/i);
  assert.match(html, /does not claim cloud sync/i);
  assert.doesNotMatch(html, /three free sessions|no subscription|cannot revise/i);
  assert.doesNotMatch(html, /codex-preview|SkeletonPreview|react-loading-skeleton/i);
});

test("keeps the governed localhost Workbench boundary explicit in source", async () => {
  const [workbench, buildout, packageJson] = await Promise.all([
    readFile(new URL("../app/workbench/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../docs/BUILDOUT_CURRENT_2026-08-14.md", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(workbench, /http:\/\/127\.0\.0\.1:8765\/api/);
  assert.match(workbench, /Derived current attention/);
  assert.match(workbench, /Propose with Writer Core/);
  assert.match(workbench, /Before these lenses shape the review/);
  assert.match(workbench, /None is selected or authoritative/);
  assert.match(workbench, /What this reveals/);
  assert.match(workbench, /What it may obscure/);
  assert.match(workbench, /Where they materially disagree/);
  assert.match(workbench, /Accept one/);
  assert.match(workbench, /Combine selected/);
  assert.match(workbench, /Accept Human edit/);
  assert.match(workbench, /Reject all/);
  assert.match(workbench, /Request another lens/);
  assert.match(workbench, /Add missing reading/);
  assert.match(workbench, /Hold/);
  assert.match(workbench, /Close with continuity/);
  assert.match(workbench, /Provider & provenance/);
  assert.match(workbench, /Credential value never crosses into the browser/);
  assert.match(workbench, /Resume restores relevance and state, never authority/);
  assert.match(workbench, /Product MVS/);
  assert.doesNotMatch(workbench, /window\.localStorage/);
  assert.match(buildout, /Human Authority accepted the evidence/);
  assert.match(buildout, /no Product MVS acceptance claim/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  await assert.rejects(access(new URL("../app/_sites-preview/SkeletonPreview.tsx", import.meta.url)));
  await assert.rejects(access(new URL("../app/_sites-preview/preview.css", import.meta.url)));
});
