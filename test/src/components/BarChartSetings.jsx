import { useState } from "react";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export function BarChartSettings({ node, connections, nodes, onClose }) {
  // Szukamy kabla, który WCHODZI (target) do naszego wykresu
  const inputConnection = connections.find((c) => c.target === node.id);
  // Szukamy węzła z którego ten kabel WYCHODZI (source)
  const inputNode = inputConnection
    ? nodes.find((n) => n.id === inputConnection.source)
    : null;

  const columns = inputNode?.data?.columns || [];
  const fileId = inputNode?.data?.fileId;

  const [xCol, setXCol] = useState("");
  const [yCol, setYCol] = useState("");
  const [chartData, setChartData] = useState([]);

  const generateChart = async () => {
    if (!fileId || !xCol || !yCol) {
      alert("Najpierw połącz węzły i wybierz kolumny!");
      return;
    }

    try {
      const response = await axios.get("http://localhost:8000/plot/bar", {
        params: {
          file_id: fileId,
          x_col: xCol,
          y_col: yCol,
        },
      });

      if (response.data.error) {
        alert("Błąd serwera: " + response.data.error);
        return;
      }

      setChartData(response.data.data);
    } catch (error) {
      console.error("Błąd generowania wykresu", error);
      alert("Wystąpił błąd podczas generowania wykresu na serwerze.");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Pasek diagnostyczny - od razu widać, gdzie leży problem */}
      <div className="text-xs px-3 py-2 bg-slate-100 rounded text-slate-500 font-mono">
        Debug: Podłączony węzeł: {inputNode ? "✅ TAK" : "❌ NIE"} | ID Pliku:{" "}
        {fileId ? "✅ TAK" : "❌ BRAK"} | Znalezione kolumny: {columns.length}
      </div>

      {!fileId ? (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-200 text-sm">
          <strong className="block mb-1">Brak danych na wejściu!</strong>
          1. Upewnij się, że wgrałeś plik w węźle Import CSV.
          <br />
          2. Upewnij się, że kabel idzie od{" "}
          <strong>Prawej Kropki (Wyjście z CSV)</strong> do{" "}
          <strong>Lewej Kropki (Wejście Wykresu)</strong>.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700">
              Oś X (Kategorie tekstowe):
            </label>
            <select
              onChange={(e) => setXCol(e.target.value)}
              value={xCol}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
            >
              <option value="">Wybierz kolumnę...</option>
              {columns.map((col) => (
                <option key={col} value={col}>
                  {col}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700">
              Oś Y (Wartości liczbowe):
            </label>
            <select
              onChange={(e) => setYCol(e.target.value)}
              value={yCol}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
            >
              <option value="">Wybierz kolumnę...</option>
              {columns.map((col) => (
                <option key={col} value={col}>
                  {col}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={generateChart}
            className="mt-2 w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 rounded-lg transition-colors"
          >
            Generuj Wykres
          </button>
        </div>
      )}

      {chartData.length > 0 && (
        <div className="mt-4 bg-white p-2 border border-slate-200 rounded-lg flex justify-center overflow-x-auto">
          <BarChart width={350} height={250} data={chartData}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#e2e8f0"
            />
            <XAxis
              dataKey={xCol}
              tick={{ fontSize: 12, fill: "#64748b" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "#64748b" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: "#f1f5f9" }}
              contentStyle={{
                borderRadius: "8px",
                border: "none",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              }}
            />
            <Bar dataKey={yCol} fill="#a855f7" radius={[4, 4, 0, 0]} />
          </BarChart>
        </div>
      )}
    </div>
  );
}
