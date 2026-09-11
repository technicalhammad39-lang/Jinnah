"use client";

import { useEffect, useState, useCallback } from "react";
import { 
  ShieldCheck, 
  ShieldAlert, 
  Laptop, 
  Smartphone, 
  Tablet, 
  Globe, 
  Clock, 
  History, 
  AlertTriangle, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  AlertOctagon, 
  LogOut, 
  KeyRound, 
  Activity,
  Layers
} from "lucide-react";
import { toast } from "sonner";

interface AdminSessionItem {
  id: string;
  sessionId: string;
  uid: string;
  email: string;
  status: "active" | "revoked" | "expired";
  createdAt: number;
  lastActiveAt: number;
  ip: string;
  userAgent: string;
  browser: string;
  os: string;
  deviceType: "desktop" | "mobile" | "tablet" | "unknown";
  isCurrent?: boolean;
}

interface LoginEventItem {
  id: string;
  type: string;
  uid?: string;
  email?: string;
  timestamp: number;
  ip: string;
  browser?: string;
  os?: string;
  deviceType?: string;
  userAgent?: string;
  reason?: string;
}

interface AlertItem {
  id: string;
  type: string;
  severity: "info" | "warning" | "critical";
  message: string;
  ip: string;
  details?: Record<string, unknown>;
  timestamp: number;
  resolved: boolean;
  resolvedAt?: number;
}

