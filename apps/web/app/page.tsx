import Link from "next/link";

const axes = [
  ["Accuracy", "Measure precision, not guesses."],
  ["Speed", "Build efficient performance under time pressure."],
  ["Challenge", "Progress through increasingly difficult material."],
  ["Consistency", "Track stable performance across sessions."],
  ["Growth", "See improvement over time."],
] as const;

export default function HomePage() {
  return (
    <main className="shell">
      <section className="hero">
        <div className="eyebrow">COGNITIVE & CAREER SKILLS</div>
        <h1>REASON AXIS</h1>
        <p className="tagline">Train. Measure. Improve.</p>
        <p className="lede">Build the skills behind performance.</p>
        <div className="actions">
          <Link className="pillLink primary" href="/train">
            Train my brain
          </Link>
          <Link className="pillLink secondary" href="/assessments">
            Prepare for hiring assessments
          </Link>
        </div>
      </section>

      <section className="axisGrid" aria-label="Performance axes">
        {axes.map(([title, copy]) => (
          <article key={title} className="axisCard">
            <span className="axisDot" aria-hidden="true" />
            <h2>{title}</h2>
            <p>{copy}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
