import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { LogOut, User as UserIcon, Shield, ChevronDown, Check, Sparkles } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout, switchDemoRole } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const roles: { role: UserRole; label: string; desc: string }[] = [
    { role: 'ADMIN', label: 'Admin', desc: 'Full System & Inventory Access' },
    { role: 'DOCTOR', label: 'Doctor', desc: 'EHR, Rx & Lab Orders' },
    { role: 'RECEPTIONIST', label: 'Receptionist', desc: 'Scheduling & Invoicing' }
  ];

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm/50">
      <div className="flex items-center gap-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200 flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-teal-600" /> PostgreSQL DBMS Mode
        </span>
      </div>

      <div className="flex items-center gap-4">
        {/* Quick Role Switcher for College Project Viva Evaluators */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200/70 text-slate-700 rounded-lg text-xs font-semibold transition border border-slate-200"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Switch Role ({user?.role})</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50">
              <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-bold uppercase text-slate-400">
                1-Click Role Switcher (Viva Demo)
              </div>
              {roles.map((r) => (
                <button
                  key={r.role}
                  onClick={() => {
                    switchDemoRole(r.role);
                    setDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-teal-50/60 transition ${
                    user?.role === r.role ? 'bg-teal-50 text-teal-900 font-bold' : 'text-slate-700'
                  }`}
                >
                  <div>
                    <p className="font-semibold">{r.label}</p>
                    <p className="text-[10px] text-slate-500">{r.desc}</p>
                  </div>
                  {user?.role === r.role && <Check className="w-4 h-4 text-teal-600" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* User profile info */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
            {user?.name?.slice(0, 1) || 'U'}
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-bold text-slate-800 leading-tight">{user?.name}</p>
            <p className="text-[10px] text-teal-600 font-semibold tracking-wide uppercase">{user?.role}</p>
          </div>
          <button
            onClick={logout}
            title="Logout"
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
