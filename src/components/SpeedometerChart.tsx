import { useMemo } from "react";

interface SpeedometerChartProps {
  value: number | null; // null means NA
  title: string;
  size?: number;
}

const SpeedometerChart = ({ value, title, size = 220 }: SpeedometerChartProps) => {
  const isNA = value === null;
  const clampedValue = isNA ? 0 : Math.max(0, Math.min(100, value));

  const cx = size / 2;
  const cy = size / 2 + 8;
  const innerRadius = size * 0.28;
  const mainRadius = size * 0.38;
  const outerRadius = size * 0.46;
  const tickLabelRadius = outerRadius + size * 0.06;

  // Angles: 180° (left, value=0) to 0° (right, value=100)
  const valueToAngle = (v: number) => Math.PI - (v / 100) * Math.PI;

  // Arc path helper
  const arcPath = (startVal: number, endVal: number, r1: number, r2: number) => {
    const startAngle = valueToAngle(startVal);
    const endAngle = valueToAngle(endVal);
    const x1Outer = cx + r2 * Math.cos(startAngle);
    const y1Outer = cy - r2 * Math.sin(startAngle);
    const x2Outer = cx + r2 * Math.cos(endAngle);
    const y2Outer = cy - r2 * Math.sin(endAngle);
    const x2Inner = cx + r1 * Math.cos(endAngle);
    const y2Inner = cy - r1 * Math.sin(endAngle);
    const x1Inner = cx + r1 * Math.cos(startAngle);
    const y1Inner = cy - r1 * Math.sin(startAngle);
    const largeArc = Math.abs(endAngle - startAngle) > Math.PI ? 1 : 0;
    return `M ${x1Outer} ${y1Outer} A ${r2} ${r2} 0 ${largeArc} 1 ${x2Outer} ${y2Outer} L ${x2Inner} ${y2Inner}
     A ${r1} ${r1} 0 ${largeArc} 0 ${x1Inner} ${y1Inner} Z`;
  };

  // Background tick segments (outer grey ring)
  const bgSegments = useMemo(() => {
    const segs = [];
    const segCount = 10;
    const gap = 0.6;
    for (let i = 0; i < segCount; i++) {
      const start = (i * 100) / segCount + gap;
      const end = ((i + 1) * 100) / segCount - gap;
      segs.push(
        <path
          key={`bg-${i}`}
          d={arcPath(start, end, outerRadius, outerRadius + size * 0.045)}
          fill="#cbd5e1"
        />
      );
    }
    return segs;
  }, [size]);

  // Color zones - matching reference exactly: Poor (0-30 red), Average (30-70 yellow/amber), Good (70-100 green)
  const zones = [
    { start: 0, end: 30, color: isNA ? "#fca5a5" : "#ef4444", label: "Poor" },
    { start: 30, end: 70, color: isNA ? "#fde68a" : "#f59e0b", label: "Average" },
    { start: 70, end: 100, color: isNA ? "#86efac" : "#16a34a", label: "Good" },
  ];

  // Needle
  const needleAngle = valueToAngle(clampedValue);
  const needleLength = mainRadius + size * 0.06;
  const needleTipX = cx + needleLength * Math.cos(needleAngle);
  const needleTipY = cy - needleLength * Math.sin(needleAngle);

  // Tick labels positioned outside
  const ticks = [10, 20, 30, 40, 50, 60, 70, 80, 90];

  // Value color
  const getValueColor = (v: number) => {
    if (v < 30) return "#ef4444";
    if (v < 50) return "#f59e0b";
    if (v < 70) return "#f59e0b";
    return "#16a34a";
  };

  return (
    <div className="flex flex-col items-center">
      {/* Title above gauge */}
      <h4 className="text-base font-bold mb-1" style={{ color: "#1e3a5f" }}>{title}</h4>
      <svg width={size} height={size * 0.58} viewBox={`0 0 ${size} ${size * 0.62}`}>
        {/* Outer grey tick segments */}
        {bgSegments}

        {/* Main color zone arcs (thick band) */}
        {zones.map((zone) => (
          <path
            key={zone.label}
            d={arcPath(zone.start, zone.end, innerRadius, outerRadius)}
            fill={zone.color}
            opacity={isNA ? 0.35 : 1}
          />
        ))}

        {/* Zone labels inside the arcs */}
        {zones.map((zone) => {
          const midVal = (zone.start + zone.end) / 2;
          const angle = valueToAngle(midVal);
          const labelR = (innerRadius + mainRadius) / 2;
          const lx = cx + labelR * Math.cos(angle);
          const ly = cy - labelR * Math.sin(angle);
          const labelColor = isNA
            ? "#9ca3af"
            : zone.label === "Poor"
            ? "#fff"
            : zone.label === "Average"
            ? "#92400e"
            : "#fff";
          return (
            <text
              key={`label-${zone.label}`}
              x={lx}
              y={ly}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={size * 0.055}
              fill={labelColor}
              fontWeight="700"
            >
              {zone.label}
            </text>
          );
        })}

        {/* Tick numbers outside */}
        {ticks.map((t) => {
          const angle = valueToAngle(t);
          const tx = cx + tickLabelRadius * Math.cos(angle);
          const ty = cy - tickLabelRadius * Math.sin(angle);
          return (
            <text
              key={`tick-${t}`}
              x={tx}
              y={ty}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={size * 0.055}
              fill="#374151"
              fontWeight="600"
            >
              {t}
            </text>
          );
        })}

        {/* Needle (only if not NA) */}
        {!isNA && (
          <>
            <line
              x1={cx}
              y1={cy}
              x2={needleTipX}
              y2={needleTipY}
              stroke="#16a34a"
              strokeWidth={3.5}
              strokeLinecap="round"
            />
            <circle cx={cx} cy={cy} r={5} fill="#374151" />
          </>
        )}
      </svg>

      {/* Value display */}
      <div className="mt-[-6px]">
        {isNA ? (
          <span className="text-2xl font-bold text-gray-400">NA</span>
        ) : (
          <span
            className="text-2xl font-bold"
            style={{ color: getValueColor(clampedValue) }}
          >
            {Math.round(clampedValue)}
          </span>
        )}
      </div>

      {/* Legend row for NA dimensions */}
      {/* {isNA && (
        <div className="flex items-center gap-3 mt-2">
          <div className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: "#ef4444" }} />
            <span className="text-xs text-gray-600 font-medium">Poor</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: "#f59e0b" }} />
            <span className="text-xs text-gray-600 font-medium">Average</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: "#16a34a" }} />
            <span className="text-xs text-gray-600 font-medium">Good</span>
          </div>
        </div>
      )} */}
    </div>
  );
};

export default SpeedometerChart;
