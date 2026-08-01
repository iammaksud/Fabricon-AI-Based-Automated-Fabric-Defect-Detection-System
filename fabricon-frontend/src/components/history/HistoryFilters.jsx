import { MdOutlineSearch, MdOutlineFilterList, MdOutlineDateRange } from 'react-icons/md';

export const STATUS_FILTERS = [
  { value: 'ALL', label: 'All Results' },
  { value: 'NORMAL', label: 'Normal Fabric' },
  { value: 'DEFECT', label: 'Defects Only' },
];

export const DATE_FILTERS = [
  { value: 'ALL', label: 'All Time' },
  { value: 'TODAY', label: 'Today' },
  { value: 'WEEK', label: 'This Week' },
  { value: 'MONTH', label: 'This Month' },
];

const HistoryFilters = ({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  dateFilter,
  onDateFilterChange,
}) => {
  return (
    <div className="fc-panel fc-filter-bar">
      <div className="fc-filter-search">
        <span className="fc-filter-search-icon">
          <MdOutlineSearch size={18} />
        </span>
        <input
          type="text"
          className="form-control"
          placeholder="Search by Inspection ID or Defect Type..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="fc-filter-select">
        <MdOutlineFilterList size={17} className="fc-filter-select-icon" />
        <select
          className="form-select"
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
        >
          {STATUS_FILTERS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="fc-filter-select">
        <MdOutlineDateRange size={17} className="fc-filter-select-icon" />
        <select
          className="form-select"
          value={dateFilter}
          onChange={(e) => onDateFilterChange(e.target.value)}
        >
          {DATE_FILTERS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default HistoryFilters;