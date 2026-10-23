import { cookies } from "next/headers";
import Link from "next/link";
import { INDEX_COOKIE, verifyIndexToken } from "@/lib/auth";
import { getClinics } from "@/lib/clinics/load";
import { demoIndexPassword, showDemoIndex } from "@/lib/config";
import { tr } from "@/lib/i18n";
import { getNiches } from "@/lib/niches/load";
import { unlockDemoIndex } from "./actions";

/**
 * Root page. In demo mode it lists the demo sites by niche (handy on your phone). Before sending
 * links to businesses, set DEMO_INDEX_PASSWORD (the list asks for it) or HIDE_DEMO_INDEX=true
 * (no list at all), so they can't see each other's demos.
 */
export default async function Home({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  // Reading the cookie on every request also keeps this page from being prerendered with the list.
  const jar = await cookies();
  const locked = showDemoIndex() && !!demoIndexPassword() && !verifyIndexToken(jar.get(INDEX_COOKIE)?.value);
  const clinics = showDemoIndex() && !locked ? getClinics() : [];
  const { error } = locked ? await searchParams : {};
  const groups = getNiches()
    .map((n) => ({ niche: n, clinics: clinics.filter((c) => c.niche === n.id) }))
    .filter((g) => g.clinics.length > 0);
  return (
    <main lang="en" className="mx-auto min-h-screen max-w-2xl px-4 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">Clinic website template</h1>
      {groups.length > 0 ? (
        <>
          <p className="mt-2 text-sm text-slate-500">Demo sites (demo mode)</p>
          {groups.map(({ niche, clinics }) => (
            <section key={niche.id} className="mt-8">
              <h2 className="text-xs font-semibold tracking-[0.14em] text-slate-500 uppercase">{tr(niche.label, "en")}</h2>
              <ul className="mt-3 grid gap-3">
                {clinics.map((c) => (
                  <li key={c.slug} className="card flex items-center justify-between gap-4 p-4">
                    <div className="flex items-center gap-3">
                      <span className="h-3 w-3 rounded-full" style={{ background: c.brandColor }} />
                      <div>
                        <p className="font-semibold">
                          {c.name}
                          {c.country !== "AZ" && <span className="ml-1.5 text-xs font-bold text-slate-500">({c.country})</span>}
                        </p>
                        <p className="text-xs text-slate-500">
                          {tr(c.district, "en")} · {c.locales.map((l) => l.toUpperCase()).join("/")}
                        </p>
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
            </section>
          ))}
        </>
      ) : locked ? (
        <form action={unlockDemoIndex} className="card mt-8 grid max-w-sm gap-4 p-6">
          <label className="grid gap-1.5">
            <span className="field-label mb-0">Password</span>
            <input name="password" type="password" autoComplete="current-password" className="field" required autoFocus />
          </label>
          {error && (
            <p className="field-error mt-0">
              {error === "rate" ? "Too many attempts. Try again in 15 minutes." : "Wrong password."}
            </p>
          )}
          <button className="btn-primary w-full">Open</button>
        </form>
      ) : (
        <p className="mt-2 text-sm text-slate-500">Nothing to see here.</p>
      )}
    </main>
  );
}
