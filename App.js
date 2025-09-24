import React, { useEffect, useRef, useState } from "react";
import "./App.css";

export default function App() {
  const canvasRef = useRef(null);
  const [threshold, setThreshold] = useState(0.4);
  const [running, setRunning] = useState(false);
  const [eventCount, setEventCount] = useState(0);
  const dataRef = useRef([]);
  const intervalRef = useRef(null);

  // Generate synthetic signal: noise + occasional spikes
  const generatePoint = () => {
    const noise = Math.random() * 0.1;
    const spike = Math.random() < 0.02 ? Math.random() * 1.2 : 0;
    return noise + spike;
  };

  const draw = () => {
    const ctx = canvasRef.current.getContext("2d");
    const width = canvasRef.current.width;
    const height = canvasRef.current.height;
    ctx.clearRect(0, 0, width, height);
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    dataRef.current.forEach((val, i) => {
      const y = height / 2 - val * 100;
      ctx.lineTo(i, y);
    });
    ctx.strokeStyle = "#00ff99";
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  const startStop = () => {
    if (running) {
      clearInterval(intervalRef.current);
      setRunning(false);
    } else {
      setRunning(true);
      intervalRef.current = setInterval(() => {
        const point = generatePoint();
        dataRef.current.push(point);
        // Use shorter visualization: keep only last 200 points
        if (dataRef.current.length > 200) dataRef.current.shift();

        // Detect events
        if (point > threshold) {
          setEventCount((c) => c + 1);
          const ctx = canvasRef.current.getContext("2d");
          const width = canvasRef.current.width;
          const height = canvasRef.current.height;
          ctx.fillStyle = "red";
          ctx.beginPath();
          // mark event at last point
          ctx.arc(
            (dataRef.current.length - 1) * (width / 200),
            height / 2 - point * 100,
            4,
            0,
            2 * Math.PI
          );
          ctx.fill();
        }

        draw();
      }, 30); // faster updates
    }
  };

  const resetEvents = () => {
    setEventCount(0);
    dataRef.current = [];
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

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
        <button onClick={startStop}>{running ? "Stop" : "Start"}</button>
        <button onClick={resetEvents}>Reset</button>
        <p>Detected Events: {eventCount}</p>
      </div>
    </div>
  );
}

