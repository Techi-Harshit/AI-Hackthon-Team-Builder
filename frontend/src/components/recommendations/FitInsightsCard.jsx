import { motion } from "framer-motion";
import { teamFitInsights } from "../../data/recommendationsData";

function FitInsightsCard() {
  const center = 100;
  const maxRadius = 65;

  // 5 axes coordinates
  const axes = [
    { name: "Skills Match", key: "skillsMatch", val: teamFitInsights.skillsMatch, angle: -Math.PI / 2, labelX: 100, labelY: 18 },
    { name: "Goals Alignment", key: "goalsAlignment", val: teamFitInsights.goalsAlignment, angle: -Math.PI / 2 + (2 * Math.PI) / 5, labelX: 180, labelY: 70 },
    { name: "Availability", key: "availability", val: teamFitInsights.availability, angle: -Math.PI / 2 + (4 * Math.PI) / 5, labelX: 155, labelY: 165 },
    { name: "Communication", key: "communicationStyle", val: teamFitInsights.communicationStyle, angle: -Math.PI / 2 + (6 * Math.PI) / 5, labelX: 45, labelY: 165 },
    { name: "Experience Level", key: "experienceLevel", val: teamFitInsights.experienceLevel, angle: -Math.PI / 2 + (8 * Math.PI) / 5, labelX: 20, labelY: 70 },
  ];

  // Helper to calculate X/Y for polygon coordinate
  const getCoords = (angle, radius) => {
    const x = center + radius * Math.cos(angle);
    const y = center + radius * Math.sin(angle);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  };

  // Outer grid layers coordinates
  const gridLevels = [0.25, 0.5, 0.75, 1].map((level) => {
    return axes.map((a) => getCoords(a.angle, maxRadius * level)).join(" ");
  });

  // Value layer coordinates
  const valPoints = axes.map((a) => getCoords(a.angle, maxRadius * (a.val / 100))).join(" ");

  return (
    <div className="rounded-3xl border border-white/5 bg-[#0e1222]/20 backdrop-blur-xl p-6 mb-6">
      <h3 className="text-lg font-bold text-white heading-font mb-4">Team Fit Insights</h3>

      {/* SVG Chart Container */}
      <div className="flex items-center justify-center relative py-2">
        <svg width="220" height="200" viewBox="0 0 200 200" className="overflow-visible select-none">
          {/* Background grid concentric rings */}
          {gridLevels.map((points, idx) => (
            <polygon
              key={idx}
              points={points}
              fill="none"
              stroke="rgba(71, 85, 105, 0.2)"
              strokeWidth="0.8"
            />
          ))}

          {/* Grid lines connecting center to nodes */}
          {axes.map((axis, idx) => {
            const endCoords = getCoords(axis.angle, maxRadius);
            const [endX, endY] = endCoords.split(",");
            return (
              <line
                key={idx}
                x1={center}
                y1={center}
                x2={endX}
                y2={endY}
                stroke="rgba(71, 85, 105, 0.25)"
                strokeWidth="0.8"
              />
            );
          })}

          {/* Core Match Polygon with Scale Spring Animation */}
          <motion.polygon
            points={valPoints}
            fill="rgba(168, 85, 247, 0.22)"
            stroke="#a855f7"
            strokeWidth="1.8"
            initial={{ scale: 0, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, type: "spring", stiffness: 90 }}
            style={{ originX: "100px", originY: "100px", filter: "drop-shadow(0 0 8px rgba(168, 85, 247, 0.3))" }}
          />

          {/* Glowing node vertices */}
          {axes.map((axis, idx) => {
            const coords = getCoords(axis.angle, maxRadius * (axis.val / 100));
            const [cx, cy] = coords.split(",");
            return (
              <motion.circle
                key={idx}
                cx={cx}
                cy={cy}
                r="3.5"
                fill="#a855f7"
                stroke="#fff"
                strokeWidth="1"
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.8 + idx * 0.08, type: "spring" }}
                style={{ filter: "drop-shadow(0 0 3px #a855f7)" }}
              />
            );
          })}

          {/* Axis Labels */}
          {axes.map((axis, idx) => (
            <g key={idx}>
              <text
                x={axis.labelX}
                y={axis.labelY}
                fill="#94a3b8"
                fontSize="7.5"
                fontWeight="700"
                fontFamily="sans-serif"
                textAnchor="middle"
                className="uppercase tracking-wider"
              >
                {axis.name.split(" ")[0]}
              </text>
              <text
                x={axis.labelX}
                y={axis.labelY + 9}
                fill="#a855f7"
                fontSize="8.5"
                fontWeight="900"
                fontFamily="monospace"
                textAnchor="middle"
              >
                {axis.val}%
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}

export default FitInsightsCard;
