"use client";

// Catches errors thrown by the root layout itself — unlike error.tsx, this
// replaces <html>/<body> entirely, so it can't rely on layout.tsx or
// globals.css and must be fully self-contained (inline styles only).
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="fr">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#060b14",
          color: "#dceaf5",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            background: "#0a1120",
            border: "1px solid #1a2740",
            borderRadius: 10,
            padding: 24,
            maxWidth: 420,
            textAlign: "center",
          }}
        >
          <p
            style={{
              fontSize: 11,
              letterSpacing: "0.12em",
              color: "#5c7690",
              textTransform: "uppercase",
              marginBottom: 12,
            }}
          >
            Erreur critique
          </p>
          <h2 style={{ fontSize: 20, marginBottom: 8 }}>HOUSE n&apos;a pas pu démarrer</h2>
          <p style={{ color: "#5c7690", fontSize: 14, marginBottom: 20 }}>
            Une erreur inattendue est survenue au chargement de l&apos;application.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              padding: "9px 18px",
              borderRadius: 6,
              border: "1px solid #4de8ff",
              background: "transparent",
              color: "#4de8ff",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Réessayer
          </button>
        </div>
      </body>
    </html>
  );
}
