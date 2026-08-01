// Reusable stat card used across the Dashboard's top metrics row.
// `tone` maps to Fabricon status colors: primary | success | danger | warning
const StatCard = ({ icon: Icon, label, value, suffix, tone = 'primary', footnote }) => {
  return (
    <div className="fc-panel fc-stat-card">
      <div className="fc-stat-card-top">
        <span className="fc-stat-card-label">{label}</span>
        <div className={`fc-stat-card-icon fc-stat-icon-${tone}`}>
          <Icon size={20} />
        </div>
      </div>
      <div className="fc-stat-card-value">
        {value}
        {suffix && <span className="fc-stat-card-suffix">{suffix}</span>}
      </div>
      {footnote && <div className="fc-stat-card-footnote">{footnote}</div>}
    </div>
  );
};

export default StatCard;