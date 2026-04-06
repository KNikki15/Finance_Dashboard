import { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

function App() {
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("income");
  const [category, setCategory] = useState("");

  const [role, setRole] = useState("admin");
  const [dark, setDark] = useState(false);

  const [transactions, setTransactions] = useState([]);

  const [filterType, setFilterType] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("transactions") || "[]");
    setTransactions(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem("transactions", JSON.stringify(transactions));
  }, [transactions]);

  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((a, b) => a + b.amount, 0);

  const expense = transactions
    .filter((t) => t.type === "expense")
    .reduce((a, b) => a + b.amount, 0);

  const balance = income - expense;

  const handleAdd = () => {
    if (!amount || !category) return;

    const newT = {
      id: Date.now(),
      amount: Number(amount),
      type,
      category,
      date: new Date().toLocaleDateString(),
    };

    setTransactions([newT, ...transactions]);
    setAmount("");
    setCategory("");
  };

  const handleDelete = (id) => {
    setTransactions(transactions.filter((t) => t.id !== id));
  };

  const filtered = transactions.filter((t) => {
    return (
      (filterType === "all" || t.type === filterType) &&
      t.category.toLowerCase().includes(search.toLowerCase())
    );
  });

  // Cumulative balance for line chart (FIXED)
  let runningBalance = 0;
  const lineData = transactions.map((t) => {
    runningBalance += t.type === "income" ? t.amount : -t.amount;
    return {
      date: t.date,
      balance: runningBalance,
    };
  });

  const pieData = [
    { name: "Income", value: income },
    { name: "Expense", value: expense },
  ];

  const categoryTotals = {};
  transactions.forEach((t) => {
    if (t.type === "expense") {
      categoryTotals[t.category] =
        (categoryTotals[t.category] || 0) + t.amount;
    }
  });

  const topCategory =
    Object.keys(categoryTotals).length > 0
      ? Object.keys(categoryTotals).reduce((a, b) =>
          categoryTotals[a] > categoryTotals[b] ? a : b
        )
      : "None";

  return (
    <div
      className={`min-h-screen p-6 transition-all duration-500 relative ${
        dark
          ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white"
          : "bg-gradient-to-br from-gray-100 via-white to-gray-200"
      }`}
    >
      <div className="absolute top-0 left-0 w-full h-full -z-10 overflow-hidden">
        <div className="w-72 h-72 bg-blue-400 opacity-20 blur-3xl absolute top-10 left-10 rounded-full"></div>
        <div className="w-72 h-72 bg-purple-400 opacity-20 blur-3xl absolute bottom-10 right-10 rounded-full"></div>
      </div>

      {/* ALL YOUR EXISTING UI */}
      <h1 className="text-3xl font-bold mb-4">Finance Dashboard</h1>

      {/* Controls */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className={`p-2 border rounded ${
            dark ? "bg-gray-700 text-white border-gray-600" : ""
          }`}
        >
          <option value="admin">Admin</option>
          <option value="viewer">Viewer</option>
        </select>

        <div
          onClick={() => setDark(!dark)}
          className={`w-14 h-8 flex items-center rounded-full p-1 cursor-pointer transition-all duration-300 ${
            dark ? "bg-blue-500" : "bg-gray-300"
          }`}
        >
          <div
            className={`bg-white w-6 h-6 rounded-full shadow-md transform duration-300 ${
              dark ? "translate-x-6" : ""
            }`}
          />
        </div>
      </div>

      {/* Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-6">
        <Card title="Balance" value={balance} dark={dark} />
        <Card title="Income" value={income} color="green" dark={dark} />
        <Card title="Expense" value={expense} color="red" dark={dark} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* LEFT */}
        <div className="flex flex-col gap-6">
          {role === "admin" && (
            <div
              className={`p-4 rounded shadow ${
                dark ? "bg-gray-800" : "bg-white"
              }`}
            >
              <h2 className="font-semibold mb-2">Add Transaction</h2>

              <input
                type="number"
                placeholder="Amount"
                className={`w-full p-2 border mb-2 ${
                  dark
                    ? "bg-gray-700 text-white border-gray-600"
                    : ""
                }`}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />

              <input
                type="text"
                placeholder="Category"
                className={`w-full p-2 border mb-2 ${
                  dark
                    ? "bg-gray-700 text-white border-gray-600"
                    : ""
                }`}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />

              <select
                className={`w-full p-2 border mb-2 ${
                  dark
                    ? "bg-gray-700 text-white border-gray-600"
                    : ""
                }`}
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>

              <button
                onClick={handleAdd}
                className="w-full bg-blue-500 text-white p-2 rounded"
              >
                Add
              </button>
            </div>
          )}

          {/* Filters */}
          <div
            className={`p-4 rounded shadow ${
              dark ? "bg-gray-800" : "bg-white"
            }`}
          >
            <input
              placeholder="Search by Category"
              className={`w-full p-2 border mb-2 ${
                dark
                  ? "bg-gray-700 text-white border-gray-600"
                  : ""
              }`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              className={`w-full p-2 border ${
                dark
                  ? "bg-gray-700 text-white border-gray-600"
                  : ""
              }`}
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">All</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>

          {/* Transactions */}
          <div
            className={`p-4 rounded shadow ${
              dark ? "bg-gray-800" : "bg-white"
            }`}
          >
            <h2 className="font-semibold mb-2">Transaction History</h2>

            {filtered.length === 0 ? (
              <p>No transactions available</p>
            ) : (
              <ul className="space-y-2">
                {filtered.map((t) => (
                  <li
                    key={t.id}
                    className="flex justify-between border-b pb-2"
                  >
                    <div>
                      <p>{t.category}</p>
                      <p className="text-xs">{t.date}</p>
                    </div>

                    <div className="flex gap-3">
                      <span
                        className={
                          t.type === "income"
                            ? "text-green-500"
                            : "text-red-500"
                        }
                      >
                        ₹{t.amount.toLocaleString()}
                      </span>

                      {role === "admin" && (
                        <button
                          onClick={() => handleDelete(t.id)}
                          className="text-red-500"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Insights */}
          <div
            className={`p-4 rounded shadow ${
              dark ? "bg-gray-800" : "bg-white"
            }`}
          >
            <h2 className="font-semibold">Spending Insights</h2>
            <p>Top Spending Category: {topCategory}</p>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex flex-col gap-6">
          <div
            className={`p-4 rounded shadow flex justify-center ${
              dark ? "bg-gray-800" : "bg-white"
            }`}
          >
            <PieChart width={250} height={250}>
              <Pie data={pieData} dataKey="value">
                <Cell fill="#22c55e" />
                <Cell fill="#ef4444" />
              </Pie>
              <Tooltip />
            </PieChart>
          </div>

          <div
            className={`p-4 rounded shadow ${
              dark ? "bg-gray-800" : "bg-white"
            }`}
          >
            <LineChart width={300} height={250} data={lineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line dataKey="balance" />
            </LineChart>
          </div>
        </div>
      </div>
    </div>
  );
}

function Card({ title, value, color, dark }) {
  return (
    <div
      className={`p-4 rounded shadow ${
        dark ? "bg-gray-800 text-white" : "bg-white"
      }`}
    >
      <p className="text-sm text-gray-400">{title}</p>
      <p
        className={`text-2xl font-bold ${
          color === "green"
            ? "text-green-500"
            : color === "red"
            ? "text-red-500"
            : ""
        }`}
      >
        ₹{value.toLocaleString()}
      </p>
    </div>
  );
}

export default App;