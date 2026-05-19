import SavedPageClient from "@/components/saved/SavedPageClient";
import { mockUsers, savedUserIds } from "@/data/mockData";

export default async function SavedPage() {
  // ─── Artificial Delay directly on the Server ───
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const savedUsers = savedUserIds
    .map((id) => mockUsers[id])
    .filter(Boolean);

  return <SavedPageClient initialUsers={savedUsers} />;
}
