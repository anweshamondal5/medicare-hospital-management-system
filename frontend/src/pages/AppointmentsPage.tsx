import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Appointment, Patient, Doctor } from '../types';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import {
  Calendar,
  Clock,
  Plus,
  Search,
  Filter,
  AlertCircle,
  CheckCircle,
  XCircle,
  User,
  CalendarCheck
} from 'lucide-react';

export const AppointmentsPage: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    patient_id: '',
    doctor_id: '',
    appointment_date: new Date().toISOString().split('T')[0],
    appointment_time: '10:00 AM',
    reason: '',
    notes: ''
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const timeSlots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
    '11:00 AM', '11:30 AM', '02:00 PM', '02:30 PM',
    '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM'
  ];

  const fetchAppointments = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/appointments', {
        params: {
          search: search || undefined,
          status: statusFilter !== 'ALL' ? statusFilter : undefined,
          date: dateFilter || undefined
        }
      });
      setAppointments(res.data.data);
    } catch (err) {
      console.error('Failed to load appointments', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDependencies = async () => {
    try {
      const [patRes, docRes] = await Promise.all([
        api.get('/patients?limit=100'),
        api.get('/doctors')
      ]);
      setPatients(patRes.data.data);
      setDoctors(docRes.data.data);
      if (patRes.data.data[0]) {
        setFormData((prev) => ({
          ...prev,
          patient_id: patRes.data.data[0].patient_id,
          doctor_id: docRes.data.data[0]?.doctor_id || ''
        }));
      }
    } catch (err) {
      console.error('Failed to load dependency lists', err);
    }
  };

  useEffect(() => {
    fetchAppointments();
    fetchDependencies();
  }, [statusFilter, dateFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAppointments();
  };

  const handleOpenSchedule = () => {
    setFormData({
      patient_id: patients[0]?.patient_id || '',
      doctor_id: doctors[0]?.doctor_id || '',
      appointment_date: new Date().toISOString().split('T')[0],
      appointment_time: '10:00 AM',
      reason: '',
      notes: ''
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);
    try {
      await api.post('/appointments', formData);
      setIsModalOpen(false);
      fetchAppointments();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to schedule appointment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (appointment_id: string, newStatus: string) => {
    try {
      await api.put(`/appointments/${appointment_id}`, { status: newStatus });
      fetchAppointments();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Appointment Scheduling</h1>
          <p className="text-xs text-slate-500 font-medium">
            Clinical consultations with automatic double-booking conflict detection
          </p>
        </div>
        <button
          onClick={handleOpenSchedule}
          className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-600/30 transition"
        >
          <Plus className="w-4 h-4" /> Book Appointment
        </button>
      </div>

      {/* Filter Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by patient, physician, or reason..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-teal-500"
          />
        </form>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-semibold focus:outline-none focus:border-teal-500"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-semibold focus:outline-none focus:border-teal-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
            <option value="No Show">No Show</option>
          </select>
        </div>
      </div>

      {/* Appointments Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-bold">Appointment Date & Time</th>
                <th className="py-3 px-4 font-bold">Patient</th>
                <th className="py-3 px-4 font-bold">Physician & Specialty</th>
                <th className="py-3 px-4 font-bold">Consultation Purpose</th>
                <th className="py-3 px-4 font-bold">Current Status</th>
                <th className="py-3 px-4 font-bold text-right">Update Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600 mb-2"></div>
                    <p>Loading schedule from PostgreSQL...</p>
                  </td>
                </tr>
              ) : appointments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No scheduled appointments found matching criteria.
                  </td>
                </tr>
              ) : (
                appointments.map((a) => (
                  <tr key={a.appointment_id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 text-sm">
                        {new Date(a.appointment_date).toLocaleDateString()}
                      </div>
                      <div className="text-[11px] font-semibold text-teal-700 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {a.appointment_time}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800">
                        {a.patient?.first_name} {a.patient?.last_name}
                      </div>
                      <div className="text-[11px] text-slate-400">{a.patient?.phone}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">
                        Dr. {a.doctor?.first_name} {a.doctor?.last_name}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {a.doctor?.specialization} ({a.doctor?.department?.department_name})
                      </div>
                    </td>
                    <td className="py-3 px-4 max-w-xs text-slate-600">
                      <p className="truncate font-medium">{a.reason}</p>
                      {a.notes && <p className="text-[10px] text-slate-400 italic truncate">{a.notes}</p>}
                    </td>
                    <td className="py-3 px-4">
                      <Badge status={a.status} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <select
                        value={a.status}
                        onChange={(e) => handleStatusChange(a.appointment_id, e.target.value)}
                        className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:border-teal-500"
                      >
                        <option value="Scheduled">Scheduled</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                        <option value="No Show">No Show</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Schedule Appointment Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Schedule Patient Consultation"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Select Patient *</label>
            <select
              required
              value={formData.patient_id}
              onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-teal-500"
            >
              {patients.map((p) => (
                <option key={p.patient_id} value={p.patient_id}>
                  {p.first_name} {p.last_name} ({p.phone}) - ID: {p.patient_id.slice(0, 8)}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Select Doctor *</label>
            <select
              required
              value={formData.doctor_id}
              onChange={(e) => setFormData({ ...formData, doctor_id: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-teal-500"
            >
              {doctors.map((d) => (
                <option key={d.doctor_id} value={d.doctor_id}>
                  Dr. {d.first_name} {d.last_name} - {d.specialization} (${Number(d.consultation_fee).toFixed(2)})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Appointment Date *</label>
              <input
                type="date"
                required
                value={formData.appointment_date}
                onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-teal-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Time Slot *</label>
              <select
                value={formData.appointment_time}
                onChange={(e) => setFormData({ ...formData, appointment_time: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-teal-500"
              >
                {timeSlots.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Reason for Visit *</label>
            <input
              type="text"
              required
              placeholder="e.g. Hypertension follow-up, Routine wellness examination"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-teal-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Clinical Notes (Optional)</label>
            <textarea
              rows={2}
              placeholder="Special instructions or pre-consultation requirements..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-teal-500"
            />
          </div>

          <div className="p-3 rounded-xl bg-teal-50/70 border border-teal-200/80 text-[11px] text-teal-800 flex items-center gap-2">
            <CalendarCheck className="w-4 h-4 text-teal-600 shrink-0" />
            <span>
              Conflict validation checks the PostgreSQL unique constraint on (doctor_id, appointment_date, appointment_time).
            </span>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-600/30 transition disabled:opacity-50"
            >
              {isSubmitting ? 'Verifying...' : 'Confirm Schedule'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
