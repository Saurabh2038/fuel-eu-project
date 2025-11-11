export type Member = { shipId: string; cb_before: number };

export function createPoolAllocation(members: Member[]) {
  const total = members.reduce((s, m) => s + m.cb_before, 0);
  if (total < 0) throw new Error("Pool sum negative");

  const sorted = members.slice().sort((a, b) => b.cb_before - a.cb_before);
  const deficits = sorted.filter(m => m.cb_before < 0).map(m => ({ ...m }));
  const surpluses = sorted.filter(m => m.cb_before > 0).map(m => ({ ...m }));

  const afterMap = new Map<string, number>(members.map(m => [m.shipId, m.cb_before]));

  let sIdx = 0, dIdx = 0;
  while (sIdx < surpluses.length && dIdx < deficits.length) {
    const s = surpluses[sIdx];
    const d = deficits[dIdx];
    const transfer = Math.min(s.cb_before, Math.abs(d.cb_before));
    afterMap.set(s.shipId, (afterMap.get(s.shipId) || 0) - transfer);
    afterMap.set(d.shipId, (afterMap.get(d.shipId) || 0) + transfer);
    s.cb_before -= transfer;
    d.cb_before += transfer;
    if (s.cb_before <= 1e-9) sIdx++;
    if (d.cb_before >= -1e-9) dIdx++;
  }

  const result = members.map(m => ({ shipId: m.shipId, cb_before: m.cb_before, cb_after: afterMap.get(m.shipId)! }));

  for (const r of result) {
    const before = members.find(m => m.shipId === r.shipId)!.cb_before;
    if (before > 0 && r.cb_after < 0) throw new Error("Surplus ship ended negative");
    if (before < 0 && r.cb_after < before) throw new Error("Deficit ship exited worse");
  }

  return result;
}
