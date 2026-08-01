import { useCallback, useEffect, useState } from 'react';

import { useCamera } from '../hooks/useCamera';
import { detectionService } from '../services/detectionService';

import CameraFeed from '../components/liveDetection/CameraFeed';
import CameraControls from '../components/liveDetection/CameraControls';
import DetectionResultCard from '../components/liveDetection/DetectionResultCard';
import ESP32ActionStatus from '../components/liveDetection/ESP32ActionStatus';

const formatTime = (isoOrDate) => {
  const d = isoOrDate ? new Date(isoOrDate) : new Date();
  return d.toLocaleTimeString('en-US', { hour12: false });
};

// Normalizes the real POST /api/detection/analyze response into the flat
// shape the result/ESP32 components consume. Kept here (not in the
// service) so detectionService.js stays a thin, reusable API wrapper.
const normalizeAnalyzeResponse = (response) => {
  const { detection, prediction } = response;
  const isDefect = Boolean(detection.defect_type);

  return {
    status: isDefect ? 'DEFECT' : 'OK',
    defect: detection.defect_type,
    confidence: Number((Number(detection.confidence) * 100).toFixed(1)),
    time: formatTime(detection.created_at),
    detectionStatus: detection.detection_status,
    processingTimeMs: detection.inference_time_ms,
    boundingBoxes: detection.bounding_boxes || [],
    imageMeta: prediction?.image || null,
  };
};

const LiveDetection = () => {
  const {
    videoRef,
    cameraState,
    isActive,
    error: cameraError,
    startCamera,
    stopCamera,
    captureFrame,
  } = useCamera();

  const [result, setResult] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState('');

  // Clear any previous detection result/image/error whenever the camera
  // is stopped (or fails), so a stale result doesn't linger once the feed
  // is gone.
  useEffect(() => {
    if (!isActive) {
      setResult(null);
      setCapturedImage(null);
      setAnalyzeError('');
    }
  }, [isActive]);

  const handleAnalyze = useCallback(async () => {
    setAnalyzeError('');
    setAnalyzing(true);

    try {
      const { blob, dataUrl } = await captureFrame();
      setCapturedImage(dataUrl);

      const response = await detectionService.analyzeFrame(blob);
      setResult(normalizeAnalyzeResponse(response));
    } catch (err) {
      const detail = err?.response?.data?.detail;
      setAnalyzeError(
        detail || err?.message || 'Could not analyze this frame. Please try again.'
      );
      setResult(null);
    } finally {
      setAnalyzing(false);
    }
  }, [captureFrame]);

  return (
    <div className="d-flex flex-column gap-4">
      <div className="row g-3">
        {/* ---------- Left: Camera preview + controls ---------- */}
        <div className="col-12 col-xl-8">
          <div className="fc-panel h-100 d-flex flex-column">
            <div className="fc-panel-title">Live Camera Feed</div>

            <CameraFeed
              videoRef={videoRef}
              cameraState={cameraState}
              error={cameraError}
            />

            <CameraControls
              cameraState={cameraState}
              analyzing={analyzing}
              onStart={startCamera}
              onStop={stopCamera}
              onAnalyze={handleAnalyze}
            />
          </div>
        </div>

        {/* ---------- Right: Detection result ---------- */}
        <div className="col-12 col-xl-4">
          <DetectionResultCard
            result={result}
            isCameraActive={isActive}
            analyzing={analyzing}
            analyzeError={analyzeError}
            capturedImage={capturedImage}
          />
        </div>
      </div>

      {/* ---------- Bottom: ESP32 hardware response ---------- */}
      <ESP32ActionStatus result={result} isCameraActive={isActive} />
    </div>
  );
};

export default LiveDetection;