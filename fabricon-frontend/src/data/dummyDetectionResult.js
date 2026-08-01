// Simulated AI detection result generator — stands in for the real
// FastAPI + AI API response until backend integration is wired up.
// Shape mirrors the eventual real payload so services/detectionService.js
// can later replace this without touching component code.

export const DEFECT_TYPES = ['Hole', 'Stain', 'Knot', 'Broken Thread'];

// Probability that a given simulated frame is a defect (rest are OK)
const DEFECT_PROBABILITY = 0.35;

const randomBetween = (min, max) => Math.random() * (max - min) + min;

export const generateSimulatedDetection = () => {
  const isDefect = Math.random() < DEFECT_PROBABILITY;
  const now = new Date();
  const time = now.toLocaleTimeString('en-US', { hour12: false });

  if (isDefect) {
    const defect =
      DEFECT_TYPES[Math.floor(Math.random() * DEFECT_TYPES.length)];
    return {
      status: 'DEFECT',
      defect,
      confidence: Number(randomBetween(88, 97).toFixed(1)),
      time,
    };
  }

  return {
    status: 'OK',
    defect: null,
    confidence: Number(randomBetween(96, 99.8).toFixed(1)),
    time,
  };
};