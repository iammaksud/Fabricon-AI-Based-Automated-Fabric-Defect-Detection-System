import {
  MdCheckCircle,
  MdOutlineWarningAmber,
  MdOutlineVideocamOff,
  MdOutlineErrorOutline,
  MdOutlineCropFree,
} from 'react-icons/md';

// Converts one Roboflow prediction (center x/y, width/height, in the
// original submitted image's pixel space) into a percentage-based CSS box
// so it can be overlaid on the captured <img>, whatever size it renders at.
const toOverlayBox = (prediction, imageMeta) => {
  if (!imageMeta?.width || !imageMeta?.height) return null;

  const left = ((prediction.x - prediction.width / 2) / imageMeta.width) * 100;
  const top = ((prediction.y - prediction.height / 2) / imageMeta.height) * 100;
  const width = (prediction.width / imageMeta.width) * 100;
  const height = (prediction.height / imageMeta.height) * 100;

  return { left: `${left}%`, top: `${top}%`, width: `${width}%`, height: `${height}%` };
};

const DetectionResultCard = ({
  result,
  isCameraActive,
  analyzing = false,
  analyzeError = '',
  capturedImage = null,
}) => {
  // Camera not running -- nothing to analyze yet.
  if (!isCameraActive) {
    return (
      <div className="fc-panel h-100">
        <div className="fc-panel-title">Detection Result</div>
        <div className="fc-result-empty">
          <MdOutlineVideocamOff size={36} />
          <p className="mb-0">No active feed</p>
          <span>Start the camera to begin fabric defect analysis</span>
        </div>
      </div>
    );
  }

  // Analysis in flight -- show a loading state rather than a stale result.
  if (analyzing) {
    return (
      <div className="fc-panel h-100">
        <div className="fc-panel-title">Detection Result</div>
        <div className="fc-result-empty">
          <div className="spinner-border text-primary mb-2" role="status" />
          <p className="mb-0">Analyzing frame...</p>
          <span>Sending the captured image to the AI inspection service</span>
        </div>
      </div>
    );
  }

  // The last analyze attempt failed (camera permission errors are handled
  // separately by CameraFeed -- this is specifically an API/analyze error).
  if (analyzeError) {
    return (
      <div className="fc-panel h-100">
        <div className="fc-panel-title">Detection Result</div>
        <div className="fc-result-empty fc-camera-error">
          <MdOutlineErrorOutline size={36} />
          <p className="mb-0">Analysis Failed</p>
          <span>{analyzeError}</span>
        </div>
      </div>
    );
  }

  // Camera is live but no frame has been analyzed yet.
  if (!result) {
    return (
      <div className="fc-panel h-100">
        <div className="fc-panel-title">Detection Result</div>
        <div className="fc-result-empty">
          <MdOutlineCropFree size={36} />
          <p className="mb-0">Ready to analyze</p>
          <span>Click "Analyze Frame" to run defect detection on the current frame</span>
        </div>
      </div>
    );
  }

  const isDefect = result.status === 'DEFECT';
  const boxes = (result.boundingBoxes || [])
    .map((prediction) => ({ prediction, box: toOverlayBox(prediction, result.imageMeta) }))
    .filter((entry) => entry.box);

  return (
    <div className="fc-panel h-100">
      <div className="fc-panel-title">Detection Result</div>

      {capturedImage && (
        <div className="fc-captured-image-wrap">
          <img src={capturedImage} alt="Captured fabric frame" className="fc-captured-image" />
          {boxes.map(({ prediction, box }, idx) => (
            <div key={idx} className="fc-bbox" style={box}>
              <span className="fc-bbox-label">
                {prediction.class} {Math.round((prediction.confidence || 0) * 100)}%
              </span>
            </div>
          ))}
        </div>
      )}

      <div
        className={`fc-result-box ${
          isDefect ? 'fc-result-box-danger' : 'fc-result-box-success'
        }`}
      >
        <div className="fc-result-icon">
          {isDefect ? <MdOutlineWarningAmber size={30} /> : <MdCheckCircle size={30} />}
        </div>
        <div className="fc-result-status">
          {isDefect ? 'DEFECT FOUND' : 'FABRIC OK'}
        </div>
      </div>

      <div className="fc-result-details">
        {isDefect && (
          <div className="fc-result-row">
            <span className="fc-result-row-label">Defect Type</span>
            <span className="fc-result-row-value">{result.defect}</span>
          </div>
        )}

        <div className="fc-result-row">
          <span className="fc-result-row-label">Confidence Score</span>
          <span className="fc-result-row-value fc-mono">{result.confidence}%</span>
        </div>

        <div className="fc-result-row">
          <span className="fc-result-row-label">Detection Status</span>
          <span className="fc-result-row-value">{result.detectionStatus}</span>
        </div>

        <div className="fc-result-row">
          <span className="fc-result-row-label">Processing Time</span>
          <span className="fc-result-row-value fc-mono">
            {result.processingTimeMs != null ? `${result.processingTimeMs} ms` : 'N/A'}
          </span>
        </div>

        <div className="fc-result-row">
          <span className="fc-result-row-label">Detection Time</span>
          <span className="fc-result-row-value fc-mono">{result.time}</span>
        </div>

        {boxes.length > 0 && (
          <div className="fc-result-row">
            <span className="fc-result-row-label">Bounding Boxes</span>
            <span className="fc-result-row-value">{boxes.length} region(s) flagged</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default DetectionResultCard;