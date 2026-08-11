// src/components/Users/Dashboard.tsx
import React, { useEffect, useState } from "react";
import axios from "../../auth/axiosInstance";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area,
} from "recharts";

interface DashboardData {
  studentsCount: number;
  teachersCount: number;
}

interface RawUser {
  user_id: number;
  username?: string;
  first_name?: string | null;
  last_name?: string | null;
  section?: string | null;
  role?: string;
  created_at?: string;
}

interface JobPosting {
  job_id: number;
  job_title: string;
  company_name: string;
  job_type: string;
  status: "open" | "closed";
  created_at: string;
}

const PESO_NAVY = "#1a1d5e";
const PESO_RED = "#c0151a";
const PESO_GOLD = "#e8a800";
const CHART_COLORS = [PESO_NAVY, PESO_RED, PESO_GOLD, "#0369a1", "#16a34a", "#7c3aed"];

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [users, setUsers] = useState<RawUser[]>([]);
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError(null);
      try {
        const [statsRes, usersRes, jobsRes] = await Promise.allSettled([
          axios.get("/dashboard-data"),
          axios.get("/users"),
          axios.get("/job-postings"),
        ]);

        if (statsRes.status === "fulfilled") setData(statsRes.value.data);
        if (usersRes.status === "fulfilled") setUsers(usersRes.value.data);
        if (jobsRes.status === "fulfilled") setJobs(jobsRes.value.data);
      } catch {
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#f4f4f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 48, height: 48, border: `4px solid ${PESO_NAVY}`, borderTopColor: PESO_GOLD, borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
          <p style={{ color: PESO_NAVY, fontWeight: 600 }}>Loading dashboard...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 32 }}>
        <div style={{ background: "#fff1f2", border: `1.5px solid ${PESO_RED}`, color: PESO_RED, borderRadius: 10, padding: "14px 20px", fontWeight: 600 }}>
          ⚠️ {error}
        </div>
      </div>
    );
  }

  const totalUsers = (data?.studentsCount ?? 0) + (data?.teachersCount ?? 0);
  const openJobs = jobs.filter((j) => j.status === "open").length;
  const closedJobs = jobs.filter((j) => j.status === "closed").length;

  const statCards = [
    { label: "TOTAL APPLICANTS", value: data?.studentsCount ?? 0, icon: "👤", color: PESO_NAVY },
    { label: "TOTAL EMPLOYERS", value: data?.teachersCount ?? 0, icon: "🏢", color: PESO_RED },
    { label: "ALL USERS", value: totalUsers, icon: "👥", color: "#0369a1" },
    { label: "OPEN JOB POSTINGS", value: openJobs, icon: "💼", color: "#16a34a" },
  ];

  // ── Chart Data ────────────────────────────────────────────────────────────

  // 1. Job type breakdown bar chart
  const jobTypeMap = new Map<string, number>();
  jobs.forEach((j) => {
    const key = j.job_type.charAt(0).toUpperCase() + j.job_type.slice(1);
    jobTypeMap.set(key, (jobTypeMap.get(key) || 0) + 1);
  });
  const jobTypeData = Array.from(jobTypeMap.entries()).map(([name, count]) => ({ name, count }));

  // 2. Job status pie chart
  const jobStatusData = [
    { name: "Open", value: openJobs },
    { name: "Closed", value: closedJobs },
  ].filter((d) => d.value > 0);

  // 3. User role pie chart
  const userRoleData = [
    { name: "Applicants", value: data?.studentsCount ?? 0 },
    { name: "Employers", value: data?.teachersCount ?? 0 },
  ].filter((d) => d.value > 0);

  // 4. Jobs posted over last 6 months (area chart)
  const now = new Date();
  const monthLabels = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return { month: d.toLocaleString("default", { month: "short" }), year: d.getFullYear(), index: i };
  });
  const jobsOverTime = monthLabels.map(({ month, year }) => {
    const count = jobs.filter((j) => {
      const d = new Date(j.created_at);
      return d.getMonth() === new Date(`${month} 1, ${year}`).getMonth() && d.getFullYear() === year;
    }).length;
    return { month, jobs: count };
  });

  // 5. Users registered over last 6 months
  const usersOverTime = monthLabels.map(({ month, year }) => {
    const count = users.filter((u) => {
      if (!u.created_at) return false;
      const d = new Date(u.created_at);
      return d.getMonth() === new Date(`${month} 1, ${year}`).getMonth() && d.getFullYear() === year;
    }).length;
    return { month, users: count };
  });

  // 6. Top companies by job count
  const companyMap = new Map<string, number>();
  jobs.forEach((j) => {
    companyMap.set(j.company_name, (companyMap.get(j.company_name) || 0) + 1);
  });
  const topCompanies = Array.from(companyMap.entries())
    .map(([name, jobs]) => ({ name, jobs }))
    .sort((a, b) => b.jobs - a.jobs)
    .slice(0, 6);

  const cardStyle: React.CSSProperties = {
    background: "white",
    borderRadius: 12,
    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
    overflow: "hidden",
  };

  const cardHeaderStyle = (bg = PESO_NAVY): React.CSSProperties => ({
    background: bg,
    padding: "14px 20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  });

  const cardTitleStyle: React.CSSProperties = {
    color: "white",
    fontWeight: 700,
    margin: 0,
    fontSize: "0.92rem",
  };

  const emptyState = (icon: string, text: string) => (
    <div style={{ textAlign: "center", padding: "48px 0", color: "#94a3b8" }}>
      <div style={{ fontSize: "2.5rem", marginBottom: 10 }}>{icon}</div>
      <p style={{ margin: 0, fontSize: "0.9rem" }}>{text}</p>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f4f4f6", fontFamily: "'Source Sans 3', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Source+Sans+3:wght@300;400;600;700&display=swap" rel="stylesheet" />

      {/* Page Header */}
      <div style={{ background: PESO_NAVY, padding: "28px 32px", borderBottom: `4px solid ${PESO_GOLD}` }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div>
            <p style={{ color: PESO_GOLD, fontSize: "0.75rem", fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", margin: "0 0 4px" }}>
              P.E.S.O. Admin Portal
            </p>
            <h1 style={{ fontFamily: "'Playfair Display', serif", color: "white", fontSize: "1.8rem", margin: 0 }}>
              Welcome back, {user?.first_name ?? user?.username}! 👋
            </h1>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.9rem", margin: "4px 0 0" }}>
              Here's what's happening on your platform today.
            </p>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link to="/QuizDashboard"
              style={{ background: "rgba(255,255,255,0.1)", color: "white", border: "1.5px solid rgba(255,255,255,0.3)", padding: "10px 20px", borderRadius: 8, fontWeight: 600, fontSize: "0.88rem", textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
              📋 Manage Quizzes
            </Link>
            <Link to="/employer/jobs"
              style={{ background: PESO_GOLD, color: PESO_NAVY, border: "none", padding: "10px 20px", borderRadius: 8, fontWeight: 800, fontSize: "0.88rem", textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
              💼 Manage Job Postings
            </Link>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px" }}>

        {/* ── Stat Cards ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20, marginBottom: 32 }}>
          {statCards.map((card) => (
            <div key={card.label} style={{ background: "white", borderRadius: 12, padding: "24px", borderTop: `4px solid ${card.color}`, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ fontSize: "2rem" }}>{card.icon}</span>
                <span style={{ background: `${card.color}18`, color: card.color, fontSize: "0.7rem", fontWeight: 700, letterSpacing: 1, padding: "3px 10px", borderRadius: 20, textTransform: "uppercase" }}>
                  Active
                </span>
              </div>
              <div style={{ fontSize: "2.2rem", fontWeight: 800, color: card.color, fontFamily: "'Playfair Display', serif", lineHeight: 1 }}>
                {card.value}
              </div>
              <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#5a5a7a", letterSpacing: 1.5, textTransform: "uppercase", marginTop: 6 }}>
                {card.label}
              </div>
            </div>
          ))}
        </div>

        {/* ── Row 1: Jobs Over Time + User Registrations ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>

          {/* Jobs Posted Over Time */}
          <div style={cardStyle}>
            <div style={cardHeaderStyle()}>
              <h5 style={cardTitleStyle}>📈 Job Postings — Last 6 Months</h5>
            </div>
            <div style={{ padding: 20 }}>
              {jobs.length === 0 ? emptyState("📋", "No job postings yet") : (
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={jobsOverTime}>
                    <defs>
                      <linearGradient id="jobGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={PESO_NAVY} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={PESO_NAVY} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#5a5a7a" }} />
                    <YAxis tick={{ fontSize: 12, fill: "#5a5a7a" }} allowDecimals={false} />
                    <Tooltip contentStyle={{ borderRadius: 8, border: `1.5px solid ${PESO_NAVY}`, fontSize: 13 }} />
                    <Area type="monotone" dataKey="jobs" stroke={PESO_NAVY} strokeWidth={2.5} fill="url(#jobGrad)" name="Jobs Posted" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* User Registrations Over Time */}
          <div style={cardStyle}>
            <div style={cardHeaderStyle()}>
              <h5 style={cardTitleStyle}>👥 User Registrations — Last 6 Months</h5>
            </div>
            <div style={{ padding: 20 }}>
              {users.length === 0 ? emptyState("👤", "No users registered yet") : (
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={usersOverTime}>
                    <defs>
                      <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={PESO_RED} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={PESO_RED} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#5a5a7a" }} />
                    <YAxis tick={{ fontSize: 12, fill: "#5a5a7a" }} allowDecimals={false} />
                    <Tooltip contentStyle={{ borderRadius: 8, border: `1.5px solid ${PESO_RED}`, fontSize: 13 }} />
                    <Area type="monotone" dataKey="users" stroke={PESO_RED} strokeWidth={2.5} fill="url(#userGrad)" name="New Users" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* ── Row 2: Job Type Bar + Pie Charts ── */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 20, marginBottom: 20 }}>

          {/* Job Type Breakdown */}
          <div style={cardStyle}>
            <div style={cardHeaderStyle()}>
              <h5 style={cardTitleStyle}>📊 Jobs by Type</h5>
              <span style={{ background: PESO_GOLD, color: PESO_NAVY, fontSize: "0.7rem", fontWeight: 800, padding: "2px 10px", borderRadius: 20 }}>
                {jobs.length} total
              </span>
            </div>
            <div style={{ padding: 20 }}>
              {jobTypeData.length === 0 ? emptyState("📋", "No job postings yet") : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={jobTypeData} barSize={36}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#5a5a7a" }} />
                    <YAxis tick={{ fontSize: 12, fill: "#5a5a7a" }} allowDecimals={false} />
                    <Tooltip contentStyle={{ borderRadius: 8, border: `1.5px solid ${PESO_NAVY}`, fontSize: 13 }} />
                    <Bar dataKey="count" name="Jobs" radius={[6, 6, 0, 0]}>
                      {jobTypeData.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Job Status Pie */}
          <div style={cardStyle}>
            <div style={cardHeaderStyle()}>
              <h5 style={cardTitleStyle}>💼 Job Status</h5>
            </div>
            <div style={{ padding: 20, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              {jobStatusData.length === 0 ? emptyState("💼", "No jobs yet") : (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={jobStatusData} cx="50%" cy="45%" innerRadius={52} outerRadius={80} paddingAngle={4} dataKey="value">
                      {jobStatusData.map((_, i) => (
                        <Cell key={i} fill={i === 0 ? "#16a34a" : "#94a3b8"} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 8, fontSize: 13 }} />
                    <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* User Role Pie */}
          <div style={cardStyle}>
            <div style={cardHeaderStyle()}>
              <h5 style={cardTitleStyle}>👥 User Roles</h5>
            </div>
            <div style={{ padding: 20, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              {userRoleData.length === 0 ? emptyState("👥", "No users yet") : (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={userRoleData} cx="50%" cy="45%" innerRadius={52} outerRadius={80} paddingAngle={4} dataKey="value">
                      {userRoleData.map((_, i) => (
                        <Cell key={i} fill={[PESO_NAVY, PESO_RED][i % 2]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 8, fontSize: 13 }} />
                    <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* ── Row 3: Top Companies ── */}
        <div style={cardStyle}>
          <div style={cardHeaderStyle()}>
            <h5 style={cardTitleStyle}>🏢 Top Companies by Job Postings</h5>
            <span style={{ background: `rgba(232,168,0,0.2)`, color: PESO_GOLD, fontSize: "0.7rem", fontWeight: 700, padding: "2px 10px", borderRadius: 20, border: `1px solid ${PESO_GOLD}` }}>
              Top {topCompanies.length}
            </span>
          </div>
          <div style={{ padding: 20 }}>
            {topCompanies.length === 0 ? emptyState("🏢", "No companies have posted jobs yet") : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={topCompanies} layout="vertical" barSize={22}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 12, fill: "#5a5a7a" }} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: "#5a5a7a" }} width={130} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: `1.5px solid ${PESO_NAVY}`, fontSize: 13 }} />
                  <Bar dataKey="jobs" name="Job Postings" radius={[0, 6, 6, 0]}>
                    {topCompanies.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;