import Link from "next/link";

export default function NotFound() {
  return (
    <div className="panel" style={{ margin: "60px auto", maxWidth: 480, textAlign: "center" }}>
      <p className="panel-title">404</p>
      <h2 className="tech" style={{ fontSize: 20, marginBottom: 8 }}>
        Page introuvable
      </h2>
      <p style={{ color: "var(--text-mute)", fontSize: 14, marginBottom: 20 }}>
        Cette page n&apos;existe pas ou plus.
      </p>
      <Link href="/" className="inline-btn">
        Retour à l&apos;accueil
      </Link>
    </div>
  );
}
