"use client";

export default function AnalyticsIllustration() {
  return (
    <div className="h-150 shrink-0 overflow-hidden mask-[radial-gradient(white_30%,transparent_90%)] perspective-[4000px] perspective-origin-center">
      <div className="-translate-y-10 -translate-z-10 rotate-x-10 rotate-y-20 -rotate-z-10 transform-3d pointer-events-none select-none">
        <svg
          viewBox="0 0 1200 520"
          role="img"
          aria-label="Meta Ads dashboard style chart with legend and summary metrics"
          className="w-full h-auto"
        >
          <defs>
            <linearGradient id="bgfade" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.14" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.10" />
            </linearGradient>
          </defs>

          {/* backdrop */}
          <rect x="0" y="0" width="1200" height="520" fill="url(#bgfade)" />

          {/* subtle grid */}
          <g opacity="0.25">
            {Array.from({ length: 10 }).map((_, i) => (
              <line
                key={`v${i}`}
                x1={80 + i * 100}
                x2={80 + i * 100}
                y1={60}
                y2={420}
                stroke="#e5e7eb"
                strokeWidth="1"
              />
            ))}
            {Array.from({ length: 6 }).map((_, i) => (
              <line
                key={`h${i}`}
                x1={60}
                x2={1140}
                y1={90 + i * 55}
                y2={90 + i * 55}
                stroke="#e5e7eb"
                strokeWidth="1"
              />
            ))}
          </g>

          {/* legend */}
          <g fontSize="14">
            <circle cx="740" cy="90" r="5" fill="#f59e0b" />
            <text x="752" y="95" fill="#6b7280">Prospecting</text>

            <circle cx="880" cy="90" r="5" fill="#10b981" />
            <text x="892" y="95" fill="#6b7280">Retargeting</text>

            <circle cx="1010" cy="90" r="5" fill="#a78bfa" />
            <text x="1022" y="95" fill="#6b7280">Loyalty (BoFu)</text>
          </g>

          {/* three lines (stylized) */}
          <path
            d="M80,360 C150,330 220,340 260,300 C300,265 340,295 380,270 C420,250 460,260 500,230 C540,260 580,250 620,275 C660,320 700,310 740,280 C780,260 820,300 860,290 C900,280 940,300 980,270 C1020,250 1060,280 1120,240"
            fill="none"
            stroke="#f59e0b"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M80,380 C120,340 160,360 210,320 C260,290 300,310 350,280 C400,250 450,300 500,290 C550,280 600,310 650,260 C700,230 750,260 800,250 C850,240 900,260 950,230 C1000,210 1050,260 1120,190"
            fill="none"
            stroke="#10b981"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M80,340 C140,300 180,320 230,300 C280,280 320,290 370,260 C420,235 470,245 520,240 C570,235 620,255 670,235 C720,215 770,235 820,225 C870,215 920,235 970,220 C1020,205 1070,230 1120,210"
            fill="none"
            stroke="#a78bfa"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* x-axis ticks */}
          <g fontSize="12" fill="#9ca3af">
            {["Aug 01", "Aug 07", "Aug 13", "Aug 19", "Aug 25", "Aug 31", "Sep 06", "Sep 12", "Sep 18", "Sep 24"].map((d, i) => (
              <text key={d} x={80 + i * 100} y={440}>{d}</text>
            ))}
          </g>

          {/* metrics row (Meta Ads style) */}
          <g fontSize="13">
            {/* headers */}
            <text x="120" y="475" fill="#6b7280">Impressions</text>
            <text x="300" y="475" fill="#6b7280">CPM</text>
            <text x="430" y="475" fill="#6b7280">CTR</text>
            <text x="520" y="475" fill="#6b7280">CPC</text>
            <text x="630" y="475" fill="#6b7280">CPA</text>
            <text x="760" y="475" fill="#6b7280">ROAS</text>
            <text x="880" y="475" fill="#6b7280">Spend</text>

            {/* values (example) */}
            <text x="120" y="495" fill="#111827" fontWeight="600">1.9M</text>
            <text x="300" y="495" fill="#111827" fontWeight="600">$10.42</text>
            <text x="430" y="495" fill="#111827" fontWeight="600">1.67%</text>
            <text x="520" y="495" fill="#111827" fontWeight="600">$0.62</text>
            <text x="630" y="495" fill="#111827" fontWeight="600">$14.90</text>
            <text x="760" y="495" fill="#111827" fontWeight="600">2.9x</text>
            <text x="880" y="495" fill="#111827" fontWeight="600">$12,431</text>
          </g>
        </svg>
      </div>
    </div>
  );
}
