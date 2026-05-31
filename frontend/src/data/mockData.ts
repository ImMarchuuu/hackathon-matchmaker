export const CURRENT_USER_ID = "u1";

export type Role =
  | "Developer"
  | "Business"
  | "UI/UX Designer"
  | "Marketing"
  | "AI / Data"
  | "Pitching";

export interface SkillBank {
  rankOverall: "Bronze" | "Silver" | "Gold" | "Diamond";
  roleMastery: Record<Role, number>;
  hardSkills: { name: string; level: string; count: number }[];
  softSkillScore: number;
  roleSoftSkills: { role: Role; score: number }[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  coverImage: string;
  bio: string;
  university: string;
  birthDate: string;
  github?: string;
  linkedin?: string;
  roles: Role[];
  skillBank: SkillBank;
}

// ─── 6 Unique Users ────────────────────────────────────────────────────────────
export const mockUsers: Record<string, User> = {
  u1: {
    id: "u1",
    name: "Murchy D.Luffy",
    email: "marchydluffy@gmail.com",
    avatarUrl: "/avatar.png",
    coverImage: "/cover-bg.png",
    bio: "ฉันจะเป็นราชาโจรสลัดให้ได้เลย เหมียวโอ่ง เริดเลยหละ",
    university: "King Mongkut's University of Technology Thonburi",
    birthDate: "5 May 2005",
    github: "github.com/marchydluffy",
    linkedin: "th.linkedin.com/marchydluffy",
    roles: ["Developer", "AI / Data"],
    skillBank: {
      rankOverall: "Gold",
      roleMastery: { Developer: 8, Business: 0, "UI/UX Designer": 0, Marketing: 0, "AI / Data": 5, Pitching: 1 },
      hardSkills: [
        { name: "React", level: "gold", count: 8 },
        { name: "NextJS", level: "gold", count: 7 },
        { name: "LLM", level: "diamond", count: 12 },
        { name: "Python", level: "gold", count: 5 },
      ],
      softSkillScore: 4.9,
      roleSoftSkills: [
        { role: "Developer", score: 4.8 },
        { role: "AI / Data", score: 4.9 },
      ],
    },
  },
  u2: {
    id: "u2",
    name: "Chanut Sunatho",
    email: "chanut@example.com",
    avatarUrl: "https://i.pravatar.cc/150?u=1",
    coverImage: "https://images.unsplash.com/photo-1557683316-973673baf926?w=600&h=200&fit=crop",
    bio: "UX designer who thinks in systems and communicates in pixels.",
    university: "Chulalongkorn University",
    birthDate: "10 Oct 2003",
    roles: ["UI/UX Designer", "Pitching"],
    skillBank: {
      rankOverall: "Silver",
      roleMastery: { Developer: 0, Business: 1, "UI/UX Designer": 10, Marketing: 2, "AI / Data": 0, Pitching: 5 },
      hardSkills: [
        { name: "Figma", level: "gold", count: 10 },
        { name: "Prototype", level: "silver", count: 4 },
        { name: "Present", level: "gold", count: 5 },
        { name: "Wireframe", level: "silver", count: 3 },
      ],
      softSkillScore: 4.5,
      roleSoftSkills: [
        { role: "UI/UX Designer", score: 4.5 },
        { role: "Pitching", score: 4.2 },
      ],
    },
  },
  u3: {
    id: "u3",
    name: "Somchai JaiDee",
    email: "somchai@example.com",
    avatarUrl: "https://i.pravatar.cc/150?u=4",
    coverImage: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=600&h=200&fit=crop",
    bio: "Business strategist passionate about startup ecosystems and growth hacking.",
    university: "Kasetsart University",
    birthDate: "1 Jan 2002",
    roles: ["Business", "Marketing"],
    skillBank: {
      rankOverall: "Bronze",
      roleMastery: { Developer: 0, Business: 8, "UI/UX Designer": 1, Marketing: 5, "AI / Data": 0, Pitching: 3 },
      hardSkills: [
        { name: "Strategy", level: "gold", count: 8 },
        { name: "Sales", level: "silver", count: 5 },
        { name: "SEO", level: "bronze", count: 3 },
        { name: "Market", level: "bronze", count: 2 },
      ],
      softSkillScore: 4.8,
      roleSoftSkills: [
        { role: "Business", score: 4.9 },
        { role: "Marketing", score: 4.6 },
      ],
    },
  },
  u4: {
    id: "u4",
    name: "Alice Wonderland",
    email: "alice@example.com",
    avatarUrl: "https://i.pravatar.cc/150?u=7",
    coverImage: "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=600&h=200&fit=crop",
    bio: "Backend engineer obsessed with distributed systems and clean APIs.",
    university: "Chiang Mai University",
    birthDate: "12 Dec 2004",
    roles: ["Developer", "AI / Data"],
    skillBank: {
      rankOverall: "Diamond",
      roleMastery: { Developer: 15, Business: 0, "UI/UX Designer": 0, Marketing: 0, "AI / Data": 8, Pitching: 0 },
      hardSkills: [
        { name: "API", level: "diamond", count: 15 },
        { name: "DB", level: "gold", count: 10 },
        { name: "Vision", level: "gold", count: 8 },
        { name: "Cloud", level: "gold", count: 6 },
      ],
      softSkillScore: 4.2,
      roleSoftSkills: [
        { role: "Developer", score: 4.2 },
        { role: "AI / Data", score: 4.0 },
      ],
    },
  },
  u5: {
    id: "u5",
    name: "Patchara Moonthong",
    email: "patchara@example.com",
    avatarUrl: "https://i.pravatar.cc/150?u=13",
    coverImage: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=200&fit=crop",
    bio: "I turn ideas into compelling stories. Public speaker & pitch coach.",
    university: "Thammasat University",
    birthDate: "3 Mar 2003",
    roles: ["Pitching", "Marketing"],
    skillBank: {
      rankOverall: "Gold",
      roleMastery: { Developer: 0, Business: 2, "UI/UX Designer": 0, Marketing: 6, "AI / Data": 0, Pitching: 9 },
      hardSkills: [
        { name: "Present", level: "diamond", count: 9 },
        { name: "Story", level: "gold", count: 7 },
        { name: "Brand", level: "gold", count: 5 },
        { name: "Ads", level: "silver", count: 4 },
      ],
      softSkillScore: 4.7,
      roleSoftSkills: [
        { role: "Pitching", score: 4.8 },
        { role: "Marketing", score: 4.5 },
      ],
    },
  },
  u6: {
    id: "u6",
    name: "Natnicha Lertkul",
    email: "natnicha@example.com",
    avatarUrl: "https://i.pravatar.cc/150?u=16",
    coverImage: "https://images.unsplash.com/photo-1553356084-58ef4a67b2a7?w=600&h=200&fit=crop",
    bio: "Full-stack developer with a love for AI-powered products.",
    university: "Mahidol University",
    birthDate: "22 Jul 2004",
    roles: ["Developer", "AI / Data"],
    skillBank: {
      rankOverall: "Gold",
      roleMastery: { Developer: 7, Business: 0, "UI/UX Designer": 1, Marketing: 0, "AI / Data": 6, Pitching: 0 },
      hardSkills: [
        { name: "React", level: "gold", count: 7 },
        { name: "Python", level: "gold", count: 6 },
        { name: "NLP", level: "gold", count: 5 },
        { name: "DB", level: "silver", count: 4 },
      ],
      softSkillScore: 4.4,
      roleSoftSkills: [
        { role: "Developer", score: 4.3 },
        { role: "AI / Data", score: 4.5 },
      ],
    },
  },
};

// ─── Saved & Pending ─────────────────────────────────────────────────────────
export const savedUserIds: string[] = ["u2", "u3", "u4"];

export const mockPendingRequests = [
  {
    id: "r1",
    requesterId: "u2",
    targetOwnerId: "u1",
    teamId: "t1",
    teamName: "Pirate Hackathon",
    time: "10 นาทีที่แล้ว",
  },
];

// ─── Team Member reference type ───────────────────────────────────────────────
export interface DetailedMember {
  name: string;
  avatar: string;
  role: Role;
  score: number;
}

// ─── Team (normalized — members reference User IDs) ───────────────────────────
export type TeamStatus = "WAITING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export interface Team {
  id: string;
  title: string;
  leaderId: string;   // FK → mockUsers
  startDate: string;
  endDate: string;
  daysLeft: number;
  status: TeamStatus;
  requiredRoles: Role[];
  requiredSkills: string[];
  currentMemberIds: string[]; // FK → mockUsers
  maxMembers: number;
  description?: string;
}

