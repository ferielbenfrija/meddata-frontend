import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  Upload,
  Shield,
  FolderOpen,
  Settings,
  Search,
  FileText,
  BookOpen,
  User,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const adminNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: 'Upload Files', href: '/admin/upload', icon: <Upload className="h-5 w-5" /> },
  { label: 'Anonymize', href: '/admin/anonymize', icon: <Shield className="h-5 w-5" /> },
  { label: 'Manage Files', href: '/admin/files', icon: <FolderOpen className="h-5 w-5" /> },
  { label: 'Settings', href: '/admin/settings', icon: <Settings className="h-5 w-5" /> },
];

const researcherNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/researcher/dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: 'Browse Dataset', href: '/researcher/browse', icon: <Search className="h-5 w-5" /> },
  { label: 'About & Docs', href: '/researcher/about', icon: <BookOpen className="h-5 w-5" /> },
  { label: 'Profile', href: '/researcher/profile', icon: <User className="h-5 w-5" /> },
];

export default function Sidebar() {
  const { user } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = user?.role === 'admin' ? adminNavItems : researcherNavItems;

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen bg-sidebar text-sidebar-foreground transition-all duration-300 z-40',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
        <Link to="/dashboard" className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-sidebar-primary/20 flex items-center justify-center flex-shrink-0">
            <Shield className="h-6 w-6 text-sidebar-foreground" />
          </div>
          {!collapsed && (
            <span className="text-lg font-bold text-sidebar-foreground">MedData</span>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
              )}
            >
              {item.icon}
              {!collapsed && <span className="font-medium">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setCollapsed(!collapsed)}
        className="absolute bottom-4 right-4 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
      >
        {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
      </Button>
    </aside>
  );
}
