import { useState, useEffect } from 'react';
import { useData } from '@/context/DataContext';
import type { Notice } from '@/types';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { Field, inputClass } from '@/components/ui/Field';
import { Pencil, Plus, Trash2, Bell, Calendar } from 'lucide-react';

const emptyForm: Omit<Notice, 'id'> = {
  title: '',
  message: '',
  date: '',
};

export function NoticesPage() {
  const { notices, loading, error, refreshAll, addNotice, updateNotice, deleteNotice } = useData();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Notice, 'id'>>(emptyForm);
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

  function openEdit(n: Notice) {
    setEditingId(n.id);
    const { id: _id, ...rest } = n;
    setForm(rest);
    setErrors({});
    setPageError('');
    setModalOpen(true);
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.message.trim()) e.message = 'Message is required';
    if (!form.date) e.date = 'Date is required';
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
        await updateNotice(editingId, form);
      } else {
        await addNotice(form);
      }
      setModalOpen(false);
    } catch (err) {
      setPageError(err instanceof Error ? err.message : 'Failed to save notice');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await deleteNotice(deleteId);
    } catch (err) {
      setPageError(err instanceof Error ? err.message : 'Failed to delete notice');
    }
    setDeleteId(null);
  }

  const sorted = [...notices].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Notices</h1>
          <p className="text-sm text-gray-500">Post and manage announcements</p>
        </div>
        <Button onClick={openAdd}>
          <Plus size={16} />
          Add Notice
        </Button>
      </div>

      {pageError && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{pageError}</div>
      )}
      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      {loading ? (
        <div className="py-20 text-center text-sm text-gray-500">Loading notices…</div>
      ) : sorted.length === 0 ? (
        <EmptyState title="No notices yet" message="Post your first notice to get started." action={<Button onClick={openAdd}><Plus size={16} />Add Notice</Button>} />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {sorted.map((n) => (
            <div key={n.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <Bell size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">{n.title}</h3>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-400">
                      <Calendar size={12} />
                      {n.date}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(n)} className="text-gray-400 hover:text-blue-600">
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => setDeleteId(n.id)} className="text-gray-400 hover:text-red-600">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <p className="mt-3 text-sm text-gray-600">{n.message}</p>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        title={editingId ? 'Edit Notice' : 'Add Notice'}
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" form="notice-form" disabled={saving}>{saving ? 'Saving…' : editingId ? 'Save Changes' : 'Add Notice'}</Button>
          </>
        }
      >
        <form id="notice-form" onSubmit={handleSubmit} className="space-y-4">
          {pageError && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{pageError}</div>}
          <Field label="Title" error={errors.title}>
            <input className={inputClass} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Mid-Semester Exam Schedule" />
          </Field>
          <Field label="Message" error={errors.message}>
            <textarea className={`${inputClass} min-h-[100px] resize-y`} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Write the notice message…" />
          </Field>
          <Field label="Date" error={errors.date}>
            <input type="date" className={inputClass} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </Field>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        title="Delete Notice"
        message="Are you sure you want to delete this notice? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
