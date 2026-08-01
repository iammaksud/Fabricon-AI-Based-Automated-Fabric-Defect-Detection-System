import { MdVideocamOff, MdErrorOutline } from 'react-icons/md';
import { CAMERA_STATE } from '../../hooks/useCamera';

const CameraFeed = ({ videoRef, cameraState, error }) => {
  return (
    <div className="fc-camera-frame">
      {/* Video element always mounted so useCamera's videoRef stays valid,
          visibility toggled instead of unmounting */}
      <video
        ref={videoRef}
        className="fc-camera-video"
        style={{ display: cameraState === CAMERA_STATE.ACTIVE ? 'block' : 'none' }}
        muted
        playsInline
      />

      {cameraState === CAMERA_STATE.IDLE && (
        <div className="fc-camera-empty">
          <MdVideocamOff size={42} />
          <p className="mb-0">Camera is currently inactive</p>
          <span>Press "Start Camera" to begin live fabric inspection</span>
        </div>
      )}

      {cameraState === CAMERA_STATE.REQUESTING && (
        <div className="fc-camera-empty">
          <div className="spinner-border text-light mb-2" role="status" />
          <p className="mb-0">Requesting camera access...</p>
        </div>
      )}

      {cameraState === CAMERA_STATE.ERROR && (
        <div className="fc-camera-empty fc-camera-error">
          <MdErrorOutline size={42} />
          <p className="mb-0">Camera Error</p>
          <span>{error}</span>
        </div>
      )}

      {/* Live status indicator overlay */}
      <div className="fc-camera-overlay-badge">
        <span
          className={`fc-status-pill ${
            cameraState === CAMERA_STATE.ACTIVE
              ? 'fc-status-ok'
              : cameraState === CAMERA_STATE.ERROR
              ? 'fc-status-danger'
              : 'fc-status-idle'
          }`}
        >
          {cameraState === CAMERA_STATE.ACTIVE && <span className="fc-pulse-dot me-1" />}
          {cameraState === CAMERA_STATE.ACTIVE
            ? 'Live'
            : cameraState === CAMERA_STATE.REQUESTING
            ? 'Connecting'
            : cameraState === CAMERA_STATE.ERROR
            ? 'Error'
            : 'Idle'}
        </span>
      </div>

      {/* Decorative scan line only while actively inspecting */}
      {cameraState === CAMERA_STATE.ACTIVE && <div className="fc-camera-scan-line" />}
    </div>
  );
};

export default CameraFeed;