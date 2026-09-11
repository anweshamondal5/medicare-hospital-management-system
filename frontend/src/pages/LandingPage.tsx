import React from 'react';
import { Link } from 'react-router-dom';
import {
  Cross,
  Database,
  ShieldCheck,
  Activity,
  Calendar,
  Pill,
  Receipt,
  FileCheck2,
  ArrowRight,
  Sparkles,
  Server,
  Layers
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col selection:bg-teal-500 selection:text-white">
      {/* Top Banner Navigation */}
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-md shadow-teal-600/20">
              <Cross className="w-5 h-5 fill-current" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-slate-900">MediCare</span>
              <span className="text-xs text-teal-600 block font-semibold leading-none">Hospital Operations DBMS</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-teal-700 hover:bg-slate-100 rounded-lg transition"
            >
              Sign In
            </Link>
            <Link
              to="/login"
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm shadow-teal-600/30 transition"
            >
              <span>Launch Live System</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-6 max-w-7xl mx-auto text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-teal-600" />
          <span>Full-Stack College DBMS Capstone Architecture</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight">
          MediCare — Hospital Management System
        </h1>
        <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto font-normal">
          A Full-Stack Database Management System for Hospital Operations.
          Backed by a normalized 3NF PostgreSQL database, Express REST API, and modern clinical workflow interfaces.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link
            to="/login"
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-lg shadow-teal-600/30 transition transform hover:-translate-y-0.5"
          >
            <span>Explore Demo Prototype</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="#architecture"
            className="px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold text-sm shadow-sm transition"
          >
            Review DBMS Concepts
          </a>
        </div>

        {/* Live Metrics Showcase Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-10 text-left">
          <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
            <span className="text-2xl font-black text-teal-600">3NF</span>
            <p className="text-xs font-bold text-slate-800 mt-1">Normalized Relations</p>
            <p className="text-[11px] text-slate-500">Zero redundant data anomalies</p>
          </div>
          <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
            <span className="text-2xl font-black text-blue-600">12 Entities</span>
            <p className="text-xs font-bold text-slate-800 mt-1">Full Relational Schema</p>
            <p className="text-[11px] text-slate-500">Patients, Doctors, Rx, Billing</p>
          </div>
          <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
            <span className="text-2xl font-black text-emerald-600">PostgreSQL</span>
            <p className="text-xs font-bold text-slate-800 mt-1">Enterprise Relational DB</p>
            <p className="text-[11px] text-slate-500">Foreign keys, Triggers & Views</p>
          </div>
          <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
            <span className="text-2xl font-black text-purple-600">RBAC</span>
            <p className="text-xs font-bold text-slate-800 mt-1">Role-Based Access</p>
            <p className="text-[11px] text-slate-500">Admin, Doctor & Receptionist</p>
          </div>
        </div>
      </section>

      {/* Features Overview */}
      <section id="architecture" className="py-16 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Core Hospital Clinical Operations
            </h2>
            <p className="text-sm text-slate-500">
              Complete end-to-end patient care lifecycle seamlessly mapped to normalized relational entities.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Conflict-Free Appointments</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Smart scheduling algorithm and PostgreSQL uniqueness constraints prevent doctor double-booking across identical time slots.
              </p>
            </div>

            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                <Pill className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Pharmacy & Stock Decrement</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Many-to-many prescription items automatically deduct inventory in real-time within atomic database transactions.
              </p>
            </div>

            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <Receipt className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Itemized Hospital Billing</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Automatic calculation of consultations, dispensed medications, diagnostic lab procedures, discounts, and printable invoices.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 border-t border-slate-200 text-center text-xs text-slate-500">
        <p className="font-semibold text-slate-700">MediCare — Hospital Management System (HMS)</p>
        <p className="text-[11px] text-slate-400 mt-1">College DBMS Practical Project • Built with React, Node.js, Express, TypeScript, and PostgreSQL</p>
      </footer>
    </div>
  );
};
