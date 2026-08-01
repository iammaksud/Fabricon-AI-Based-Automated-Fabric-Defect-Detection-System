import axiosInstance from './axiosInstance';

export const dashboardService = {
  /**
   * GET /api/dashboard/stats
   * Returns: { total_detections, total_defects, total_normal,
   *            today_detections, ai_status, esp32_status }
   */
  async getStats() {
    const response = await axiosInstance.get('/dashboard/stats');
    return response.data;
  },

  /**
   * GET /api/dashboard/recent-activity
   * Returns: { recent_activities: [ { id, batch_number, defect_type,
   *            confidence, image_path, detection_status, esp32_action,
   *            device_id, created_at }, ... ] }
   */
  async getRecentActivity(limit = 10) {
    const response = await axiosInstance.get('/dashboard/recent-activity', {
      params: { limit },
    });
    return response.data.recent_activities;
  },
};