import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { ChartPie } from "lucide-react";

const COLORS = [
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#f59e0b', // amber
  '#10b981', // emerald
  '#3b82f6', // blue
  '#ef4444', // red
  '#06b6d4', // cyan
];

export default function ResultsChart({ poll, votes }) {
  const voteCounts = poll.options.map((_, index) => 
    votes.filter(vote => vote.option_index === index).length
  );
  
  const totalVotes = votes.length;
  
  const chartData = poll.options.map((option, index) => ({
    name: option,
    value: voteCounts[index],
    percentage: totalVotes > 0 ? ((voteCounts[index] / totalVotes) * 100).toFixed(1) : 0
  })).filter(item => item.value > 0); // Only show options with votes

  if (totalVotes === 0) {
    return (
      <Card className="border-slate-200/60 bg-white/80 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <ChartPie className="w-5 h-5 text-indigo-600" />
            Results Chart
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-slate-500">
            No votes yet to display chart
          </div>
        </CardContent>
      </Card>
    );
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-200">
          <p className="font-semibold text-slate-900">{payload[0].name}</p>
          <p className="text-sm text-slate-600">
            {payload[0].value} votes ({payload[0].payload.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="border-slate-200/60 bg-white/80 backdrop-blur-sm shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-900">
          <ChartPie className="w-5 h-5 text-indigo-600" />
          Results Chart
        </CardTitle>
        <p className="text-sm text-slate-500 mt-1">
          {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'} cast
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percentage }) => `${name}: ${percentage}%`}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              formatter={(value, entry) => `${value} (${entry.payload.value} votes)`}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}