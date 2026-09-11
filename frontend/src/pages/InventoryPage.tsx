import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Medicine } from '../types';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import {
  Pill,
  Search,
  Plus,
  Filter,
  AlertTriangle,
  Calendar,
  DollarSign,
  Package,
  Edit2,
  Building,
  Clock
} from 'lucide-react';

export const InventoryPage: React.FC = () => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [lowStockFilter, setLowStockFilter] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [formData, setFormData] = useState({
    medicine_name: '',
    category: 'Cardiovascular',
    manufacturer: '',
    unit_price: 25.00,
    stock_quantity: 100,
    expiry_date: '2028-06-30',
    description: ''
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    'Antibiotic',
    'Cardiovascular',
    'Antidiabetic',
    'Gastroenterology',
    'Analgesic & NSAID',
    'Endocrinology',
    'Respiratory',
    'Neurology',
    'Corticosteroid',
    'Psychiatry',
    'Antihistamine'
  ];

  const fetchMedicines = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/medicines', {
        params: {
          search: search || undefined,
          category: categoryFilter !== 'ALL' ? categoryFilter : undefined,
          low_stock: lowStockFilter ? 'true' : undefined
        }
      });
      setMedicines(res.data.data);
    } catch (err) {
      console.error('Failed to load medicines', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, [categoryFilter, lowStockFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMedicines();
  };

  const handleOpenAdd = () => {
    setEditingMedicine(null);
    setFormData({
      medicine_name: '',
      category: 'Cardiovascular',
      manufacturer: '',
      unit_price: 25.00,
      stock_quantity: 100,
      expiry_date: '2028-06-30',
      description: ''
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (med: Medicine) => {
    setEditingMedicine(med);
    setFormData({
      medicine_name: med.medicine_name,
      category: med.category,
      manufacturer: med.manufacturer,
      unit_price: Number(med.unit_price),
      stock_quantity: med.stock_quantity,
      expiry_date: new Date(med.expiry_date).toISOString().split('T')[0],
      description: med.description || ''
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);
    try {
      if (editingMedicine) {
        await api.put(`/medicines/${editingMedicine.medicine_id}`, formData);
      } else {
        await api.post('/medicines', formData);
      }
      setIsModalOpen(false);
      fetchMedicines();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to save medicine.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Pharmacy & Medicine Inventory</h1>
          <p className="text-xs text-slate-500 font-medium">
            Pharmaceutical catalog, unit pricing, batch tracking, and automatic stock depletion
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-600/30 transition"
        >
          <Plus className="w-4 h-4" /> Add Medication
        </button>
      </div>

      {/* Filter Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by medicine name, manufacturer, or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-teal-500"
          />
        </form>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-semibold focus:outline-none focus:border-teal-500"
          >
            <option value="ALL">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setLowStockFilter(!lowStockFilter)}
            className={`px-3 py-2 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 ${
              lowStockFilter
                ? 'bg-rose-50 border-rose-300 text-rose-700'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Low Stock Only</span>
          </button>
        </div>
      </div>

      {/* Medicines Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-bold">Medicine Details</th>
                <th className="py-3 px-4 font-bold">Category</th>
                <th className="py-3 px-4 font-bold">Manufacturer</th>
                <th className="py-3 px-4 font-bold">Unit Price</th>
                <th className="py-3 px-4 font-bold">Stock Remaining</th>
                <th className="py-3 px-4 font-bold">Expiry Date</th>
                <th className="py-3 px-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600 mb-2"></div>
                    <p>Loading pharmacy inventory from PostgreSQL...</p>
                  </td>
                </tr>
              ) : medicines.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No medications found matching search criteria.
                  </td>
                </tr>
              ) : (
                medicines.map((m) => {
                  const isLow = m.stock_quantity <= 20;
                  const isCritical = m.stock_quantity <= 10;
                  const expiry = new Date(m.expiry_date);
                  const isExpiringSoon = expiry.getTime() - Date.now() < 90 * 86400000;

                  return (
                    <tr key={m.medicine_id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                          <Pill className="w-4 h-4 text-teal-600 shrink-0" />
                          <span>{m.medicine_name}</span>
                        </div>
                        {m.description && (
                          <div className="text-[11px] text-slate-400 truncate max-w-xs ml-6">
                            {m.description}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-medium">{m.category}</td>
                      <td className="py-3 px-4 text-slate-500">{m.manufacturer}</td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">
                        ${Number(m.unit_price).toFixed(2)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-mono font-bold ${
                              isCritical ? 'text-rose-600' : isLow ? 'text-amber-600' : 'text-slate-800'
                            }`}
                          >
                            {m.stock_quantity}
                          </span>
                          {isCritical ? (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                              Critical
                            </span>
                          ) : isLow ? (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                              Low
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">
                              In Stock
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        <div className="flex items-center gap-1">
                          <span>{expiry.toLocaleDateString()}</span>
                          {isExpiringSoon && (
                            <span title="Expiring within 90 days">
                              <Clock className="w-3.5 h-3.5 text-amber-500" />
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleOpenEdit(m)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                          title="Edit Stock or Details"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Medicine Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingMedicine ? 'Update Medicine Stock' : 'Add Medication to Inventory'}
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Medicine Name & Strength *</label>
              <input
                type="text"
                required
                placeholder="e.g. Amoxicillin 500mg"
                value={formData.medicine_name}
                onChange={(e) => setFormData({ ...formData, medicine_name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-teal-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Therapeutic Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-teal-500"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Manufacturer / Brand *</label>
              <input
                type="text"
                required
                placeholder="e.g. Pfizer Inc., Bayer AG"
                value={formData.manufacturer}
                onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-teal-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Unit Price ($) *</label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.unit_price}
                onChange={(e) => setFormData({ ...formData, unit_price: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Stock Quantity (Packs) *</label>
              <input
                type="number"
                required
                value={formData.stock_quantity}
                onChange={(e) => setFormData({ ...formData, stock_quantity: parseInt(e.target.value, 10) || 0 })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-teal-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Expiry Date *</label>
              <input
                type="date"
                required
                value={formData.expiry_date}
                onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Description / Indications</label>
            <textarea
              rows={2}
              placeholder="Clinical pharmacology details..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
              {isSubmitting ? 'Saving...' : editingMedicine ? 'Update Stock' : 'Add Medication'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
