import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
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

async function filesUnder(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) => {
      const target = new URL(`${entry.name}${entry.isDirectory() ? "/" : ""}`, directory);
      return entry.isDirectory() ? filesUnder(target) : [target];
    }),
  );
  return nested.flat();
}

test("server-renders the honest public pilot boundary", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /PrismEthics/);
  assert.match(html, /Thinking that/);
  assert.match(html, /carries/);
  assert.match(html, /Begin a conversation/i);
  assert.match(html, /submitted turns and bounded recent context go to the configured provider/i);
  assert.match(html, /device-local copy supports re-entry/i);
  assert.match(html, /No account or cloud sync yet/i);
  assert.doesNotMatch(html, /three free sessions|no subscription|cannot revise/i);
  assert.doesNotMatch(html, /Private on this device|live model assistance[^.]*not connected/i);
});

test("server-renders the one-composer Workbench entry", async () => {
  const response = await render("/workbench");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /What are you[\s\S]*working through\?/i);
  assert.match(html, /Describe what you[^<]*trying to understand/i);
  assert.match(html, /Attach<\/button>/i);
  assert.match(html, /configured server/i);
  assert.doesNotMatch(html, /Recent work \(0\)/i);
  assert.doesNotMatch(html, /Save Work Object|Choose a mode|Pick a frame/i);
});

test("keeps structure internal and the candidate proof boundary explicit", async () => {
  const [workbench, server, contract, buildout, packageJson] = await Promise.all([
    readFile(new URL("../app/workbench/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../lib/workbench-server.ts", import.meta.url), "utf8"),
    readFile(new URL("../docs/CONVERSATIONAL_WORKBENCH_PILOT_CONTRACT_v0_1.md", import.meta.url), "utf8"),
    readFile(new URL("../docs/BUILDOUT_CURRENT_2026-08-20.md", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(workbench, /window\.localStorage/);
  assert.match(workbench, /fetch\("\/api\/workbench\/turn"/);
  assert.match(workbench, /context_package/);
  assert.match(workbench, /DEVICE_LOCAL_CONVENIENCE/);
  assert.match(workbench, /HUMAN_INPUT/);
  assert.match(workbench, /MODEL_OUTPUT/);
  assert.doesNotMatch(workbench, /previous_response_id/);
  assert.match(workbench, /perspective-passages/);
  assert.match(workbench, /artifact-pane/);
  assert.match(workbench, /Export as Markdown/);
  assert.doesNotMatch(workbench, /type=["'](?:radio|checkbox)["']/i);
  assert.doesNotMatch(workbench, /127\.0\.0\.1|frame picker|mode selector|Save Work Object/i);

  assert.match(server, /OPENAI_API_KEY/);
  assert.match(server, /Actor integrity is mandatory/);
  assert.match(server, /redirect: "error"/);
  assert.match(server, /store: false/);
  assert.match(server, /class CandidateSessionRuntime/);
  assert.match(server, /class OpenAIModelRuntimeAdapter/);
  assert.match(server, /class HeldFrameRuntimePort/);
  assert.doesNotMatch(server, /previous_response_id/);
  assert.match(server, /WORKBENCH_TURN_SCHEMA/);
  assert.doesNotMatch(server, /deterministic-provider-free|Precision and plurality may reinforce/i);

  assert.match(contract, /Structured inside; conversational outside/);
  assert.match(contract, /Preserved back-end architecture/i);
  assert.match(contract, /SessionRuntime[\s\S]*FrameRuntimePort[\s\S]*ModelRuntimePort/);
  assert.match(contract, /provider-assisted research/i);
  assert.match(contract, /Ten-turn pilot journey/i);
  assert.match(contract, /Product Minimal Viable Step:[^\n]*MODEL_RUNTIME_LIVE_PROVIDER_PROOF_v0_1[^\n]*open/i);
  assert.match(buildout, /site draft PR #3[\s\S]*superseded/i);
  assert.match(buildout, /runtime draft PR #13[\s\S]*cannot serve as pilot truth/i);
  assert.match(buildout, /D-89[\s\S]*modular-monolith/i);
  assert.match(packageJson, /tests\/\*\.test\.mjs/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
});

test("keeps provider configuration and system behavior out of client bundles", async () => {
  const clientRoot = new URL("../dist/client/", import.meta.url);
  const files = await filesUnder(clientRoot);
  const clientText = (
    await Promise.all(files.map((file) => readFile(file, "utf8")))
  ).join("\n");

  assert.doesNotMatch(clientText, /OPENAI_API_KEY/);
  assert.doesNotMatch(clientText, /api\.openai\.com\/v1\/responses/);
  assert.doesNotMatch(clientText, /Actor integrity is mandatory/);
  assert.doesNotMatch(clientText, /Bearer sk-/);
});
