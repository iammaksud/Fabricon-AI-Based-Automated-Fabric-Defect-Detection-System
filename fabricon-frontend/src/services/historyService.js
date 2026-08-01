import axiosInstance from './axiosInstance';

export const historyService = {
  /**
   * GET /api/history
   * Accepts: { page, pageSize, defectType, detectionStatus, dateFrom, dateTo }
   * (all optional except page/pageSize, which default server-side too).
   * Returns: { items, total, page, page_size, total_pages }
   */
  async getHistory({
    page = 1,
    pageSize = 100,
    defectType,
    detectionStatus,
    dateFrom,
    dateTo,
  } = {}) {
    const response = await axiosInstance.get('/history', {
      params: {
        page,
        page_size: pageSize,
        defect_type: defectType || undefined,
        detection_status: detectionStatus || undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
      },
    });
    return response.data;
  },

  /**
   * GET /api/history/{id}
   */
  async getHistoryById(detectionId) {
    const response = await axiosInstance.get(`/history/${detectionId}`);
    return response.data;
  },
};