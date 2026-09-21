function formatCurrency(value) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value || 0);
}

function formatNumber(value) {
  return new Intl.NumberFormat("fr-FR").format(value || 0);
}

const STAT_DEFS = [
  { key: "totalRevenue", label: "Chiffre d'affaires", format: formatCurrency },
  { key: "totalOrders", label: "Commandes", format: formatNumber },
  { key: "totalItems", label: "Articles vendus", format: formatNumber },
  { key: "avgOrder", label: "Panier moyen", format: formatCurrency },
];

export default function StatsOverview({ stats, loading, error }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {STAT_DEFS.map(({ key, label, format }) => (
        <div key={key} className="card p-5">
          <p className="label-mono mb-3">{label}</p>
          {loading ? (
            <div className="h-8 w-24 bg-ink/5 rounded animate-pulse" />
          ) : error ? (
            <p className="text-ink/30 text-2xl font-display">—</p>
          ) : (
            <p className="text-3xl font-display text-ink">
              {format(stats?.[key])}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
