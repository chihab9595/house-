import SectionLayout from "./SectionLayout";

interface SecondaryPageProps {
  icon: string;
  title: string;
  description: string;
}

export default function SecondaryPage({ icon, title, description }: SecondaryPageProps) {
  return (
    <SectionLayout>
      <div className="panel placeholder-panel">
        <div className="icon">{icon}</div>
        <div className="title">{title}</div>
        <div className="desc">{description}</div>
        <div className="badge">Module à venir</div>
      </div>
    </SectionLayout>
  );
}
