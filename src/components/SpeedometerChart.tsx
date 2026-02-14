import { useMemo } from "react";

interface SpeedometerChartProps {
  value: number | null; // null means NA
  title: string;
  size?: number;
}

const SpeedometerChart = ({ value, title, size = 200 }: SpeedometerChartProps) => {
  const isNA = value === null;
  const clampedValue = isNA ? 0 : Math.max(0, Math.min(100, value));

  const cx = size / 2;
  const cy = size / 2 + 10;
  const radius = size * 0.38;
  const outerRadius = radius + size * 0.08;
  const tickRadius = outerRadius + 4;

  // Angles: 180° (left) to 0° (right), so 0=left, 100=right
  const valueToAngle = (v: number) => Math.PI - (v / 100) * Math.PI;

  // Arc path for a zone
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
    return `M ${x1Outer} ${y1Outer} A ${r2} ${r2} 0 ${largeArc} 1 ${x2Outer} ${y2Outer} L ${x2Inner} ${y2Inner} A ${r1} ${r1} 0 ${largeArc} 0 ${x1Inner} ${y1Inner} Z`;
  };

  // Background arc segments (grey ticks)
  const bgSegments = useMemo(() => {
    const segs = [];
    const segCount = 10;
    const gap = 0.5;
    for (let i = 0; i < segCount; i++) {
      const start = (i * 100) / segCount + gap;
      const end = ((i + 1) * 100) / segCount - gap;
      segs.push(
        <path
          key={`bg-${i}`}
          d={arcPath(start, end, outerRadius, outerRadius + size * 0.06)}
          fill="#d1d5db"
        />
      );
    }
    return segs;
  }, [size]);

  // Color zones
  const zones = [
    { start: 0, end: 30, color: isNA ? "#fca5a5" : "#ef4444", label: "Poor" },
    { start: 30, end: 70, color: isNA ? "#fde68a" : "#eab308", label: "Average" },
    { start: 70, end: 100, color: isNA ? "#a7f3d0" : "#22c55e", label: "Good" },
  ];

  // Needle
  const needleAngle = valueToAngle(clampedValue);
  const needleLength = radius - 8;
  const needleTipX = cx + needleLength * Math.cos(needleAngle);
  const needleTipY = cy - needleLength * Math.sin(needleAngle);

  // Tick labels
  const ticks = [10, 20, 30, 40, 50, 60, 70, 80, 90];

  // Value color
  const getValueColor = (v: number) => {
    if (v < 30) return "#ef4444";
    if (v < 50) return "#f97316";
    if (v < 70) return "#eab308";
    return "#16a34a";
  };

  return (
    <div className="flex flex-col items-center">
      <h4 className="text-sm font-bold text-gray-800 mb-1">{title}</h4>
      <svg width={size} height={size * 0.6} viewBox={`0 0 ${size} ${size * 0.65}`}>
        {/* Background segments */}
        {bgSegments}

        {/* Color zones */}
        {zones.map((zone) => (
          <path
            key={zone.label}
            d={arcPath(zone.start, zone.end, radius - size * 0.04, outerRadius)}
            fill={zone.color}
            opacity={isNA ? 0.4 : 1}
          />
        ))}

        {/* Zone labels */}
        {zones.map((zone) => {
          const midVal = (zone.start + zone.end) / 2;
          const angle = valueToAngle(midVal);
          const labelR = radius + size * 0.01;
          const lx = cx + labelR * Math.cos(angle);
          const ly = cy - labelR * Math.sin(angle);
          return (
            <text
              key={`label-${zone.label}`}
              x={lx}
              y={ly}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={size * 0.05}
              fill={isNA ? "#9ca3af" : zone.color === "#eab308" ? "#a16207" : zone.color}
              fontWeight="600"
            >
              {zone.label}
            </text>
          );
        })}

        {/* Tick numbers */}
        {ticks.map((t) => {
          const angle = valueToAngle(t);
          const tr = tickRadius + size * 0.06;
          const tx = cx + tr * Math.cos(angle);
          const ty = cy - tr * Math.sin(angle);
          return (
            <text
              key={`tick-${t}`}
              x={tx}
              y={ty}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={size * 0.055}
              fill="#374151"
              fontWeight="500"
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
              strokeWidth={3}
              strokeLinecap="round"
            />
            <circle cx={cx} cy={cy} r={4} fill="#374151" />
          </>
        )}
      </svg>

      {/* Value display */}
      <div className="mt-[-4px]">
        {isNA ? (
          <span className="text-lg font-bold text-gray-400">NA</span>
        ) : (
          <span
            className="text-xl font-bold"
            style={{ color: getValueColor(clampedValue) }}
          >
            {Math.round(clampedValue)}
          </span>
        )}
      </div>
    </div>
  );
};

export default SpeedometerChart;
