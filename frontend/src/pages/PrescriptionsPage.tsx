import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Prescription, Patient, Doctor, Medicine, Appointment } from '../types';
import { Modal } from '../components/common/Modal';
import { PrintPrescriptionModal } from '../components/common/PrintPrescriptionModal';
import {
  FileText,
  Plus,
  Trash2,
  Printer,
  Pill,
  Search,
  CheckCircle2,
  AlertCircle,
  Activity
} from 'lucide-react';

export const PrescriptionsPage: React.FC = () => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Print modal
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);

  // New Prescription Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    patient_id: '',
    doctor_id: '',
    appointment_id: '',
    diagnosis: '',
    notes: '',
    items: [
      {
        medicine_id: '',
        dosage: '1 tablet (500mg)',
        frequency: 'Twice daily after meals',
        duration: '7 days',
        instructions: 'Take with plenty of water'
      }
    ]
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPrescriptions = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/prescriptions');
      setPrescriptions(res.data.data);
    } catch (err) {
      console.error('Failed to load prescriptions', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDependencies = async () => {
    try {
      const [patRes, docRes, medRes, apptRes] = await Promise.all([
        api.get('/patients?limit=100'),
        api.get('/doctors'),
        api.get('/medicines'),
        api.get('/appointments?status=Scheduled')
      ]);
      setPatients(patRes.data.data);
      setDoctors(docRes.data.data);
      setMedicines(medRes.data.data);
      setAppointments(apptRes.data.data);

      if (patRes.data.data[0] && medRes.data.data[0]) {
        setFormData((prev) => ({
          ...prev,
          patient_id: patRes.data.data[0].patient_id,
          doctor_id: docRes.data.data[0]?.doctor_id || '',
          items: [
            {
              ...prev.items[0],
              medicine_id: medRes.data.data[0].medicine_id
            }
          ]
        }));
      }
    } catch (err) {
      console.error('Failed to load dependencies', err);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
    fetchDependencies();
  }, []);

  const handleAddItem = () => {
    if (medicines.length === 0) return;
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          medicine_id: medicines[0].medicine_id,
          dosage: '1 capsule',
          frequency: 'Once daily',
          duration: '10 days',
          instructions: 'Take in the morning'
        }
      ]
    });
  };

  const handleRemoveItem = (index: number) => {
    if (formData.items.length <= 1) return;
    setFormData({
      ...formData,
      items: formData.items.filter((_, idx) => idx !== index)
    });
  };

  const handleItemChange = (index: number, field: string, value: string) => {
    const updated = [...formData.items];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, items: updated });
  };

  const handleOpenCreate = () => {
    setFormData({
      patient_id: patients[0]?.patient_id || '',
      doctor_id: doctors[0]?.doctor_id || '',
      appointment_id: '',
      diagnosis: '',
      notes: '',
      items: [
        {
          medicine_id: medicines[0]?.medicine_id || '',
          dosage: '1 tablet (500mg)',
          frequency: 'Twice daily after meals',
          duration: '7 days',
          instructions: 'Complete entire course'
        }
      ]
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);
    try {
      await api.post('/prescriptions', formData);
      setIsModalOpen(false);
      fetchPrescriptions();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to create prescription.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Prescription Management (Rx)</h1>
          <p className="text-xs text-slate-500 font-medium">
            Multi-medicine clinical orders with automated PostgreSQL inventory decrement transactions
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-600/30 transition"
        >
          <Plus className="w-4 h-4" /> Issue New Prescription
        </button>
      </div>

      {/* Prescriptions List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mb-2"></div>
            <p className="text-xs">Loading prescriptions from PostgreSQL...</p>
          </div>
        ) : prescriptions.length === 0 ? (
          <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
            No prescriptions recorded yet.
          </div>
        ) : (
          prescriptions.map((pr) => (
            <div
              key={pr.prescription_id}
              className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">
                      {pr.patient?.first_name} {pr.patient?.last_name}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Attending: Dr. {pr.doctor?.first_name} {pr.doctor?.last_name} •{' '}
                      {new Date(pr.prescription_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-mono text-slate-400">
                    RX-#{pr.prescription_id.slice(0, 8).toUpperCase()}
                  </span>
                  <button
                    onClick={() => setSelectedPrescription(pr)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-lg text-xs font-bold border border-teal-200 transition"
                  >
                    <Printer className="w-3.5 h-3.5 text-teal-600" /> Print Prescription
                  </button>
                </div>
              </div>

              {/* Diagnosis Badge */}
              <div className="flex items-center gap-2 text-xs">
                <Activity className="w-4 h-4 text-teal-600" />
                <span className="font-bold text-slate-700">Diagnosis:</span>
                <span className="text-slate-900 font-semibold">{pr.diagnosis}</span>
              </div>

              {/* Prescribed Medicines Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {pr.items?.map((item) => (
                  <div
                    key={item.prescription_item_id}
                    className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-2.5 text-xs"
                  >
                    <Pill className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-slate-800">{item.medicine?.medicine_name}</p>
                      <p className="text-slate-600 mt-0.5">
                        {item.dosage} • {item.frequency}
                      </p>
                      <p className="text-[10px] text-teal-700 font-medium">Duration: {item.duration}</p>
                      {item.instructions && (
                        <p className="text-[10px] text-slate-400 italic">{item.instructions}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {pr.notes && (
                <div className="text-[11px] text-slate-500 italic bg-slate-50/50 p-2.5 rounded-xl">
                  Notes: {pr.notes}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Write Prescription Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Issue Medical Prescription (Rx)"
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleFormSubmit} className="space-y-6">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
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
                    {p.first_name} {p.last_name} ({p.phone})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Prescribing Doctor *</label>
              <select
                required
                value={formData.doctor_id}
                onChange={(e) => setFormData({ ...formData, doctor_id: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-teal-500"
              >
                {doctors.map((d) => (
                  <option key={d.doctor_id} value={d.doctor_id}>
                    Dr. {d.first_name} {d.last_name} ({d.specialization})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Clinical Diagnosis *</label>
            <input
              type="text"
              required
              placeholder="e.g. Acute Bronchitis with Secondary Bacterial Infection"
              value={formData.diagnosis}
              onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-teal-500"
            />
          </div>

          {/* Dynamic Medicines Section */}
          <div className="space-y-3 border-t border-slate-100 pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <Pill className="w-4 h-4 text-teal-600" />
                <span>Prescribed Medications (Many-to-Many Relational Items)</span>
              </div>
              <button
                type="button"
                onClick={handleAddItem}
                className="flex items-center gap-1 text-xs text-teal-700 font-bold hover:underline"
              >
                <Plus className="w-3.5 h-3.5" /> Add Medicine
              </button>
            </div>

            <div className="space-y-3">
              {formData.items.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-600">Medication #{idx + 1}</span>
                    {formData.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="text-slate-400 hover:text-rose-600 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-600">Medicine & Stock</label>
                      <select
                        required
                        value={item.medicine_id}
                        onChange={(e) => handleItemChange(idx, 'medicine_id', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                      >
                        {medicines.map((m) => (
                          <option key={m.medicine_id} value={m.medicine_id}>
                            {m.medicine_name} ({m.stock_quantity} in stock)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-600">Dosage</label>
                      <input
                        type="text"
                        required
                        value={item.dosage}
                        onChange={(e) => handleItemChange(idx, 'dosage', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-600">Frequency</label>
                      <input
                        type="text"
                        required
                        value={item.frequency}
                        onChange={(e) => handleItemChange(idx, 'frequency', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-600">Duration</label>
                      <input
                        type="text"
                        required
                        value={item.duration}
                        onChange={(e) => handleItemChange(idx, 'duration', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-600">Instructions</label>
                      <input
                        type="text"
                        value={item.instructions}
                        onChange={(e) => handleItemChange(idx, 'instructions', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Physician Notes (Optional)</label>
            <textarea
              rows={2}
              placeholder="Lifestyle recommendations, diet advice, follow-up..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-teal-500"
            />
          </div>

          <div className="p-3 bg-teal-50 text-teal-800 rounded-xl text-[11px] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
            <span>
              On confirmation, PostgreSQL runs an atomic transaction creating the prescription, inserting items, and deducting pharmacy inventory stock.
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
              {isSubmitting ? 'Transacting...' : 'Issue Prescription'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Print Modal */}
      <PrintPrescriptionModal
        isOpen={Boolean(selectedPrescription)}
        onClose={() => setSelectedPrescription(null)}
        prescription={selectedPrescription}
      />
    </div>
  );
};
