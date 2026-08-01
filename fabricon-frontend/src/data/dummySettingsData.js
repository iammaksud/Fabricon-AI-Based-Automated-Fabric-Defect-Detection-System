// Dummy System Settings data — frontend-only until camera/AI API/ESP32
// are wired to real endpoints.

export const cameraInfo = {
  deviceName: 'USB Webcam',
  resolution: '1920x1080',
  fps: 30,
  status: 'ONLINE', // ONLINE | OFFLINE | WARNING
};

export const aiApiInfo = {
  serviceName: 'Roboflow API',
  responseTime: 250, // ms
  modelStatus: 'Model Loaded',
  status: 'ACTIVE', // ACTIVE | OFFLINE | WARNING
};

export const esp32Info = {
  ipAddress: '192.168.1.100',
  connectionStatus: 'CONNECTED', // CONNECTED | DISCONNECTED | WARNING
  servoStatus: 'READY', // READY | ACTIVATED | OFFLINE
  lastCommand: 'No Action',
};

export const systemInfo = {
  application: 'Fabricon',
  version: '1.0.0',
  environment: 'Development',
};