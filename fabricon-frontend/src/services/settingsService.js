import axiosInstance from './axiosInstance';

export const settingsService = {
  /**
   * GET /api/settings/status
   * Returns: { ai_status, esp32_status, camera_status, system_mode, last_updated }
   */
  async getStatus() {
    const response = await axiosInstance.get('/settings/status');
    return response.data;
  },

  /**
   * PUT /api/settings/status
   * keyName must be one of: ai_status, esp32_status, camera_status, system_mode
   * Returns the refreshed full status object (same shape as getStatus()).
   */
  async updateStatus(keyName, value) {
    const response = await axiosInstance.put('/settings/status', {
      key_name: keyName,
      value,
    });
    return response.data;
  },
};