import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { DashboardStats } from '../types';
import { Badge } from '../components/common/Badge';
import {
  Users,
  UserCheck,
  Calendar,
  Clock,
  DollarSign,
  Pill,
  AlertTriangle,
  ArrowUpRight,
  Activity,
  CheckCircle2,
  CalendarClock
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar
} from 'recharts';

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/dashboard/stats');
        setStats(res.data.data);
      } catch (err) {
        console.error('Failed to load dashboard stats', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-8 text-center text-slate-500">
        Unable to load dashboard metrics from PostgreSQL database.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Hospital Clinical Dashboard</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Real-time aggregate data queried from PostgreSQL relational tables
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> Live Relational Database Sync
          </span>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Patients */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Patients</span>
            <div className="p-2 bg-teal-50 text-teal-600 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 mt-2">{stats.totalPatients}</p>
          <p className="text-[11px] text-teal-600 font-medium flex items-center gap-1 mt-1">
            <ArrowUpRight className="w-3 h-3" /> Registered in database
          </p>
        </div>

        {/* Total Doctors */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Doctors</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 mt-2">{stats.totalDoctors}</p>
          <p className="text-[11px] text-blue-600 font-medium flex items-center gap-1 mt-1">
            Across 7 medical specialties
          </p>
        </div>

        {/* Pending Appointments */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Scheduled Appts</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <CalendarClock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 mt-2">{stats.pendingAppointments}</p>
          <p className="text-[11px] text-amber-600 font-medium flex items-center gap-1 mt-1">
            Active patient bookings
          </p>
        </div>

        {/* Total Revenue */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Collected Revenue</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 mt-2 font-mono">
            ${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-1">
            Total paid hospital billings
          </p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Appointment Status Distribution (Donut) */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-sm">Appointment Distribution</h3>
            <span className="text-[10px] uppercase font-bold text-slate-400">By Status</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.appointmentDistribution}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                >
                  {stats.appointmentDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Patient Registration Trend (Area) */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-sm">Patient Registrations</h3>
            <span className="text-[10px] uppercase font-bold text-slate-400">Monthly Volume</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.patientTrend}>
                <defs>
                  <linearGradient id="colorPatients" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="patients"
                  stroke="#0d9488"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorPatients)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Revenue Trend (Bar) */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-sm">Hospital Revenue Trends</h3>
            <span className="text-[10px] uppercase font-bold text-slate-400">Monthly Billed vs Paid</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.revenueTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                />
                <Bar dataKey="billed" fill="#93c5fd" name="Billed ($)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="collected" fill="#10b981" name="Collected ($)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row: Recent Appointments & Low Stock Alert */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Appointments */}
        <div className="lg:col-span-2 p-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-sm">Recent Patient Appointments</h3>
            <span className="text-xs text-slate-400">Latest consultations</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-2.5 px-3">Patient</th>
                  <th className="py-2.5 px-3">Doctor</th>
                  <th className="py-2.5 px-3">Date & Time</th>
                  <th className="py-2.5 px-3">Reason</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats.recentAppointments.map((appt) => (
                  <tr key={appt.appointment_id} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 font-semibold text-slate-800">
                      {appt.patient?.first_name} {appt.patient?.last_name}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      Dr. {appt.doctor?.first_name} {appt.doctor?.last_name}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">
                      {new Date(appt.appointment_date).toLocaleDateString()} at {appt.appointment_time}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 truncate max-w-[150px]">
                      {appt.reason}
                    </td>
                    <td className="py-2.5 px-3">
                      <Badge status={appt.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Medicine Alert Panel */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              <span>Low Stock Alerts</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
              {stats.lowStockMedicines} Critical
            </span>
          </div>

          <p className="text-xs text-slate-500">
            Medicines falling below minimum replenishment thresholds (= 20 units):
          </p>

          <div className="space-y-3">
            {stats.lowStockList.map((med) => (
              <div
                key={med.medicine_id}
                className="p-3 rounded-xl bg-amber-50/50 border border-amber-200/60 flex items-center justify-between text-xs"
              >
                <div>
                  <p className="font-bold text-slate-900">{med.medicine_name}</p>
                  <p className="text-[11px] text-slate-500">{med.category} • {med.manufacturer}</p>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-rose-600 text-sm">
                    {med.stock_quantity}
                  </span>
                  <span className="text-[10px] text-slate-400 block">units left</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
