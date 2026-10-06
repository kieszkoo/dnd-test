import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export function BarChartSettings({ node, parentNode }) {
  const [chartData, setChartData] = useState([]);
  const [xCol, setXCol] = useState(node.data?.xCol || "");
  const [yCol, setYCol] = useState(node.data?.yCol || "");

  const availableColumns = parentNode?.data?.columns || [];
  const fileId = parentNode?.data?.fileId;

  const fetchPlotData = async () => {
    if (!fileId || !xCol || !yCol) return;
    const res = await fetch(
      `http://localhost:8000/plot/bar?file_id=${fileId}&x_column=${xCol}&y_column=${yCol}`,
    );
    const json = await res.json();
    if (json.data) {
      setChartData(json.data);
    }
  };

  return (
    <div style={{ width: "100%", height: "400px" }}>
      <h4>Konfiguracja Wykresu</h4>

      {!fileId ? (
        <p style={{ color: "red" }}>
          Najpierw połącz ten blok z wgranym plikiem CSV!
        </p>
      ) : (
        <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
          <select value={xCol} onChange={(e) => setXCol(e.target.value)}>
            <option value="">Oś X (Kategorie)</option>
            {availableColumns.map((col) => (
              <option key={col} value={col}>
                {col}
              </option>
            ))}
          </select>

          <select value={yCol} onChange={(e) => setYCol(e.target.value)}>
            <option value="">Oś Y (Wartości)</option>
            {availableColumns.map((col) => (
              <option key={col} value={col}>
                {col}
              </option>
            ))}
          </select>

          <button onClick={fetchPlotData}>Generuj</button>
        </div>
      )}

      {/* Renderowanie wykresu za pomocą Recharts */}
      {chartData.length > 0 && (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xCol} />
            <YAxis />
            <Tooltip />
            <Bar dataKey={yCol} fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
