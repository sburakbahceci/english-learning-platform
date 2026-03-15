import { useMemo } from 'react';

interface AdminHeaderProps {
  title?: string;
  subtitle?: string;
}

export default function AdminHeader({ 
  title = 'Dashboard', 
  subtitle = 'Welcome back, manage your platform' 
}: AdminHeaderProps) {
  const adminUser = useMemo(() => {
    const user = localStorage.getItem('admin_user');
    return user ? JSON.parse(user) : null;
  }, []);

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="text-sm text-gray-500">{subtitle}</p>
        </div>

        {/* Admin Info */}
        {adminUser && (
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900">{adminUser.name}</p>
              <p className="text-xs text-gray-500 capitalize">{adminUser.role.replace('_', ' ')}</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {adminUser.name.charAt(0).toUpperCase()}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}