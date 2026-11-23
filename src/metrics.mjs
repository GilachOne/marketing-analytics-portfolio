// Currency is held in integer kopecks. Aggregate first, divide afterwards.
export const ratio = (n, d) => (d > 0 ? n / d : null);
export const between = (date, from, to) => date >= from && date <= to;
export function aggregate(
  data,
  campaignIds,
  { from, to, cohort = false, manager = "" },
) {
  const ids = new Set(campaignIds),
    all = data.leads.filter(
      (l) => ids.has(l.campaignId) && (!manager || l.manager === manager),
    );
  const fresh = all.filter((l) => between(l.created, from, to)),
    eligible = new Set((cohort ? fresh : all).map((l) => l.id));
  const events = (items) =>
    items.filter(
      (e) =>
        eligible.has(e.leadId) &&
        (cohort
          ? e.date <= (data.asOf || "2026-11-23")
          : between(e.date, from, to)),
    );
  const pres = events(data.presentations).filter((e) => e.confirmed),
    meetings = events(data.meetings),
    payments = events(data.payments);
  const spend = manager
    ? []
    : data.spend.filter(
        (s) => ids.has(s.campaignId) && between(s.date, from, to),
      );
  const direct = spend.reduce((a, s) => a + s.direct, 0),
    overhead = spend.reduce((a, s) => a + s.overhead, 0),
    expense = direct + overhead;
  const revenue = payments.reduce((a, p) => a + p.amount, 0),
    vks = new Set(meetings.map((m) => m.leadId)).size,
    paidLeads = new Set(
      payments.filter((p) => p.amount > 0).map((p) => p.leadId),
    ).size;
  return {
    leads: fresh.length,
    presentations: new Set(pres.map((p) => p.leadId)).size,
    vks,
    deals: new Set(payments.filter((p) => p.amount > 0).map((p) => p.dealId))
      .size,
    paidLeads,
    revenue,
    direct,
    overhead,
    expense,
    drr: ratio(expense, revenue),
    cpl: ratio(expense, fresh.length),
    cpvks: ratio(expense, vks),
    conversion: cohort ? ratio(vks, fresh.length) : null,
  };
}
export function activity(data, id) {
  const s = data.spend
    .filter((x) => x.campaignId === id && x.direct > 0)
    .sort((a, b) => a.date.localeCompare(b.date));
  return {
    first: s[0]?.date || null,
    last: s.at(-1)?.date || null,
    days: s.length,
  };
}
export function recommendation(m, active) {
  if (!active && m.revenue > 0) return "Проверить возврат";
  if (m.revenue === 0)
    return active ? "Проверить тест" : "Нет текущего расхода";
  if (m.drr > 0.6) return "Проверить ДРР";
  return "Есть поступления";
}
