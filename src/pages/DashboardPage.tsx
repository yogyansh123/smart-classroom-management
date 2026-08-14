import { useData } from '@/context/DataContext';
import { Badge } from '@/components/ui/Badge';
import {
  BookOpen,
  Users,
  CalendarClock,
  FileText,
  TrendingUp,
} from 'lucide-react';

export function DashboardPage() {
  const { classes, students, assignments, notices, loading, error, refreshAll } = useData();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-sm text-gray-500">Loading dashboard…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-sm text-red-600">{error}</p>
        <button onClick={refreshAll} className="mt-2 text-sm font-medium text-red-700 underline">
          Try again
        </button>
      </div>
    );
  }

  const upcomingClasses = classes
    .filter((c) => c.status === 'Scheduled' || c.status === 'Ongoing')
    .slice(0, 4);
  const pendingAssignments = assignments.filter((a) => a.status === 'Pending');

  const stats = [
    { label: 'Total Classes', value: classes.length, icon: <BookOpen size={20} />, color: 'bg-blue-50 text-blue-600' },
    { label: 'Total Students', value: students.length, icon: <Users size={20} />, color: 'bg-green-50 text-green-600' },
    { label: 'Upcoming Classes', value: upcomingClasses.length, icon: <CalendarClock size={20} />, color: 'bg-amber-50 text-amber-600' },
    { label: 'Pending Assignments', value: pendingAssignments.length, icon: <FileText size={20} />, color: 'bg-red-50 text-red-600' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">Overview of your classroom activity</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{s.label}</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{s.value}</p>
              </div>
              <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${s.color}`}>
                {s.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Upcoming classes */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <CalendarClock size={18} className="text-blue-600" />
            <h2 className="text-sm font-semibold text-gray-900">Upcoming Classes</h2>
          </div>
          <div className="space-y-3">
            {upcomingClasses.length === 0 && (
              <p className="text-sm text-gray-500">No upcoming classes scheduled.</p>
            )}
            {upcomingClasses.map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2.5">
                <div>
                  <p className="text-sm font-medium text-gray-900">{c.subject}</p>
                  <p className="text-xs text-gray-500">{c.faculty} · Room {c.room}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">{c.date}</p>
                  <p className="text-xs font-medium text-gray-700">{c.startTime}–{c.endTime}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent notices as activity */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-green-600" />
            <h2 className="text-sm font-semibold text-gray-900">Recent Notices</h2>
          </div>
          <div className="space-y-3">
            {notices.length === 0 && (
              <p className="text-sm text-gray-500">No notices posted yet.</p>
            )}
            {[...notices]
              .sort((a, b) => b.date.localeCompare(a.date))
              .slice(0, 4)
              .map((n) => (
                <div key={n.id} className="flex items-start gap-3">
                  <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                  <div>
                    <p className="text-sm text-gray-700">{n.title}</p>
                    <p className="text-xs text-gray-400">{n.date}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Pending assignments */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <FileText size={18} className="text-red-600" />
          <h2 className="text-sm font-semibold text-gray-900">Pending Assignments</h2>
        </div>
        <div className="space-y-2">
          {pendingAssignments.length === 0 && (
            <p className="text-sm text-gray-500">All assignments are completed.</p>
          )}
          {pendingAssignments.map((a) => (
            <div key={a.id} className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2.5">
              <div>
                <p className="text-sm font-medium text-gray-900">{a.title}</p>
                <p className="text-xs text-gray-500">{a.subject} · Due {a.dueDate}</p>
              </div>
              <Badge color="amber">Pending</Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
