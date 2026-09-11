import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Billing, Patient, Appointment } from '../types';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { PrintInvoiceModal } from '../components/common/PrintInvoiceModal';
import {
  Receipt,
  Plus,
  Search,
  Printer,
  DollarSign,
  CreditCard,
  Calculator,
  Calendar,
  CheckCircle2,
  FileCheck
} from 'lucide-react';

export const BillingPage: React.FC = () => {
  const [bills, setBills] = useState<Billing[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);

  // Print modal
  const [selectedBill, setSelectedBill] = useState<Billing | null>(null);

  // Create Bill Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    patient_id: '',
    appointment_id: '',
    consultation_charge: 150.00,
    medicine_charge: 45.00,
    test_charge: 65.00,
    other_charge: 15.00,
    discount: 20.00,
    payment_status: 'Paid',
    payment_method: 'Credit Card'
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchBills = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/bills', {
        params: {
          search: search || undefined,
          payment_status: statusFilter !== 'ALL' ? statusFilter : undefined
        }
      });
      setBills(res.data.data);
    } catch (err) {
      console.error('Failed to load bills', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDependencies = async () => {
    try {
      const [patRes, apptRes] = await Promise.all([
        api.get('/patients?limit=100'),
        api.get('/appointments?status=Completed')
      ]);
      setPatients(patRes.data.data);
      setAppointments(apptRes.data.data);

      if (patRes.data.data[0]) {
        setFormData((prev) => ({
          ...prev,
          patient_id: patRes.data.data[0].patient_id,
          appointment_id: apptRes.data.data[0]?.appointment_id || ''
        }));
      }
    } catch (err) {
      console.error('Failed to load dependencies', err);
    }
  };

  useEffect(() => {
    fetchBills();
    fetchDependencies();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBills();
  };

  const calculatedTotal = Math.max(
    0,
    Number(formData.consultation_charge || 0) +
      Number(formData.medicine_charge || 0) +
      Number(formData.test_charge || 0) +
      Number(formData.other_charge || 0) -
      Number(formData.discount || 0)
  );

  const handleOpenCreate = () => {
    setFormData({
      patient_id: patients[0]?.patient_id || '',
      appointment_id: appointments[0]?.appointment_id || '',
      consultation_charge: 150.00,
      medicine_charge: 45.00,
      test_charge: 65.00,
      other_charge: 15.00,
      discount: 20.00,
      payment_status: 'Paid',
      payment_method: 'Credit Card'
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);
    try {
      await api.post('/bills', formData);
      setIsModalOpen(false);
      fetchBills();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to generate invoice.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (bill_id: string, newStatus: string) => {
    try {
      await api.put(`/bills/${bill_id}`, { payment_status: newStatus });
      fetchBills();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update billing status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Billing & Accounts Receivable</h1>
          <p className="text-xs text-slate-500 font-medium">
            Dynamic itemized invoice computations, payments settlement, and audit receipts
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-600/30 transition"
        >
          <Plus className="w-4 h-4" /> Generate New Bill
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by patient name or invoice ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-teal-500"
          />
        </form>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-semibold focus:outline-none focus:border-teal-500"
          >
            <option value="ALL">All Payment Statuses</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
            <option value="Partially Paid">Partially Paid</option>
          </select>
        </div>
      </div>

      {/* Bills Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-bold">Invoice # & Date</th>
                <th className="py-3 px-4 font-bold">Patient</th>
                <th className="py-3 px-4 font-bold">Itemized Breakdown</th>
                <th className="py-3 px-4 font-bold">Method</th>
                <th className="py-3 px-4 font-bold">Total Amount</th>
                <th className="py-3 px-4 font-bold">Status</th>
                <th className="py-3 px-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mb-2"></div>
                    <p>Loading hospital invoices from PostgreSQL...</p>
                  </td>
                </tr>
              ) : bills.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No billing records found matching criteria.
                  </td>
                </tr>
              ) : (
                bills.map((b) => (
                  <tr key={b.bill_id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-slate-900 text-sm">
                        INV-#{b.bill_id.slice(0, 8).toUpperCase()}
                      </span>
                      <p className="text-[11px] text-slate-400">
                        {new Date(b.bill_date).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800">
                      {b.patient?.first_name} {b.patient?.last_name}
                      <p className="text-[11px] font-normal text-slate-400">{b.patient?.phone}</p>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <div className="flex flex-wrap gap-1 text-[10px]">
                        <span className="px-1.5 py-0.5 bg-slate-100 rounded font-mono">
                          Doc: ${Number(b.consultation_charge).toFixed(0)}
                        </span>
                        {Number(b.medicine_charge) > 0 && (
                          <span className="px-1.5 py-0.5 bg-teal-50 text-teal-700 rounded font-mono">
                            Rx: ${Number(b.medicine_charge).toFixed(0)}
                          </span>
                        )}
                        {Number(b.test_charge) > 0 && (
                          <span className="px-1.5 py-0.5 bg-purple-50 text-purple-700 rounded font-mono">
                            Lab: ${Number(b.test_charge).toFixed(0)}
                          </span>
                        )}
                        {Number(b.discount) > 0 && (
                          <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded font-mono">
                            Disc: -${Number(b.discount).toFixed(0)}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-medium">{b.payment_method}</td>
                    <td className="py-3 px-4 font-mono font-black text-slate-900 text-sm">
                      ${Number(b.total_amount).toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <Badge status={b.payment_status} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <select
                          value={b.payment_status}
                          onChange={(e) => handleStatusChange(b.bill_id, e.target.value)}
                          className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:border-teal-500"
                        >
                          <option value="Paid">Paid</option>
                          <option value="Pending">Pending</option>
                          <option value="Partially Paid">Partially Paid</option>
                        </select>
                        <button
                          onClick={() => setSelectedBill(b)}
                          className="p-1.5 text-teal-600 hover:text-teal-800 hover:bg-teal-50 rounded-lg transition"
                          title="Print Formal Invoice"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Generate Invoice Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Generate Hospital Invoice"
        maxWidth="max-w-2xl"
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
                    {p.first_name} {p.last_name} ({p.phone})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Linked Appointment (Optional)</label>
              <select
                value={formData.appointment_id}
                onChange={(e) => setFormData({ ...formData, appointment_id: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-teal-500"
              >
                <option value="">-- No Direct Link --</option>
                {appointments.map((a) => (
                  <option key={a.appointment_id} value={a.appointment_id}>
                    {new Date(a.appointment_date).toLocaleDateString()} - {a.reason.slice(0, 30)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Calculator className="w-3.5 h-3.5 text-teal-600" /> Itemized Charges Calculation
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-600">Consultation ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.consultation_charge}
                  onChange={(e) => setFormData({ ...formData, consultation_charge: parseFloat(e.target.value) || 0 })}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-600">Pharmacy ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.medicine_charge}
                  onChange={(e) => setFormData({ ...formData, medicine_charge: parseFloat(e.target.value) || 0 })}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-600">Laboratory ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.test_charge}
                  onChange={(e) => setFormData({ ...formData, test_charge: parseFloat(e.target.value) || 0 })}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-600">Discount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.discount}
                  onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-emerald-700 font-bold"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
              <span className="text-xs font-bold text-slate-600">Computed Bill Total:</span>
              <span className="text-lg font-black text-teal-700 font-mono">
                ${calculatedTotal.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Payment Status *</label>
              <select
                value={formData.payment_status}
                onChange={(e) => setFormData({ ...formData, payment_status: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-teal-500"
              >
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Partially Paid">Partially Paid</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Payment Method *</label>
              <select
                value={formData.payment_method}
                onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-teal-500"
              >
                <option value="Cash">Cash</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Debit Card">Debit Card</option>
                <option value="Insurance">Insurance</option>
                <option value="UPI">UPI</option>
                <option value="Net Banking">Net Banking</option>
              </select>
            </div>
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
              {isSubmitting ? 'Calculating...' : 'Generate Invoice'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Print Modal */}
      <PrintInvoiceModal
        isOpen={Boolean(selectedBill)}
        onClose={() => setSelectedBill(null)}
        bill={selectedBill}
      />
    </div>
  );
};
