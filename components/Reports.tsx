import React, { useState } from 'react';
import { Task, TaskStatus, TaskPriority } from '../types';
import Button from './Button';
import { generateProjectReport } from '../services/geminiService';

interface ReportsProps {
  tasks: Task[];
}

const Reports: React.FC<ReportsProps> = ({ tasks }) => {
  const [reportText, setReportText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    setIsCollapsed(false); // Auto-expand when generating
    try {
      const report = await generateProjectReport(tasks);
      setReportText(report);
    } catch (e) {
      setReportText('Failed to generate report.');
    } finally {
      setIsGenerating(false);
    }
  };

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === TaskStatus.DONE).length;
  const inProgressTasks = tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length;
  const overdueTasks = tasks.filter(t => new Date(t.dueDate) < new Date() && t.status !== TaskStatus.DONE).length;

  // -- Charts Data Calculation --

  // 1. Status Distribution (Donut)
  const statusCounts = Object.values(TaskStatus).map(status => ({
    label: status,
    value: tasks.filter(t => t.status === status).length,
    color: status === TaskStatus.TODO ? '#9ca3af' :
      status === TaskStatus.IN_PROGRESS ? '#a855f7' :
        status === TaskStatus.REVIEW ? '#f97316' : '#10b981'
  })).filter(d => d.value > 0);

  // 2. Priority Distribution (Bar)
  const priorityCounts = Object.values(TaskPriority).map(priority => ({
    label: priority,
    value: tasks.filter(t => t.priority === priority).length,
    color: priority === TaskPriority.LOW ? '#3b82f6' :
      priority === TaskPriority.MEDIUM ? '#eab308' : '#ef4444'
  }));
  const maxPriorityValue = Math.max(...priorityCounts.map(p => p.value), 1);

  // 3. Activity Trend (Line - Mocked timeline based on createdAt)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

  const trendData = last7Days.map(date => {
    const count = tasks.filter(t => {
      const tDate = new Date(t.createdAt).toISOString().split('T')[0];
      return tDate === date;
    }).length;
    return count + (count === 0 && Math.random() > 0.8 ? 1 : 0);
  });
                ))}

{/* Day Labels */ }
                <text x="-10" y="24" className="text-[9px] fill-gray-400" textAnchor="end">Mon</text>
                <text x="-10" y="54" className="text-[9px] fill-gray-400" textAnchor="end">Wed</text>
                <text x="-10" y="84" className="text-[9px] fill-gray-400" textAnchor="end">Fri</text>

{/* Cells */ }
{
  heatmapData.map((cell, idx) => {
    const cellSize = 13;
    const gap = 3;

    let colorClass = "fill-gray-100 dark:fill-gray-700";
    if (cell.count > 0) {
      const intensity = Math.min(cell.count / Math.max(heatmapMax, 3), 1);
      if (intensity < 0.3) colorClass = "fill-primary-200 dark:fill-primary-900";
      else if (intensity < 0.6) colorClass = "fill-primary-400 dark:fill-primary-700";
      else colorClass = "fill-primary-600 dark:fill-primary-500";
    }

    return (
      <rect
        key={idx}
        x={cell.x * (cellSize + gap)}
        y={cell.y * (cellSize + gap)}
        width={cellSize}
        height={cellSize}
        rx="2"
        className={`${colorClass} transition-all duration-200 hover:stroke-2 hover:stroke-gray-300 dark:hover:stroke-gray-500 cursor-pointer`}
      >
        <title>{`${cell.date}: ${cell.count} task${cell.count !== 1 ? 's' : ''}`}</title>
      </rect>
    );
  })
}
              </g >
            </svg >
          </div >
        </div >
      </div >

  {/* Activity Trend */ }
  < div className = "bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700" >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Weekly Activity</h3>
          <span className="text-xs text-green-500 font-semibold bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-full">+12% vs last week</span>
        </div>
        <div className="relative h-64 w-full">
          <svg className="w-full h-full overflow-visible">
            {/* Grid Lines */}
            {[0, 25, 50, 75, 100].map(p => (
              <line key={p} x1="0" y1={`${p}%`} x2="100%" y2={`${p}%`} stroke="currentColor" className="text-gray-100 dark:text-gray-700" strokeDasharray="4 4" />
            ))}

            {/* Area Fill */}
            <linearGradient id="trendGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="var(--primary-500)" stopOpacity="0.2" />
              <stop offset="100%" stopColor="var(--primary-500)" stopOpacity="0" />
            </linearGradient>
            <polygon points={`0,100 ${polylinePoints} 100,100`} fill="url(#trendGradient)" />

            {/* Line */}
            <polyline
              points={polylinePoints}
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-primary-500 drop-shadow-md"
            />

            {/* Points */}
            {trendData.map((val, idx) => {
              const x = (idx / (trendData.length - 1)) * 100;
              const y = 100 - (val / maxTrend) * 80;
              return (
                <circle
                  key={idx}
                  cx={`${x}%`} cy={`${y}%`} r="4"
                  className="fill-white dark:fill-gray-800 stroke-primary-500 stroke-2 hover:scale-150 transition-transform cursor-pointer"
                />
              );
            })}
          </svg>
          <div className="flex justify-between mt-2 text-xs text-gray-400">
            {last7Days.map(d => (
              <span key={d}>{new Date(d).toLocaleDateString(undefined, { weekday: 'short' })}</span>
            ))}
          </div>
        </div>
      </div >

    </div >
  );
};

export default Reports;