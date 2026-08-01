import axiosInstance from './axiosInstance';

export const detectionService = {
  /**
   * POST /api/detection/analyze
   * Sends one captured frame (as a Blob) to the backend as
   * multipart/form-data under the 'file' field -- matching FastAPI's
   * `file: UploadFile = File(...)` parameter on the detection router.
   *
   * Content-Type is explicitly cleared (not set to a fixed
   * 'multipart/form-data' string) so the browser fills in the required
   * boundary itself; axiosInstance's default 'application/json' header
   * would otherwise be applied to every request, including this one.
   *
   * Returns: { success, filename, prediction, detection } where
   * `detection` is the saved MySQL row: { id, defect_type, confidence,
   * bounding_boxes, inference_time_ms, image_path, detection_status,
   * device_id, created_at }.
   */
  async analyzeFrame(blob, filename = `frame-${Date.now()}.jpg`) {
    const formData = new FormData();
    formData.append('file', blob, filename);

    const response = await axiosInstance.post('/detection/analyze', formData, {
      headers: {
        'Content-Type': undefined,
      },
    });

    return response.data;
  },
};