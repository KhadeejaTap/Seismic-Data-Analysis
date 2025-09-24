import React, { useRef, useState } from "react";
import "./App.css";

export default function App() {
  const canvasRef = useRef(null);
  const [threshold, setThreshold] = useState(0.4);
  const [running, setRunning] = useState(false);
  const [eventCount, setEventCount] = useState(0);
  const [events, setEvents] = useState([]); // detected events
  const [predictedEvents, setPredictedEvents] = useState([]); // ML prediction
  const dataRef = useRef([]);
  const intervalRef = useRef(null);

  const WIDTH = 800;
  const HEIGHT = 300;
  const WINDOW_POINTS = 200;

  // Generate synthetic seismic point
  const generatePoint = () => {
    const noise = Math.random() * 0.1;
    const spike = Math.random() < 0.02 ? Math.random() * 1.2 : 0;
    return noise + spike;
  };

  // Draw waveform + events
  const draw = () => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    // Draw waveform
    ctx.beginPath();
    dataRef.current.forEach((val, i) => {
      const x = (i * WIDTH) / WINDOW_POINTS;
      const y = HEIGHT / 2 - val * 100;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = "#00ff99";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw events with color-coded predictions
    predictedEvents.forEach((e) => {
      const x =
        ((e.index - Math.max(0, dataRef.current.length - WINDOW_POINTS)) *
          WIDTH) /
        WINDOW_POINTS;
      if (x < 0 || x > WIDTH) return;
      const y = HEIGHT / 2 - e.amplitude * 100;
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      if (e.prediction === "Low") ctx.fillStyle = "green";
      else if (e.prediction === "Medium") ctx.fillStyle = "orange";
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
        if (dataRef.current.length > WINDOW_POINTS) dataRef.current.shift();

        // Detect event
        if (point > threshold) {
          const newEvent = {
            index:
              dataRef.current.length +
              (events.length
                ? events[events.length - 1].index -
                  dataRef.current.length +
                  WINDOW_POINTS
                : 0),
            amplitude: point,
          };
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
    setPredictedEvents([]);
    dataRef.current = [];
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
  };

  // Export detected events as CSV
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

  // Predict event categories (simple ML simulation)
  const predictEvents = () => {
    const predictions = events.map((e) => {
      let category = "";
      if (e.amplitude < 0.5) category = "Low";
      else if (e.amplitude < 0.9) category = "Medium";
      else category = "High";
      return { ...e, prediction: category };
    });
    setPredictedEvents(predictions);
  };

  return (
    <div className="App">
      <h1>Microseismic Event Detector</h1>
      <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} />
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
        <button onClick={predictEvents}>Predict Event Categories</button>
        <p>Detected Events: {eventCount}</p>
      </div>

      {/* Event Prediction Table */}
      {predictedEvents.length > 0 && (
        <table
          style={{
            margin: "20px auto",
            color: "#eee",
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr>
              <th style={{ border: "1px solid #444", padding: "4px" }}>
                Index
              </th>
              <th style={{ border: "1px solid #444", padding: "4px" }}>
                Amplitude
              </th>
              <th style={{ border: "1px solid #444", padding: "4px" }}>
                Prediction
              </th>
            </tr>
          </thead>
          <tbody>
            {predictedEvents.map((e, i) => (
              <tr key={i}>
                <td style={{ border: "1px solid #444", padding: "4px" }}>
                  {e.index}
                </td>
                <td style={{ border: "1px solid #444", padding: "4px" }}>
                  {e.amplitude.toFixed(3)}
                </td>
                <td style={{ border: "1px solid #444", padding: "4px" }}>
                  {e.prediction}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}



