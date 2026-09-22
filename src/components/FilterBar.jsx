import { useState } from "react";

export default function FilterBar({ onFilter, onReport, loading, reportLoading }) {
  const [q, setQ] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    onFilter({ q: q.trim(), start, end });
  }

  function handleReset() {
    setQ("");
    setStart("");
    setEnd("");
    onFilter({ q: "", start: "", end: "" });
  }

  return (
    <form onSubmit={handleSubmit} className="card p-5 flex flex-col gap-4">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="lg:col-span-2">
          <label className="label-mono block mb-1.5">Recherche</label>
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Numéro, nom du client, WhatsApp…"
            className="input-field"
          />
        </div>
        <div>
          <label className="label-mono block mb-1.5">Du</label>
          <input
            type="date"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            className="input-field"
          />
        </div>
        <div>
          <label className="label-mono block mb-1.5">Au</label>
          <input
            type="date"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            className="input-field"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Filtrage…" : "Filtrer"}
        </button>
        <button type="button" onClick={handleReset} className="btn-secondary" disabled={loading}>
          Réinitialiser
        </button>
        <div className="flex-1" />
        <button
          type="button"
          onClick={() => onReport({ q: q.trim(), start, end })}
          className="btn-secondary"
          disabled={reportLoading}
        >
          {reportLoading ? "Génération…" : "⬇ Générer un rapport PDF"}
        </button>
      </div>
    </form>
  );
}
