import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
} from 'recharts';

interface VelocityData {
  sprint: string;
  completed: number;
  planned: number;
}

const VelocityChart: React.FC<{ data: VelocityData[] }> = ({ data }) => {
  return (
    <div className="h-[300px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
          <XAxis 
            dataKey="sprint" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 12, fill: '#64748B' }} 
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 12, fill: '#64748B' }} 
          />
          <Tooltip 
            cursor={{ fill: '#F1F5F9' }}
            contentStyle={{ 
              backgroundColor: '#FFFFFF', 
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
            }}
          />
          <Bar dataKey="planned" fill="#E2E8F0" radius={[4, 4, 0, 0]} barSize={40} />
          <Bar dataKey="completed" fill="#6366F1" radius={[4, 4, 0, 0]} barSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default VelocityChart;
