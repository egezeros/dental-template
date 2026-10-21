import Link from "next/link";
import { getClinics } from "@/lib/clinics/load";
import { showDemoIndex } from "@/lib/config";
import { tr } from "@/lib/i18n";

/**
 * Root page. In demo mode it lists the demo sites (handy on your phone); set
 * HIDE_DEMO_INDEX=true before sending links to clinics so they can't see each other's demos.
 */
export default function Home() {
  const clinics = showDemoIndex() ? getClinics() : [];
  return (
    <main className="mx-auto min-h-screen max-w-2xl px-4 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">Dental clinic website template</h1>
      {clinics.length > 0 ? (
        <>
          <p className="mt-2 text-sm text-slate-500">Demo sites (demo mode)</p>
          <ul className="mt-8 grid gap-3">
            {clinics.map((c) => (
              <li key={c.slug} className="card flex items-center justify-between gap-4 p-4">
                <div className="flex items-center gap-3">
                  <span className="h-3 w-3 rounded-full" style={{ background: c.brandColor }} />
                  <div>
                    <p className="font-semibold">{c.name}</p>
                    <p className="text-xs text-slate-500">{tr(c.district, "en")}</p>
                  </div>
                </div>
                <div className="flex gap-3 text-sm font-medium">
                  <Link href={`/${c.slug}`} className="text-slate-900 hover:underline">
                    Site
                  </Link>
                  <Link href={`/${c.slug}/admin`} className="text-slate-500 hover:underline">
                    Admin
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="mt-2 text-sm text-slate-500">Nothing to see here.</p>
      )}
    </main>
  );
}
