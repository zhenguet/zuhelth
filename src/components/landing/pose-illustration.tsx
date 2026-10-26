export function PoseIllustration() {
  return (
    <svg
      aria-label="Illustration of a person in a squat pose with a simplified pose landmark overlay"
      role="img"
      viewBox="0 0 360 340"
      fill="none"
      className="h-full w-full max-w-[360px]"
    >
      <defs>
        <linearGradient id="body" x1="92" y1="58" x2="263" y2="286" gradientUnits="userSpaceOnUse">
          <stop stopColor="#d7f3b6" />
          <stop offset="1" stopColor="#75b957" />
        </linearGradient>
      </defs>
      <ellipse cx="180" cy="302" rx="112" ry="12" fill="#101d16" fillOpacity=".35" />
      <path d="M86 290h188" stroke="#dce7d6" strokeOpacity=".25" strokeDasharray="4 7" />
      <path d="M184 79 151 131 111 157 92 211" stroke="url(#body)" strokeWidth="22" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M155 131 205 174 252 183 278 227" stroke="url(#body)" strokeWidth="22" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M151 131 202 126 233 144" stroke="#91cf68" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M184 79 209 110 202 126" stroke="#c2eb9d" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="185" cy="57" r="21" fill="#d7f3b6" />
      <path d="M165 53c3-17 29-25 42-5-7-6-13-7-20-5-6 2-11 7-22 10Z" fill="#244b31" />
      <g stroke="#c9f49e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m184 79 27 31-7 16-49 5-44 26-19 54" />
        <path d="m155 131 50 43 47 9 26 44" />
        <path d="m151 131 51-5 31 18" />
      </g>
      <g fill="#f4ffe9" stroke="#6caf4d" strokeWidth="3">
        <circle cx="184" cy="79" r="5" />
        <circle cx="155" cy="131" r="5" />
        <circle cx="111" cy="157" r="5" />
        <circle cx="92" cy="211" r="5" />
        <circle cx="205" cy="174" r="5" />
        <circle cx="252" cy="183" r="5" />
        <circle cx="278" cy="227" r="5" />
        <circle cx="202" cy="126" r="5" />
        <circle cx="233" cy="144" r="5" />
      </g>
      <g stroke="#b9f36d" strokeWidth="1.5" strokeDasharray="3 4" opacity=".75">
        <path d="M155 131 92 211" />
        <path d="M155 131 252 183" />
        <path d="M184 79 202 126" />
      </g>
      <path d="M58 99h50M58 99v22M302 252h-36M302 252v-22" stroke="#dce7d6" strokeOpacity=".45" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
