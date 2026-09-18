import Link from "next/link";
import { notFound } from "next/navigation";
import { getReceipt } from "@/lib/data";
import { assertReceipt } from "@/lib/receipts";

export const dynamic = "force-dynamic";

export default async function ReceiptPage({ params }: { params: { id: string } }) {
  const raw = await getReceipt(params.id);
  if (!raw) notFound();

  let verified = true;
  let verifyError = "";
  try {
    assertReceipt(raw);
  } catch (e) {
    verified = false;
    verifyError = e instanceof Error ? e.message : String(e);
  }

  return (
    <div className="space-y-6">
      <nav className="text-xs text-muted">
        <Link href="/" className="hover:text-signal">Atlas</Link> / <span className="text-slate-300">receipt {raw.id}</span>
      </nav>

      <section className="panel p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold">Provenance receipt</h1>
            <p className="font-mono text-xs text-muted">{raw.id}</p>
          </div>
          <span
            className={`chip ${verified ? "border-signal/50 text-signal" : "border-danger/60 text-danger"}`}
          >
            {verified ? "✓ content hash verified" : "✗ hash mismatch"}
          </span>
        </div>
        {!verified && <p className="mt-2 text-xs text-danger">{verifyError}</p>}
        <p className="mt-3 text-sm text-slate-300">{raw.disclaimer}</p>
      </section>

      <section className="panel overflow-x-auto p-6">
        <h2 className="mb-3 font-medium">Receipt body (JSON-LD)</h2>
        <pre className="receipt-line overflow-x-auto">{JSON.stringify(raw, null, 2)}</pre>
      </section>
    </div>
  );
}
