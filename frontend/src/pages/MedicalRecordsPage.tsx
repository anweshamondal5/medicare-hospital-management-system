import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { MedicalRecord, Patient, Doctor } from '../types';
import { Modal } from '../components/common/Modal';
import {
  ClipboardList,
  Plus,
  Search,
  Activity,
  HeartPulse,
  User,
  Calendar,
  FileText
} from 'lucide-react';

export const MedicalRecordsPage: React.FC = () => {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Add Record Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    patient_id: '',
    doctor_id: '',
    diagnosis: '',
    symptoms: '',
    treatment: '',
    notes: ''
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchRecords = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/medical-records');
      setRecords(res.data.data);
    } catch (err) {
      console.error('Failed to load records', err);
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
      console.error('Failed to load dependencies', err);
    }
  };

  useEffect(() => {
    fetchRecords();
    fetchDependencies();
  }, []);

  const handleOpenAdd = () => {
    setFormData({
      patient_id: patients[0]?.patient_id || '',
      doctor_id: doctors[0]?.doctor_id || '',
      diagnosis: '',
      symptoms: '',
      treatment: '',
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
      await api.post('/medical-records', formData);
      setIsModalOpen(false);
      fetchRecords();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to record medical history.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Electronic Medical Records (EMR)</h1>
          <p className="text-xs text-slate-500 font-medium">
            Clinical history, symptomatology notes, and diagnosis documentation
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-600/30 transition"
        >
          <Plus className="w-4 h-4" /> Add Clinical Note
        </button>
      </div>

      {/* Records Cards List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mb-2"></div>
            <p className="text-xs">Loading clinical records from PostgreSQL...</p>
          </div>
        ) : records.length === 0 ? (
          <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
            No medical records logged.
          </div>
        ) : (
          records.map((rec) => (
            <div
              key={rec.record_id}
              className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition space-y-3"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                    <HeartPulse className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">
                      {rec.patient?.first_name} {rec.patient?.last_name}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Evaluated by Dr. {rec.doctor?.first_name} {rec.doctor?.last_name} ({rec.doctor?.specialization})
                    </p>
                  </div>
                </div>
                <div className="text-right text-xs text-slate-400">
                  <span>{new Date(rec.record_date).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="text-xs">
                <span className="font-bold text-teal-800 text-sm">{rec.diagnosis}</span>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 text-xs text-slate-600 bg-slate-50/70 p-3.5 rounded-2xl border border-slate-100">
                <div>
                  <strong className="text-slate-800 block uppercase text-[10px] tracking-wider mb-0.5">
                    Presenting Symptoms:
                  </strong>
                  <p>{rec.symptoms}</p>
                </div>
                <div>
                  <strong className="text-slate-800 block uppercase text-[10px] tracking-wider mb-0.5">
                    Prescribed Treatment Protocol:
                  </strong>
                  <p>{rec.treatment}</p>
                </div>
              </div>

              {rec.notes && (
                <div className="text-[11px] text-slate-500 italic">
                  Physician Observations: {rec.notes}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add Record Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Patient Clinical Record"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Patient *</label>
              <select
                required
                value={formData.patient_id}
                onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-teal-500"
              >
                {patients.map((p) => (
                  <option key={p.patient_id} value={p.patient_id}>
                    {p.first_name} {p.last_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Attending Physician *</label>
              <select
                required
                value={formData.doctor_id}
                onChange={(e) => setFormData({ ...formData, doctor_id: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-teal-500"
              >
                {doctors.map((d) => (
                  <option key={d.doctor_id} value={d.doctor_id}>
                    Dr. {d.first_name} {d.last_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Primary Diagnosis *</label>
            <input
              type="text"
              required
              placeholder="e.g. Type 2 Diabetes with Peripheral Neuropathy"
              value={formData.diagnosis}
              onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-teal-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Presenting Symptoms *</label>
            <textarea
              rows={2}
              required
              placeholder="Patient reported recurring numbness in extremities..."
              value={formData.symptoms}
              onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-teal-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Treatment Plan *</label>
            <textarea
              rows={2}
              required
              placeholder="Initiated metformin regimen, dietary guidance..."
              value={formData.treatment}
              onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-teal-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Clinical Observations & Vitals</label>
            <input
              type="text"
              placeholder="BP: 124/80 mmHg, Pulse: 70 bpm, Temp: 98.4 F"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-teal-500"
            />
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
              {isSubmitting ? 'Recording...' : 'Save Clinical Record'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
