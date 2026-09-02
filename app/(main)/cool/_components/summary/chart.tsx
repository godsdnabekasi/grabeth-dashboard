import {
  Bar,
  BarChart,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card } from "@/components/ui/card";

interface IProps {
  chartData: {
    label: string;
    count: number;
    met: boolean;
  }[];
  targetPerMonth: number;
}

const CoolSummaryChart = ({ chartData, targetPerMonth }: IProps) => {
  return (
    <Card>
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
        Jumlah COOL per bulan
      </p>
      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData} barSize={"100%"}>
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
              width={20}
            />
            <Tooltip
              cursor={{ fill: "rgba(0,0,0,0.04)" }}
              contentStyle={{
                fontSize: 12,
                borderRadius: 8,
                border: "0.5px solid #e5e7eb",
                boxShadow: "none",
              }}
              formatter={(value) => [`${value}x COOL \n Pertemuan`, ""]}
            />
            <ReferenceLine
              y={targetPerMonth}
              stroke="#e5e7eb"
              strokeDasharray="4 4"
              label={{
                value: `Target ${targetPerMonth}x`,
                fontSize: 10,
                fill: "#9ca3af",
                position: "insideTopRight",
              }}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.met ? "#4ade80" : "#fbbf24"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex items-center justify-center h-40 text-sm text-gray-400">
          Belum ada data COOL
        </div>
      )}
      {/* Legend */}
      <div className="flex gap-4 mt-2">
        <span className="flex items-center gap-1.5 text-xs text-gray-400">
          <span className="w-2.5 h-2.5 rounded-sm bg-green-400 inline-block" />
          Memenuhi target
        </span>
        <span className="flex items-center gap-1.5 text-xs text-gray-400">
          <span className="w-2.5 h-2.5 rounded-sm bg-amber-400 inline-block" />
          Di bawah target
        </span>
      </div>
    </Card>
  );
};

export default CoolSummaryChart;