export const mockTeams: Team[] = [
  {
    id: "t1",
    title: "Pirate Hackathon",
    leaderId: "u1",
    startDate: "2024-05-10",
    endDate: "2034-05-13",
    daysLeft: 1,
    status: "IN_PROGRESS",
    requiredRoles: ["Developer", "Pitching"],
    requiredSkills: ["React", "API", "DB", "Story"],
    currentMemberIds: ["u1", "u3", "u2"],
    maxMembers: 4,
    description: "We are building an AI-powered matchmaking platform for hackathons. Looking for a passionate developer and a strong presenter to complete our crew.",
  },
  {
    id: "t2",
    title: "The Storytellers",
    leaderId: "u5",
    startDate: "2024-05-10",
    endDate: "2034-05-13",
    daysLeft: 2,
    status: "WAITING",
    requiredRoles: ["Pitching", "UI/UX Designer"],
    requiredSkills: ["Present", "Story", "Figma", "Visual"],
    currentMemberIds: ["u5", "u2"],
    maxMembers: 4,
    description: "A team laser-focused on storytelling. Our goal is to create a pitch deck that moves judges to tears. Looking for a designer and co-presenter.",
  },
  {
    id: "t3",
    title: "Data Kraken",
    leaderId: "u4",
    startDate: "2024-05-10",
    endDate: "2034-05-13",
    daysLeft: 3,
    status: "IN_PROGRESS",
    requiredRoles: ["Business", "Marketing"],
    requiredSkills: ["Python", "NLP", "Strategy", "Market"],
    currentMemberIds: ["u4", "u6"],
    maxMembers: 5,
    description: "Deep-tech team building an NLP analytics engine. We have the technical muscle — now we need business and marketing talent to bring it to market.",
  },
  {
    id: "t4",
    title: "GrowthLab",
    leaderId: "u3",
    startDate: "2024-05-10",
    endDate: "2034-05-13",
    daysLeft: 5,
    status: "WAITING",
    requiredRoles: ["Developer", "UI/UX Designer"],
    requiredSkills: ["SEO", "React", "Figma", "Brand"],
    currentMemberIds: ["u3", "u5"],
    maxMembers: 4,
    description: "A growth-focused team combining marketing expertise with product craft. We need a frontend developer and a UX designer to ship fast.",
  },
  {
    id: "t5",
    title: "AI สตาร์ทอัพ รุ่น 2",
    leaderId: "u6",
    startDate: "2025-08-01",
    endDate: "2025-08-03",
    daysLeft: 12,
    status: "WAITING",
    requiredRoles: ["Business", "Pitching"],
    requiredSkills: ["LLM", "Strategy", "Present"],
    currentMemberIds: ["u1", "u6"],
    maxMembers: 4,
    description: "Next-generation AI startup competition. We have the tech — now seeking a business strategist and a compelling presenter to close the loop.",
  },
];
