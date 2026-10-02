import Link from "next/link";
import { PracticeDemo } from "./practice-demo";

export default function TrainPage() {
  return (
    <main className="shell practiceShell">
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link href="/">REASON AXIS</Link>
        <span aria-hidden="true">/</span>
        <span>Train</span>
      </nav>

      <header className="practiceHeader">
        <div>
          <div className="eyebrow">TRAIN · NUMERICAL REASONING</div>
          <h1 className="pageTitle">Percentages & data</h1>
        </div>
        <p className="lede">
          A working engine slice using original REASON AXIS items. Persistence
          and adaptive item selection will attach to the database layer next.
        </p>
      </header>

      <PracticeDemo />
    </main>
  );
}
