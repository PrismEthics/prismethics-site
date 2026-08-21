import Link from "next/link";

const steps = [
  {
    number: "01",
    title: "Start in your own words",
    body: "Bring the question, decision, draft, research, or difficult situation as you would to a thoughtful conversation.",
  },
  {
    number: "02",
    title: "Let the work open up",
    body: "The structure works underneath the exchange, bringing forward distinct readings when they genuinely change what you can see.",
  },
  {
    number: "03",
    title: "Make and carry forward",
    body: "Develop the note, draft, research, plan, or design through conversation, then return from the ground you already earned.",
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
            Work through a difficult question as a conversation while the reasoning, research,
            and things you make take shape underneath—and carry forward without losing the thread.
          </p>
          <div className="hero-actions">
            <Link className="button button-primary" href="/workbench">
              Begin a conversation <span aria-hidden="true">↗</span>
            </Link>
            <a className="text-link" href="#method">See the method <span aria-hidden="true">↓</span></a>
          </div>
          <p className="preview-note">
            Pilot candidate: submitted turns and bounded recent context go to the configured provider; a device-local copy supports re-entry. No account or cloud sync yet.
          </p>
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
            This pilot candidate connects model assistance through a server-side provider route when
            configured. A bounded recent context package is resubmitted with each turn, while a
            device-local copy supports re-entry. This slice does not claim accounts, cloud sync, or
            deployed-provider proof.
          </p>
          <div className="trust-facts">
            <span><b>Now</b>Conversation-first candidate</span>
            <span><b>Boundary</b>Local transcript, submitted turns</span>
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
