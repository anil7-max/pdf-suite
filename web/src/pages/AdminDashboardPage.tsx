import React, { useEffect, useState } from 'react';
import { 
  Shield, 
  Users, 
  HardDrive, 
  Trash2, 
  Search, 
  Check, 
  RefreshCw,
  Sliders,
  ArrowLeft,
  Activity,
  Coins,
  FileText,
  Clock,
  Sparkles,
  UserCheck,
  UserX,
  PlusCircle,
  X
} from 'lucide-react';
import { adminService, UserProfile } from '../services/api';

interface AdminDashboardPageProps {
  onBack: () => void;
  currentUser: UserProfile | null;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ onBack, currentUser }) => {
  const [metrics, setMetrics] = useState<any | null>(null);
  const [conversionLogs, setConversionLogs] = useState<any[]>([]);
  const [claimLogs, setClaimLogs] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'conversions' | 'claims' | 'users' | 'settings'>('conversions');

  // Platform limits state
  const [starterTokens, setStarterTokens] = useState(7);
  const [maxSizeMb, setMaxSizeMb] = useState(50);

  // Token adjustment modal state
  const [tokenModalUser, setTokenModalUser] = useState<any | null>(null);
  const [tokenAmount, setTokenAmount] = useState<number>(10);
  const [tokenAction, setTokenAction] = useState<'add' | 'set'>('add');

  const loadData = async () => {
    setLoading(true);
    try {
      const [dash, userList] = await Promise.all([
        adminService.getDashboard(),
        adminService.listUsers(search)
      ]);
      setMetrics(dash.metrics);
      setConversionLogs(dash.conversion_logs || []);
      setClaimLogs(dash.claim_logs || []);
      setStarterTokens(dash.config.starter_tokens || 7);
      setMaxSizeMb(dash.config.free_max_file_size_mb || 50);
      setUsers(userList);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const list = await adminService.listUsers(search);
      setUsers(list);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdjustTokensSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenModalUser) return;
    try {
      await adminService.adjustTokens(tokenModalUser.id, tokenAction, Number(tokenAmount));
      setActionMsg(`Updated tokens for ${tokenModalUser.email}: ${tokenAction === 'add' ? `+${tokenAmount}` : `Set to ${tokenAmount}`}`);
      setTokenModalUser(null);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to adjust tokens');
    }
  };

  const handleToggleActive = async (userId: number) => {
    try {
      await adminService.toggleUserActive(userId);
      setActionMsg(`Toggled active status for user ID #${userId}`);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to toggle status');
    }
  };

  const handleDeleteUser = async (userId: number, email: string) => {
    if (!window.confirm(`Are you sure you want to delete user ${email}?`)) return;
    try {
      await adminService.deleteUser(userId);
      setActionMsg(`Deleted user ${email}`);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to delete user');
    }
  };

  const handleSaveLimits = async () => {
    try {
      await adminService.updateLimits(Number(starterTokens), Number(maxSizeMb));
      setActionMsg('Platform settings updated successfully!');
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to update settings');
    }
  };

  const handleCleanup = async () => {
    try {
      const res = await adminService.triggerCleanup();
      setActionMsg(`Storage cleaned: purged ${res.cleanup_report.deleted_count} files (${res.cleanup_report.freed_mb} MB freed).`);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Cleanup error');
    }
  };

  const formatBytes = (bytes: number) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return '-';
    const d = new Date(isoString);
    return d.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="max-w-7xl mx-auto px-2.5 sm:px-4 py-4 sm:py-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div className="flex items-start sm:items-center gap-3">
          <button 
            onClick={onBack}
            className="p-2 sm:p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 hover:bg-slate-700 text-slate-300 transition-colors flex-shrink-0"
            title="Back to Tools"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold uppercase tracking-wider mb-1">
              <Shield className="w-3 h-3" />
              Master Control Center
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              Super Admin Analytics
            </h1>
            <p className="text-xs text-slate-400">Live platform telemetry, user conversion logs, and token controls.</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <button
            onClick={handleCleanup}
            className="flex-1 sm:flex-initial px-3 sm:px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            Purge Storage
          </button>
          <button
            onClick={loadData}
            className="flex-1 sm:flex-initial px-3 sm:px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-lg shadow-indigo-600/30"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
        </div>
      </div>

      {actionMsg && (
        <div className="mb-6 p-3.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs font-bold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          {actionMsg}
        </div>
      )}

      {/* Metrics Row */}
      {metrics && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-3 mb-6 sm:mb-8">
          <div className="bg-slate-900 border border-slate-800 p-3 sm:p-4 rounded-xl sm:rounded-2xl">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider">Registered Users</span>
              <Users className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-white">{metrics.total_users}</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-3 sm:p-4 rounded-xl sm:rounded-2xl">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider">Active Today</span>
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-white">{metrics.active_users_today}</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-3 sm:p-4 rounded-xl sm:rounded-2xl">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider">Today Conversions</span>
              <FileText className="w-3.5 h-3.5 text-rose-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-white">{metrics.today_conversions}</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-3 sm:p-4 rounded-xl sm:rounded-2xl">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider">Total Lifetime</span>
              <FileText className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-white">{metrics.total_conversions_lifetime}</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-3 sm:p-4 rounded-xl sm:rounded-2xl">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider">Tokens Claimed</span>
              <Coins className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-white">{metrics.total_tokens_claimed}</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-3 sm:p-4 rounded-xl sm:rounded-2xl">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider">Storage Used</span>
              <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-white">{metrics.storage?.total_mb ?? 0} <span className="text-[10px] font-normal text-slate-400">MB</span></div>
          </div>
        </div>
      )}

      {/* Tabs Bar with Mobile Smooth Horizontal Scroll */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-6 overflow-x-auto no-scrollbar flex-nowrap">
        <button
          onClick={() => setActiveTab('conversions')}
          className={`whitespace-nowrap flex-shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'conversions'
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/25'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Activity className="w-4 h-4" />
          Live Conversions ({conversionLogs.length})
        </button>

        <button
          onClick={() => setActiveTab('claims')}
          className={`whitespace-nowrap flex-shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'claims'
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/25'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Coins className="w-4 h-4" />
          Task Claims ({claimLogs.length})
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`whitespace-nowrap flex-shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'users'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          User Management ({users.length})
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`whitespace-nowrap flex-shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'settings'
              ? 'bg-slate-700 text-white shadow-lg'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Sliders className="w-4 h-4" />
          Controls
        </button>
      </div>

      {/* Tab 1: Conversion Logs Table */}
      {activeTab === 'conversions' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white">Live User Conversion Activity</h2>
              <p className="text-xs text-slate-400">All document conversions performed across Image to PDF, PDF to Word, Compress, and ZIP</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
              Live Feed
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">User</th>
                  <th className="px-5 py-3.5">Tool Action</th>
                  <th className="px-5 py-3.5">Input Document</th>
                  <th className="px-5 py-3.5">Result File</th>
                  <th className="px-5 py-3.5">File Size</th>
                  <th className="px-5 py-3.5">Timestamp</th>
                  <th className="px-5 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {conversionLogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-slate-500">
                      No conversions logged yet. Test any document tool to see activity populate here live!
                    </td>
                  </tr>
                ) : (
                  conversionLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-5 py-3 font-semibold text-white">
                        {log.user_email}
                      </td>
                      <td className="px-5 py-3">
                        <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 font-mono text-[11px] text-rose-300 font-bold">
                          {log.task_type}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-slate-400 max-w-xs truncate" title={log.input_filename}>
                        {log.input_filename}
                      </td>
                      <td className="px-5 py-3 font-mono text-slate-300 text-[11px] max-w-xs truncate" title={log.output_filename}>
                        {log.output_filename}
                      </td>
                      <td className="px-5 py-3 text-slate-400">
                        {formatBytes(log.file_size_bytes)}
                      </td>
                      <td className="px-5 py-3 text-slate-400 flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {formatDate(log.created_at)}
                      </td>
                      <td className="px-5 py-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Task Claims Log */}
      {activeTab === 'claims' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white">Token Reward Claim Activity</h2>
              <p className="text-xs text-slate-400">Telemetry of users completing tasks and earning free conversion tokens</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Rewards Feed
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">User</th>
                  <th className="px-5 py-3.5">Task Name</th>
                  <th className="px-5 py-3.5">Tokens Credited</th>
                  <th className="px-5 py-3.5">Claimed At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {claimLogs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-10 text-slate-500">
                      No task claims recorded yet.
                    </td>
                  </tr>
                ) : (
                  claimLogs.map((claim) => (
                    <tr key={claim.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-5 py-3 font-semibold text-white">
                        {claim.user_email}
                      </td>
                      <td className="px-5 py-3">
                        <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-bold font-mono">
                          {claim.task_id}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300 font-black border border-amber-500/20 inline-flex items-center gap-1">
                          <Coins className="w-3 h-3 text-amber-400" />
                          +{claim.tokens_earned} Tokens
                        </span>
                      </td>
                      <td className="px-5 py-3 text-slate-400 flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {formatDate(claim.claimed_at)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: User Management Table */}
      {activeTab === 'users' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-white">User Accounts & Quotas</h2>
              <p className="text-xs text-slate-400">View user conversion counts, grant custom token rewards, or manage status</p>
            </div>
            
            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <div className="relative">
                <input 
                  type="text" 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search user email..."
                  className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
              </div>
              <button
                type="submit"
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-white font-semibold rounded-xl"
              >
                Search
              </button>
            </form>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">ID</th>
                  <th className="px-5 py-3.5">Email</th>
                  <th className="px-5 py-3.5">Role</th>
                  <th className="px-5 py-3.5">Token Balance</th>
                  <th className="px-5 py-3.5">Conversions</th>
                  <th className="px-5 py-3.5">Joined</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-3 font-mono text-slate-500">#{u.id}</td>
                    <td className="px-5 py-3 font-semibold text-white">
                      {u.email || 'Anonymous Guest'}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                        u.role === 'SUPER_ADMIN' 
                          ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' 
                          : 'bg-slate-800 text-slate-300'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-bold text-amber-300">
                      🪙 {u.tokens_balance} Tokens
                    </td>
                    <td className="px-5 py-3 text-slate-300">
                      {u.conversions_count} files
                    </td>
                    <td className="px-5 py-3 text-slate-400">
                      {formatDate(u.created_at)}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.is_active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                      }`}>
                        {u.is_active ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setTokenModalUser(u);
                            setTokenAmount(10);
                            setTokenAction('add');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[11px] font-bold flex items-center gap-1 transition-colors"
                          title="Adjust user tokens"
                        >
                          <Coins className="w-3 h-3 text-amber-400" />
                          Tokens
                        </button>

                        {u.role !== 'SUPER_ADMIN' && (
                          <>
                            <button
                              onClick={() => handleToggleActive(u.id)}
                              className="p-1 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                              title={u.is_active ? 'Suspend User' : 'Activate User'}
                            >
                              {u.is_active ? <UserX className="w-3.5 h-3.5 text-amber-400" /> : <UserCheck className="w-3.5 h-3.5 text-emerald-400" />}
                            </button>
                            <button
                              onClick={() => handleDeleteUser(u.id, u.email)}
                              className="p-1 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                              title="Delete user"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Platform Controls */}
      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
            <div className="flex items-center gap-2.5 mb-4">
              <Sliders className="w-5 h-5 text-indigo-400" />
              <h2 className="text-base font-bold text-white">Default Platform Quotas</h2>
            </div>
            <p className="text-xs text-slate-400 mb-6">Control how many starter tokens new users receive and max upload payload size.</p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  New User Starter Tokens
                </label>
                <input 
                  type="number"
                  min="1"
                  max="500"
                  value={starterTokens}
                  onChange={(e) => setStarterTokens(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">Default: 7 tokens on registration</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Max File Upload Limit (MB)
                </label>
                <input 
                  type="number"
                  min="5"
                  max="500"
                  value={maxSizeMb}
                  onChange={(e) => setMaxSizeMb(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">Default: 50 MB per file</span>
              </div>

              <button
                onClick={handleSaveLimits}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all"
              >
                Save Platform Settings
              </button>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <Trash2 className="w-5 h-5 text-rose-400" />
                <h2 className="text-base font-bold text-white">Storage & Auto-Wipe Service</h2>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                All uploaded documents and converted results are automatically wiped from the server after 2 hours to guarantee zero privacy retention and avoid server disk leaks.
              </p>
              <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300 space-y-2 mb-6">
                <div className="flex justify-between">
                  <span className="text-slate-400">Retention Policy:</span>
                  <strong className="text-white">2 Hours Auto-Wipe</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Current Disk Usage:</span>
                  <strong className="text-white">{metrics?.storage?.total_mb ?? 0} MB ({metrics?.storage?.active_files ?? 0} files)</strong>
                </div>
              </div>
            </div>

            <button
              onClick={handleCleanup}
              className="w-full py-2.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/30 text-rose-300 font-bold text-xs transition-all flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4 text-rose-400" />
              Force Purge Expired Files Now
            </button>
          </div>
        </div>
      )}

      {/* Token Adjustment Modal */}
      {tokenModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-sm w-full text-white shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Coins className="w-4 h-4 text-amber-400" />
                Adjust User Tokens
              </h3>
              <button 
                onClick={() => setTokenModalUser(null)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-4">
              User: <strong className="text-white">{tokenModalUser.email}</strong><br />
              Current Balance: <strong className="text-amber-300">{tokenModalUser.tokens_balance} Tokens</strong>
            </p>

            <form onSubmit={handleAdjustTokensSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTokenAction('add')}
                  className={`py-2 rounded-xl text-xs font-bold transition-all ${
                    tokenAction === 'add' ? 'bg-amber-500 text-slate-900' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  + Add Tokens
                </button>
                <button
                  type="button"
                  onClick={() => setTokenAction('set')}
                  className={`py-2 rounded-xl text-xs font-bold transition-all ${
                    tokenAction === 'set' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  Set Fixed Total
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Token Amount
                </label>
                <input 
                  type="number"
                  min="0"
                  max="10000"
                  value={tokenAmount}
                  onChange={(e) => setTokenAmount(Number(e.target.value))}
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setTokenModalUser(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20"
                >
                  Confirm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
