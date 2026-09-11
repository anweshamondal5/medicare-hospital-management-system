import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { Patient, Prescription, Billing } from '../types';
import { Badge } from '../components/common/Badge';
import { PrintInvoiceModal } from '../components/common/PrintInvoiceModal';
import { PrintPrescriptionModal } from '../components/common/PrintPrescriptionModal';
import {
  ArrowLeft,
  Calendar,
  ClipboardList,
  FileText,
  FlaskConical,
  Receipt,
  Phone,
  Mail,
  MapPin,
  Printer
} from 'lucide-react';

export const PatientDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [activeTab, setActiveTab] = useState<'appointments' | 'records' | 'prescriptions' | 'labTests' | 'billing'>('appointments');
  const [isLoading, setIsLoading] = useState(true);

  // Print Modals
  const [selectedBill, setSelectedBill] = useState<Billing | null>(null);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const res = await api.get(`/patients/${id}`);
        setPatient(res.data.data);
      } catch (err) {
        console.error('Failed to load patient detail', err);
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchPatient();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="p-8 text-center text-slate-500">
        Patient record not found.
      </div>
    );
  }

  const birthYear = new Date(patient.date_of_birth).getFullYear();
  const age = new Date().getFullYear() - birthYear;

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <Link
        to="/patients"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 hover:text-teal-800 transition"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Patient Directory
      </Link>

      {/* Patient Header Card */}
      <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-teal-600/30">
            {patient.first_name[0]}{patient.last_name[0]}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-slate-900">
                {patient.first_name} {patient.last_name}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                {patient.blood_group}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-1">
              <span>{patient.gender}, {age} years old</span>
              <span>•</span>
              <span className="font-mono text-slate-400">ID: {patient.patient_id}</span>
              <span>•</span>
              <span>Registered: {new Date(patient.registration_date).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs text-slate-600 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 font-medium text-slate-700">
              <Phone className="w-3.5 h-3.5 text-teal-600" /> {patient.phone}
            </div>
            <div className="flex items-center gap-1.5 text-slate-500">
              <Mail className="w-3.5 h-3.5 text-slate-400" /> {patient.email}
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-slate-500">
              <MapPin className="w-3.5 h-3.5 text-slate-400" /> {patient.address}
            </div>
            <div className="text-[11px] text-slate-400">
              Emergency: <strong className="text-slate-600">{patient.emergency_contact}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 space-x-6 text-xs font-bold text-slate-500">
        <button
          onClick={() => setActiveTab('appointments')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition ${
            activeTab === 'appointments'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent hover:text-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" /> Appointments ({patient.appointments?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('records')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition ${
            activeTab === 'records'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent hover:text-slate-800'
          }`}
        >
          <ClipboardList className="w-4 h-4" /> Medical Records ({patient.medical_records?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('prescriptions')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition ${
            activeTab === 'prescriptions'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" /> Prescriptions ({patient.prescriptions?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('labTests')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition ${
            activeTab === 'labTests'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent hover:text-slate-800'
          }`}
        >
          <FlaskConical className="w-4 h-4" /> Lab Tests ({patient.patient_lab_tests?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('billing')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition ${
            activeTab === 'billing'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent hover:text-slate-800'
          }`}
        >
          <Receipt className="w-4 h-4" /> Invoices & Billing ({patient.billings?.length || 0})
        </button>
      </div>

      {/* Tab Panels */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 min-h-[350px]">
        {/* Appointments Tab */}
        {activeTab === 'appointments' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800">Consultation Schedule History</h3>
            {patient.appointments?.length === 0 ? (
              <p className="text-xs text-slate-400 py-8 text-center">No appointment records found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase border-b border-slate-100">
                    <tr>
                      <th className="py-2.5 px-3">Date & Time</th>
                      <th className="py-2.5 px-3">Attending Physician</th>
                      <th className="py-2.5 px-3">Specialization & Dept</th>
                      <th className="py-2.5 px-3">Reason</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {patient.appointments?.map((a) => (
                      <tr key={a.appointment_id} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-semibold text-slate-900">
                          {new Date(a.appointment_date).toLocaleDateString()} at {a.appointment_time}
                        </td>
                        <td className="py-2.5 px-3 font-medium">
                          Dr. {a.doctor?.first_name} {a.doctor?.last_name}
                        </td>
                        <td className="py-2.5 px-3 text-slate-500">
                          {a.doctor?.specialization} ({a.doctor?.department?.department_name})
                        </td>
                        <td className="py-2.5 px-3">{a.reason}</td>
                        <td className="py-2.5 px-3">
                          <Badge status={a.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Medical Records Tab */}
        {activeTab === 'records' && (
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-slate-800">Chronological Clinical Journey</h3>
            {patient.medical_records?.length === 0 ? (
              <p className="text-xs text-slate-400 py-8 text-center">No medical record entries logged.</p>
            ) : (
              <div className="space-y-4">
                {patient.medical_records?.map((rec) => (
                  <div key={rec.record_id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{rec.diagnosis}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          • {new Date(rec.record_date).toLocaleDateString()}
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-teal-700">
                        Dr. {rec.doctor?.first_name} {rec.doctor?.last_name}
                      </span>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4 text-xs pt-2 text-slate-600">
                      <div>
                        <strong className="text-slate-800 block text-[11px] uppercase">Symptoms Reported:</strong>
                        <p>{rec.symptoms}</p>
                      </div>
                      <div>
                        <strong className="text-slate-800 block text-[11px] uppercase">Treatment Protocol:</strong>
                        <p>{rec.treatment}</p>
                      </div>
                    </div>
                    {rec.notes && (
                      <p className="text-[11px] text-slate-500 italic pt-1 border-t border-slate-200/60">
                        Notes: {rec.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Prescriptions Tab */}
        {activeTab === 'prescriptions' && (
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-slate-800">Prescription Records</h3>
            {patient.prescriptions?.length === 0 ? (
              <p className="text-xs text-slate-400 py-8 text-center">No prescriptions written yet.</p>
            ) : (
              <div className="space-y-4">
                {patient.prescriptions?.map((pr) => (
                  <div key={pr.prescription_id} className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{pr.diagnosis}</p>
                        <p className="text-xs text-slate-500">
                          Prescribed by Dr. {pr.doctor?.first_name} {pr.doctor?.last_name} on{' '}
                          {new Date(pr.prescription_date).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={() => setSelectedPrescription({ ...pr, patient })}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-lg text-xs font-bold border border-teal-200 transition"
                      >
                        <Printer className="w-3.5 h-3.5 text-teal-600" /> Print Rx
                      </button>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3 text-xs">
                      {pr.items?.map((item) => (
                        <div key={item.prescription_item_id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                          <p className="font-bold text-slate-800">{item.medicine?.medicine_name}</p>
                          <p className="text-[11px] text-slate-500">
                            {item.dosage} • {item.frequency} for {item.duration}
                          </p>
                          {item.instructions && (
                            <p className="text-[10px] text-teal-700 italic mt-0.5">{item.instructions}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Lab Tests Tab */}
        {activeTab === 'labTests' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800">Diagnostic Laboratory Results</h3>
            {patient.patient_lab_tests?.length === 0 ? (
              <p className="text-xs text-slate-400 py-8 text-center">No lab test orders logged.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase border-b border-slate-100">
                    <tr>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Test Procedure</th>
                      <th className="py-2.5 px-3">Ordering Doctor</th>
                      <th className="py-2.5 px-3">Findings / Results</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {patient.patient_lab_tests?.map((lt) => (
                      <tr key={lt.patient_lab_test_id} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 text-slate-500">
                          {new Date(lt.test_date).toLocaleDateString()}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">{lt.test?.test_name}</td>
                        <td className="py-2.5 px-3 text-slate-600">
                          Dr. {lt.doctor?.first_name} {lt.doctor?.last_name}
                        </td>
                        <td className="py-2.5 px-3 max-w-xs text-slate-600">{lt.result || 'Pending evaluation'}</td>
                        <td className="py-2.5 px-3">
                          <Badge status={lt.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Billing Tab */}
        {activeTab === 'billing' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800">Invoices & Financial Ledger</h3>
            {patient.billings?.length === 0 ? (
              <p className="text-xs text-slate-400 py-8 text-center">No billing records found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase border-b border-slate-100">
                    <tr>
                      <th className="py-2.5 px-3">Bill Date</th>
                      <th className="py-2.5 px-3">Invoice #</th>
                      <th className="py-2.5 px-3">Consultation</th>
                      <th className="py-2.5 px-3">Medicines</th>
                      <th className="py-2.5 px-3">Total Amount</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Invoice</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {patient.billings?.map((b) => (
                      <tr key={b.bill_id} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 text-slate-500">
                          {new Date(b.bill_date).toLocaleDateString()}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-700">
                          INV-{b.bill_id.slice(0, 8).toUpperCase()}
                        </td>
                        <td className="py-2.5 px-3 font-mono">${Number(b.consultation_charge).toFixed(2)}</td>
                        <td className="py-2.5 px-3 font-mono">${Number(b.medicine_charge).toFixed(2)}</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                          ${Number(b.total_amount).toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3">
                          <Badge status={b.payment_status} />
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => setSelectedBill({ ...b, patient })}
                            className="p-1.5 text-teal-600 hover:text-teal-800 hover:bg-teal-50 rounded-lg transition inline-flex items-center gap-1 font-bold"
                          >
                            <Printer className="w-3.5 h-3.5" /> Print
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Print Modals */}
      <PrintInvoiceModal
        isOpen={Boolean(selectedBill)}
        onClose={() => setSelectedBill(null)}
        bill={selectedBill}
      />
      <PrintPrescriptionModal
        isOpen={Boolean(selectedPrescription)}
        onClose={() => setSelectedPrescription(null)}
        prescription={selectedPrescription}
      />
    </div>
  );
};
