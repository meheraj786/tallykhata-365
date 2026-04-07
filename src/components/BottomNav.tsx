import { Home, List, BarChart3, MoreHorizontal } from 'lucide-react';
import { NavLink } from 'react-router';

const navItems = [
  { to: '/', icon: Home, label: 'হোম' },
  { to: '/transactions', icon: List, label: 'খাতা' },
  { to: '/reports', icon: BarChart3, label: 'রিপোর্ট' },
  { to: '/more', icon: MoreHorizontal, label: 'আরও' },
];

export default function BottomNav() {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50">
      <div className="flex items-center justify-around py-2 max-w-md mx-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-1 px-4 rounded-xl transition-colors ${
                isActive ? 'text-emerald-600' : 'text-muted-foreground'
              }`
            }
          >
            <Icon size={24} />
            <span className="text-xs font-medium">{label}</span>
          </NavLink>
        ))}
      </div>
    </div>
  );
}