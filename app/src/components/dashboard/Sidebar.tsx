import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderOpen,
  Users,
  MessageSquare,
  Settings,
  Building2,
  LogOut,
  PlusCircle,
  Menu,
  Calendar,
  BarChart3,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

interface SidebarProps {
  cabinetName: string;
  onLogout: () => void;
}

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Tableau de bord' },
  { to: '/dashboard/projets', icon: FolderOpen, label: 'Mes Projets' },
  { to: '/dashboard/nouveau-projet', icon: PlusCircle, label: 'Nouveau Projet' },
  { to: '/dashboard/candidats', icon: Users, label: 'Candidats' },
  { to: '/dashboard/calendrier', icon: Calendar, label: 'Calendrier' },
  { to: '/dashboard/statistiques', icon: BarChart3, label: 'Statistiques' },
  { to: '/dashboard/messages', icon: MessageSquare, label: 'Messages' },
  { to: '/dashboard/parametres', icon: Settings, label: 'Parametres' },
];

function SidebarContent({ cabinetName, onLogout, onNavClick }: SidebarProps & { onNavClick?: () => void }) {
  return (
    <>
      {/* Logo et nom du cabinet */}
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-lg">PPEO</h1>
            <p className="text-xs text-slate-400 truncate max-w-[140px]">{cabinetName}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.to === '/dashboard'}
                onClick={onNavClick}
                className={({ isActive }: { isActive: boolean }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Deconnexion</span>
        </button>
      </div>
    </>
  );
}

export function Sidebar({ cabinetName, onLogout }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar - hidden on mobile */}
      <aside className="hidden lg:flex w-64 bg-slate-900 text-white min-h-screen flex-col">
        <SidebarContent cabinetName={cabinetName} onLogout={onLogout} />
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-slate-900 text-white flex items-center gap-3 px-4 py-3">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-lg hover:bg-slate-800 transition-colors"
          aria-label="Ouvrir le menu"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Building2 className="w-4 h-4" />
          </div>
          <span className="font-bold">PPEO</span>
          <span className="text-xs text-slate-400 truncate max-w-[120px]">- {cabinetName}</span>
        </div>
      </div>

      {/* Mobile drawer */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-64 p-0 bg-slate-900 text-white border-slate-800">
          <SheetHeader className="sr-only">
            <SheetTitle>Menu de navigation</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col h-full">
            <SidebarContent
              cabinetName={cabinetName}
              onLogout={() => {
                setMobileOpen(false);
                onLogout();
              }}
              onNavClick={() => setMobileOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
