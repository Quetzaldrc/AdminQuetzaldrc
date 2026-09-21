import { useState } from "react";
import { fetchInvoice, downloadBase64Pdf } from "../lib/api";

function formatCurrency(value) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value || 0);
}

export default function OrderCard({ order }) {
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");
  const [expanded, setExpanded] = useState(false);

  async function handleDownload() {
    setDownloading(true);
    setDownloadError("");
    try {
      const { base64, filename } = await fetchInvoice(order.orderNo);
      downloadBase64Pdf(base64, filename);
    } catch (err) {
      setDownloadError(err.message || "Échec du téléchargement de la facture.");
    } finally {
      setDownloading(false);
    }
  }

  const fullName = [order.firstName, order.lastName].filter(Boolean).join(" ");

  return (
    <div className="card overflow-hidden">
      <button
        className="w-full flex items-center justify-between gap-4 p-5 text-left"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-center gap-4 min-w-0">
          <span className="font-mono text-xs uppercase tracking-wider text-bordeaux bg-bordeaux/10 px-2.5 py-1 rounded-sm shrink-0">
            #{order.orderNo}
          </span>
          <div className="min-w-0">
            <p className="font-body text-ink truncate">{fullName || "Client sans nom"}</p>
            <p className="label-mono truncate">{order.date} {order.city && `· ${order.city}`}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <span className="font-display text-xl text-ink">{formatCurrency(order.total)}</span>
          <span className={`text-ink/40 transition-transform ${expanded ? "rotate-180" : ""}`}>
            ▾
          </span>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-ink/10 p-5 bg-ivory/60 flex flex-col gap-5">
          <div className="grid sm:grid-cols-2 gap-4">
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
            <div>
              <p className="label-mono mb-1">Paiement</p>
              <p className="font-body text-sm text-ink">{order.payment || "—"}</p>
            </div>
            <div>
              <p className="label-mono mb-1">Total commande</p>
              <p className="font-body text-sm text-ink">{formatCurrency(order.total)}</p>
            </div>
          </div>

          {order.items?.length > 0 && (
            <div>
              <p className="label-mono mb-2">Articles</p>
              <div className="flex flex-col divide-y divide-ink/10 border border-ink/10 rounded-sm">
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

          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="btn-secondary"
            >
              {downloading ? "Génération…" : "⬇ Télécharger la facture PDF"}
            </button>
            {downloadError && (
              <p className="text-sm text-bordeaux">{downloadError}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
