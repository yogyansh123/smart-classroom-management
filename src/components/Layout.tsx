import { useState, type ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from '@/router/Router';
import { Button } from '@/components/ui/Button';
import {
  GraduationCap,
  LayoutDashboard,
  BookOpen,
  Users,
  ClipboardCheck,
  FileText,
  Bell,
  LogOut,
  Menu,
} from 'lucide-react';

interface NavItem {
  label: string;
  path: string;
  icon: ReactNode;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/', icon: <LayoutDashboard size={18} /> },
  { label: 'Classes', path: '/classes', icon: <BookOpen size={18} /> },
  { label: 'Students', path: '/students', icon: <Users size={18} /> },
  { label: 'Attendance', path: '/attendance', icon: <ClipboardCheck size={18} /> },
  { label: 'Assignments', path: '/assignments', icon: <FileText size={18} /> },
  { label: 'Notices', path: '/notices', icon: <Bell size={18} /> },
];

export function Layout({ children }: { children: ReactNode }) {
  const { user, signOut } = useAuth();
  const { path, navigate } = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  function go(to: string) {
    navigate(to);
    setMobileOpen(false);
  }

  async function handleSignOut() {
    await signOut();
    navigate('/');
  }

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
          <GraduationCap size={20} />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-bold text-gray-900">Smart Classroom</p>
          <p className="text-xs text-gray-500">Management Portal</p>
        </div>
      </div>

      <nav className="mt-2 flex-1 space-y-1 px-3">
        {navItems.map((item) => {
          const active = path === item.path;
          return (
            <button
              key={item.path}
              onClick={() => go(item.path)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="border-t border-gray-200 p-3">
        <div className="mb-2 px-3">
          <p className="truncate text-sm font-medium text-gray-900">{user?.name}</p>
          <p className="truncate text-xs text-gray-500">{user?.email}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={handleSignOut} className="w-full justify-start">
          <LogOut size={16} />
          Sign Out
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-gray-200 bg-white lg:block">
        {sidebar}
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 bg-white">
            {sidebar}
          </aside>
        </div>
      )}

      {/* Top bar (mobile) */}
      <div className="sticky top-0 z-20 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 lg:hidden">
        <button onClick={() => setMobileOpen(true)} className="text-gray-600">
          <Menu size={22} />
        </button>
        <span className="text-sm font-semibold text-gray-900">Smart Classroom</span>
        <button onClick={handleSignOut} className="text-gray-600">
          <LogOut size={20} />
        </button>
      </div>

      {/* Content */}
      <main className="lg:pl-64">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
}
