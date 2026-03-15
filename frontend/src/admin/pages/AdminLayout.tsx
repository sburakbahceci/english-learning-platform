import { useEffect } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if admin is authenticated
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/admin/login');
    }
  }, [navigate]);

  // Get page title based on route
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/dashboard')) return 'Dashboard';
    if (path.includes('/users')) return 'User Management';
    if (path.includes('/lessons')) return 'Lesson Management';
    if (path.includes('/podcasts')) return 'Podcast Management';
    if (path.includes('/reading')) return 'Reading Management';
    if (path.includes('/writing')) return 'Writing Management';
    if (path.includes('/speaking')) return 'Speaking Management';
    if (path.includes('/exams')) return 'Exam Management';
    if (path.includes('/analytics')) return 'Analytics';
    return 'Admin Panel';
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar - Fixed */}
      <AdminSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden ml-64">
        {/* Header */}
        <AdminHeader
          title={getPageTitle()}
          subtitle="Manage your platform content and users"
        />

        {/* Page Content - Scrollable */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
