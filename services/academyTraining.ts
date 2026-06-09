import { SwimAcademyCard } from '@/data/swimAcademy';

export type AcademyTrainingPlanDraft = {
  id: string;
  academyCardId: string;
  title: string;
  drills: string[];
  createdAt: string;
};

let academyTrainingDrafts: AcademyTrainingPlanDraft[] = [];

export function addAcademyDrillToTrainingPlan(card: SwimAcademyCard) {
  const draft: AcademyTrainingPlanDraft = {
    id: `academy-drill-${Date.now()}`,
    academyCardId: card.id,
    title: card.title,
    drills: card.waterDrills,
    createdAt: new Date().toISOString(),
  };
  academyTrainingDrafts = [draft, ...academyTrainingDrafts];
  return draft;
}

export function getAcademyTrainingDrafts() {
  return academyTrainingDrafts;
}
