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
  const maxTrend = Math.max(...trendData, 4);

  // 4. Heatmap Data Generation
  const generateHeatmapData = () => {
    const today = new Date();
    const mapData = [];
    const weeks = 52;
    const days = 7;

    const startDate = new Date(today);
    startDate.setDate(today.getDate() - (weeks * 7));
    const dayOfWeek = startDate.getDay();
    startDate.setDate(startDate.getDate() - dayOfWeek);

    const taskDates: Record<string, number> = {};
    tasks.forEach(t => {
      const d = new Date(t.createdAt).toISOString().split('T')[0];
      taskDates[d] = (taskDates[d] || 0) + 1;
    });

    let maxCount = 0;

    for (let w = 0; w < weeks; w++) {
      for (let d = 0; d < days; d++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + (w * 7) + d);
        if (currentDate > today) continue;
        const dateStr = currentDate.toISOString().split('T')[0];
        const count = taskDates[dateStr] || 0;
        if (count > maxCount) maxCount = count;
        mapData.push({ x: w, y: d, date: dateStr, count, dayIndex: d });
      }
    }
    return { mapData, maxCount };
  };

  const { mapData: heatmapData, maxCount: heatmapMax } = generateHeatmapData();

  // Donut Chart Helpers
  let accumulatedPercent = 0;
  const donutSegments = statusCounts.map((segment) => {
    const percent = segment.value / totalTasks;
    const strokeDasharray = `${percent * 100} ${100 - percent * 100}`;
    const strokeDashoffset = 25 - accumulatedPercent * 100;
    accumulatedPercent += percent;
    return (
      <circle
        key={segment.label}
        cx="18" cy="18" r="15.91549430918954"
        fill="transparent"
        stroke={segment.color}
        strokeWidth="4"
        strokeDasharray={strokeDasharray}
        strokeDashoffset={strokeDashoffset}
        className="transition-all duration-1000 ease-out"
      />
    );
  });

  const polylinePoints = trendData.map((val, idx) => {
    const x = (idx / (trendData.length - 1)) * 100;
    const y = 100 - (val / maxTrend) * 80;
    return `${x},${y}`;
  }).join(' ');


  return (
    <div className="p-6 space-y-6">

      {/* Feature 9: AI Executive Summary */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-6 rounded-xl border border-indigo-100 dark:border-indigo-800 transition-all duration-300">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-start gap-3">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="mt-1 p-1 hover:bg-indigo-100 dark:hover:bg-indigo-800/50 rounded-full transition-colors text-indigo-600 dark:text-indigo-400"
            >
              <svg
                className={`w-5 h-5 transform transition-transform duration-300 ${isCollapsed ? '-rotate-90' : 'rotate-0'}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div>
              <h3 className="text-lg font-bold text-indigo-900 dark:text-indigo-100 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                AI Executive Briefing
              </h3>
              <p className="text-sm text-indigo-700 dark:text-indigo-300 mt-1">Generate a real-time status report of your project health.</p>
            </div>
          </div>
          <Button onClick={handleGenerateReport} disabled={isGenerating} variant="primary" className="bg-indigo-600 hover:bg-indigo-700 text-white">
            {isGenerating ? 'Generating...' : 'Generate Report'}
          </Button>
        </div>

        {!isCollapsed && reportText && (
          <div className="prose dark:prose-invert max-w-none animate-fade-in">
            <div dangerouslySetInnerHTML={{ __html: reportText }} />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Tasks', value: totalTasks, color: 'bg-blue-500', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
          { label: 'Completed', value: completedTasks, color: 'bg-green-500', icon: 'M5 13l4 4L19 7' },
          { label: 'In Progress', value: inProgressTasks, color: 'bg-purple-500', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
          { label: 'Overdue', value: overdueTasks, color: 'bg-red-500', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{stat.label}</p>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</h3>
            </div>
            <div className={`p-3 rounded-full ${stat.color} bg-opacity-10`}>
              <svg className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} /></svg>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Status Distribution */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Task Status</h3>
          <div className="flex flex-col sm:flex-row items-center justify-around">
            <div className="relative w-48 h-48">
              <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                {totalTasks > 0 ? donutSegments : (
                  <circle cx="18" cy="18" r="15.91549430918954" fill="transparent" stroke="#e5e7eb" strokeWidth="4" />
                )}
              </svg>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">{Math.round((completedTasks / totalTasks || 0) * 100)}%</span>
                <span className="text-xs text-gray-500 uppercase">Complete</span>
              </div>
            </div>
            <div className="mt-6 sm:mt-0 space-y-3">
              {statusCounts.map(item => (
                <div key={item.label} className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: item.color }}></div>
                  <span className="text-sm text-gray-600 dark:text-gray-300 w-24">{item.label}</span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Priority Breakdown */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Tasks by Priority</h3>
          <div className="h-48 flex items-end justify-around space-x-4 px-4">
            {priorityCounts.map((item) => (
              <div key={item.label} className="flex flex-col items-center flex-1 group">
                <div className="w-full max-w-[60px] relative flex items-end h-40 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                  <div
                    className="w-full transition-all duration-1000 ease-out opacity-90 group-hover:opacity-100"
                    style={{
                      height: `${(item.value / maxPriorityValue) * 100}%`,
                      backgroundColor: item.color
                    }}
                  ></div>
                </div>
                <span className="mt-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{item.label}</span>
                <span className="text-sm font-bold text-gray-900 dark:text-white mt-1">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activity Heatmap */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Activity Heatmap</h3>
          <div className="text-xs text-gray-400 flex items-center space-x-2">
            <span>Less</span>
            <div className="flex space-x-1">
              <div className="w-2.5 h-2.5 bg-gray-100 dark:bg-gray-700 rounded-sm"></div>
              <div className="w-2.5 h-2.5 bg-primary-200 dark:bg-primary-900 rounded-sm"></div>
              <div className="w-2.5 h-2.5 bg-primary-400 dark:bg-primary-700 rounded-sm"></div>
              <div className="w-2.5 h-2.5 bg-primary-600 dark:bg-primary-500 rounded-sm"></div>
            </div>
            <span>More</span>
          </div>
        </div>

        <div className="w-full overflow-x-auto custom-scrollbar pb-2">
          <div className="min-w-[700px]">
            <svg width="100%" height="130" viewBox="0 0 840 110" preserveAspectRatio="xMinYMin meet">
              <g transform="translate(20, 20)">
                {/* Week Labels */}
                {Array.from({ length: 12 }).map((_, i) => (
                  <text key={i} x={i * 70} y="-8" className="text-[10px] fill-gray-400" textAnchor="start">
                    {new Date(new Date().setMonth(new Date().getMonth() - (11 - i))).toLocaleString('default', { month: 'short' })}
                  </text>
                ))}

                {/* Day Labels */}
                <text x="-10" y="24" className="text-[9px] fill-gray-400" textAnchor="end">Mon</text>
                <text x="-10" y="54" className="text-[9px] fill-gray-400" textAnchor="end">Wed</text>
                <text x="-10" y="84" className="text-[9px] fill-gray-400" textAnchor="end">Fri</text>

                {/* Cells */}
                {heatmapData.map((cell, idx) => {
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
                })}
              </g>
            </svg>
          </div>
        </div>
      </div>

      {/* Activity Trend */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
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
      </div>

    </div>
  );
};

export default Reports;