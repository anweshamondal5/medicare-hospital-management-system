import React from 'react';
import { Billing } from '../../types';
import { Modal } from './Modal';
import { Printer, Building2, Calendar, CreditCard, ShieldCheck } from 'lucide-react';

interface PrintInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  bill: Billing | null;
}

export const PrintInvoiceModal: React.FC<PrintInvoiceModalProps> = ({ isOpen, onClose, bill }) => {
  if (!bill) return null;

  const handlePrint = () => {
    window.print();
  };

  const consultation = Number(bill.consultation_charge || 0);
  const medicine = Number(bill.medicine_charge || 0);
  const test = Number(bill.test_charge || 0);
  const other = Number(bill.other_charge || 0);
  const discount = Number(bill.discount || 0);
  const total = Number(bill.total_amount || 0);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Hospital Invoice & Bill Summary" maxWidth="max-w-3xl">
      <div className="space-y-6">
        <div className="flex justify-end no-print">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium shadow-sm transition"
          >
            <Printer className="w-4 h-4" /> Print Invoice
          </button>
        </div>

        {/* Printable Invoice Container */}
        <div className="p-8 border border-slate-200 rounded-xl bg-white text-slate-800 space-y-6 print-card">
          {/* Header */}
          <div className="flex justify-between items-start border-b border-slate-200 pb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-teal-600 text-white rounded-xl">
                <Building2 className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">MediCare HMS</h2>
                <p className="text-xs text-slate-500 font-medium">Metropolitan Healthcare & Academic Medical Center</p>
                <p className="text-xs text-slate-400">100 Health Avenue, Metro City • Emergency: (555) 0199</p>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-md bg-teal-50 text-teal-700 border border-teal-200">
                Official Receipt
              </span>
              <p className="text-sm font-mono font-bold text-slate-700 mt-2">
                INV-#{bill.bill_id.slice(0, 8).toUpperCase()}
              </p>
              <p className="text-xs text-slate-500">Date: {new Date(bill.bill_date).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Patient & Doctor Info */}
          <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg text-xs">
            <div>
              <p className="text-slate-400 font-semibold uppercase">Patient Details</p>
              <p className="text-sm font-bold text-slate-800 mt-1">
                {bill.patient?.first_name} {bill.patient?.last_name}
              </p>
              <p className="text-slate-600">Patient ID: {bill.patient?.patient_id.slice(0, 8)}</p>
              <p className="text-slate-600">Phone: {bill.patient?.phone}</p>
              <p className="text-slate-600">Blood Group: {bill.patient?.blood_group}</p>
            </div>
            <div>
              <p className="text-slate-400 font-semibold uppercase">Attending Specialist</p>
              <p className="text-sm font-bold text-slate-800 mt-1">
                Dr. {bill.appointment?.doctor?.first_name} {bill.appointment?.doctor?.last_name}
              </p>
              <p className="text-slate-600">{bill.appointment?.doctor?.specialization}</p>
              <p className="text-slate-600">Dept: {bill.appointment?.doctor?.department?.department_name || 'Clinical'}</p>
            </div>
          </div>

          {/* Itemized Charges Table */}
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                <th className="py-2.5">Item Description</th>
                <th className="py-2.5">Category</th>
                <th className="py-2.5 text-right">Amount (USD)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr>
                <td className="py-2.5 font-medium">Physician Consultation Fee</td>
                <td className="py-2.5 text-xs text-slate-500">Professional Services</td>
                <td className="py-2.5 text-right font-mono">${consultation.toFixed(2)}</td>
              </tr>
              {medicine > 0 && (
                <tr>
                  <td className="py-2.5 font-medium">Prescribed Pharmacy Dispensary</td>
                  <td className="py-2.5 text-xs text-slate-500">Medications</td>
                  <td className="py-2.5 text-right font-mono">${medicine.toFixed(2)}</td>
                </tr>
              )}
              {test > 0 && (
                <tr>
                  <td className="py-2.5 font-medium">Clinical Laboratory & Diagnostic Procedures</td>
                  <td className="py-2.5 text-xs text-slate-500">Diagnostics</td>
                  <td className="py-2.5 text-right font-mono">${test.toFixed(2)}</td>
                </tr>
              )}
              {other > 0 && (
                <tr>
                  <td className="py-2.5 font-medium">Hospital Facility & Consumables</td>
                  <td className="py-2.5 text-xs text-slate-500">Administrative</td>
                  <td className="py-2.5 text-right font-mono">${other.toFixed(2)}</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Totals */}
          <div className="border-t border-slate-200 pt-4 flex justify-between items-start">
            <div className="space-y-1 text-xs text-slate-500">
              <p className="flex items-center gap-1.5 font-medium text-slate-700">
                <CreditCard className="w-4 h-4 text-teal-600" /> Payment Method: {bill.payment_method}
              </p>
              <p>Payment Status: <span className="font-bold text-slate-800">{bill.payment_status}</span></p>
              <p className="flex items-center gap-1 text-emerald-600 font-medium">
                <ShieldCheck className="w-3.5 h-3.5" /> Verified Electronic Hospital Transaction
              </p>
            </div>

            <div className="w-64 space-y-2 text-right text-sm">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal:</span>
                <span className="font-mono">${(consultation + medicine + test + other).toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Institutional Discount:</span>
                  <span className="font-mono">-${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-black text-slate-900 border-t border-slate-200 pt-2">
                <span>Total Due:</span>
                <span className="font-mono text-teal-700">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Footer Notes */}
          <div className="border-t border-slate-100 pt-4 text-center text-[10px] text-slate-400">
            Thank you for choosing MediCare Hospital. For billing inquiries, contact billing@medicare.demo.
          </div>
        </div>
      </div>
    </Modal>
  );
};