export default function AdminSecurityPage() {
  const [activeTab, setActiveTab] = useState<"sessions" | "history" | "alerts">("sessions");
  
  // Data states
  const [sessions, setSessions] = useState<AdminSessionItem[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [history, setHistory] = useState<LoginEventItem[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  
  // Loading states
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loadingAlerts, setLoadingAlerts] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [revokingOthers, setRevokingOthers] = useState(false);
  const [revokingAll, setRevokingAll] = useState(false);
  const [resolvingAlertId, setResolvingAlertId] = useState<string | null>(null);

  // Filters
  const [historyFilter, setHistoryFilter] = useState<string>("ALL");

  const fetchSessions = useCallback(async () => {
    setLoadingSessions(true);
    try {
      const res = await fetch("/api/admin/security/sessions");
      if (!res.ok) throw new Error("Failed to load sessions");
      const data = await res.json();
      setSessions(data.sessions || []);
      setCurrentSessionId(data.currentSessionId || null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error loading sessions";
      toast.error(message);
    } finally {
      setLoadingSessions(false);
    }
  }, []);

  const fetchHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const url = historyFilter === "ALL" 
        ? "/api/admin/security/login-history?limit=100" 
        : `/api/admin/security/login-history?limit=100&type=${encodeURIComponent(historyFilter)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to load login history");
      const data = await res.json();
      setHistory(data.history || []);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error loading history";
      toast.error(message);
    } finally {
      setLoadingHistory(false);
    }
  }, [historyFilter]);

  const fetchAlerts = useCallback(async () => {
    setLoadingAlerts(true);
    try {
      const res = await fetch("/api/admin/security/alerts");
      if (!res.ok) throw new Error("Failed to load security alerts");
      const data = await res.json();
      setAlerts(data.alerts || []);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error loading alerts";
      toast.error(message);
    } finally {
      setLoadingAlerts(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
    fetchAlerts();
  }, [fetchSessions, fetchAlerts]);

  useEffect(() => {
    if (activeTab === "history") {
      fetchHistory();
    }
  }, [activeTab, fetchHistory]);

  const handleRevokeSingle = async (sessionId: string) => {
    if (!confirm("Are you sure you want to revoke this session? The device will be immediately logged out.")) {
      return;
    }
    setRevokingId(sessionId);
    try {
      const res = await fetch("/api/admin/security/sessions/revoke", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "single", targetSessionId: sessionId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to revoke session");
      toast.success("Session revoked successfully");
      await fetchSessions();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error revoking session";
      toast.error(message);
    } finally {
      setRevokingId(null);
    }
  };

  const handleRevokeOthers = async () => {
    if (!confirm("Revoke all other sessions? Only your current device will remain logged in.")) {
      return;
    }
    setRevokingOthers(true);
    try {
      const res = await fetch("/api/admin/security/sessions/revoke", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "others" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to revoke other sessions");
      toast.success(`Revoked ${data.revokedCount || 0} other sessions`);
      await fetchSessions();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error revoking sessions";
      toast.error(message);
    } finally {
      setRevokingOthers(false);
    }
  };

  const handleRevokeAll = async () => {
    if (!confirm("WARNING: This will revoke ALL admin sessions including this one. You will be logged out immediately. Continue?")) {
      return;
    }
    setRevokingAll(true);
    try {
      const res = await fetch("/api/admin/security/sessions/revoke", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "all" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to revoke sessions");
      toast.success("All sessions revoked. Redirecting to login...");
      setTimeout(() => {
        window.location.href = "/admin-cts/login";
      }, 1000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error revoking all sessions";
      toast.error(message);
      setRevokingAll(false);
    }
  };

  const handleResolveAlert = async (alertId: string) => {
    setResolvingAlertId(alertId);
    try {
      const res = await fetch("/api/admin/security/alerts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alertId, resolved: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to resolve alert");
      toast.success("Alert marked as resolved");
      await fetchAlerts();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error updating alert";
      toast.error(message);
    } finally {
      setResolvingAlertId(null);
    }
  };

  const renderDeviceIcon = (deviceType?: string) => {
    switch (deviceType) {
      case "mobile":
        return <Smartphone className="w-5 h-5 text-orange-600" />;
      case "tablet":
        return <Tablet className="w-5 h-5 text-amber-600" />;
      case "desktop":
      default:
        return <Laptop className="w-5 h-5 text-zinc-700" />;
    }
  };

  const renderEventBadge = (type: string) => {
    switch (type) {
      case "SUCCESSFUL_LOGIN":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> Successful Login
          </span>
        );
      case "FAILED_LOGIN":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5" /> Failed Login
          </span>
        );
      case "RATE_LIMITED":
      case "TEMPORARILY_BLOCKED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <AlertOctagon className="w-3.5 h-3.5" /> Rate Limited / Blocked
          </span>
        );
      case "SESSION_REVOKED":
      case "ALL_SESSIONS_REVOKED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <LogOut className="w-3.5 h-3.5" /> Revoked
          </span>
        );
      case "LOGOUT":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-700 border border-zinc-200">
            <LogOut className="w-3.5 h-3.5" /> Logout
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-50 text-zinc-700 border border-zinc-200">
            <Activity className="w-3.5 h-3.5" /> {type}
          </span>
        );
    }
  };

  const unresolvedAlertsCount = alerts.filter(a => !a.resolved).length;

  return (
    <div className="h-full flex flex-col overflow-y-auto bg-[#faf9f6] p-4 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-orange-500/10">
        <div>
          <div className="flex items-center gap-2.5 text-zinc-800 font-bold text-2xl">
            <div className="p-2.5 bg-orange-500/10 text-[#FF6A2A] rounded-2xl">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <span>Admin Authentication & Security Center</span>
          </div>
          <p className="text-zinc-500 text-sm mt-1">
            Real-time active sessions, server-enforced brute-force shields, and immutable security audit logs.
          </p>
        </div>

        {/* Quick Refresh */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (activeTab === "sessions") fetchSessions();
              else if (activeTab === "history") fetchHistory();
              else fetchAlerts();
            }}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-zinc-700 bg-white border border-zinc-200 hover:border-orange-300 rounded-xl shadow-sm transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mt-6 border-b border-zinc-200">
        <button
          onClick={() => setActiveTab("sessions")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all ${
            activeTab === "sessions"
              ? "border-[#FF6A2A] text-[#FF6A2A]"
              : "border-transparent text-zinc-500 hover:text-zinc-800"
          }`}
        >
          <Layers className="w-4 h-4" />
          Active Sessions ({sessions.length})
        </button>

        <button
          onClick={() => setActiveTab("history")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all ${
            activeTab === "history"
              ? "border-[#FF6A2A] text-[#FF6A2A]"
              : "border-transparent text-zinc-500 hover:text-zinc-800"
          }`}
        >
          <History className="w-4 h-4" />
          Login History
        </button>

        <button
          onClick={() => setActiveTab("alerts")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all ${
            activeTab === "alerts"
              ? "border-[#FF6A2A] text-[#FF6A2A]"
              : "border-transparent text-zinc-500 hover:text-zinc-800"
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          Security Alerts
          {unresolvedAlertsCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white animate-pulse">
              {unresolvedAlertsCount}
            </span>
          )}
        </button>
      </div>

      {/* Tab 1: Active Sessions */}
      {activeTab === "sessions" && (
        <div className="mt-6 space-y-6">
          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-zinc-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <div>
                <h3 className="text-sm font-bold text-zinc-800">Active Admin Devices</h3>
                <p className="text-xs text-zinc-500">
                  Devices with authorized cryptographic session cookies currently active.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleRevokeOthers}
                disabled={revokingOthers || sessions.length <= 1}
                className="px-3.5 py-2 text-xs font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 disabled:opacity-40 disabled:pointer-events-none rounded-xl transition-all"
              >
                {revokingOthers ? "Revoking..." : "Revoke Other Sessions"}
              </button>

              <button
                onClick={handleRevokeAll}
                disabled={revokingAll}
                className="px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 disabled:opacity-40 rounded-xl transition-all"
              >
                {revokingAll ? "Revoking..." : "Revoke All Sessions"}
              </button>
            </div>
          </div>

          {/* Sessions List */}
          {loadingSessions ? (
            <div className="p-12 text-center text-zinc-400">Loading active sessions...</div>
          ) : sessions.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-zinc-200 text-zinc-400">
              No active sessions found.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sessions.map((session) => {
                const isCurrent = session.sessionId === currentSessionId;
                return (
                  <div
                    key={session.sessionId}
                    className={`relative p-5 rounded-2xl border transition-all ${
                      isCurrent
                        ? "bg-gradient-to-br from-white to-orange-50/40 border-orange-500/30 shadow-sm ring-1 ring-orange-500/20"
                        : "bg-white border-zinc-200 shadow-sm"
                    }`}
                  >
                    {isCurrent && (
                      <span className="absolute top-4 right-4 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FF6A2A] text-white">
                        Current Device
                      </span>
                    )}

                    <div className="flex items-start gap-3.5">
                      <div className="p-3 bg-zinc-100 rounded-xl">
                        {renderDeviceIcon(session.deviceType)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-zinc-900 text-sm truncate">
                            {session.browser} on {session.os}
                          </h4>
                        </div>

                        <div className="mt-2 space-y-1 text-xs text-zinc-500">
                          <div className="flex items-center gap-1.5">
                            <Globe className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                            <span className="font-mono text-zinc-700">{session.ip || "Unknown IP"}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                            <span>
                              Logged in: {new Date(session.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Activity className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                            <span>
                              Last active: {new Date(session.lastActiveAt).toLocaleString()}
                            </span>
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between">
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active
                          </span>

                          <button
                            onClick={() => handleRevokeSingle(session.sessionId)}
                            disabled={revokingId === session.sessionId}
                            className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline disabled:opacity-40"
                          >
                            {revokingId === session.sessionId ? "Revoking..." : "Revoke"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Login History */}
      {activeTab === "history" && (
        <div className="mt-6 space-y-6">
          {/* History Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-zinc-200 shadow-sm">
            <div>
              <h3 className="text-sm font-bold text-zinc-800">Authentication Event Log</h3>
              <p className="text-xs text-zinc-500">
                Immutable security records for logins, failed attempts, revocations, and rate limit blocks.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={historyFilter}
                onChange={(e) => setHistoryFilter(e.target.value)}
                className="text-xs font-medium px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#FF6A2A]"
              >
                <option value="ALL">All Events</option>
                <option value="SUCCESSFUL_LOGIN">Successful Logins</option>
                <option value="FAILED_LOGIN">Failed Logins</option>
                <option value="RATE_LIMITED">Rate Limited</option>
                <option value="LOGOUT">Logouts</option>
                <option value="SESSION_REVOKED">Revocations</option>
              </select>
            </div>
          </div>

          {/* History Table */}
          {loadingHistory ? (
            <div className="p-12 text-center text-zinc-400">Loading login history...</div>
          ) : history.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-zinc-200 text-zinc-400">
              No login history records found.
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-zinc-600">
                  <thead className="bg-zinc-50 border-b border-zinc-200 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                    <tr>
                      <th className="p-3.5">Event</th>
                      <th className="p-3.5">Account / Email</th>
                      <th className="p-3.5">IP Address</th>
                      <th className="p-3.5">Device & Browser</th>
                      <th className="p-3.5">Timestamp</th>
                      <th className="p-3.5">Reason / Result</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {history.map((event) => (
                      <tr key={event.id} className="hover:bg-zinc-50/50 transition-colors">
                        <td className="p-3.5 whitespace-nowrap">
                          {renderEventBadge(event.type)}
                        </td>
                        <td className="p-3.5 font-medium text-zinc-800">
                          {event.email || "—"}
                        </td>
                        <td className="p-3.5 font-mono text-zinc-700 whitespace-nowrap">
                          {event.ip || "Unknown"}
                        </td>
                        <td className="p-3.5 whitespace-nowrap">
                          {event.browser || "Unknown"} • {event.os || "Unknown"} ({event.deviceType || "Desktop"})
                        </td>
                        <td className="p-3.5 whitespace-nowrap text-zinc-500">
                          {new Date(event.timestamp).toLocaleString()}
                        </td>
                        <td className="p-3.5 text-zinc-500 max-w-xs truncate">
                          {event.reason || "OK"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Security Alerts */}
      {activeTab === "alerts" && (
        <div className="mt-6 space-y-6">
          <div className="p-4 rounded-2xl bg-white border border-zinc-200 shadow-sm">
            <h3 className="text-sm font-bold text-zinc-800">Automated Threat Detection Alerts</h3>
            <p className="text-xs text-zinc-500">
              Triggered automatically when unusual failed authentication spikes or potential brute-force attempts occur.
            </p>
          </div>

          {loadingAlerts ? (
            <div className="p-12 text-center text-zinc-400">Loading security alerts...</div>
          ) : alerts.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-zinc-200 text-zinc-400">
              <ShieldCheck className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
              <p className="text-sm font-medium text-zinc-700">No active security alerts</p>
              <p className="text-xs text-zinc-400 mt-0.5">All authentication traffic is within normal thresholds.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    alert.resolved
                      ? "bg-zinc-50 border-zinc-200 opacity-60"
                      : alert.severity === "critical"
                      ? "bg-rose-50/50 border-rose-200"
                      : "bg-amber-50/40 border-amber-200"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2.5 rounded-xl shrink-0 ${
                        alert.severity === "critical" ? "bg-rose-100 text-rose-600" : "bg-amber-100 text-amber-700"
                      }`}>
                        <AlertTriangle className="w-5 h-5" />
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            alert.severity === "critical" ? "bg-rose-600 text-white" : "bg-amber-600 text-white"
                          }`}>
                            {alert.severity}
                          </span>
                          <span className="text-xs font-bold text-zinc-800">{alert.type}</span>
                          {alert.resolved && (
                            <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              Resolved
                            </span>
                          )}
                        </div>

                        <p className="text-sm font-medium text-zinc-900 mt-1">{alert.message}</p>

                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-500">
                          <span>IP: <strong className="font-mono text-zinc-700">{alert.ip}</strong></span>
                          <span>Time: <strong>{new Date(alert.timestamp).toLocaleString()}</strong></span>
                        </div>
                      </div>
                    </div>

                    {!alert.resolved && (
                      <button
                        onClick={() => handleResolveAlert(alert.id)}
                        disabled={resolvingAlertId === alert.id}
                        className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-all self-start"
                      >
                        {resolvingAlertId === alert.id ? "Resolving..." : "Mark Resolved"}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
