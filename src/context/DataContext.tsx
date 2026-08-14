import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type {
  ClassEntry,
  Student,
  Assignment,
  Notice,
  AttendanceStatus,
  AttendanceRecord,
} from '@/types';
import { supabase } from '@/lib/supabase';

interface DataContextType {
  classes: ClassEntry[];
  students: Student[];
  assignments: Assignment[];
  notices: Notice[];
  loading: boolean;
  error: string | null;
  refreshAll: () => Promise<void>;
  addClass: (c: Omit<ClassEntry, 'id'>) => Promise<void>;
  updateClass: (id: string, c: Omit<ClassEntry, 'id'>) => Promise<void>;
  deleteClass: (id: string) => Promise<void>;
  addStudent: (s: Omit<Student, 'id'>) => Promise<void>;
  updateStudent: (id: string, s: Omit<Student, 'id'>) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;
  addAssignment: (a: Omit<Assignment, 'id'>) => Promise<void>;
  updateAssignment: (id: string, a: Omit<Assignment, 'id'>) => Promise<void>;
  deleteAssignment: (id: string) => Promise<void>;
  addNotice: (n: Omit<Notice, 'id'>) => Promise<void>;
  updateNotice: (id: string, n: Omit<Notice, 'id'>) => Promise<void>;
  deleteNotice: (id: string) => Promise<void>;
  getAttendance: (classId: string, date: string) => Promise<Record<string, AttendanceStatus>>;
  saveAttendance: (classId: string, date: string, marks: Record<string, AttendanceStatus>) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// --- DB row types (snake_case) ---
interface ClassRow {
  id: string;
  subject: string;
  faculty: string;
  room: string;
  date: string;
  start_time: string;
  end_time: string;
  status: string;
}
interface StudentRow {
  id: string;
  name: string;
  roll_number: string;
  email: string;
  class_name: string;
}
interface AssignmentRow {
  id: string;
  title: string;
  subject: string;
  due_date: string;
  status: string;
}
interface NoticeRow {
  id: string;
  title: string;
  message: string;
  date: string;
}
interface AttendanceRow {
  id: string;
  class_id: string;
  student_id: string;
  attendance_date: string;
  status: string;
}

// --- mappers ---
function mapClass(r: ClassRow): ClassEntry {
  return {
    id: r.id,
    subject: r.subject,
    faculty: r.faculty,
    room: r.room,
    date: r.date,
    startTime: r.start_time,
    endTime: r.end_time,
    status: r.status as ClassEntry['status'],
  };
}
function mapStudent(r: StudentRow): Student {
  return {
    id: r.id,
    name: r.name,
    rollNumber: r.roll_number,
    email: r.email,
    className: r.class_name,
  };
}
function mapAssignment(r: AssignmentRow): Assignment {
  return {
    id: r.id,
    title: r.title,
    subject: r.subject,
    dueDate: r.due_date,
    status: r.status as Assignment['status'],
  };
}
function mapNotice(r: NoticeRow): Notice {
  return {
    id: r.id,
    title: r.title,
    message: r.message,
    date: r.date,
  };
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [classes, setClasses] = useState<ClassEntry[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [c, s, a, n] = await Promise.all([
        supabase.from('classes').select('*'),
        supabase.from('students').select('*'),
        supabase.from('assignments').select('*'),
        supabase.from('notices').select('*'),
      ]);

      if (c.error) throw c.error;
      if (s.error) throw s.error;
      if (a.error) throw a.error;
      if (n.error) throw n.error;

      setClasses((c.data as ClassRow[]).map(mapClass));
      setStudents((s.data as StudentRow[]).map(mapStudent));
      setAssignments((a.data as AssignmentRow[]).map(mapAssignment));
      setNotices((n.data as NoticeRow[]).map(mapNotice));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  // --- Classes ---
  async function addClass(item: Omit<ClassEntry, 'id'>) {
    const { error } = await supabase.from('classes').insert({
      subject: item.subject,
      faculty: item.faculty,
      room: item.room,
      date: item.date,
      start_time: item.startTime,
      end_time: item.endTime,
      status: item.status,
    });
    if (error) throw error;
    await refreshAll();
  }

  async function updateClass(id: string, item: Omit<ClassEntry, 'id'>) {
    const { error } = await supabase.from('classes').update({
      subject: item.subject,
      faculty: item.faculty,
      room: item.room,
      date: item.date,
      start_time: item.startTime,
      end_time: item.endTime,
      status: item.status,
    }).eq('id', id);
    if (error) throw error;
    await refreshAll();
  }

  async function deleteClass(id: string) {
    const { error } = await supabase.from('classes').delete().eq('id', id);
    if (error) throw error;
    await refreshAll();
  }

  // --- Students ---
  async function addStudent(item: Omit<Student, 'id'>) {
    const { error } = await supabase.from('students').insert({
      name: item.name,
      roll_number: item.rollNumber,
      email: item.email,
      class_name: item.className,
    });
    if (error) throw error;
    await refreshAll();
  }

  async function updateStudent(id: string, item: Omit<Student, 'id'>) {
    const { error } = await supabase.from('students').update({
      name: item.name,
      roll_number: item.rollNumber,
      email: item.email,
      class_name: item.className,
    }).eq('id', id);
    if (error) throw error;
    await refreshAll();
  }

  async function deleteStudent(id: string) {
    const { error } = await supabase.from('students').delete().eq('id', id);
    if (error) throw error;
    await refreshAll();
  }

  // --- Assignments ---
  async function addAssignment(item: Omit<Assignment, 'id'>) {
    const { error } = await supabase.from('assignments').insert({
      title: item.title,
      subject: item.subject,
      due_date: item.dueDate,
      status: item.status,
    });
    if (error) throw error;
    await refreshAll();
  }

  async function updateAssignment(id: string, item: Omit<Assignment, 'id'>) {
    const { error } = await supabase.from('assignments').update({
      title: item.title,
      subject: item.subject,
      due_date: item.dueDate,
      status: item.status,
    }).eq('id', id);
    if (error) throw error;
    await refreshAll();
  }

  async function deleteAssignment(id: string) {
    const { error } = await supabase.from('assignments').delete().eq('id', id);
    if (error) throw error;
    await refreshAll();
  }

  // --- Notices ---
  async function addNotice(item: Omit<Notice, 'id'>) {
    const { error } = await supabase.from('notices').insert({
      title: item.title,
      message: item.message,
      date: item.date,
    });
    if (error) throw error;
    await refreshAll();
  }

  async function updateNotice(id: string, item: Omit<Notice, 'id'>) {
    const { error } = await supabase.from('notices').update({
      title: item.title,
      message: item.message,
      date: item.date,
    }).eq('id', id);
    if (error) throw error;
    await refreshAll();
  }

  async function deleteNotice(id: string) {
    const { error } = await supabase.from('notices').delete().eq('id', id);
    if (error) throw error;
    await refreshAll();
  }

  // --- Attendance ---
  async function getAttendance(classId: string, date: string): Promise<Record<string, AttendanceStatus>> {
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('class_id', classId)
      .eq('attendance_date', date);
    if (error) throw error;
    const result: Record<string, AttendanceStatus> = {};
    (data as AttendanceRow[]).forEach((r) => {
      result[r.student_id] = r.status as AttendanceStatus;
    });
    return result;
  }

  async function saveAttendance(classId: string, date: string, marks: Record<string, AttendanceStatus>) {
    // Upsert each student's attendance for this class+date.
    const rows = Object.entries(marks).map(([studentId, status]) => ({
      class_id: classId,
      student_id: studentId,
      attendance_date: date,
      status,
    }));

    if (rows.length === 0) return;

    // Delete existing records for this class+date, then insert fresh.
    const { error: delError } = await supabase
      .from('attendance')
      .delete()
      .eq('class_id', classId)
      .eq('attendance_date', date);
    if (delError) throw delError;

    const { error: insError } = await supabase.from('attendance').insert(rows);
    if (insError) throw insError;
  }

  const value: DataContextType = {
    classes,
    students,
    assignments,
    notices,
    loading,
    error,
    refreshAll,
    addClass,
    updateClass,
    deleteClass,
    addStudent,
    updateStudent,
    deleteStudent,
    addAssignment,
    updateAssignment,
    deleteAssignment,
    addNotice,
    updateNotice,
    deleteNotice,
    getAttendance,
    saveAttendance,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}

export type { AttendanceRecord };
