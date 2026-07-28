/**
 * Managed entities — the client companies a CSP/DPO account buys reports about.
 *
 * A report's subject must be named explicitly at order time. It is never inferred
 * from who is logged in: for these accounts the logged-in company is the firm doing
 * the compliance work, not the company being assessed. `verified` here is the only
 * thing that licenses a certified identity on a deliverable — an entity with a
 * company_name but no ACRA match is perfectly orderable, its report just says
 * "Not verified" instead of naming a legal person we cannot stand behind.
 */

export interface ManagedEntity {
  id: string;
  company_name: string;
  /** What ACRA returned. Null means no registry match — do not substitute company_name. */
  legal_name: string | null;
  uen: string | null;
  website: string | null;
  industry: string | null;
  verified: boolean;
  verified_at: string | null;
  status: "ACTIVE" | "ARCHIVED";
  created_at: string | null;
}

export interface CreateEntityInput {
  company_name: string;
  website?: string;
  industry?: string;
  /** Optional claim, checked against ACRA. A contradiction is a 422, not a silent accept. */
  uen?: string;
}

export async function listManagedEntities(
  includeArchived = false,
): Promise<ManagedEntity[]> {
  const qs = includeArchived ? "?include_archived=true" : "";
  const res = await fetch(`/api/managed-entities${qs}`, { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json().catch(() => null);
  return Array.isArray(data?.items) ? data.items : [];
}

export class ManagedEntityError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

/**
 * Register a client company. The backend verifies against ACRA at entry, so a
 * mismatch surfaces here as a 422 with the registry's own wording — that message
 * is shown verbatim rather than reworded, because it names the actual conflict
 * ("UEN X is registered to Y") and a paraphrase would lose it.
 */
export async function createManagedEntity(
  input: CreateEntityInput,
): Promise<ManagedEntity> {
  const res = await fetch("/api/managed-entities", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const detail =
      typeof data?.detail === "string" ? data.detail : "Could not add this company.";
    throw new ManagedEntityError(detail, res.status);
  }
  return data.entity as ManagedEntity;
}

/** Label for a picker row: the registry name when we have one, else what was typed. */
export function entityLabel(e: ManagedEntity): string {
  return e.legal_name || e.company_name;
}
