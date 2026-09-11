import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Doctor, Department } from '../types';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import {
  UserCheck,
  Search,
  Plus,
  Filter,
  Phone,
  Mail,
  Award,
  DollarSign,
  Calendar,
  Building2,
  Edit2
} from 'lucide-react';

export const DoctorsPage: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedAvailability, setSelectedAvailability] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    specialization: '',
    department_id: '',
    phone: '',
    email: '',
    license_number: '',
    consultation_fee: 150.00,
    availability_status: 'Available'
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchDoctors = async () => {
    setIsLoading(true);
    try {
      const [docRes, deptRes] = await Promise.all([
        api.get('/doctors', {
          params: {
            search: search || undefined,
            department_id: selectedDept !== 'ALL' ? selectedDept : undefined,
            availability: selectedAvailability !== 'ALL' ? selectedAvailability : undefined
          }
        }),
        api.get('/departments')
      ]);
      setDoctors(docRes.data.data);
      setDepartments(deptRes.data.data);
    } catch (err) {
      console.error('Failed to load doctors', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [selectedDept, selectedAvailability]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDoctors();
  };

  const handleOpenAdd = () => {
    setEditingDoctor(null);
    setFormData({
      first_name: '',
      last_name: '',
      specialization: '',
      department_id: departments[0]?.department_id || '',
      phone: '',
      email: '',
      license_number: '',
      consultation_fee: 150.00,
      availability_status: 'Available'
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (doc: Doctor) => {
    setEditingDoctor(doc);
    setFormData({
      first_name: doc.first_name,
      last_name: doc.last_name,
      specialization: doc.specialization,
      department_id: doc.department_id,
      phone: doc.phone,
      email: doc.email,
      license_number: doc.license_number,
      consultation_fee: Number(doc.consultation_fee),
      availability_status: doc.availability_status
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);
    try {
      if (editingDoctor) {
        await api.put(`/doctors/${editingDoctor.doctor_id}`, formData);
      } else {
        await api.post('/doctors', formData);
      }
      setIsModalOpen(false);
      fetchDoctors();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to save doctor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Physician & Specialist Staff</h1>
          <p className="text-xs text-slate-500 font-medium">
            Clinical faculty directory, department assignments, and consultation availability
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-600/30 transition"
        >
          <Plus className="w-4 h-4" /> Add Doctor
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by physician name, specialization, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
          />
        </form>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-semibold focus:outline-none focus:border-teal-500"
          >
            <option value="ALL">All Departments</option>
            {departments.map((d) => (
              <option key={d.department_id} value={d.department_id}>
                {d.department_name}
              </option>
            ))}
          </select>

          <select
            value={selectedAvailability}
            onChange={(e) => setSelectedAvailability(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-semibold focus:outline-none focus:border-teal-500"
          >
            <option value="ALL">All Availabilities</option>
            <option value="Available">Available</option>
            <option value="In Consultation">In Consultation</option>
            <option value="On Leave">On Leave</option>
            <option value="Unavailable">Unavailable</option>
          </select>
        </div>
      </div>

      {/* Doctor Cards Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-400">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mb-2"></div>
          <p className="text-xs">Loading doctors from PostgreSQL...</p>
        </div>
      ) : doctors.length === 0 ? (
        <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
          No medical specialists found matching your filter options.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doc) => (
            <div
              key={doc.doctor_id}
              className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-600 to-teal-500 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-teal-600/20">
                      {doc.first_name[0]}{doc.last_name[0]}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">
                        Dr. {doc.first_name} {doc.last_name}
                      </h3>
                      <span className="text-xs font-semibold text-teal-700 block">
                        {doc.specialization}
                      </span>
                    </div>
                  </div>
                  <Badge status={doc.availability_status} />
                </div>

                <div className="space-y-1.5 text-xs text-slate-500 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-medium text-slate-700">{doc.department?.department_name}</span>
                    <span className="text-[10px] text-slate-400">({doc.department?.location})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="w-3.5 h-3.5 text-slate-400" />
                    <span>License: <strong className="text-slate-600">{doc.license_number}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-3.5 h-3.5 text-teal-600" />
                    <span>Fee: <strong className="font-mono text-slate-900">${Number(doc.consultation_fee).toFixed(2)}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{doc.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{doc.email}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  <strong className="text-slate-700 font-semibold">{doc._count?.appointments || 0}</strong> consultations handled
                </span>
                <button
                  onClick={() => handleOpenEdit(doc)}
                  className="p-1.5 text-slate-400 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition"
                  title="Edit Specialist"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Doctor Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingDoctor ? 'Edit Doctor Profile' : 'Add New Physician'}
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">First Name *</label>
              <input
                type="text"
                required
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-teal-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Last Name *</label>
              <input
                type="text"
                required
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Clinical Specialization *</label>
              <input
                type="text"
                required
                placeholder="e.g. Interventional Cardiology"
                value={formData.specialization}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-teal-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Hospital Department *</label>
              <select
                value={formData.department_id}
                onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-teal-500"
              >
                {departments.map((d) => (
                  <option key={d.department_id} value={d.department_id}>
                    {d.department_name} ({d.location})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Consultation Fee ($) *</label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.consultation_fee}
                onChange={(e) => setFormData({ ...formData, consultation_fee: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-teal-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Availability Status *</label>
              <select
                value={formData.availability_status}
                onChange={(e) => setFormData({ ...formData, availability_status: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-teal-500"
              >
                <option value="Available">Available</option>
                <option value="In Consultation">In Consultation</option>
                <option value="On Leave">On Leave</option>
                <option value="Unavailable">Unavailable</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Phone *</label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-teal-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Email Address *</label>
              <input
                type="email"
                required
                disabled={Boolean(editingDoctor)}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-teal-500 disabled:opacity-60"
              />
            </div>
          </div>

          {!editingDoctor && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Medical License Number *</label>
              <input
                type="text"
                required
                placeholder="MD-SPEC-XXXX"
                value={formData.license_number}
                onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-teal-500"
              />
            </div>
          )}

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
              {isSubmitting ? 'Saving...' : editingDoctor ? 'Update Specialist' : 'Create Specialist'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
