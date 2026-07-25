import React, { useState, useEffect } from 'react';
import { doctorService, adminService } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import Modal from '../../components/Modal';
import { Stethoscope, Plus, Trash2, CheckCircle2 } from 'lucide-react';

export default function SpecializationsAdmin() {
  const [specializations, setSpecializations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [icon, setIcon] = useState('Stethoscope');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const fetchSpecs = async () => {
    try {
      setLoading(true);
      const res = await doctorService.getSpecializations();
      if (res.data.success) {
        setSpecializations(res.data.specializations);
      }
    } catch (err) {
      console.error('Fetch specs error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpecs();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await adminService.createSpecialization({
        specialization_name: name,
        description: desc,
        icon: icon
      });

      if (res.data.success) {
        setModalOpen(false);
        setName('');
        setDesc('');
        setMessage('Specialization added successfully!');
        fetchSpecs();
      }
    } catch (err) {
      console.error('Create spec error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this specialization?')) return;
    try {
      await adminService.deleteSpecialization(id);
      setMessage('Specialization deleted.');
      fetchSpecs();
    } catch (err) {
      console.error('Delete spec error:', err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center space-x-3">
            <Stethoscope className="w-8 h-8 text-sky-600 dark:text-sky-400" />
            <span>Manage Specializations</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Add, edit, or remove medical departments</p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-5 py-2.5 bg-sky-600 text-white font-extrabold text-xs rounded-xl shadow hover:bg-sky-700 transition-colors flex items-center space-x-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Add Specialization</span>
        </button>
      </div>

      {message && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs flex items-center justify-between">
          <span>{message}</span>
          <button onClick={() => setMessage('')} className="font-bold">✕</button>
        </div>
      )}

      {loading ? (
        <LoadingSpinner message="Fetching medical specializations..." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {specializations.map((s) => (
            <div key={s.specialization_id} className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-700 shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white">{s.specialization_name}</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300">
                    {s.doctor_count || 0} Doctors
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">{s.description || 'Medical department care'}</p>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex justify-end">
                <button
                  onClick={() => handleDelete(s.specialization_id)}
                  className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors text-xs font-semibold flex items-center space-x-1"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Specialization Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add New Specialization">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Specialization Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Ophthalmology"
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Description</label>
            <textarea
              rows="3"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Description of care..."
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white"
            ></textarea>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Icon Category</label>
            <select
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white"
            >
              <option value="Heart">Heart (Cardiology)</option>
              <option value="Sparkles">Sparkles (Dermatology)</option>
              <option value="Activity">Activity (Neurology)</option>
              <option value="Baby">Baby (Pediatrics)</option>
              <option value="Bone">Bone (Orthopedics)</option>
              <option value="Brain">Brain (Psychiatry)</option>
              <option value="Stethoscope">Stethoscope (General)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 bg-sky-600 text-white font-bold text-xs rounded-xl shadow hover:bg-sky-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Create Specialization'}
          </button>
        </form>
      </Modal>

    </div>
  );
}
