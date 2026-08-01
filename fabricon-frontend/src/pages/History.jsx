import { useEffect, useMemo, useState } from 'react';
import { MdOutlineFactCheck, MdOutlineReportProblem, MdOutlineGpsFixed } from 'react-icons/md';

import StatCard from '../components/dashboard/StatCard';
import HistoryFilters from '../components/history/HistoryFilters';
import HistoryTable from '../components/history/HistoryTable';

import { historyService } from '../services/historyService';

const formatDate = (d) =>
  d.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });

const formatTime = (d) =>
  d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

// The backend has no ESP32 action log yet (hardware integration isn't
// implemented), so this column is honestly shown as "--" rather than faked.
const mapRecord = (item) => {
  const dateObj = new Date(item.created_at);
  const isDefect = Boolean(item.defect_type);

  return {
    inspectionId: String(item.id),
    dateObj,
    date: formatDate(dateObj),
    time: formatTime(dateObj),
    fabricStatus: isDefect ? 'Defect Found' : 'Normal Fabric',
    defectType: item.defect_type || '—',
    confidence: Number((Number(item.confidence) * 100).toFixed(1)),
    esp32Action: '—',
    status: isDefect ? 'Defect' : 'Normal',
  };
};

// Maps the UI's date-range dropdown to date_from/date_to for the API.
const getDateRange = (dateFilter) => {
  const now = new Date();

  if (dateFilter === 'TODAY') {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return { dateFrom: start.toISOString(), dateTo: undefined };
  }
  if (dateFilter === 'WEEK') {
    const start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return { dateFrom: start.toISOString(), dateTo: undefined };
  }
  if (dateFilter === 'MONTH') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return { dateFrom: start.toISOString(), dateTo: undefined };
  }
  return { dateFrom: undefined, dateTo: undefined };
};

const History = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('ALL');
  const [page, setPage] = useState(1);

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadHistory = async () => {
    setLoading(true);
    setError('');
    try {
      const { dateFrom, dateTo } = getDateRange(dateFilter);
      const data = await historyService.getHistory({
        page: 1,
        pageSize: 100, // fetch a large batch; search/status filtering stay client-side, matching prior UX
        dateFrom,
        dateTo,
      });
      setRecords(data.items.map(mapRecord));
    } catch (err) {
      setError(
        err?.response?.data?.detail || 'Could not load detection history. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch from the backend only when the date range changes -- search
  // and status are applied client-side against the fetched batch below.
  useEffect(() => {
    loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateFilter]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, dateFilter]);

  const filteredRecords = useMemo(() => {
    const query = search.trim().toLowerCase();

    return records.filter((record) => {
      const matchesSearch =
        !query ||
        record.inspectionId.toLowerCase().includes(query) ||
        record.defectType.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'NORMAL' && record.fabricStatus === 'Normal Fabric') ||
        (statusFilter === 'DEFECT' && record.fabricStatus === 'Defect Found');

      return matchesSearch && matchesStatus;
    });
  }, [records, search, statusFilter]);

  const summary = useMemo(() => {
    const total = records.length;
    const defects = records.filter((r) => r.fabricStatus === 'Defect Found').length;
    const avgConfidence =
      total > 0 ? (records.reduce((sum, r) => sum + r.confidence, 0) / total).toFixed(1) : '0.0';

    return { total, defects, avgConfidence };
  }, [records]);

  if (error) {
    return (
      <div className="fc-panel">
        <div className="alert alert-danger d-flex justify-content-between align-items-center mb-0" role="alert">
          <span>{error}</span>
          <button className="btn btn-sm btn-outline-danger" onClick={loadHistory}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column gap-4">
      {/* ---------- Summary Cards ---------- */}
      <div className="row g-3">
        <div className="col-12 col-sm-6 col-xl-4">
          <StatCard
            icon={MdOutlineFactCheck}
            label="Total Inspections"
            value={summary.total.toLocaleString()}
            tone="primary"
            footnote="Recorded inspections in this date range"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-4">
          <StatCard
            icon={MdOutlineReportProblem}
            label="Total Defects"
            value={summary.defects.toLocaleString()}
            tone="danger"
            footnote="Defects found in this date range"
          />
        </div>
        <div className="col-12 col-xl-4">
          <StatCard
            icon={MdOutlineGpsFixed}
            label="Average Confidence"
            value={summary.avgConfidence}
            suffix="%"
            tone="success"
            footnote="Mean AI confidence score"
          />
        </div>
      </div>

      {/* ---------- Filters ---------- */}
      <HistoryFilters
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        dateFilter={dateFilter}
        onDateFilterChange={setDateFilter}
      />

      {/* ---------- Table ---------- */}
      <HistoryTable
        records={filteredRecords}
        loading={loading}
        page={page}
        onPageChange={setPage}
      />
    </div>
  );
};

export default History;