import React, { useEffect, useRef, useState } from "react";
import "./App.css";

export default function App() {
  const canvasRef = useRef(null);
  const [threshold, setThreshold] = useState(0.4);
  const [running, setRunning] = useState(false);
  const [eventCount, setEventCount] = useState(0);
  const dataRef = useRef([]);
  const xPosRef = useRef(0);

  // Generate synthetic signal: noise + occasional spikes
  const generatePoint = () => {
    const noise = Math.random() * 0.1;
    const spike = Math.random() < 0.02 ? Math.random() * 1.2 : 0;
    return noise + spike;
  };

  useEffect(() => {
    if (!running) return;
    const ctx = canvasRef.current.getContext("2d");
    const width = canvasRef.current.width;
    const height = canvasRef.current.height;
    ctx.clearRect(0, 0, width, height);
    ctx.strokeStyle = "#00ff99";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, height / 2);

    const interval = setInterval(() => {
      const point = generatePoint();
      dataRef.current.push(point);
      if (dataRef.current.length > width) dataRef.current.shift();

      // Draw waveform
      ctx.clearRect(0, 0, width, height);
      ctx.beginPath();
      dataRef.current.forEach((val, i) => {
        const y = height / 2 - val * 100;
        if (i === 0) ctx.moveTo(i, y);
        else ctx.lineTo(i, y);
      });
      ctx.stroke();

      // Detect events
      if (point > threshold) {
        setEventCount((c) => c + 1);
        // highlight event as red dot
        ctx.fillStyle = "red";
        ctx.beginPath();
        ctx.arc(width - 1, height / 2 - point * 100, 4, 0, 2 * Math.PI);
        ctx.fill();
      }
    }, 50);

    return () => clearInterval(interval);
  }, [running, threshold]);

  return (
    <div className="App">
      <h1>Microseismic Event Detector</h1>
      <canvas ref={canvasRef} width={800} height={300} />
      <div className="controls">
        <label>
          Threshold: {threshold.toFixed(2)}
          <input
            type="range"
            min="0.1"
            max="1.0"
            step="0.05"
            value={threshold}
            onChange={(e) => setThreshold(parseFloat(e.target.value))}
          />
        </label>
        <button onClick={() => setRunning(!running)}>
          {running ? "Stop" : "Start"}
        </button>
        <p>Detected Events: {eventCount}</p>
      </div>
    </div>
  );
}
