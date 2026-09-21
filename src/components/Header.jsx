import { useAuth } from "../lib/auth";

export default function Header() {
  const { logout } = useAuth();

  return (
    <header className="border-b border-ink/10 bg-white">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src="./logo.png"
            alt="Quetzal"
            className="h-9 w-auto object-contain"
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
          <div>
            <h1 className="font-display text-xl leading-none text-ink">Quetzal</h1>
            <p className="label-mono leading-none mt-1">Administration</p>
          </div>
        </div>
        <button onClick={logout} className="label-mono hover:text-bordeaux transition-colors">
          Se déconnecter
        </button>
      </div>
    </header>
  );
}
