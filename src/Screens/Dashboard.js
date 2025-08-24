import React, { useEffect, useState } from "react";
import { auth, db } from "../Firebase/firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { AiFillDelete, AiFillEdit } from "react-icons/ai";

const Dashboard = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState([]);
  const [steps, setSteps] = useState("");
  const [sleep, setSleep] = useState("");
  const [mood, setMood] = useState("Happy");
  const [notes, setNotes] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  const metricsRef = collection(db, "wellnessMetrics");
  const [name, setName] = useState("");

  // Fetch user name
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const providerId = currentUser.providerData[0]?.providerId;
        if (providerId === "google.com") {
          setName(currentUser.displayName);
        } else if (providerId === "password") {
          const docRef = doc(db, "users", currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) setName(docSnap.data().name);
        }
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // Fetch metrics
  const fetchMetrics = useCallback(async () => {
    if (!auth.currentUser) return;

    const q = query(
      metricsRef,
      where("user", "==", auth.currentUser.email),
      orderBy("date", "asc")
    );

    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((item) => {
        if (startDate && endDate) {
          const itemDate = new Date(item.date);
          return itemDate >= startDate && itemDate <= endDate;
        }
        return true;
      });

    setMetrics(data);
  }, [metricsRef, startDate, endDate]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  // Save metric
  const handleSaveMetric = async (e) => {
    e.preventDefault();
    if (!steps || !sleep) return;

    const metricData = {
      steps: Number(steps),
      sleep: Number(sleep),
      mood,
      notes,
      date: new Date().toISOString(),
      user: auth.currentUser.email,
    };

    if (editingId) {
      const metricDoc = doc(db, "wellnessMetrics", editingId);
      await updateDoc(metricDoc, metricData);
      setEditingId(null);
    } else {
      await addDoc(metricsRef, metricData);
    }

    setSteps("");
    setSleep("");
    setMood("Happy");
    setNotes("");
    fetchMetrics();
  };

  const handleEdit = (metric) => {
    setSteps(metric.steps);
    setSleep(metric.sleep);
    setMood(metric.mood);
    setNotes(metric.notes || "");
    setEditingId(metric.id);
  };

  const handleDelete = async (id) => {
    const metricDoc = doc(db, "wellnessMetrics", id);
    await deleteDoc(metricDoc);
    fetchMetrics();
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  // Summary stats
  const totalSteps = metrics.reduce((acc, m) => acc + m.steps, 0);
  const avgSleep =
    metrics.length > 0
      ? (metrics.reduce((acc, m) => acc + m.sleep, 0) / metrics.length).toFixed(
          1
        )
      : 0;

  return (
    <div
      style={{
        padding: "20px 40px",
        minHeight: "100vh",
        backgroundColor: darkMode ? "#121212" : "#f0f2f5",
        color: darkMode ? "#f5f5f5" : "#222",
        transition: "all 0.3s ease",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px",
        }}
      >
        <h2 style={{ fontSize: "1.8rem" }}>Hello, {name}</h2>
        <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
          <button
            onClick={() => setDarkMode(!darkMode)}
            style={{
              padding: "10px 15px",
              background: darkMode ? "#444" : "#ddd",
              color: darkMode ? "#fff" : "#000",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            {darkMode ? "🌙 Dark" : "☀️ Light"}
          </button>
          <button
            onClick={handleLogout}
            style={{
              padding: "10px 15px",
              background: "#e53935",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Logout
          </button>
        </div>
      </div>
      {/* Quick Metrics Cards */}
      <div
        style={{
          display: "flex",
          gap: "20px",
          flexWrap: "wrap",
          marginBottom: "30px",
        }}
      >
        <div style={styles.card(darkMode, "#6a11cb")}>
          <h3>Total Steps</h3>
          <p style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{totalSteps}</p>
        </div>
        <div style={styles.card(darkMode, "#2575fc")}>
          <h3>Average Sleep (hrs)</h3>
          <p style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{avgSleep}</p>
        </div>
        <div style={styles.card(darkMode, "#ff9800")}>
          <h3>Last Mood</h3>
          <p style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
            {metrics.length > 0 ? metrics[metrics.length - 1].mood : "-"}
          </p>
        </div>
      </div>
      {/* Add / Update Daily Wellness */}
      <div style={styles.formCard(darkMode)}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "10px",
          }}
        >
          <span style={{ fontSize: "1.5rem" }}>📝</span>
          <h3 style={{ margin: 0 }}>Add / Update Daily Wellness</h3>
        </div>
        <p style={{ fontSize: "12px", color: darkMode ? "#aaa" : "#555" }}>
          Enter your daily steps, sleep hours, mood, and optional notes. You can
          also filter by date.
        </p>
        <form style={styles.formGrid} onSubmit={handleSaveMetric}>
          <input
            type="number"
            placeholder="Steps walked"
            value={steps}
            onChange={(e) => setSteps(e.target.value)}
            required
            style={styles.input(darkMode)}
          />
          <input
            type="number"
            placeholder="Sleep hours"
            value={sleep}
            onChange={(e) => setSleep(e.target.value)}
            required
            style={styles.input(darkMode)}
          />
          <select
            value={mood}
            onChange={(e) => setMood(e.target.value)}
            style={styles.input(darkMode)}
          >
            <option>Happy</option>
            <option>Neutral</option>
            <option>Tired</option>
            <option>Stressed</option>
          </select>
          <input
            type="text"
            placeholder="Notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            style={styles.input(darkMode)}
          />
          <button type="submit" style={styles.button}>
            {editingId ? "Update Metric" : "Add Metric"}
          </button>
        </form>
        <div
          style={{
            marginTop: "15px",
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
          }}
        >
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            placeholderText="Start Date"
            className="datePicker"
          />
          <DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            placeholderText="End Date"
            className="datePicker"
          />
        </div>
      </div>
      {/* Recorded Metrics */}
      <div style={styles.tableCard(darkMode)}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "10px",
          }}
        >
          <span style={{ fontSize: "1.5rem" }}>📊</span>
          <h3 style={{ margin: 0 }}>Recorded Metrics</h3>
        </div>
        <p style={{ fontSize: "12px", color: darkMode ? "#aaa" : "#555" }}>
          View all your logged wellness metrics. Edit or delete any entry as
          needed.
        </p>
        <table style={styles.table(darkMode)}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Steps</th>
              <th>Sleep (hrs)</th>
              <th>Mood</th>
              <th>Notes</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {metrics.map((metric) => (
              <tr
                key={metric.id}
                style={{ transition: "all 0.2s", cursor: "pointer" }}
              >
                <td>{new Date(metric.date).toLocaleDateString()}</td>
                <td>{metric.steps}</td>
                <td>{metric.sleep}</td>
                <td>{metric.mood}</td>
                <td>{metric.notes}</td>
                <td>
                  <button
                    onClick={() => handleEdit(metric)}
                    style={styles.editBtn}
                  >
                    <AiFillEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(metric.id)}
                    style={styles.deleteBtn}
                  >
                    <AiFillDelete />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Steps & Sleep Over Time */}
      <div style={styles.chartCard(darkMode)}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "10px",
          }}
        >
          <span style={{ fontSize: "1.5rem" }}>📈</span>
          <h3 style={{ margin: 0 }}>Steps & Sleep Over Time</h3>
        </div>
        <p
          style={{
            fontSize: "12px",
            color: darkMode ? "#aaa" : "#555",
            marginBottom: "10px",
          }}
        >
          Track your wellness trends over time to better understand your health
          patterns.
        </p>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={metrics}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={darkMode ? "#555" : "#ccc"}
            />
            <XAxis
              dataKey="date"
              tickFormatter={(str) => new Date(str).toLocaleDateString()}
              stroke={darkMode ? "#fff" : "#000"}
            />
            <YAxis stroke={darkMode ? "#fff" : "#000"} />
            <Tooltip
              contentStyle={{
                backgroundColor: darkMode ? "#222" : "#fff",
                color: darkMode ? "#fff" : "#000",
              }}
            />
            <Line
              type="monotone"
              dataKey="steps"
              stroke="#8884d8"
              name="Steps"
            />
            <Line
              type="monotone"
              dataKey="sleep"
              stroke="#82ca9d"
              name="Sleep (hrs)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Styles
const styles = {
  card: (darkMode, color) => ({
    flex: 1,
    minWidth: "150px",
    background: color,
    color: "#fff",
    padding: "20px",
    borderRadius: "10px",
    textAlign: "center",
    boxShadow: "0 5px 15px rgba(0,0,0,0.2)",
  }),
  formCard: (darkMode) => ({
    background: darkMode ? "#1e1e1e" : "#fff",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: darkMode
      ? "0 2px 8px rgba(0,0,0,0.6)"
      : "0 2px 10px rgba(0,0,0,0.1)",
    marginBottom: "30px",
  }),
  chartCard: (darkMode) => ({
    background: darkMode ? "#1e1e1e" : "#fff",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: darkMode
      ? "0 2px 8px rgba(0,0,0,0.6)"
      : "0 2px 10px rgba(0,0,0,0.1)",
    marginBottom: "40px",
  }),
  tableCard: (darkMode) => ({
    background: darkMode ? "#1e1e1e" : "#fff",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: darkMode
      ? "0 2px 8px rgba(0,0,0,0.6)"
      : "0 2px 10px rgba(0,0,0,0.1)",
    marginBottom: "40px",
    overflowX: "auto",
  }),
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "15px",
    alignItems: "center",
  },
  input: (darkMode) => ({
    padding: "10px",
    borderRadius: "8px",
    border: darkMode ? "1px solid #555" : "1px solid #ccc",
    background: darkMode ? "#2c2c2c" : "#fff",
    color: darkMode ? "#fff" : "#222",
    minWidth: "150px",
  }),
  button: {
    padding: "10px 20px",
    background: "#4CAF50",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  table: (darkMode) => ({
    width: "100%",
    borderCollapse: "collapse",
    color: darkMode ? "#fff" : "#222",
    textAlign: "center",
  }),
  editBtn: {
    background: "#1976d2",
    color: "white",
    padding: "5px 8px",
    marginRight: "5px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  deleteBtn: {
    background: "#e53935",
    color: "white",
    padding: "5px 8px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
};

export default Dashboard;
