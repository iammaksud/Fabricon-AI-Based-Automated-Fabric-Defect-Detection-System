# Fabricon – AI-Based Automated Fabric Defect Detection System

Fabricon is an AI-powered fabric defect detection system that automates fabric quality inspection using computer vision, a FastAPI backend, React frontend, and ESP32 hardware integration. The system detects defects in real time, records inspection history, and can automatically trigger hardware actions when defects are found.

---

## Features

- AI-powered fabric defect detection
- Real-time camera monitoring
- Defect history and analytics
- Dashboard with live statistics
- ESP32 integration for automated machine control
- RESTful FastAPI backend
- React.js frontend
- MySQL database
- Roboflow Hosted Inference API integration
- Secure authentication system
- Detection history management

---

## Technology Stack

### Frontend
- React.js
- Vite
- Axios
- CSS

### Backend
- FastAPI
- SQLAlchemy
- Alembic
- JWT Authentication
- Pydantic

### Database
- MySQL

### AI
- Roboflow Hosted Inference API

### Hardware
- ESP32
- Camera Module
- Relay/Motor Control

---

## Project Structure

```
Fabricon/
│
├── fabricon-frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── fabricon-backend/
│   ├── app/
│   ├── alembic/
│   ├── tests/
│   ├── uploads/
│   └── requirements.txt
│
├── fabricon-arduino/
│   └── fabricron_motor_controller/
│
└── README.md
```

---

## Installation

### Clone Repository

```bash
git clone https://github.com/iammaksud/Fabricon-AI-Based-Automated-Fabric-Defect-Detection-System.git

cd Fabricon-AI-Based-Automated-Fabric-Defect-Detection-System
```

---

## Backend Setup

Navigate to backend:

```bash
cd fabricon-backend
```

Create virtual environment:

```bash
python -m venv venv
```

Activate environment

### Windows

```bash
venv\Scripts\activate
```

### macOS/Linux

```bash
source venv/bin/activate
```

Install dependencies

```bash
pip install -r requirements.txt
```

Run backend

```bash
python -m uvicorn app.main:app --reload
```

Backend URL

```
http://127.0.0.1:8000
```

Swagger API Documentation

```
http://127.0.0.1:8000/docs
```

---

## Frontend Setup

Navigate to frontend

```bash
cd fabricon-frontend
```

Install packages

```bash
npm install
```

Run development server

```bash
npm run dev
```

Frontend URL

```
http://localhost:5173
```

---

## ESP32 Setup

1. Open Arduino IDE.
2. Install ESP32 Board Package.
3. Open:

```
fabricon-arduino/fabricron_motor_controller/fabricron_motor_controller.ino
```

4. Select the correct COM Port.
5. Upload the sketch.

---

## API Endpoints

| Endpoint | Description |
|-----------|-------------|
| /auth | Authentication |
| /dashboard | Dashboard statistics |
| /detection | Fabric detection |
| /history | Detection history |
| /settings | System settings |
| /esp32 | ESP32 communication |

---

## AI Workflow

```
Camera
    │
    ▼
Capture Image
    │
    ▼
Roboflow AI Inference
    │
    ▼
Defect Detected?
    │
 ┌──Yes───────────────┐
 │                    │
 ▼                    ▼
Save to Database   Send Command to ESP32
 │                    │
 ▼                    ▼
Update Dashboard   Stop Machine / Alert
```

---

## Screenshots

You can add screenshots here.

- Login Page
- Dashboard
- Live Detection
- Detection History
- Settings

---

## Future Improvements

- YOLOv8 local inference
- Live video streaming
- Email notifications
- SMS alerts
- Production analytics dashboard
- Multi-camera support
- User role management
- Cloud deployment

---

## Contributors

**Maksudul Islam**

GitHub:
https://github.com/iammaksud

---

## License

This project is intended for educational and research purposes.
