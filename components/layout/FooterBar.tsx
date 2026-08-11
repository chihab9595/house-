import Link from "next/link";

const FOOTER_ICONS = [
  { icon: "🎙️", href: "/assistant", label: "Assistant vocal" },
  { icon: "📁", href: "/cours", label: "Mes cours" },
  { icon: "📅", href: "/planning", label: "Planning" },
  { icon: "⚙️", href: "/parametres", label: "Paramètres" },
];

export default function FooterBar() {
  return (
    <div className="footer-bar">
      <div className="avatar" />
      <div className="footer-id">
        <div className="v">HOUSE 4.0</div>
        <div className="c">Assistant d&apos;étude médicale</div>
      </div>
      <div className="search-bar">🔍&nbsp; Posez une question ou donnez un ordre…</div>
      <div className="footer-icons">
        {FOOTER_ICONS.map((item) => (
          <Link key={item.href} href={item.href} className="ficon" aria-label={item.label}>
            {item.icon}
          </Link>
        ))}
      </div>
    </div>
  );
}
