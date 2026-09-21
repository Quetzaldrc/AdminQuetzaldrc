import { useState } from "react";

export default function OrderSearch({ onSearch, loading }) {
  const [query, setQuery] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    onSearch(query.trim());
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Numéro de commande, nom du client, numéro WhatsApp…"
        className="input-field flex-1"
      />
      <button type="submit" className="btn-primary shrink-0" disabled={loading}>
        {loading ? "Recherche…" : "Rechercher"}
      </button>
    </form>
  );
}
