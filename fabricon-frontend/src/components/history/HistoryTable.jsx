import { MdChevronLeft, MdChevronRight, MdOutlineInbox } from 'react-icons/md';

const PAGE_SIZE = 8;

const STATUS_TONE = {
  Normal: 'fc-status-ok',
  Defect: 'fc-status-danger',
  Processing: 'fc-status-warning',
};

const HistoryTable = ({ records, loading, page, onPageChange }) => {
  const totalPages = Math.max(1, Math.ceil(records.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageRecords = records.slice(start, start + PAGE_SIZE);

  return (
    <div className="fc-panel">
      <div className="fc-panel-title">Inspection History</div>

      <div className="table-responsive">
        <table className="table fc-table align-middle mb-0">
          <thead>
            <tr>
              <th>Inspection ID</th>
              <th>Date</th>
              <th>Time</th>
              <th>Fabric Status</th>
              <th>Defect Type</th>
              <th>Confidence</th>
              <th>ESP32 Action</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {/* ---------- Loading skeleton ---------- */}
            {loading &&
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={`skeleton-${i}`}>
                  {Array.from({ length: 8 }).map((__, j) => (
                    <td key={j}>
                      <span className="fc-skeleton" />
                    </td>
                  ))}
                </tr>
              ))}

            {/* ---------- Data rows ---------- */}
            {!loading &&
              pageRecords.map((row) => (
                <tr key={row.inspectionId}>
                  <td className="fc-mono text-muted">#{row.inspectionId}</td>
                  <td className="fc-mono">{row.date}</td>
                  <td className="fc-mono">{row.time}</td>
                  <td>{row.fabricStatus}</td>
                  <td>{row.defectType}</td>
                  <td className="fc-mono">{row.confidence}%</td>
                  <td>{row.esp32Action}</td>
                  <td>
                    <span
                      className={`fc-status-pill ${
                        STATUS_TONE[row.status] || 'fc-status-idle'
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* ---------- Empty state ---------- */}
      {!loading && records.length === 0 && (
        <div className="fc-table-empty">
          <MdOutlineInbox size={38} />
          <p className="mb-0">No matching inspections found</p>
          <span>Try adjusting your search or filters</span>
        </div>
      )}

      {/* ---------- Pagination ---------- */}
      {!loading && records.length > 0 && (
        <div className="fc-pagination">
          <span className="fc-pagination-info">
            Showing {start + 1}–{Math.min(start + PAGE_SIZE, records.length)} of{' '}
            {records.length}
          </span>

          <div className="fc-pagination-controls">
            <button
              className="fc-pagination-btn"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <MdChevronLeft size={18} />
            </button>
            <span className="fc-pagination-page">
              {currentPage} / {totalPages}
            </span>
            <button
              className="fc-pagination-btn"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <MdChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryTable;