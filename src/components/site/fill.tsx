import { PLACEHOLDER, type FactStatus } from "@/lib/clinics/schema";

/** Renders text, highlighting any "[TO CONFIRM]" marker so placeholders are obvious in the demo. */
export function Fill({ text }: { text: string }) {
  if (!text.includes(PLACEHOLDER)) return <>{text}</>;
  const parts = text.split(PLACEHOLDER);
  return (
    <>
      {parts.map((part, i) => (
        <span key={i}>
          {part}
          {i < parts.length - 1 && <span className="to-confirm">{PLACEHOLDER}</span>}
        </span>
      ))}
    </>
  );
}

const NEEDS_CONFIRMATION: FactStatus[] = ["placeholder", "conflict", "outdated"];

/** Small marker next to content whose source is missing, conflicting or dated. */
export function ConfirmBadge({ status }: { status: FactStatus | undefined }) {
  if (!status || !NEEDS_CONFIRMATION.includes(status)) return null;
  return (
    <span className="to-confirm ml-1.5 align-middle text-[10px]! md:text-[11px]!" title={`Status: ${status}`}>
      {PLACEHOLDER}
    </span>
  );
}
