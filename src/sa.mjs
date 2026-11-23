import { projects } from "./data.mjs";
export const snapshotDay = "2026-11-23";
const sources = [
  ["Таргет ВК", "ВКИ"],
  ["Каталоги", "ВКИ"],
  ["Заявки с сайта", "ВКИ"],
  ["Автопрозвон", "НКИ"],
  ["Автозвонок", "НКИ"],
  ["HH", "НКИ"],
];
export const inventory = [];
for (let p = 0; p < projects.length; p++)
  for (let s = 0; s < sources.length; s++)
    for (let i = 0; i < 38 + p * 7 + s * 3; i++) {
      const purchased = i % 6 === 0,
        today = i % 8 === 0;
      inventory.push({
        id: `STOCK-${p}-${s}-${i}`,
        project: projects[p],
        source: sources[s][0],
        category: sources[s][1],
        created: today
          ? snapshotDay
          : `2026-10-${String(1 + (i % 28)).padStart(2, "0")}`,
        assigned: purchased ? `Менеджер ${1 + (i % 4)}` : "Service Account",
        purchased: purchased ? snapshotDay : null,
        stage: ["Новый", "В работе", "Презентация", "ВКС"][i % 4],
      });
    }
export function selectInventory(project = "", kind = "stock") {
  return inventory.filter(
    (l) =>
      (!project || l.project === project) &&
      (kind === "stock"
        ? l.assigned === "Service Account" && l.created >= "2026-09-25"
        : kind === "purchases"
          ? l.purchased === snapshotDay
          : l.created === snapshotDay),
  );
}
export function saView(project, tab = "stock") {
  const stock = selectInventory(project),
    purchases = selectInventory(project, "purchases"),
    incoming = selectInventory(project, "incoming");
  const kpis = [
    [
      "Доступно к покупке",
      stock.length,
      "Текущий ответственный: Service Account",
    ],
    ["Куплено за день", purchases.length, "По дате покупки"],
    ["Поступило лидов за день", incoming.length, "По дате создания"],
  ]
    .map(
      ([name, n, sub]) =>
        `<div class="kpi"><span>${name}</span><strong>${n}</strong><small>${sub}</small></div>`,
    )
    .join("");
  const ps = project ? [project] : projects;
  let rows, headers, title;
  if (tab === "stock" || tab === "incoming") {
    const entries = tab === "stock" ? stock : incoming;
    title =
      tab === "stock" ? "Доступные к покупке лиды" : "Поступившие лиды за день";
    headers = ps;
    rows = sources.map(([source, category]) => ({
      label: category + " / " + source,
      values: ps.map(
        (p) =>
          entries.filter((l) => l.project === p && l.source === source).length,
      ),
    }));
  } else if (tab === "purchases") {
    title = "Покупки лидов по сотрудникам";
    headers = ps;
    rows = Array.from({ length: 4 }, (_, i) => {
      const label = `Менеджер ${i + 1}`;
      return {
        label,
        values: ps.map(
          (p) =>
            purchases.filter((l) => l.project === p && l.assigned === label)
              .length,
        ),
      };
    });
  } else {
    title = "Покупки за день по текущим стадиям";
    headers = ["Новый", "В работе", "Презентация", "ВКС"];
    rows = Array.from({ length: 4 }, (_, i) => {
      const label = `Менеджер ${i + 1}`;
      return {
        label,
        values: headers.map(
          (stage) =>
            purchases.filter((l) => l.assigned === label && l.stage === stage)
              .length,
        ),
      };
    });
  }
  const max = Math.max(...rows.flatMap((r) => r.values), 1),
    totals = headers.map((_, i) => rows.reduce((a, r) => a + r.values[i], 0));
  const table = `<div class="section-head"><h2>${title}</h2><span>Количество лидов · синтетический снимок</span></div><div class="panel"><div class="table-scroll"><table><thead><tr><th>${tab === "stock" || tab === "incoming" ? "Категория / источник" : "Ответственный"}</th>${headers.map((p) => `<th>${p}</th>`).join("")}<th>Итого</th></tr></thead><tbody>${rows.map((r) => `<tr><td>${r.label}</td>${r.values.map((n) => `<td style="background:rgba(83,125,242,${(n / max) * 0.32})">${n}</td>`).join("")}<td><strong>${r.values.reduce((a, b) => a + b, 0)}</strong></td></tr>`).join("")}<tr><td><strong>Итого</strong></td>${totals.map((n) => `<td><strong>${n}</strong></td>`).join("")}<td><strong>${totals.reduce((a, b) => a + b, 0)}</strong></td></tr></tbody></table></div></div>`;
  return {
    kpis,
    content: `<div class="callout"><strong>Снимок: 23.11.2026 · 12:00 МСК.</strong> Доступные лиды за последние 60 дней. «Поступило» здесь означает новые лиды, а не деньги. Демо не изменяет CRM и не оформляет покупки.</div>${table}`,
  };
}
