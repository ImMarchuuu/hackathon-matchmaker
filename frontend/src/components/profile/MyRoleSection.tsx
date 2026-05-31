import { RoleIcon } from "@/components/Icons";

export interface RoleWithRank {
  name: string;
  rank_title: string;
}

const RANK_COLORS: Record<string, string> = {
  Bronze:  "text-[#8B5A2B]",
  Silver:  "text-[#9CA3AF]",
  Gold:    "text-[#F59E0B]",
  Diamond: "text-[#00BFFF]",
};

interface MyRoleSectionProps {
  roles?: RoleWithRank[];
}

export default function MyRoleSection({ roles = [] }: MyRoleSectionProps) {
  return (
    <section className="relative rounded-[2rem] border border-gray-200 bg-white p-8 pt-12 flex-1 shadow-sm mt-8">
      {/* Title pill */}
      <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-white border border-gray-200 px-6 py-2 rounded-full flex items-center gap-2 shadow-sm text-[#1b3168] font-bold text-sm tracking-widest uppercase whitespace-nowrap">
        <RoleIcon className="w-4 h-4 text-[#1b3168]" />
        MY ROLE
      </div>

      {roles.length > 0 ? (
        <div className="grid grid-cols-2 gap-x-6 gap-y-8 justify-items-center mt-2">
          {roles.map((role) => (
            <div key={role.name} className="flex flex-col items-center gap-2 transition-transform hover:scale-105">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-[3px] border-[#1b3168] flex items-center justify-center p-2 text-center text-[#1b3168] font-bold text-xs sm:text-sm shadow-sm bg-white">
                {role.name}
              </div>
              <span className={`text-xs font-bold ${RANK_COLORS[role.rank_title] ?? "text-gray-400"}`}>
                {role.rank_title}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-full min-h-[150px]">
          <p className="text-sm text-gray-400 italic">No roles assigned yet.</p>
        </div>
      )}
    </section>
  );
}
