import { useState } from "react";
import { fetchInvoice, downloadBase64Pdf } from "../lib/api";

function formatCurrency(value) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value || 0);
}

function OrderRow({ order }) {
  const [expanded, setExpanded] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");

  const fullName = [order.firstName, order.lastName].filter(Boolean).join(" ");

  async function handleDownload(e) {
    e.stopPropagation();
    setDownloading(true);
    setDownloadError("");
    try {
      const { base64, filename } = await fetchInvoice(order.orderNo);
      downloadBase64Pdf(base64, filename);
    } catch (err) {
      setDownloadError(err.message || "Échec du téléchargement.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <>
      <tr
        onClick={() => setExpanded((v) => !v)}
        className="cursor-pointer hover:bg-ivory/70 transition-colors border-b border-ink/10"
      >
        <td className="px-4 py-3 font-mono text-xs text-bordeaux whitespace-nowrap">
          #{order.orderNo}
        </td>
        <td className="px-4 py-3 text-sm text-ink/70 whitespace-nowrap">{order.date}</td>
        <td className="px-4 py-3 text-sm text-ink">{fullName || "—"}</td>
        <td className="px-4 py-3 text-sm text-ink/70">{order.city || "—"}</td>
        <td className="px-4 py-3 text-sm text-ink/70">{order.payment || "—"}</td>
        <td className="px-4 py-3 text-sm text-ink text-right font-body">
          {formatCurrency(order.total)}
        </td>
        <td className="px-4 py-3 text-right">
          <span className={`text-ink/40 transition-transform inline-block ${expanded ? "rotate-180" : ""}`}>
            ▾
          </span>
        </td>
      </tr>

      {expanded && (
        <tr className="border-b border-ink/10 bg-ivory/60">
          <td colSpan={7} className="px-4 py-5">
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="label-mono mb-1">Client</p>
                <p className="font-body text-sm text-ink">{fullName || "—"}</p>
                {order.email && <p className="font-body text-sm text-ink/60">{order.email}</p>}
                {order.whatsapp && (
                  <p className="font-body text-sm text-ink/60">WhatsApp : {order.whatsapp}</p>
                )}
              </div>
              <div>
                <p className="label-mono mb-1">Livraison</p>
                <p className="font-body text-sm text-ink">{order.address || "—"}</p>
                <p className="font-body text-sm text-ink/60">{order.city}</p>
              </div>
            </div>

            {order.items?.length > 0 && (
              <div className="mb-4">
                <p className="label-mono mb-2">Articles</p>
                <div className="flex flex-col divide-y divide-ink/10 border border-ink/10 rounded-sm bg-white">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between px-4 py-2.5 text-sm">
                      <div className="min-w-0">
                        <p className="font-body text-ink truncate">{item.product}</p>
                        <p className="label-mono">
                          Pointure {item.size} · Qté {item.quantity}
                        </p>
                      </div>
                      <p className="font-body text-ink shrink-0 ml-4">
                        {formatCurrency(item.lineTotal || item.unitPrice * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <button onClick={handleDownload} disabled={downloading} className="btn-secondary">
                {downloading ? "Génération…" : "⬇ Télécharger la facture PDF"}
              </button>
              {downloadError && <p className="text-sm text-bordeaux">{downloadError}</p>}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default function OrdersTable({ orders, loading, error }) {
  if (loading) {
    return <p className="label-mono text-ink/40 py-6">Chargement des commandes…</p>;
  }

  if (error) {
    return <p className="text-sm text-bordeaux py-4">{error}</p>;
  }

  if (orders.length === 0) {
    return (
      <p className="font-body text-ink/50 text-sm py-6">
        Aucune commande ne correspond à cette sélection.
      </p>
    );
  }

  return (
    <div className="card overflow-x-auto">
      <table className="w-full min-w-[720px] border-collapse">
        <thead>
          <tr className="border-b border-ink/10 bg-ivory/40">
            <th className="label-mono text-left px-4 py-3">N° commande</th>
            <th className="label-mono text-left px-4 py-3">Date</th>
            <th className="label-mono text-left px-4 py-3">Client</th>
            <th className="label-mono text-left px-4 py-3">Ville</th>
            <th className="label-mono text-left px-4 py-3">Paiement</th>
            <th className="label-mono text-right px-4 py-3">Total</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <OrderRow key={order.orderNo} order={order} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
