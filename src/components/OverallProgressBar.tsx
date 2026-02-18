interface OverallProgressBarProps {
  completed: number;
  total: number;
  label?: string;
}

const OverallProgressBar = ({ completed, total, label = 'Overall Progress' }: OverallProgressBarProps) => {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  // Color based on progress
  const getColorClass = () => {
    if (percentage >= 100) return 'from-green-400 to-green-600';
    if (percentage >= 75) return 'from-blue-400 to-blue-600';
    if (percentage >= 50) return 'from-yellow-400 to-yellow-600';
    if (percentage >= 25) return 'from-orange-400 to-orange-600';
    return 'from-gray-400 to-gray-500';
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-5 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-gray-900">{label}</h3>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-gray-900">{percentage}%</span>
          <span className="text-sm text-gray-500">({completed}/{total} complete)</span>
        </div>
      </div>
      <div className="relative w-full bg-gray-200 rounded-full h-4 overflow-hidden">
        <div
          className={`absolute inset-y-0 left-0 bg-gradient-to-r ${getColorClass()} rounded-full transition-all duration-700 ease-out`}
          style={{ width: `${percentage}%` }}
        />
        {/* Progress milestones */}
        <div className="absolute inset-0 flex justify-between px-0.5">
          {[25, 50, 75].map((milestone) => (
            <div
              key={milestone}
              className="w-0.5 h-full bg-white/30"
              style={{ marginLeft: `${milestone}%` }}
            />
          ))}
        </div>
      </div>
      <div className="flex justify-between mt-2 text-xs text-gray-400">
        <span>0%</span>
        <span>25%</span>
        <span>50%</span>
        <span>75%</span>
        <span>100%</span>
      </div>
    </div>
  );
};

export default OverallProgressBar;
