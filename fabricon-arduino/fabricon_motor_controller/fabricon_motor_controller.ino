/*
  Fabricon Motor Controller Firmware (Arduino)
  ---------------------------------------------
  Receives simple text commands over USB Serial from the FastAPI backend
  (app/services/esp32_service.py) and drives a DC motor through a motor
  driver module to route fabric right (defect) or left (normal).

  Serial protocol: 9600 baud, one newline-terminated ASCII command per
  line. Each command gets exactly one reply line back:

    MOVE_RIGHT  -> spins the motor one direction for MOVE_DURATION_MS,
                   then stops. Replies "OK:MOVE_RIGHT"
    MOVE_LEFT   -> spins the motor the other direction for
                   MOVE_DURATION_MS, then stops. Replies "OK:MOVE_LEFT"
    STATUS      -> health check only, no motor movement. Replies "READY"
    (anything else) -> replies "ERR:UNKNOWN_COMMAND"

  Wiring (example using a common L298N motor driver module):

    Arduino pin 8  -> L298N IN1
    Arduino pin 9  -> L298N IN2
    Arduino pin 10 -> L298N ENA   (PWM speed control)
    L298N OUT1/OUT2 -> DC motor terminals
    L298N 12V (or your motor's rated voltage) -> external motor power
                                                   supply (+)
    L298N GND       -> shared ground: Arduino GND AND motor power
                        supply (-) must all be tied together
    Arduino 5V/GND  -> Arduino's own USB power is enough for the logic
                        side; do NOT power the motor itself from the
                        Arduino's 5V pin

  If you're using a different driver (L293D, TB6612FNG, a relay-based
  H-bridge, etc.), just change MOTOR_IN1_PIN / MOTOR_IN2_PIN /
  MOTOR_ENABLE_PIN below to match your wiring -- the serial protocol and
  command handling don't need to change.
*/

const int MOTOR_IN1_PIN = 8;
const int MOTOR_IN2_PIN = 9;
const int MOTOR_ENABLE_PIN = 10; // PWM speed control, 0-255

const int MOTOR_SPEED = 200;                 // 0-255 (try lower values first)
const unsigned long MOVE_DURATION_MS = 800;  // how long the motor runs per command

void stopMotor() {
  digitalWrite(MOTOR_IN1_PIN, LOW);
  digitalWrite(MOTOR_IN2_PIN, LOW);
  analogWrite(MOTOR_ENABLE_PIN, 0);
}

void moveRight() {
  digitalWrite(MOTOR_IN1_PIN, HIGH);
  digitalWrite(MOTOR_IN2_PIN, LOW);
  analogWrite(MOTOR_ENABLE_PIN, MOTOR_SPEED);
  delay(MOVE_DURATION_MS);
  stopMotor();
}

void moveLeft() {
  digitalWrite(MOTOR_IN1_PIN, LOW);
  digitalWrite(MOTOR_IN2_PIN, HIGH);
  analogWrite(MOTOR_ENABLE_PIN, MOTOR_SPEED);
  delay(MOVE_DURATION_MS);
  stopMotor();
}

void setup() {
  Serial.begin(9600);

  pinMode(MOTOR_IN1_PIN, OUTPUT);
  pinMode(MOTOR_IN2_PIN, OUTPUT);
  pinMode(MOTOR_ENABLE_PIN, OUTPUT);

  stopMotor();
}

void loop() {
  if (Serial.available()) {
    String command = Serial.readStringUntil('\n');
    command.trim();

    if (command == "MOVE_RIGHT") {
      moveRight();
      Serial.println("OK:MOVE_RIGHT");
    } else if (command == "MOVE_LEFT") {
      moveLeft();
      Serial.println("OK:MOVE_LEFT");
    } else if (command == "STATUS") {
      Serial.println("READY");
    } else if (command.length() > 0) {
      Serial.println("ERR:UNKNOWN_COMMAND");
    }
  }
}