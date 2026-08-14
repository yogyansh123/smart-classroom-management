import { useState, useEffect } from 'react';
import { useData } from '@/context/DataContext';
import type { Student } from '@/types';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { Field, inputClass } from '@/components/ui/Field';
import { Pencil, Plus, Trash2 } from 'lucide-react';

const emptyForm: Omit<Student, 'id'> = {
  name: '',
  rollNumber: '',
  email: '',
  className: '',
};

export function StudentsPage() {
  const { students, classes, loading, error, refreshAll, addStudent, updateStudent, deleteStudent } = useData();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Student, 'id'>>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [pageError, setPageError] = useState('');

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  function openAdd() {
    setEditingId(null);
    setForm(emptyForm);
    setErrors({});
    setPageError('');
    setModalOpen(true);
  }

  function openEdit(s: Student) {
    setEditingId(s.id);
    const { id: _id, ...rest } = s;
    setForm(rest);
    setErrors({});
    setPageError('');
    setModalOpen(true);
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.rollNumber.trim()) e.rollNumber = 'Roll number is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email';
    if (!form.className.trim()) e.className = 'Class is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    setPageError('');
    try {
      if (editingId) {
        await updateStudent(editingId, form);
      } else {
        await addStudent(form);
      }
      setModalOpen(false);
    } catch (err) {
      setPageError(err instanceof Error ? err.message : 'Failed to save student');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await deleteStudent(deleteId);
    } catch (err) {
      setPageError(err instanceof Error ? err.message : 'Failed to delete student');
    }
    setDeleteId(null);
  }

  // Unique class names from the classes table for the dropdown
  const classNames = [...new Set(classes.map((c) => c.subject))].sort();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Students</h1>
          <p className="text-sm text-gray-500">Manage student enrollment</p>
        </div>
        <Button onClick={openAdd}>
          <Plus size={16} />
          Add Student
        </Button>
      </div>

      {pageError && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{pageError}</div>
      )}
      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      {loading ? (
        <div className="py-20 text-center text-sm text-gray-500">Loading students…</div>
      ) : students.length === 0 ? (
        <EmptyState title="No students yet" message="Add your first student to get started." action={<Button onClick={openAdd}><Plus size={16} />Add Student</Button>} />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Roll No.</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Class</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {students.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{s.name}</td>
                  <td className="px-4 py-3 text-gray-600">{s.rollNumber}</td>
                  <td className="px-4 py-3 text-gray-600">{s.email}</td>
                  <td className="px-4 py-3 text-gray-600">{s.className}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openEdit(s)} className="text-gray-400 hover:text-blue-600">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => setDeleteId(s.id)} className="text-gray-400 hover:text-red-600">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={modalOpen}
        title={editingId ? 'Edit Student' : 'Add Student'}
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" form="student-form" disabled={saving}>{saving ? 'Saving…' : editingId ? 'Save Changes' : 'Add Student'}</Button>
          </>
        }
      >
        <form id="student-form" onSubmit={handleSubmit} className="space-y-4">
          {pageError && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{pageError}</div>}
          <Field label="Student Name" error={errors.name}>
            <input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Aarav Patel" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Roll Number" error={errors.rollNumber}>
              <input className={inputClass} value={form.rollNumber} onChange={(e) => setForm({ ...form, rollNumber: e.target.value })} placeholder="e.g. CS21-001" />
            </Field>
            <Field label="Email" error={errors.email}>
              <input type="email" className={inputClass} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="e.g. name@college.edu" />
            </Field>
          </div>
          <Field label="Class" error={errors.className}>
            <input
              className={inputClass}
              value={form.className}
              onChange={(e) => setForm({ ...form, className: e.target.value })}
              placeholder="e.g. Data Structures"
              list="class-names"
            />
            <datalist id="class-names">
              {classNames.map((cn) => (
                <option key={cn} value={cn} />
              ))}
            </datalist>
          </Field>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        title="Delete Student"
        message="Are you sure you want to delete this student? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
