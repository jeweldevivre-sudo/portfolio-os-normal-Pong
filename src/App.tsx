import { useEffect, useState } from "react";
import {
  PieChart, Pie, Cell, Tooltip,
  BarChart, Bar, XAxis, YAxis,
  ResponsiveContainer, LineChart, Line
} from "recharts";

const API_URL = "https://script.google.com/macros/s/AKfycbyZSOF6AnGxiYYktwn-h5QA_L920Mu1HZVOTXrI0hUsB5xWwDc_SkYXhy27i7KKVDRKkQ/exec";

export default function App() {
  const [data, setData] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(API_URL)
      .then(res => res.json())
      .then(res => {
        setData(res);
        setLoading(false);
      });
  }, []);

  const saveDecision = async (order: any) => {
    if (!order.actualUnits || !order.actualPrice || !order.note) {
      alert("Please fill all fields");
      return;
    }

    await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify({
        action: "logDecision",
        assetCode: order.assetCode,
        tradeAction: order.type === "SELL" ? "SELL" : "BUY",
        suggestedUnits: order.buyUnits || order.sellUnits,
        actualUnits: order.actualUnits,
        actualPrice: order.actualPrice,
        suggestedPrice: order.price,
        note: order.note,
      }),
    });

    alert("Saved ✅");
  };

  const getAdaptiveMessage = (mode: string) => {
    switch (mode) {
      case "USER_LEADING":
        return "You've been making strong calls lately";
      case "SYSTEM_LEADING":
        return "System has been consistent recently";
      case "BALANCED":
        return "You and the system are aligned";
      default:
        return "Learning your decision style";
    }
  };

  const COLORS = ["#34d399", "#f87171"];

  if (loading) return <div style={{ padding: 20 }}>Loading...</div>;

  const orders = [...(data.buyOrders || []), ...(data.sellOrders || [])];

  const pieData = [
    { name: "Follow", value: data?.decisionStats?.followRate || 0 },
    { name: "Override", value: data?.decisionStats?.overrideRate || 0 },
  ];

  const barData = [
    {
      name: "Performance",
      Follow: data?.decisionStats?.followGain || 0,
      Override: data?.decisionStats?.overrideGain || 0,
    },
  ];

  return (
    <div style={{
      padding: 20,
      background: "#0b1220",
      color: "white",
      minHeight: "100vh"
    }}>

      {/* ================= ORDERS ================= */}
      <h2>Orders</h2>

      {orders.map((order: any, i: number) => (
        <div key={i} style={{
          border: "1px solid #1e293b",
          padding: 16,
          marginBottom: 12,
          borderRadius: 12
        }}>
          <h3>{order.assetCode}</h3>

          {/* 🔥 Adaptive */}
          <p style={{ fontSize: 12, opacity: 0.7 }}>
            {getAdaptiveMessage(data?.adaptiveSignal?.mode)}
          </p>

          <p>
            Suggested Units: {order.buyUnits || order.sellUnits}
          </p>

          <input
            type="number"
            placeholder="Actual Units"
            style={{ marginRight: 8 }}
            onChange={(e) =>
              order.actualUnits = Number(e.target.value)
            }
          />

          <input
            type="number"
            placeholder="Actual Price"
            style={{ marginRight: 8 }}
            onChange={(e) =>
              order.actualPrice = Number(e.target.value)
            }
          />

          <select
            style={{ marginRight: 8 }}
            onChange={(e) =>
              order.note = e.target.value
            }
          >
            <option value="">Why this decision?</option>
            <option>Follow System</option>
            <option>Add on Dip</option>
            <option>Reduce Risk</option>
            <option>Manual Override</option>
            <option>Off-System</option>
          </select>

          <button onClick={() => saveDecision(order)}>
            Done
          </button>
        </div>
      ))}

      {/* ================= INSIGHTS ================= */}
      <h2>Decision Insights</h2>

      {/* Pie */}
      <div style={{ width: "100%", height: 250 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie data={pieData} dataKey="value">
              {pieData.map((_, index) => (
                <Cell key={index} fill={COLORS[index]} />
              ))}
            </Pie>
            <Tooltip formatter={(v: any) => `${(v * 100).toFixed(0)}%`} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Bar */}
      <div style={{ width: "100%", height: 250 }}>
        <ResponsiveContainer>
          <BarChart data={barData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="Follow" fill="#34d399" />
            <Bar dataKey="Override" fill="#f87171" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 🔥 Time Graph */}
      <h2>Decision Over Time</h2>

      <div style={{ width: "100%", height: 250 }}>
        <ResponsiveContainer>
          <LineChart data={data?.decisionTimeSeries || []}>
            <XAxis dataKey="date" />
            <YAxis domain={[0, 1]} />
            <Tooltip formatter={(v: any) => `${(v * 100).toFixed(0)}%`} />

            <Line
              type="monotone"
              dataKey="followRate"
              stroke="#34d399"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}