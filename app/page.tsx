import Link from "next/link";

const steps = [
  {
    number: "01",
    title: "Name the real work",
    body: "Start with the question, decision, draft, or difficult situation that actually matters.",
  },
  {
    number: "02",
    title: "Make the structure visible",
    body: "Separate what is known, what is uncertain, which options remain, and where judgment is needed.",
  },
  {
    number: "03",
    title: "Carry it forward",
    body: "Close with a clear continuity note so the next session begins from earned ground—not from scratch.",
  },
];

export default function Home() {
  return (
    <main>
      <nav className="site-nav shell" aria-label="Primary navigation">
        <Link className="wordmark" href="/" aria-label="PrismEthics home">
          <span className="mark" aria-hidden="true" />
          PrismEthics
        </Link>
        <div className="nav-links">
          <a href="#method">How it works</a>
          <a href="#trust">Trust</a>
          <Link className="button button-small button-quiet" href="/workbench">
            Open Workbench
          </Link>
        </div>
      </nav>

      <section className="hero shell">
        <div className="hero-copy">
          <p className="eyebrow"><span /> A workbench for consequential thinking</p>
          <h1>Thinking that<br />carries <em>forward.</em></h1>
          <p className="hero-lede">
            Turn a difficult question into a visible line of reasoning, preserve what you learned,
            and return without losing the thread.
          </p>
          <div className="hero-actions">
            <Link className="button button-primary" href="/workbench">
              Begin a Work Object <span aria-hidden="true">↗</span>
            </Link>
            <a className="text-link" href="#method">See the method <span aria-hidden="true">↓</span></a>
          </div>
          <p className="preview-note">Private on this device in the current preview. No account required.</p>
        </div>

        <div className="hero-object" aria-label="An abstract prism representing preserved perspective">
          <div className="orbital orbital-one" />
          <div className="orbital orbital-two" />
          <span className="beam-in" aria-hidden="true" />
          <span className="spectrum-out" aria-hidden="true" />
          <div className="prism">
            <span className="prism-face face-one" />
            <span className="prism-face face-two" />
            <span className="prism-face face-three" />
            <span className="prism-core" />
          </div>
          <p className="object-caption">Structure without flattening complexity.</p>
        </div>
      </section>

      <section className="signal-strip" aria-label="Product principles">
        <div className="shell signal-inner">
          <span>Visible reasoning</span><i />
          <span>Human authority</span><i />
          <span>Continuity by design</span><i />
          <span>Correctable memory</span>
        </div>
      </section>

      <section className="method shell" id="method">
        <div className="section-heading">
          <p className="eyebrow"><span /> The working loop</p>
          <h2>Move the work,<br />not just the conversation.</h2>
        </div>
        <div className="steps">
          {steps.map((step) => (
            <article className="step-card" key={step.number}>
              <span className="step-number">{step.number}</span>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="continuity shell">
        <div className="continuity-panel">
          <p className="eyebrow light"><span /> A durable handoff</p>
          <blockquote>“Next time, begin from what changed—not from a transcript of everything said.”</blockquote>
          <p>
            PrismEthics treats continuity as something you can inspect and correct. The work stays
            organized around your purpose, your uncertainty, and your next responsible move.
          </p>
          <Link className="text-link light" href="/workbench">Try the continuity loop <span aria-hidden="true">→</span></Link>
        </div>
        <div className="trace" aria-hidden="true">
          <div className="trace-node"><span>Question</span><b>What is actually at stake?</b></div>
          <div className="trace-line" />
          <div className="trace-node"><span>Shift</span><b>What became clearer?</b></div>
          <div className="trace-line" />
          <div className="trace-node active"><span>Carry forward</span><b>Where should the work resume?</b></div>
        </div>
      </section>

      <section className="trust shell" id="trust">
        <div>
          <p className="eyebrow"><span /> Trust boundary</p>
          <h2>An honest first surface.</h2>
        </div>
        <div className="trust-copy">
          <p>
            This preview is a useful, device-local Workbench. It does not claim cloud sync,
            accounts, or live model assistance. Those arrive only when the governed runtime is
            connected and its evidence is ready.
          </p>
          <div className="trust-facts">
            <span><b>Now</b>Local structured work</span>
            <span><b>Next</b>Governed model assistance</span>
            <span><b>Always</b>You can inspect and revise</span>
          </div>
        </div>
      </section>

      <section className="final-cta shell">
        <p className="eyebrow light"><span /> Begin with what matters</p>
        <h2>Give the work somewhere<br />worth returning to.</h2>
        <Link className="button button-primary" href="/workbench">Open the Workbench <span aria-hidden="true">↗</span></Link>
      </section>

      <footer className="site-footer shell">
        <Link className="wordmark" href="/"><span className="mark" aria-hidden="true" />PrismEthics</Link>
        <p>Structured reasoning that carries forward.</p>
        <p>Preview · 2026</p>
      </footer>
    </main>
  );
}
