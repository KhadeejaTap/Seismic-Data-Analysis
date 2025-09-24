import React, { useEffect, useRef, useState } from "react";
import "./App.css";

export default function App() {
  const canvasRef = useRef(null);
  const [threshold, setThreshold] = useState(0.4);
  const [running, setRunning] = useState(false);
  const [eventCount, setEventCount] = useState(0);
  const [events, setEvents] = useState([]); // stores all detected events
  const dataRef = useRef([]);
  const intervalRef = useRef(null);

  // Generate synthetic signal: noise + occasional spikes
  const generatePoint = () => {
    const noise = Math.random() * 0.1;
    const spike = Math.random() < 0.02 ? Math.random() * 1.2 : 0;
    return noise + spike;
  };

  // Draw waveform
  const draw = () => {
    const ctx = canvasRef.current.getContext("2d");
    const width = canvasRef.current.width;
    const height = canvasRef.current.height;
    ctx.clearRect(0, 0, width, height);

    // Draw waveform
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    dataRef.current.forEach((val, i) => {
      const y = height / 2 - val * 100;
      ctx.lineTo(i * (width / 200), y); // scale x to 200 points
    });
    ctx.strokeStyle = "#00ff99";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw events
    events.forEach((e) => {
      const x = e.index * (width / 200);
      const y = height / 2 - e.amplitude * 100;
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      if (e.amplitude < 0.5) ctx.fillStyle = "green";
      else if (e.amplitude < 0.9) ctx.fillStyle = "orange";
      else ctx.fillStyle = "red";
      ctx.fill();
    });
  };

  // Start / Stop simulation
  const startStop = () => {
    if (running) {
      clearInterval(intervalRef.current);
      setRunning(false);
    } else {
      setRunning(true);
      intervalRef.current = setInterval(() => {
        const point = generatePoint();
        dataRef.current.push(point);
        if (dataRef.current.length > 200) dataRef.current.shift();

        // Detect events
        if (point > threshold) {
          const newEvent = { index: dataRef.current.length - 1, amplitude: point };
          setEvents((prev) => [...prev, newEvent]);
          setEventCount((c) => c + 1);
        }

        draw();
      }, 30);
    }
  };

  // Reset simulation
  const resetEvents = () => {
    setEventCount(0);
    setEvents([]);
    dataRef.current = [];
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  // Export events as CSV
  const exportCSV = () => {
    if (events.length === 0) return;
    let csv = "TimeStep,Amplitude\n";
    events.forEach((e) => {
      csv += `${e.index},${e.amplitude.toFixed(3)}\n`;
    });
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "detected_events.csv";
    a.click();
    URL.revokeObjectURL(url);
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
        <button onClick={exportCSV}>Export CSV</button>
        <p>Detected Events: {eventCount}</p>
      </div>
    </div>
  );
}


