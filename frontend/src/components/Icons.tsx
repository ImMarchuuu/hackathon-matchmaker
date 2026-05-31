import React from "react";

interface IconProps {
  className?: string;
}

/** Crown / pirate-hat silhouette — used for Role tags */
export function RoleIcon({ className = "w-4 h-4" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Crown with three peaks and a base bar */}
      <path d="M2 19h20v2H2v-2z" />
      <path d="M3 17l3-8 4 5 2-8 2 8 4-5 3 8H3z" />
    </svg>
  );
}

/** Hollow hexagon — used for Skill tags */
export function SkillIcon({ className = "w-4 h-4" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/*
        Outer hexagon minus inner hexagon using fill-rule="evenodd".
        Outer: flat-top hex with apothem ~11, centre (12,12)
        Inner: same shape scaled to ~55%, creating a thick hollow ring
      */}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="
          M12 1
          L21.99 6.5 V17.5 L12 23 L2.01 17.5 V6.5 Z

          M12 5.2
          L6.4 8.4 V14.8 L12 18 L17.6 14.8 V8.4 Z
        "
      />
    </svg>
  );
}

/** Anchor — used for Competition section */
export function AnchorIcon({ className = "w-5 h-5" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm0 2a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" />
      <path d="M11 7.17V20.9A9 9 0 0 1 3.1 13H6a1 1 0 0 0 0-2H3.1A9 9 0 0 1 11 4.1V6h2V4.1A9 9 0 0 1 20.9 11H18a1 1 0 0 0 0 2h2.9A9 9 0 0 1 13 20.9V7.17a3 3 0 0 0-2 0z" />
    </svg>
  );
}
