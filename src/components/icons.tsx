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

export function Doses(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <path d="M12 2v2" />
            <path d="m4.93 4.93 1.41 1.41" />
            <path d="M2 12h2" />
            <path d="m4.93 19.07 1.41-1.41" />
            <path d="M12 20v2" />
            <path d="m19.07 19.07-1.41-1.41" />
            <path d="M22 12h-2" />
            <path d="m19.07 4.93-1.41 1.41" />
            <path d="M17 12a5 5 0 1 1-10 0 5 5 0 0 1 10 0Z" />
        </svg>
    )
}
