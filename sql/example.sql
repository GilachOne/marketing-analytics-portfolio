-- Illustrative PostgreSQL reporting model, not a production migration.
-- Monetary values are integer kopecks. Aggregate each fact BEFORE joining.
CREATE TABLE demo_leads (id text PRIMARY KEY, base_id text NOT NULL, created_at date NOT NULL);
CREATE TABLE demo_meetings (lead_id text REFERENCES demo_leads(id), happened_at date, journal text);
CREATE TABLE demo_payments (deal_id text, lead_id text REFERENCES demo_leads(id), paid_at date, amount_kop bigint);
CREATE TABLE demo_spend (base_id text, spent_at date, direct_kop bigint, overhead_kop bigint);

WITH lead_counts AS (
  SELECT base_id, count(*) AS leads FROM demo_leads
  WHERE created_at BETWEEN DATE '2026-11-01' AND DATE '2026-11-23' GROUP BY base_id
), meetings AS (
  SELECT l.base_id, count(DISTINCT m.lead_id) AS vks
  FROM demo_meetings m JOIN demo_leads l ON l.id=m.lead_id
  WHERE m.happened_at BETWEEN DATE '2026-11-01' AND DATE '2026-11-23' GROUP BY l.base_id
), payments AS (
  SELECT l.base_id, sum(p.amount_kop) AS revenue_kop,
    count(DISTINCT p.deal_id) FILTER (WHERE p.amount_kop>0) AS paid_deals
  FROM demo_payments p JOIN demo_leads l ON l.id=p.lead_id
  WHERE p.paid_at BETWEEN DATE '2026-11-01' AND DATE '2026-11-23' GROUP BY l.base_id
), spend AS (
  SELECT base_id, sum(direct_kop+overhead_kop) AS expense_kop FROM demo_spend
  WHERE spent_at BETWEEN DATE '2026-11-01' AND DATE '2026-11-23' GROUP BY base_id
), bases AS (
  SELECT base_id FROM lead_counts UNION SELECT base_id FROM meetings
  UNION SELECT base_id FROM payments UNION SELECT base_id FROM spend
)
SELECT b.base_id, coalesce(l.leads,0) AS leads, coalesce(m.vks,0) AS vks,
  coalesce(p.paid_deals,0) AS paid_deals, coalesce(p.revenue_kop,0) AS revenue_kop,
  coalesce(s.expense_kop,0) AS expense_kop,
  s.expense_kop::numeric/nullif(p.revenue_kop,0) AS drr
FROM bases b LEFT JOIN lead_counts l USING(base_id) LEFT JOIN meetings m USING(base_id)
LEFT JOIN payments p USING(base_id) LEFT JOIN spend s USING(base_id);
