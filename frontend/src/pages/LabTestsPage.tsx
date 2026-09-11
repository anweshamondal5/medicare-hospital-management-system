import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { LabTest, PatientLabTest, Patient, Doctor } from '../types';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import {
  FlaskConical,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  DollarSign,
  Edit2,
  FileCheck
} from 'lucide-react';

export const LabTestsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'orders' | 'catalog'>('orders');
  const [orders, setOrders] = useState<PatientLabTest[]>([]);
  const [catalog, setCatalog] = useState<LabTest[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Order modal
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [orderForm, setOrderForm] = useState({
    patient_id: '',
    doctor_id: '',
    test_id: '',
    test_date: new Date().toISOString().split('T')[0]
  });

  // Result modal
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<PatientLabTest | null>(null);
  const [resultText, setResultText] = useState('');
  const [resultStatus, setResultStatus] = useState<'Ordered' | 'In Progress' | 'Completed'>('Completed');

  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [ordRes, catRes, patRes, docRes] = await Promise.all([
        api.get('/lab-tests/orders'),
        api.get('/lab-tests'),
        api.get('/patients?limit=100'),
        api.get('/doctors')
      ]);
      setOrders(ordRes.data.data);
      setCatalog(catRes.data.data);
      setPatients(patRes.data.data);
      setDoctors(docRes.data.data);

      if (patRes.data.data[0] && catRes.data.data[0]) {
        setOrderForm({
          patient_id: patRes.data.data[0].patient_id,
          doctor_id: docRes.data.data[0]?.doctor_id || '',
          test_id: catRes.data.data[0].test_id,
          test_date: new Date().toISOString().split('T')[0]
        });
      }
    } catch (err) {
      console.error('Failed to load lab data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);
    try {
      await api.post('/lab-tests/orders', orderForm);
      setIsOrderModalOpen(false);
      fetchData();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to order lab test.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenUpdateResult = (order: PatientLabTest) => {
    setEditingOrder(order);
    setResultText(order.result || '');
    setResultStatus(order.status);
    setFormError(null);
    setIsResultModalOpen(true);
  };

  const handleUpdateResultSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;
    setFormError(null);
    setIsSubmitting(true);
    try {
      await api.put(`/lab-tests/orders/${editingOrder.patient_lab_test_id}`, {
        result: resultText,
        status: resultStatus
      });
      setIsResultModalOpen(false);
      fetchData();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to update lab test result.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Clinical Diagnostic Laboratory</h1>
          <p className="text-xs text-slate-500 font-medium">
            Pathology tests, imaging orders, and laboratory findings ledger
          </p>
        </div>
        <button
          onClick={() => {
            setFormError(null);
            setIsOrderModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-600/30 transition"
        >
          <Plus className="w-4 h-4" /> Order Lab Procedure
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 space-x-6 text-xs font-bold text-slate-500">
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition ${
            activeTab === 'orders' ? 'border-teal-600 text-teal-700' : 'border-transparent hover:text-slate-800'
          }`}
        >
          <FlaskConical className="w-4 h-4" /> Patient Lab Orders ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('catalog')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition ${
            activeTab === 'catalog' ? 'border-teal-600 text-teal-700' : 'border-transparent hover:text-slate-800'
          }`}
        >
          <FileCheck className="w-4 h-4" /> Standard Test Catalog ({catalog.length})
        </button>
      </div>

      {/* Panel 1: Orders */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 font-bold">Order Date</th>
                  <th className="py-3 px-4 font-bold">Patient</th>
                  <th className="py-3 px-4 font-bold">Diagnostic Procedure</th>
                  <th className="py-3 px-4 font-bold">Ordering Doctor</th>
                  <th className="py-3 px-4 font-bold">Findings / Result Summary</th>
                  <th className="py-3 px-4 font-bold">Status</th>
                  <th className="py-3 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mb-2"></div>
                      <p>Loading lab orders from PostgreSQL...</p>
                    </td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500">
                      No lab test orders logged.
                    </td>
                  </tr>
                ) : (
                  orders.map((ord) => (
                    <tr key={ord.patient_lab_test_id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4 font-medium text-slate-500">
                        {new Date(ord.test_date).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-800">
                        {ord.patient?.first_name} {ord.patient?.last_name}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900">{ord.test?.test_name}</span>
                        <span className="block font-mono text-[10px] text-teal-700">
                          ${Number(ord.test?.price || 0).toFixed(2)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        Dr. {ord.doctor?.first_name} {ord.doctor?.last_name}
                      </td>
                      <td className="py-3 px-4 max-w-xs text-slate-600">
                        {ord.result || <span className="italic text-slate-400">Specimen in processing</span>}
                      </td>
                      <td className="py-3 px-4">
                        <Badge status={ord.status} />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleOpenUpdateResult(ord)}
                          className="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-lg font-semibold transition"
                        >
                          Update Result
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Panel 2: Catalog */}
      {activeTab === 'catalog' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {catalog.map((t) => (
            <div
              key={t.test_id}
              className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm space-y-2 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <h3 className="font-bold text-slate-900 text-sm">{t.test_name}</h3>
                  <span className="font-mono font-bold text-teal-700 text-sm">
                    ${Number(t.price).toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">{t.description}</p>
              </div>
              <div className="pt-3 border-t border-slate-100 text-[10px] text-slate-400 font-mono">
                Catalog ID: {t.test_id.slice(0, 8)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Order Procedure Modal */}
      <Modal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        title="Order Diagnostic Procedure"
      >
        <form onSubmit={handleCreateOrder} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs">
              {formError}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Patient *</label>
            <select
              required
              value={orderForm.patient_id}
              onChange={(e) => setOrderForm({ ...orderForm, patient_id: e.target.value })}
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
            <label className="text-xs font-bold text-slate-700">Ordering Physician *</label>
            <select
              required
              value={orderForm.doctor_id}
              onChange={(e) => setOrderForm({ ...orderForm, doctor_id: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-teal-500"
            >
              {doctors.map((d) => (
                <option key={d.doctor_id} value={d.doctor_id}>
                  Dr. {d.first_name} {d.last_name} ({d.specialization})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Select Test Catalog Procedure *</label>
            <select
              required
              value={orderForm.test_id}
              onChange={(e) => setOrderForm({ ...orderForm, test_id: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-teal-500"
            >
              {catalog.map((t) => (
                <option key={t.test_id} value={t.test_id}>
                  {t.test_name} - ${Number(t.price).toFixed(2)}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Target Date *</label>
            <input
              type="date"
              required
              value={orderForm.test_date}
              onChange={(e) => setOrderForm({ ...orderForm, test_date: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-teal-500"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsOrderModalOpen(false)}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-600/30 transition disabled:opacity-50"
            >
              {isSubmitting ? 'Ordering...' : 'Order Procedure'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Update Result Modal */}
      <Modal
        isOpen={isResultModalOpen}
        onClose={() => setIsResultModalOpen(false)}
        title="Record Laboratory Test Results"
      >
        <form onSubmit={handleUpdateResultSubmit} className="space-y-4">
          <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
            <p><strong>Patient:</strong> {editingOrder?.patient?.first_name} {editingOrder?.patient?.last_name}</p>
            <p><strong>Procedure:</strong> {editingOrder?.test?.test_name}</p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Test Status *</label>
            <select
              value={resultStatus}
              onChange={(e) => setResultStatus(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-teal-500"
            >
              <option value="Ordered">Ordered</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Findings & Physiological Metrics *</label>
            <textarea
              rows={3}
              required
              placeholder="e.g. Hemoglobin 14.2 g/dL, Platelets 280,000 /mcL, White Blood Count 6,500. No pathology detected."
              value={resultText}
              onChange={(e) => setResultText(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-teal-500"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsResultModalOpen(false)}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-600/30 transition disabled:opacity-50"
            >
              {isSubmitting ? 'Updating...' : 'Save Result'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
