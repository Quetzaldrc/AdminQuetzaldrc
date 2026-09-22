import { useEffect, useState, useCallback } from "react";
import Header from "../components/Header";
import StatsOverview from "../components/StatsOverview";
import FilterBar from "../components/FilterBar";
import OrdersTable from "../components/OrdersTable";
import { fetchStats, fetchOrders, fetchReport, downloadBase64Pdf } from "../lib/api";

function filterLabel({ q, start, end }) {
  const parts = [];
  if (q) parts.push(`recherche « ${q} »`);
  if (start && end) parts.push(`du ${start} au ${end}`);
  else if (start) parts.push(`depuis le ${start}`);
  else if (end) parts.push(`jusqu'au ${end}`);
  return parts.length ? parts.join(" · ") : "toutes les commandes";
}

export default function Dashboard() {
  const [filters, setFilters] = useState({ q: "", start: "", end: "" });

  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState(false);

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState("");

  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState("");

  const loadData = useCallback((f) => {
    setStatsLoading(true);
    setStatsError(false);
    fetchStats(f)
      .then(setStats)
      .catch(() => setStatsError(true))
      .finally(() => setStatsLoading(false));

    setOrdersLoading(true);
    setOrdersError("");
    fetchOrders(f)
      .then(setOrders)
      .catch((err) => {
        setOrdersError(err.message || "Erreur lors du chargement des commandes.");
        setOrders([]);
      })
      .finally(() => setOrdersLoading(false));
  }, []);

  // Chargement initial : toutes les commandes, aucun filtre
  useEffect(() => {
    loadData({ q: "", start: "", end: "" });
  }, [loadData]);

  function handleFilter(f) {
    setFilters(f);
    loadData(f);
  }

  async function handleReport(f) {
    setReportLoading(true);
    setReportError("");
    try {
      const { base64, filename } = await fetchReport(f);
      downloadBase64Pdf(base64, filename);
    } catch (err) {
      setReportError(err.message || "Échec de la génération du rapport.");
    } finally {
      setReportLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-ivory">
      <Header />

      <main className="max-w-6xl mx-auto px-6 py-10 flex flex-col gap-10">
        <section>
          <h2 className="label-mono mb-1">Aperçu des ventes</h2>
          <p className="text-ink/40 text-xs font-body mb-4">{filterLabel(filters)}</p>
          <StatsOverview stats={stats} loading={statsLoading} error={statsError} />
        </section>

        <section className="flex flex-col gap-5">
          <h2 className="label-mono">Commandes</h2>

          <FilterBar
            onFilter={handleFilter}
            onReport={handleReport}
            loading={ordersLoading}
            reportLoading={reportLoading}
          />

          {reportError && <p className="text-sm text-bordeaux">{reportError}</p>}

          <OrdersTable orders={orders} loading={ordersLoading} error={ordersError} />
        </section>
      </main>
    </div>
  );
}
