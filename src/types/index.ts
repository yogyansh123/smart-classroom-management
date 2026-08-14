export type ClassStatus = 'Scheduled' | 'Ongoing' | 'Completed' | 'Cancelled';

export interface ClassEntry {
  id: string;
  subject: string;
  faculty: string;
  room: string;
  date: string; // ISO yyyy-mm-dd
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  status: ClassStatus;
}

export interface Student {
  id: string;
  name: string;
  rollNumber: string;
  email: string;
  className: string;
}

export type AttendanceStatus = 'Present' | 'Absent';

export interface AttendanceRecord {
  id: string;
  classId: string;
  studentId: string;
  date: string;
  status: AttendanceStatus;
}

export type AssignmentStatus = 'Pending' | 'Completed';

export interface Assignment {
  id: string;
  title: string;
  subject: string;
  dueDate: string;
  status: AssignmentStatus;
}

export interface Notice {
  id: string;
  title: string;
  message: string;
  date: string;
}

export interface ActivityItem {
  id: string;
  message: string;
  time: string;
}
