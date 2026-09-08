"use client";

import { useState, useEffect } from "react";
import { 
  History, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  RefreshCw, 
  Filter, 
  Clock 
} from "lucide-react";
import { EmailLog } from "@/lib/email/types";
import { toast } from "sonner";

export default function EmailLogsTab() {
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/email/logs?status=${statusFilter}`);
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.error("Failed to load logs:", err);
      toast.error("Failed to load audit logs");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [statusFilter]);

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/5 pb-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Email Transmission & Sync Logs</h2>
          <p className="text-xs text-muted-foreground">
            Complete audit trail of all outgoing SMTP dispatches, incoming IMAP synchronization events, and error logs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-black/10 bg-white px-3 py-2 text-xs font-semibold outline-none"
          >
            <option value="all">All Logs</option>
            <option value="success">Success Only</option>
            <option value="error">Errors Only</option>
          </select>

          <button
            onClick={fetchLogs}
            className="p-2 rounded-xl border border-black/10 bg-white hover:bg-black/5 text-muted-foreground hover:text-foreground"
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Logs Table */}
      <div className="rounded-2xl border border-black/5 bg-white shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground">
            No transmission logs found matching your criteria.
          </div>
        ) : (
          <div className="divide-y divide-black/5 text-xs">
            {logs.map((log) => (
              <div key={log.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#faf9f6] transition-colors">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0">
                    {log.status === "success" ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-rose-600" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold uppercase tracking-wider text-[10px] text-muted-foreground">
                        {log.type}
                      </span>
                      {log.to && (
                        <span className="font-mono text-xs text-foreground font-semibold">
                          To: {log.to}
                        </span>
                      )}
                    </div>

                    {log.subject && (
                      <p className="text-sm font-semibold text-foreground mt-0.5">
                        {log.subject}
                      </p>
                    )}

                    {log.errorDetails && (
                      <p className="text-xs text-rose-600 mt-1 font-mono bg-rose-50 p-2 rounded-lg border border-rose-100">
                        {log.errorDetails}
                      </p>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[11px] text-muted-foreground font-semibold flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(log.timestamp).toLocaleString("en-PK", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
