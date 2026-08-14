import { useMemo, useState, useEffect } from 'react';
import { useData } from '@/context/DataContext';
import type { AttendanceStatus } from '@/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Field, inputClass } from '@/components/ui/Field';
import { EmptyState } from '@/components/ui/EmptyState';
import { Check, X, ClipboardCheck, Save } from 'lucide-react';

export function AttendancePage() {
  const { classes, students, loading, refreshAll, getAttendance, saveAttendance } = useData();
  const [classId, setClassId] = useState('');
  const [date, setDate] = useState('');
  const [marks, setMarks] = useState<Record<string, AttendanceStatus>>({});
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pageError, setPageError] = useState('');
  const [loadingAttendance, setLoadingAttendance] = useState(false);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  const selectedClass = classes.find((c) => c.id === classId);

  const classStudents = useMemo(
    () => {
      if (!selectedClass) return [];
      return students.filter((s) => s.className === selectedClass.subject);
    },
    [students, selectedClass]
  );

  async function handleSelectClass(id: string) {
    setClassId(id);
    setMarks({});
    setSaved(false);
    setPageError('');
    if (id && date) {
      setLoadingAttendance(true);
      try {
        const existing = await getAttendance(id, date);
        setMarks(existing);
      } catch (err) {
        setPageError(err instanceof Error ? err.message : 'Failed to load attendance');
      } finally {
        setLoadingAttendance(false);
      }
    }
  }

  async function handleSelectDate(d: string) {
    setDate(d);
    setSaved(false);
    setPageError('');
    if (classId && d) {
      setLoadingAttendance(true);
      try {
        const existing = await getAttendance(classId, d);
        setMarks(existing);
      } catch (err) {
        setPageError(err instanceof Error ? err.message : 'Failed to load attendance');
      } finally {
        setLoadingAttendance(false);
      }
    }
  }

  function toggle(studentId: string, status: AttendanceStatus) {
    setMarks((m) => ({ ...m, [studentId]: status }));
    setSaved(false);
  }

  function markAll(status: AttendanceStatus) {
    const all: Record<string, AttendanceStatus> = {};
    classStudents.forEach((s) => { all[s.id] = status; });
    setMarks(all);
    setSaved(false);
  }

  async function handleSave() {
    if (!classId || !date) return;
    setSaving(true);
    setPageError('');
    try {
      await saveAttendance(classId, date, marks);
      setSaved(true);
    } catch (err) {
      setPageError(err instanceof Error ? err.message : 'Failed to save attendance');
    } finally {
      setSaving(false);
    }
  }

  const presentCount = Object.values(marks).filter((v) => v === 'Present').length;
  const total = classStudents.length;
  const percentage = total > 0 ? Math.round((presentCount / total) * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Attendance</h1>
        <p className="text-sm text-gray-500">Mark student attendance for a class</p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Select Class">
            <select className={inputClass} value={classId} onChange={(e) => handleSelectClass(e.target.value)} disabled={loading}>
              <option value="">{loading ? 'Loading…' : 'Choose a class'}</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.subject}</option>
              ))}
            </select>
          </Field>
          <Field label="Select Date">
            <input type="date" className={inputClass} value={date} onChange={(e) => handleSelectDate(e.target.value)} />
          </Field>
        </div>
      </div>

      {pageError && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{pageError}</div>
      )}

      {!classId || !date ? (
        <EmptyState title="Select a class and date" message="Choose a class and date above to view students and mark attendance." />
      ) : loadingAttendance ? (
        <div className="py-20 text-center text-sm text-gray-500">Loading attendance…</div>
      ) : classStudents.length === 0 ? (
        <EmptyState title="No students in this class" message="No students are enrolled in this class yet." />
      ) : (
        <div className="space-y-4">
          {/* Summary */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <ClipboardCheck size={18} className="text-blue-600" />
                <span className="text-sm font-medium text-gray-900">{total} students</span>
              </div>
              <Badge color={percentage >= 75 ? 'green' : percentage >= 50 ? 'amber' : 'red'}>
                {percentage}% Present
              </Badge>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => markAll('Present')}>Mark All Present</Button>
              <Button variant="secondary" size="sm" onClick={() => markAll('Absent')}>Mark All Absent</Button>
            </div>
          </div>

          {/* Student list */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Student</th>
                  <th className="px-4 py-3 font-medium">Roll No.</th>
                  <th className="px-4 py-3 text-center font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {classStudents.map((s) => {
                  const status = marks[s.id];
                  return (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{s.name}</td>
                      <td className="px-4 py-3 text-gray-600">{s.rollNumber}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => toggle(s.id, 'Present')}
                            className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                              status === 'Present'
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-green-100 hover:text-green-700'
                            }`}
                          >
                            <Check size={14} /> Present
                          </button>
                          <button
                            onClick={() => toggle(s.id, 'Absent')}
                            className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                              status === 'Absent'
                                ? 'bg-red-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-700'
                            }`}
                          >
                            <X size={14} /> Absent
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between">
            {saved && (
              <p className="text-sm text-green-600">Attendance saved successfully.</p>
            )}
            <Button onClick={handleSave} disabled={saving} className="ml-auto">
              <Save size={16} />
              {saving ? 'Saving…' : 'Save Attendance'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
