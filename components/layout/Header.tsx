import Clock from "./Clock";
import TopNav from "./TopNav";

export default function Header() {
  return (
    <header>
      <div className="brand">
        <div className="mark" />
        <h1 className="tech">
          HO<span>USE</span>
        </h1>
      </div>
      <TopNav />
      <div className="head-right">
        <Clock />
        <div className="status-pill">
          <span className="dot" /> HOUSE · en ligne
        </div>
      </div>
    </header>
  );
}
