"use client";

import FindTeamContent from "@/components/team/FindTeamContent";
import { useTeamsData } from "@/hooks/useTeamsData";

export default function FindTeamPage() {
  const { teams, people, isLoading } = useTeamsData();

  return <FindTeamContent teams={teams} people={people} isLoading={isLoading} />;
}
