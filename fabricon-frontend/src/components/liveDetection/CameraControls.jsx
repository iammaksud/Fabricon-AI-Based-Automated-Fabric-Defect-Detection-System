import { MdPlayArrow, MdStop, MdCameraAlt } from 'react-icons/md';
import { CAMERA_STATE } from '../../hooks/useCamera';

const CameraControls = ({ cameraState, analyzing, onStart, onStop, onAnalyze }) => {
  const isActive = cameraState === CAMERA_STATE.ACTIVE;
  const isRequesting = cameraState === CAMERA_STATE.REQUESTING;

  return (
    <div className="fc-camera-controls">
      <button
        className="btn btn-primary d-flex align-items-center gap-2"
        onClick={onStart}
        disabled={isActive || isRequesting}
      >
        <MdPlayArrow size={18} />
        {isRequesting ? 'Starting...' : 'Start Camera'}
      </button>

      <button
        className="btn btn-outline-secondary d-flex align-items-center gap-2"
        onClick={onStop}
        disabled={!isActive}
      >
        <MdStop size={18} />
        Stop Camera
      </button>

      <button
        className="btn btn-outline-primary d-flex align-items-center gap-2 ms-auto"
        onClick={onAnalyze}
        disabled={!isActive || analyzing}
        title="Capture the current frame and send it for AI defect analysis"
      >
        {analyzing ? (
          <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
        ) : (
          <MdCameraAlt size={18} />
        )}
        {analyzing ? 'Analyzing...' : 'Analyze Frame'}
      </button>
    </div>
  );
};

export default CameraControls;