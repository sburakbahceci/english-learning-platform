import { useNavigate, useLocation } from 'react-router-dom';

interface MenuItem {
  path: string;
  icon: string;
  label: string;
}

const menuItems: MenuItem[] = [
  { path: '/admin/dashboard', icon: '📊', label: 'Dashboard' },
  { path: '/admin/users', icon: '👥', label: 'Users' },
  { path: '/admin/lessons', icon: '📚', label: 'Lessons' },
  { path: '/admin/podcasts', icon: '🎙️', label: 'Podcasts' },
  { path: '/admin/reading', icon: '📖', label: 'Reading' },
  { path: '/admin/writing', icon: '✍️', label: 'Writing' },
  { path: '/admin/speaking', icon: '🎤', label: 'Speaking' },
  { path: '/admin/exams', icon: '📝', label: 'Exams' },
  { path: '/admin/analytics', icon: '📈', label: 'Analytics' },
];

export default function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    navigate('/admin/login');
  };

  return (
    <div className="w-64 bg-gray-900 text-white h-screen flex flex-col fixed left-0 top-0 z-50">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <img
            src="/logo-icon.png"
            alt="Lingoria Icon"
            className="w-10 h-10 rounded-lg"
          />
          <div>
            <h2 className="text-lg font-bold">Lingoria</h2>
            <p className="text-xs text-gray-400">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <button
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  location.pathname === item.path
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium text-sm">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-gray-800 transition-colors"
        >
          <span className="text-xl">🚪</span>
          <span className="font-medium text-sm">Logout</span>
        </button>
      </div>
    </div>
  );
}
