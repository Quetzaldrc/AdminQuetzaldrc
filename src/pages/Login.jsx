import { useState } from "react";
import { useAuth } from "../lib/auth";

export default function Login() {
  const { login } = useAuth();
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    const ok = login(password);
    if (!ok) {
      setError(true);
      setPassword("");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-ivory px-6">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <img
            src="./logo-full.png"
            alt="Quetzal"
            className="w-48 sm:w-56 h-auto object-contain mb-4"
          />
          <p className="label-mono">Espace administration</p>
        </div>

        <form onSubmit={handleSubmit} className="card p-8 flex flex-col gap-5">
          <div>
            <label className="label-mono block mb-2">Mot de passe</label>
            <input
              type="password"
              autoFocus
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(false);
              }}
              className="input-field"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-sm text-bordeaux font-body">
              Mot de passe incorrect.
            </p>
          )}

          <button type="submit" className="btn-primary w-full mt-2">
            Se connecter
          </button>
        </form>

        <p className="text-center label-mono mt-8 text-ink/30">
          Accès réservé — Quetzal
        </p>
      </div>
    </div>
  );
}
