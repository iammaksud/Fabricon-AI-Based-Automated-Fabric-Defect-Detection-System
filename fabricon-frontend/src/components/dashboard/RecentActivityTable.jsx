// Recent Detection Activity table — shown on the Dashboard as a condensed
// preview. The full, filterable version lives on the History page.
const RecentActivityTable = ({ detections }) => {
  return (
    <div className="fc-panel">
      <div className="fc-panel-title">Recent Detection Activity</div>

      <div className="table-responsive">
        <table className="table fc-table align-middle mb-0">
          <thead>
            <tr>
              <th>ID</th>
              <th>Time</th>
              <th>Defect Type</th>
              <th>Confidence</th>
              <th>ESP32 Action</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {detections.map((row) => (
              <tr key={row.id}>
                <td className="fc-mono text-muted">{row.id}</td>
                <td className="fc-mono">{row.time}</td>
                <td>{row.defectType}</td>
                <td className="fc-mono">{row.confidence.toFixed(1)}%</td>
                <td>{row.esp32Action}</td>
                <td>
                  <span
                    className={`fc-status-pill ${
                      row.status === 'DEFECT' ? 'fc-status-danger' : 'fc-status-ok'
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
    </div>
  );
};

export default RecentActivityTable;