/**
 * Mock Supabase client for DEV_BYPASS mode.
 * Implements the PostgREST-style chained query API against in-memory mock data.
 */
import { mockTables } from './mockData';
import { profiles } from './mockData';

// ─── tiny select-join parser ───────────────────────────────
// Handles: "*, properties(name)", "*, units(count)", "*", "id, name" etc.
function parseSelect(selectStr: string) {
  const joins: { alias: string; table: string; cols: string[] }[] = [];
  // e.g. "tenant:profiles!leases_tenant_id_fkey(full_name, email)"
  const joinRe = /(?:(\w+):)?(\w+)(?:!\w+)?\(([^)]*)\)/g;
  let m: RegExpExecArray | null;
  while ((m = joinRe.exec(selectStr)) !== null) {
    joins.push({ alias: m[1] || m[2], table: m[2], cols: m[3].split(',').map((c) => c.trim()) });
  }
  // strip joins from the base cols
  const baseCols = selectStr.replace(joinRe, '').split(',').map((c) => c.trim()).filter(Boolean);
  return { baseCols, joins };
}

function pickCols(row: Record<string, unknown>, cols: string[]): Record<string, unknown> {
  if (cols.includes('*')) return { ...row };
  const out: Record<string, unknown> = {};
  for (const c of cols) if (c in row) out[c] = row[c];
  return out;
}

function resolveJoin(row: Record<string, unknown>, join: { alias: string; table: string; cols: string[] }) {
  const related = (mockTables[join.table] ?? []) as Record<string, unknown>[];
  const fk = findForeignKey(row, join.table);
  if (!fk) return null;

  if (join.cols.includes('count')) {
    return related.filter((r) => r[fk.targetCol] === fk.value).length;
  }

  const matched = related.filter((r) => r[fk.targetCol] === fk.value);
  if (matched.length === 0) return null;
  if (matched.length === 1) return pickCols(matched[0], join.cols);
  return matched.map((r) => pickCols(r, join.cols));
}

function findForeignKey(row: Record<string, unknown>, targetTable: string) {
  // Convention: row has `${singular}_id` pointing to target table `id`
  const singulars: Record<string, string> = {
    properties: 'property_id',
    units: 'unit_id',
    profiles: 'id', // for profile joins, the FK is typically tenant_id, reported_by, etc.
    leases: 'lease_id',
  };

  const fkCol = singulars[targetTable];
  if (fkCol && fkCol in row) return { targetCol: 'id', value: row[fkCol] };

  // Reverse: target table has a FK back to this row's id (e.g., units belongs to property)
  if ('id' in row) {
    const reverseKey = Object.keys(row).find((k) => k.endsWith('_id') && targetTable.startsWith(k.replace('_id', '')));
    if (reverseKey) return { targetCol: 'id', value: row[reverseKey] };

    // For profiles, check all common FK columns
    if (targetTable === 'profiles') {
      for (const col of ['tenant_id', 'reported_by', 'assigned_to', 'landlord_id', 'listed_by', 'owner_id', 'generated_for', 'user_id']) {
        if (col in row) return { targetCol: 'id', value: row[col] };
      }
    }
  }

  return null;
}

// ─── Query builder ──────────────────────────────────────────
type Filter = { col: string; op: string; value: unknown };

class MockQueryBuilder {
  private tableName: string;
  private selectStr = '*';
  private filters: Filter[] = [];
  private orderCol = '';
  private orderAsc = true;
  private limitN: number | null = null;
  private headOnly = false;
  private countMode = false;
  private isSingle = false;
  private isMaybeSingle = false;

  constructor(table: string) {
    this.tableName = table;
  }

  select(cols: string, opts?: { count?: string; head?: boolean }) {
    this.selectStr = cols;
    if (opts?.head) this.headOnly = true;
    if (opts?.count === 'exact') this.countMode = true;
    return this;
  }

  eq(col: string, val: unknown) { this.filters.push({ col, op: 'eq', value: val }); return this; }
  in(col: string, vals: unknown[]) { this.filters.push({ col, op: 'in', value: vals }); return this; }
  gte(col: string, val: unknown) { this.filters.push({ col, op: 'gte', value: val }); return this; }
  lte(col: string, val: unknown) { this.filters.push({ col, op: 'lte', value: val }); return this; }
  order(col: string, opts?: { ascending?: boolean }) { this.orderCol = col; this.orderAsc = opts?.ascending ?? true; return this; }
  limit(n: number) { this.limitN = n; return this; }
  single() { this.isSingle = true; return this; }
  maybeSingle() { this.isMaybeSingle = true; return this; }

  async then<T>(resolve: (v: T) => void) {
    resolve(this.execute() as T);
  }

  execute(): { data: unknown; count?: number; error: null } {
    let rows = [...((mockTables[this.tableName] ?? []) as Record<string, unknown>[])];

    // Apply filters (skip dotted columns like 'properties.owner_id' — treat as pass-through for mock)
    for (const f of this.filters) {
      if (f.col.includes('.')) continue; // skip joined filters in mock
      rows = rows.filter((r) => {
        const v = r[f.col];
        if (f.op === 'eq') return v === f.value;
        if (f.op === 'in') return (f.value as unknown[]).includes(v);
        if (f.op === 'gte') return String(v) >= String(f.value);
        if (f.op === 'lte') return String(v) <= String(f.value);
        return true;
      });
    }

    // Order
    if (this.orderCol) {
      rows.sort((a, b) => {
        const va = String(a[this.orderCol] ?? '');
        const vb = String(b[this.orderCol] ?? '');
        return this.orderAsc ? va.localeCompare(vb) : vb.localeCompare(va);
      });
    }

    // Count-only (head: true)
    if (this.headOnly && this.countMode) {
      return { data: null, count: rows.length, error: null };
    }

    // Limit
    if (this.limitN) rows = rows.slice(0, this.limitN);

    // Select & joins
    const { baseCols, joins } = parseSelect(this.selectStr);
    const projected = rows.map((row) => {
      const out = pickCols(row, baseCols);
      for (const j of joins) {
        if (j.cols.includes('count')) {
          // Aggregate count
          (out as Record<string, unknown>)[j.alias] = [{ count: resolveJoin(row, j) }];
        } else {
          (out as Record<string, unknown>)[j.alias] = resolveJoin(row, j);
        }
      }
      return out;
    });

    if (this.isSingle || this.isMaybeSingle) {
      return { data: projected[0] ?? null, error: null };
    }

    return { data: projected, count: this.countMode ? projected.length : undefined, error: null };
  }

  // Insert / update stubs — just log
  async insert(_row: unknown) { console.log(`[mock] INSERT into ${this.tableName}`, _row); return { data: null, error: null }; }
  async update(_vals: unknown) { console.log(`[mock] UPDATE ${this.tableName}`, _vals, this.filters); return { data: null, error: null }; }
}

// ─── Mock channel (no-op) ──────────────────────────────────
class MockChannel {
  on() { return this; }
  subscribe() { return this; }
}

// ─── Exported mock supabase client ─────────────────────────
export const mockSupabase = {
  from: (table: string) => new MockQueryBuilder(table),
  auth: {
    getSession: async () => ({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signInWithPassword: async () => ({ data: { user: null, session: null }, error: { message: 'Mock mode — login disabled' } }),
    signUp: async () => ({ data: { user: null, session: null }, error: { message: 'Mock mode — signup disabled' } }),
    signOut: async () => ({ error: null }),
  },
  channel: () => new MockChannel(),
  removeChannel: () => {},
  functions: {
    invoke: async () => ({ data: null, error: null }),
  },
};
