import { useEffect, useState, useCallback } from "react";
import Header from "../components/Header";
import StatsOverview from "../components/StatsOverview";
import OrderSearch from "../components/OrderSearch";
import OrderCard from "../components/OrderCard";
import { fetchStats, searchOrders } from "../lib/api";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState(false);

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    fetchStats()
      .then(setStats)
      .catch(() => setStatsError(true))
      .finally(() => setStatsLoading(false));
  }, []);

  const handleSearch = useCallback(async (query) => {
    setOrdersLoading(true);
    setOrdersError("");
    setHasSearched(true);
    try {
      const results = await searchOrders(query);
      setOrders(results);
    } catch (err) {
      setOrdersError(err.message || "Erreur lors de la recherche.");
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-ivory">
      <Header />

      <main className="max-w-5xl mx-auto px-6 py-10 flex flex-col gap-12">
        <section>
          <h2 className="label-mono mb-4">Aperçu des ventes</h2>
          <StatsOverview stats={stats} loading={statsLoading} error={statsError} />
        </section>

        <section className="flex flex-col gap-5">
          <h2 className="label-mono">Rechercher une commande</h2>
          <OrderSearch onSearch={handleSearch} loading={ordersLoading} />

          {ordersError && (
            <p className="text-sm text-bordeaux">{ordersError}</p>
          )}

          {ordersLoading && (
            <p className="label-mono text-ink/40">Recherche en cours…</p>
          )}

          {!ordersLoading && hasSearched && orders.length === 0 && !ordersError && (
            <p className="font-body text-ink/50 text-sm">
              Aucune commande trouvée pour cette recherche.
            </p>
          )}

          <div className="flex flex-col gap-3">
            {orders.map((order) => (
              <OrderCard key={order.orderNo} order={order} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
