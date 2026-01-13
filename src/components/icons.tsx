import type { SVGProps } from "react";

export function AppLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 2a10 10 0 1 0 10 10" />
      <path d="m21.54 11.37-8.3-5.93" />
      <path d="M2.46 12.63 12 22" />
      <path d="m15.5 6.5-3 3" />
      <path d="m12.5 9.5-3 3" />
      <path d="m15.5 12.5-3 3" />
      <text x="13" y="19" fontFamily="sans-serif" fontSize="6" fill="currentColor" fontWeight="bold">Rx</text>
    </svg>
  );
}
