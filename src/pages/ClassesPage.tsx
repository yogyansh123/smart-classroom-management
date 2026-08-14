import { useState, useEffect } from 'react';
import { useData } from '@/context/DataContext';
import type { ClassEntry, ClassStatus } from '@/types';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { Field, inputClass } from '@/components/ui/Field';
import { Pencil, Plus, Trash2 } from 'lucide-react';

const statusColor: Record<ClassStatus, 'blue' | 'green' | 'amber' | 'red'> = {
  Scheduled: 'blue',
  Ongoing: 'amber',
  Completed: 'green',
  Cancelled: 'red',
};

const emptyForm: Omit<ClassEntry, 'id'> = {
  subject: '',
  faculty: '',
  room: '',
  date: '',
  startTime: '',
  endTime: '',
  status: 'Scheduled',
};

export function ClassesPage() {
  const { classes, loading, error, refreshAll, addClass, updateClass, deleteClass } = useData();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<ClassEntry, 'id'>>(emptyForm);
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

  function openEdit(c: ClassEntry) {
    setEditingId(c.id);
    const { id: _id, ...rest } = c;
    setForm(rest);
    setErrors({});
    setPageError('');
    setModalOpen(true);
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!form.subject.trim()) e.subject = 'Subject is required';
    if (!form.faculty.trim()) e.faculty = 'Faculty is required';
    if (!form.room.trim()) e.room = 'Room is required';
    if (!form.date) e.date = 'Date is required';
    if (!form.startTime) e.startTime = 'Start time is required';
    if (!form.endTime) e.endTime = 'End time is required';
    if (form.startTime && form.endTime && form.startTime >= form.endTime)
      e.endTime = 'End time must be after start time';
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
        await updateClass(editingId, form);
      } else {
        await addClass(form);
      }
      setModalOpen(false);
    } catch (err) {
      setPageError(err instanceof Error ? err.message : 'Failed to save class');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await deleteClass(deleteId);
    } catch (err) {
      setPageError(err instanceof Error ? err.message : 'Failed to delete class');
    }
    setDeleteId(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Classes</h1>
          <p className="text-sm text-gray-500">Manage your class schedule</p>
        </div>
        <Button onClick={openAdd}>
          <Plus size={16} />
          Add Class
        </Button>
      </div>

      {pageError && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{pageError}</div>
      )}
      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      {loading ? (
        <div className="py-20 text-center text-sm text-gray-500">Loading classes…</div>
      ) : classes.length === 0 ? (
        <EmptyState title="No classes yet" message="Add your first class to get started." action={<Button onClick={openAdd}><Plus size={16} />Add Class</Button>} />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3 font-medium">Subject</th>
                <th className="px-4 py-3 font-medium">Faculty</th>
                <th className="px-4 py-3 font-medium">Room</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Time</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {classes.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{c.subject}</td>
                  <td className="px-4 py-3 text-gray-600">{c.faculty}</td>
                  <td className="px-4 py-3 text-gray-600">{c.room}</td>
                  <td className="px-4 py-3 text-gray-600">{c.date}</td>
                  <td className="px-4 py-3 text-gray-600">{c.startTime}–{c.endTime}</td>
                  <td className="px-4 py-3"><Badge color={statusColor[c.status]}>{c.status}</Badge></td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openEdit(c)} className="text-gray-400 hover:text-blue-600">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => setDeleteId(c.id)} className="text-gray-400 hover:text-red-600">
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
        title={editingId ? 'Edit Class' : 'Add Class'}
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" form="class-form" disabled={saving}>{saving ? 'Saving…' : editingId ? 'Save Changes' : 'Add Class'}</Button>
          </>
        }
      >
        <form id="class-form" onSubmit={handleSubmit} className="space-y-4">
          {pageError && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{pageError}</div>}
          <Field label="Subject" error={errors.subject}>
            <input className={inputClass} value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="e.g. Data Structures" />
          </Field>
          <Field label="Faculty" error={errors.faculty}>
            <input className={inputClass} value={form.faculty} onChange={(e) => setForm({ ...form, faculty: e.target.value })} placeholder="e.g. Dr. Anita Rao" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Room" error={errors.room}>
              <input className={inputClass} value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} placeholder="e.g. B-201" />
            </Field>
            <Field label="Date" error={errors.date}>
              <input type="date" className={inputClass} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Start Time" error={errors.startTime}>
              <input type="time" className={inputClass} value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
            </Field>
            <Field label="End Time" error={errors.endTime}>
              <input type="time" className={inputClass} value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} />
            </Field>
          </div>
          <Field label="Status">
            <select className={inputClass} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as ClassStatus })}>
              <option>Scheduled</option>
              <option>Ongoing</option>
              <option>Completed</option>
              <option>Cancelled</option>
            </select>
          </Field>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        title="Delete Class"
        message="Are you sure you want to delete this class? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
