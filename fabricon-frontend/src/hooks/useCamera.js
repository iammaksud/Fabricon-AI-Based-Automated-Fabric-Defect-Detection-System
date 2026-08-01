import { useRef, useState, useCallback, useEffect } from 'react';

// Camera lifecycle states surfaced to consuming components
export const CAMERA_STATE = {
  IDLE: 'IDLE',
  REQUESTING: 'REQUESTING',
  ACTIVE: 'ACTIVE',
  ERROR: 'ERROR',
};

/**
 * useCamera
 * Encapsulates browser webcam access (getUserMedia), exposing a videoRef
 * to attach to a <video> element, plus start/stop controls and error state.
 * No backend/AI calls here — purely responsible for the media stream.
 */
export const useCamera = () => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [cameraState, setCameraState] = useState(CAMERA_STATE.IDLE);
  const [error, setError] = useState(null);

  const startCamera = useCallback(async () => {
    setError(null);
    setCameraState(CAMERA_STATE.REQUESTING);

    if (!navigator.mediaDevices?.getUserMedia) {
      setError('Camera API is not supported in this browser.');
      setCameraState(CAMERA_STATE.ERROR);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setCameraState(CAMERA_STATE.ACTIVE);
    } catch (err) {
      let message = 'Unable to access camera.';

      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        message = 'Camera permission was denied. Please allow camera access.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        message = 'No camera device was found on this system.';
      } else if (err.name === 'NotReadableError') {
        message = 'Camera is already in use by another application.';
      }

      setError(message);
      setCameraState(CAMERA_STATE.ERROR);
    }
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraState(CAMERA_STATE.IDLE);
  }, []);

  // Ensure the stream is released if the component unmounts while active
  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  /**
   * captureFrame
   * Draws the current video frame onto an off-screen canvas (at the
   * stream's native resolution) and resolves with both a Blob (for
   * uploading to the backend) and a data URL (for an immediate on-screen
   * preview). Rejects if the camera isn't currently active.
   */
  const captureFrame = useCallback(() => {
    return new Promise((resolve, reject) => {
      const video = videoRef.current;

      if (cameraState !== CAMERA_STATE.ACTIVE || !video || !video.videoWidth) {
        reject(new Error('Camera is not active. Start the camera before capturing a frame.'));
        return;
      }

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to capture a frame from the camera.'));
            return;
          }
          resolve({ blob, dataUrl, width: canvas.width, height: canvas.height });
        },
        'image/jpeg',
        0.92
      );
    });
  }, [cameraState]);

  return {
    videoRef,
    cameraState,
    isActive: cameraState === CAMERA_STATE.ACTIVE,
    isRequesting: cameraState === CAMERA_STATE.REQUESTING,
    error,
    startCamera,
    stopCamera,
    captureFrame,
  };
};