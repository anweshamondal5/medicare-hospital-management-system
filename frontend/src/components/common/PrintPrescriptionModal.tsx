import React from 'react';
import { Prescription } from '../../types';
import { Modal } from './Modal';
import { Printer, Cross, Activity, Pill, ShieldCheck } from 'lucide-react';

interface PrintPrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  prescription: Prescription | null;
}

export const PrintPrescriptionModal: React.FC<PrintPrescriptionModalProps> = ({
  isOpen,
  onClose,
  prescription
}) => {
  if (!prescription) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Medical Prescription (Rx)" maxWidth="max-w-3xl">
      <div className="space-y-6">
        <div className="flex justify-end no-print">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium shadow-sm transition"
          >
            <Printer className="w-4 h-4" /> Print Prescription
          </button>
        </div>

        {/* Printable Rx Card */}
        <div className="p-8 border border-slate-200 rounded-xl bg-white text-slate-800 space-y-6 print-card">
          {/* Clinic Header */}
          <div className="flex justify-between items-start border-b-2 border-teal-600 pb-4">
            <div>
              <div className="flex items-center gap-2 text-teal-600">
                <Cross className="w-6 h-6 fill-current" />
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">MediCare HMS</h2>
              </div>
              <p className="text-xs text-slate-500 font-medium">Department of Clinical Medicine & Therapeutics</p>
              <p className="text-xs text-slate-400">Main Block, 100 Health Avenue, Metro City</p>
            </div>
            <div className="text-right">
              <p className="text-base font-bold text-slate-900">
                Dr. {prescription.doctor?.first_name} {prescription.doctor?.last_name}
              </p>
              <p className="text-xs text-teal-700 font-medium">{prescription.doctor?.specialization}</p>
              <p className="text-xs text-slate-500">License: {prescription.doctor?.license_number}</p>
              <p className="text-xs text-slate-400 mt-1">Date: {new Date(prescription.prescription_date).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Patient Details */}
          <div className="grid grid-cols-4 gap-4 bg-slate-50 p-4 rounded-lg text-xs border border-slate-100">
            <div>
              <span className="text-slate-400 block font-semibold uppercase">Patient Name</span>
              <span className="font-bold text-slate-800 text-sm">
                {prescription.patient?.first_name} {prescription.patient?.last_name}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block font-semibold uppercase">Gender / Blood</span>
              <span className="font-medium text-slate-700">
                {prescription.patient?.gender} • {prescription.patient?.blood_group}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block font-semibold uppercase">Phone</span>
              <span className="font-medium text-slate-700">{prescription.patient?.phone}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-semibold uppercase">Prescription ID</span>
              <span className="font-mono text-slate-600">RX-#{prescription.prescription_id.slice(0, 8).toUpperCase()}</span>
            </div>
          </div>

          {/* Clinical Assessment */}
          <div className="bg-teal-50/50 p-3.5 rounded-lg border border-teal-100 text-xs">
            <span className="font-bold text-teal-900 uppercase flex items-center gap-1.5 mb-1">
              <Activity className="w-4 h-4 text-teal-600" /> Clinical Assessment & Diagnosis:
            </span>
            <p className="text-slate-800 text-sm font-medium">{prescription.diagnosis}</p>
          </div>

          {/* Rx Icon & Medication List */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-teal-700 font-serif text-3xl font-black italic">
              <span>&#8478;</span>
              <span className="text-xs font-sans not-italic font-bold uppercase tracking-wider text-slate-400">
                Prescribed Medications
              </span>
            </div>

            <table className="w-full text-left text-sm border border-slate-200 rounded-lg overflow-hidden">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Medicine & Strength</th>
                  <th className="py-2.5 px-3">Dosage</th>
                  <th className="py-2.5 px-3">Frequency</th>
                  <th className="py-2.5 px-3">Duration</th>
                  <th className="py-2.5 px-3">Instructions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {prescription.items?.map((item, idx) => (
                  <tr key={item.prescription_item_id || idx} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 font-bold text-slate-400">{idx + 1}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900 flex items-center gap-1.5">
                      <Pill className="w-3.5 h-3.5 text-teal-600" />
                      {item.medicine?.medicine_name || 'Standard Rx Item'}
                    </td>
                    <td className="py-2.5 px-3">{item.dosage}</td>
                    <td className="py-2.5 px-3">{item.frequency}</td>
                    <td className="py-2.5 px-3 font-semibold text-teal-700">{item.duration}</td>
                    <td className="py-2.5 px-3 text-slate-500 italic">{item.instructions || 'As directed'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Doctor Instructions & Signature Block */}
          {prescription.notes && (
            <div className="text-xs bg-slate-50 p-3 rounded-lg text-slate-600 border border-slate-100">
              <span className="font-bold text-slate-700 block mb-1">Doctor's Special Instructions:</span>
              <p>{prescription.notes}</p>
            </div>
          )}

          <div className="pt-8 flex justify-between items-end border-t border-slate-200 text-xs">
            <div className="text-slate-400 space-y-1">
              <p className="flex items-center gap-1 text-emerald-600 font-medium">
                <ShieldCheck className="w-4 h-4" /> Digitally Authenticated E-Prescription
              </p>
              <p>Generated by MediCare Relational Clinical Decision System</p>
            </div>

            <div className="text-center w-56">
              <div className="border-b border-slate-400 pb-2 mb-1">
                <span className="font-serif italic text-teal-800 font-bold text-base">
                  Dr. {prescription.doctor?.first_name} {prescription.doctor?.last_name}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Physician Signature & Stamp</p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
