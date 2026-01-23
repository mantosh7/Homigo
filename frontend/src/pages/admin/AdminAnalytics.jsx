import { useEffect, useState } from "react";
import { getAnalyticsSummary, getMonthlyTrend } from "@/services/analyticsService";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";


const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Reusable stat card
const StatCard = ({ title, value }) => (
    <div
        style={{
            background: "#0b1220",
            padding: "20px",
            borderRadius: "12px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.4)"
        }}
    >
        <p style={{ color: "#aaa", fontSize: "14px" }}>{title}</p>
        <h2 style={{ color: "#fff", marginTop: "8px" }}>{value}</h2>
    </div>
);


export default function AdminAnalytics() {

    const [summary, setSummary] = useState(null);
    const [monthlyTrend, setMonthlyTrend] = useState([]);

    const loadAnalytics = async () => {
        try {
            const summary = await getAnalyticsSummary();
            const trend = await getMonthlyTrend();

            setSummary(summary);
            setMonthlyTrend(trend);

            console.log("SUMMARY 👉", summary);
            console.log("MONTHLY TREND 👉", trend);
        } catch (error) {
            console.error("Analytics error:", err);
        }
    };

    useEffect(() => {
        loadAnalytics();
    }, []);

    // Prepare chart data
    const chartData = monthlyTrend.map(item => ({
        month: monthNames[item.month - 1],
        total: Number(item.total)
    }));

    return (
        <div style={{ padding: "24px" }}>
            <h1 style={{ color: "#fff", marginBottom: "24px" }}>
                Admin Analytics Dashboard
            </h1>

            {/* Summary Cards */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: "16px",
                    marginBottom: "40px"
                }}
            >
                <StatCard
                    title="Total Collected"
                    value={`₹${summary?.totalCollected ?? 0}`}
                />
                <StatCard
                    title="Pending Amount"
                    value={`₹${summary?.totalPending ?? 0}`}
                />
                <StatCard
                    title="Paid Tenants"
                    value={summary?.paidCount ?? 0}
                />
                <StatCard
                    title="Pending Tenants"
                    value={summary?.pendingCount ?? 0}
                />
            </div>

            {/* Monthly Bar Chart */}
            <h2 style={{ color: "#fff", marginBottom: "16px" }}>
                Monthly Rent Collection
            </h2>

            <div style={{ width: "100%", height: 320 }}>
                <ResponsiveContainer>
                    <BarChart data={chartData}>
                        <XAxis dataKey="month" stroke="#ccc" />
                        <YAxis stroke="#ccc" />
                        <Tooltip />
                        <Bar
                            dataKey="total"
                            fill="#ff7a45"
                            radius={[6, 6, 0, 0]}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}