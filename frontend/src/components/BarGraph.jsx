import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function BarGraph({ readings = [] }) {
  if (!Array.isArray(readings) || readings.length === 0) {
    return <div style={{ padding: 12, color: '#9a9a9a' }}>No data for bar graph</div>;
  }

  const data = readings.map((r, i) => ({ name: i + 1, value: r.wetnessIndex, label: r.label }));

  return (
    <div style={{ width: '100%', height: 140 }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
          <XAxis dataKey="name" hide />
          <YAxis domain={[0, 3]} ticks={[0,1,2,3]} />
          <Tooltip formatter={(value, name, props) => [`${value} (${props.payload.label})`, 'Wetness']} />
          <Bar dataKey="value" fill="#8884d8" radius={[4,4,0,0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
