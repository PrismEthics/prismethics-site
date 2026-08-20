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
  const [css, home] = await Promise.all([
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
  ]);
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /PrismEthics/);
  assert.match(html, /Thinking that/);
  assert.match(html, /carries/);
  assert.match(html, /Begin with one thought/);
  assert.match(html, /This pilot begins with one Thought Object/i);
  assert.match(html, /research, writing, analysis,[\s\S]*Those later capabilities are not active here/i);
  assert.match(html, /Before anyone begins a pilot/i);
  assert.match(html, /where their writing will be stored/i);
  assert.match(html, /whether an outside AI service will be used/i);
  assert.match(html, /a suggestion stays[\s\S]*a proposal until the person reviews and accepts the exact change/i);
  assert.doesNotMatch(html, /three free sessions|no subscription|cannot revise/i);
  assert.doesNotMatch(html, /This preview runs on this computer|Private on this device in the current preview|Not yet[^\n]*Live AI help/i);
  assert.doesNotMatch(html, /codex-preview|SkeletonPreview|react-loading-skeleton/i);
  assert.match(css, /\.beam-in[^}]*top:\s*59\.5%[^}]*width:\s*50%/);
  assert.match(css, /\.bridge-start > div > p:not\(\.eyebrow\)[^}]*margin:\s*30px 0 0[^}]*line-height:\s*1\.65/);
  assert.equal((home.match(/<a[^>]+href="\/workbench"/g) ?? []).length, 4);
  assert.doesNotMatch(home, /<Link[^>]+href="\/workbench"/);
});

test("keeps the governed localhost Workbench boundary explicit in source", async () => {
  const [workbench, buildout, packageJson] = await Promise.all([
    readFile(new URL("../app/workbench/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../docs/BUILDOUT_CURRENT_2026-08-14.md", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(workbench, /http:\/\/127\.0\.0\.1:8765\/api/);
  assert.match(workbench, /Where this thought stands now/);
  assert.match(workbench, /Ask for a writing proposal/);
  assert.match(workbench, /<a className="text-link light" href="\/#method">About the method/);
  assert.match(workbench, /Before these viewpoints guide the review/);
  assert.match(workbench, /Nothing has been chosen for you/);
  assert.match(workbench, /What this reveals/);
  assert.match(workbench, /What it may obscure/);
  assert.match(workbench, /Where they lead in different directions/);
  assert.match(workbench, /Accept one/);
  assert.match(workbench, /Combine selected/);
  assert.match(workbench, /Use my edited wording/);
  assert.match(workbench, /Reject all/);
  assert.match(workbench, /Ask for another viewpoint/);
  assert.match(workbench, /Add missing reading/);
  assert.match(workbench, /Hold/);
  assert.match(workbench, /Save and close/);
  assert.match(workbench, /How this proposal was made/);
  assert.match(workbench, /This proposal was made without an outside AI service/);
  assert.match(workbench, /What do you want to think through/);
  assert.match(workbench, /Give this thought a short name/);
  assert.match(workbench, /aria-describedby="thought-question-help"/);
  assert.match(workbench, /state \? "Thought saved" : "Workbench ready"/);
  assert.doesNotMatch(workbench, /useState\("Plurality and precision"\)|useState\("Can a thought remain plural while becoming more precise\?"\)/);
  assert.match(workbench, /<b>Saved<\/b>/);
  assert.match(workbench, /Technical record/);
  assert.doesNotMatch(workbench, /Last saved record/);
  assert.match(workbench, /Reopening brings back the saved thought, not permission to change it/);
  assert.match(workbench, /Product MVS/);
  assert.doesNotMatch(workbench, /Saved on this computer|Thought saved locally|saved Thought Object and local runtime remain on this computer|keeps one Thought Object and its local runtime on your computer/i);
  assert.doesNotMatch(workbench, /NEXT_PUBLIC_PRISMETHICS_BRIDGE/);
  assert.doesNotMatch(workbench, /Derived current attention|Propose with Writer Core|Provider & provenance|Credential value never crosses|semantic review still pending/);
  assert.doesNotMatch(workbench, /window\.localStorage/);
  assert.match(buildout, /Human Authority accepted the evidence/);
  assert.match(buildout, /no Product MVS acceptance claim/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  await assert.rejects(access(new URL("../app/_sites-preview/SkeletonPreview.tsx", import.meta.url)));
  await assert.rejects(access(new URL("../app/_sites-preview/preview.css", import.meta.url)));
});
