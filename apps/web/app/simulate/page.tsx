import Link from "next/link";
import { SimulationClient } from "./simulation-client";

export default function SimulatePage() {
  return (
    <main className="shell practiceShell">
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link href="/">REASON AXIS</Link>
        <span aria-hidden="true">/</span>
        <span>Simulation</span>
      </nav>

      <header className="practiceHeader">
        <div>
          <div className="eyebrow">SIMULATION MODE</div>
          <h1 className="pageTitle">Core Reasoning Sprint</h1>
        </div>
        <p className="lede">
          Four mixed reasoning items. No hints or explanations during the run.
          The server owns the clock and unlocks the report after submission.
        </p>
      </header>

      <SimulationClient />
    </main>
  );
}
