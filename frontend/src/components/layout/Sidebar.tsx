import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Calendar,
  FileText,
  Pill,
  Receipt,
  ClipboardList,
  FlaskConical,
  Database,
  Cross
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Patients', href: '/patients', icon: Users },
    { name: 'Doctors', href: '/doctors', icon: UserCheck },
    { name: 'Appointments', href: '/appointments', icon: Calendar },
    { name: 'Prescriptions', href: '/prescriptions', icon: FileText },
    { name: 'Medicine Inventory', href: '/inventory', icon: Pill },
    { name: 'Billing & Invoices', href: '/billing', icon: Receipt },
    { name: 'Medical Records', href: '/records', icon: ClipboardList },
    { name: 'Lab Tests', href: '/lab-tests', icon: FlaskConical },
    { name: 'DBMS Explorer (Viva)', href: '/dbms-explorer', icon: Database }
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 min-h-screen border-r border-slate-800">
      {/* Brand Header */}
      <div className="h-16 flex items-center gap-3 px-6 bg-slate-950/70 border-b border-slate-800/80">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-500 to-teal-400 text-white flex items-center justify-center shadow-lg shadow-teal-500/20">
          <Cross className="w-5 h-5 fill-current" />
        </div>
        <div>
          <h1 className="text-base font-black text-white tracking-tight">MediCare HMS</h1>
          <p className="text-[10px] text-teal-400 font-medium">PostgreSQL Relational System</p>
        </div>
      </div>

      {/* Nav Menu */}
      <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Hospital Operations
        </div>
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-teal-600 text-white shadow-md shadow-teal-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Database Academic Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40 text-[11px] text-slate-400 space-y-1">
        <div className="flex items-center justify-between text-slate-300 font-bold">
          <span>Relational DBMS</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono">
            3NF Compliant
          </span>
        </div>
        <p className="text-[10px] text-slate-500">PostgreSQL 18 + Prisma ORM + Express</p>
      </div>
    </aside>
  );
};
