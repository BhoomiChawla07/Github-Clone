import React, { useMemo } from 'react';

const ContributionsHeatmap = ({ contributions }) => {
  const weeks = useMemo(() => {
    const result = [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    // Create 7 rows (one for each day of the week)
    for (let i = 0; i < 7; i++) {
      result[i] = [];
    }
    
    // Fill in the contributions
    contributions.forEach((item, index) => {
      const date = new Date(item.date);
      const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
      const weekIndex = Math.floor(index / 7);
      
      if (!result[dayOfWeek][weekIndex]) {
        result[dayOfWeek][weekIndex] = [];
      }
      result[dayOfWeek][weekIndex] = item;
    });
    
    return result;
  }, [contributions]);

  const getLevel = (count) => {
    if (!count || count === 0) return 0;
    if (count === 1) return 1;
    if (count <= 3) return 2;
    if (count <= 5) return 3;
    return 4;
  };

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Calculate which months to show based on the data
  const getMonthsForWeeks = () => {
    if (contributions.length === 0) return [];
    
    const monthMarkers = [];
    const totalWeeks = Math.ceil(contributions.length / 7);
    
    for (let weekIndex = 0; weekIndex < totalWeeks; weekIndex++) {
      const contributionIndex = weekIndex * 7;
      if (contributionIndex < contributions.length) {
        const date = new Date(contributions[contributionIndex].date);
        const month = date.getMonth();
        const year = date.getFullYear();
        
        // Check if this is the first week of a new month
        if (weekIndex === 0 || month !== new Date(contributions[(weekIndex - 1) * 7]?.date).getMonth()) {
          monthMarkers.push({
            weekIndex,
            monthName: months[month],
            month
          });
        }
      }
    }
    
    return monthMarkers;
  };

  const monthMarkers = getMonthsForWeeks();
  const totalWeeks = Math.ceil(contributions.length / 7);

  return (
    <div className="heatmap-container">
      <div className="heatmap-header">
        <span>{contributions.length} contributions in 2026</span>
        <div className="heatmap-legend">
          <span>Less</span>
          <div className="legend-colors">
            <div className="legend-box level-0"></div>
            <div className="legend-box level-1"></div>
            <div className="legend-box level-2"></div>
            <div className="legend-box level-3"></div>
            <div className="legend-box level-4"></div>
          </div>
          <span>More</span>
        </div>
      </div>

      <div className="heatmap-grid">
        <div className="heatmap-weekdays">
          <span></span>
          {/* Month labels positioned above their respective weeks */}
          <div style={{ display: 'flex', gap: '4px', gridColumn: 'span 7' }}>
            {Array.from({ length: totalWeeks }).map((_, weekIndex) => {
              const monthMarker = monthMarkers.find(m => m.weekIndex === weekIndex);
              return (
                <div key={weekIndex} style={{ width: '12px', fontSize: '10px', color: 'var(--muted)', textAlign: 'center' }}>
                  {monthMarker ? monthMarker.monthName : ''}
                </div>
              );
            })}
          </div>
        </div>
        
        <div style={{ display: 'flex' }}>
          <div style={{ width: '30px' }}>
            {dayNames.map(day => (
              <div key={day} style={{ height: '16px', fontSize: '10px', color: 'var(--muted)', marginBottom: '4px' }}>
                {day}
              </div>
            ))}
          </div>
          
          <div className="heatmap-weeks">
            {Array.from({ length: totalWeeks }).map((_, weekIndex) => (
              <div key={weekIndex} className="heatmap-week">
                {dayNames.map((_, dayIndex) => {
                  const contribution = weeks[dayIndex]?.[weekIndex];
                  return (
                    <div
                      key={`${weekIndex}-${dayIndex}`}
                      className={`heatmap-cell level-${getLevel(contribution?.count)}`}
                      title={contribution ? `${contribution.date}: ${contribution.count} contributions` : 'No contributions'}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContributionsHeatmap;