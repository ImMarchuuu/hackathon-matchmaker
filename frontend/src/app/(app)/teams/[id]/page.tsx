import { notFound } from "next/navigation";
import { mockTeams, mockUsers, CURRENT_USER_ID } from "@/data/mockData";
import TeamDetailClient from "@/components/team/TeamDetailClient";

export default async function TeamDetailPage({ params }: { params: { id: string } }) {
  // ─── Server-Side delay to perfectly trigger Suspense boundary / loading.tsx ───
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const team = mockTeams.find((t) => t.id === params.id);

  if (!team) {
    notFound();
  }

  const leader = mockUsers[team.leaderId];

  const startDateStr = new Date(team.startDate).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const endDateStr = new Date(team.endDate).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const dateRange = `${startDateStr} - ${endDateStr}`;

  const reviewMembers = team.currentMemberIds.filter(id => id !== CURRENT_USER_ID);

  return (
    <TeamDetailClient
      team={team}
      leader={leader}
      dateRange={dateRange}
      reviewMembers={reviewMembers}
    />
  );
}
