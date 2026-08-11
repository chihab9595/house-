import AccuracyReal from "./AccuracyReal";
import ExamCountdownReal from "./ExamCountdownReal";
import ModuleProgressReal from "./ModuleProgressReal";
import StudyHoursReal from "./StudyHoursReal";

function ModuleProgressCard() {
  return (
    <div className="bcard">
      <div className="panel-title">Cours importés par module</div>
      <ModuleProgressReal />
    </div>
  );
}

function ExamCountdownCard() {
  return (
    <div className="bcard">
      <div className="panel-title">Prochain contrôle</div>
      <ExamCountdownReal />
    </div>
  );
}

function StudyHoursCard() {
  return (
    <div className="bcard">
      <div className="panel-title">Temps d&apos;étude (7 jours)</div>
      <StudyHoursReal />
    </div>
  );
}

function AccuracyCard() {
  return (
    <div className="bcard">
      <div className="panel-title">Précision aux quiz</div>
      <AccuracyReal />
    </div>
  );
}

export default function BottomCards() {
  return (
    <div className="bottom-cards">
      <ModuleProgressCard />
      <ExamCountdownCard />
      <StudyHoursCard />
      <AccuracyCard />
    </div>
  );
}
