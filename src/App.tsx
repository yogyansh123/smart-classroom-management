import { useEffect } from 'react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { DataProvider } from '@/context/DataContext';
import { RouterProvider, useRouter } from '@/router/Router';
import { LoginPage } from '@/pages/LoginPage';
import { Layout } from '@/components/Layout';
import { DashboardPage } from '@/pages/DashboardPage';
import { ClassesPage } from '@/pages/ClassesPage';
import { StudentsPage } from '@/pages/StudentsPage';
import { AttendancePage } from '@/pages/AttendancePage';
import { AssignmentsPage } from '@/pages/AssignmentsPage';
import { NoticesPage } from '@/pages/NoticesPage';

function Routes() {
  const { user, loading } = useAuth();
  const { path, navigate } = useRouter();

  useEffect(() => {
    if (!loading && !user && path !== '/') {
      navigate('/');
    }
  }, [loading, user, path, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-sm text-gray-500">Loading…</div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  let page;
  switch (path) {
    case '/classes': page = <ClassesPage />; break;
    case '/students': page = <StudentsPage />; break;
    case '/attendance': page = <AttendancePage />; break;
    case '/assignments': page = <AssignmentsPage />; break;
    case '/notices': page = <NoticesPage />; break;
    default: page = <DashboardPage />; break;
  }

  return (
    <DataProvider>
      <Layout>{page}</Layout>
    </DataProvider>
  );
}

export default function App() {
  return (
    <RouterProvider>
      <AuthProvider>
        <Routes />
      </AuthProvider>
    </RouterProvider>
  );
}
