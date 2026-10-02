import Link from "next/link";

const families = [
  {
    name: "Numerical reasoning",
    status: "Engine slice live",
    description: "Percentages, ratios, averages, rates and data interpretation.",
  },
  {
    name: "Logical reasoning",
    status: "Next engine slice",
    description: "Rules, constraints, sequencing and elimination.",
  },
  {
    name: "Attention to detail",
    status: "Next engine slice",
    description: "Data checking, discrepancy detection and exact comparison.",
  },
];

export default function AssessmentsPage() {
  return (
    <main className="shell practiceShell">
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link href="/">REASON AXIS</Link>
        <span aria-hidden="true">/</span>
        <span>Hiring assessments</span>
      </nav>

      <header className="practiceHeader">
        <div>
          <div className="eyebrow">PREPARE FOR HIRING ASSESSMENTS</div>
          <h1 className="pageTitle">Practice the skills behind the test.</h1>
        </div>
        <p className="lede">
          Independent practice for common reasoning skills. REASON AXIS does not
          copy proprietary vendor questions or interfaces.
        </p>
      </header>

      <section className="trackGrid">
        {families.map((family) => (
          <article className="trackCard" key={family.name}>
            <div className="trackStatus">{family.status}</div>
            <h2>{family.name}</h2>
            <p>{family.description}</p>
          </article>
        ))}
      </section>

      <Link className="pillLink primary inlineAction" href="/train">
        Start numerical training
      </Link>
    </main>
  );
}
