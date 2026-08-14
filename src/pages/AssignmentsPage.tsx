import { useState, useEffect } from 'react';
import { useData } from '@/context/DataContext';
import type { Assignment, AssignmentStatus } from '@/types';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { Field, inputClass } from '@/components/ui/Field';
import { Pencil, Plus, Trash2, CheckCircle2, Clock } from 'lucide-react';

const emptyForm: Omit<Assignment, 'id'> = {
  title: '',
  subject: '',
  dueDate: '',
  status: 'Pending',
};

export function AssignmentsPage() {
  const { assignments, loading, error, refreshAll, addAssignment, updateAssignment, deleteAssignment } = useData();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Assignment, 'id'>>(emptyForm);
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

  function openEdit(a: Assignment) {
    setEditingId(a.id);
    const { id: _id, ...rest } = a;
    setForm(rest);
    setErrors({});
    setPageError('');
    setModalOpen(true);
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.subject.trim()) e.subject = 'Subject is required';
    if (!form.dueDate) e.dueDate = 'Due date is required';
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
        await updateAssignment(editingId, form);
      } else {
        await addAssignment(form);
      }
      setModalOpen(false);
    } catch (err) {
      setPageError(err instanceof Error ? err.message : 'Failed to save assignment');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await deleteAssignment(deleteId);
    } catch (err) {
      setPageError(err instanceof Error ? err.message : 'Failed to delete assignment');
    }
    setDeleteId(null);
  }

  const pending = assignments.filter((a) => a.status === 'Pending');
  const completed = assignments.filter((a) => a.status === 'Completed');

  function renderCard(a: Assignment) {
    return (
      <div key={a.id} className="flex items-start justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <div className={`mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg ${a.status === 'Pending' ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'}`}>
            {a.status === 'Pending' ? <Clock size={16} /> : <CheckCircle2 size={16} />}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{a.title}</p>
            <p className="text-xs text-gray-500">{a.subject} · Due {a.dueDate}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge color={a.status === 'Pending' ? 'amber' : 'green'}>{a.status}</Badge>
          <div className="flex gap-2">
            <button onClick={() => openEdit(a)} className="text-gray-400 hover:text-blue-600">
              <Pencil size={16} />
            </button>
            <button onClick={() => setDeleteId(a.id)} className="text-gray-400 hover:text-red-600">
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Assignments</h1>
          <p className="text-sm text-gray-500">Track pending and completed assignments</p>
        </div>
        <Button onClick={openAdd}>
          <Plus size={16} />
          Add Assignment
        </Button>
      </div>

      {pageError && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{pageError}</div>
      )}
      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      {loading ? (
        <div className="py-20 text-center text-sm text-gray-500">Loading assignments…</div>
      ) : assignments.length === 0 ? (
        <EmptyState title="No assignments yet" message="Add your first assignment to get started." action={<Button onClick={openAdd}><Plus size={16} />Add Assignment</Button>} />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <Clock size={16} className="text-amber-600" />
              <h2 className="text-sm font-semibold text-gray-900">Pending ({pending.length})</h2>
            </div>
            <div className="space-y-3">
              {pending.length === 0 ? (
                <p className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">No pending assignments.</p>
              ) : (
                pending.map(renderCard)
              )}
            </div>
          </div>
          <div>
            <div className="mb-3 flex items-center gap-2">
              <CheckCircle2 size={16} className="text-green-600" />
              <h2 className="text-sm font-semibold text-gray-900">Completed ({completed.length})</h2>
            </div>
            <div className="space-y-3">
              {completed.length === 0 ? (
                <p className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">No completed assignments yet.</p>
              ) : (
                completed.map(renderCard)
              )}
            </div>
          </div>
        </div>
      )}

      <Modal
        open={modalOpen}
        title={editingId ? 'Edit Assignment' : 'Add Assignment'}
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" form="assignment-form" disabled={saving}>{saving ? 'Saving…' : editingId ? 'Save Changes' : 'Add Assignment'}</Button>
          </>
        }
      >
        <form id="assignment-form" onSubmit={handleSubmit} className="space-y-4">
          {pageError && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{pageError}</div>}
          <Field label="Title" error={errors.title}>
            <input className={inputClass} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Linked List Implementation" />
          </Field>
          <Field label="Subject" error={errors.subject}>
            <input className={inputClass} value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="e.g. Data Structures" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Due Date" error={errors.dueDate}>
              <input type="date" className={inputClass} value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
            </Field>
            <Field label="Status">
              <select className={inputClass} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as AssignmentStatus })}>
                <option>Pending</option>
                <option>Completed</option>
              </select>
            </Field>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        title="Delete Assignment"
        message="Are you sure you want to delete this assignment? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
