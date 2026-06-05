'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Trophy, UserPlus, Hash, Settings } from 'lucide-react';

interface SidebarNavProps {
  counts: {
    clubs: number;
    tournaments: number;
    athletes: number;
    results: number;
  };
}

export default function AdminSidebarNav({ counts }: SidebarNavProps) {
  const pathname = usePathname();

  const isRouteActive = (route: string) => {
    if (route === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(route);
  };

  return (
    <>
      <Link 
        href="/admin" 
        className={`admin-navitem ${isRouteActive('/admin') ? 'active' : ''}`}
      >
        <span className="ic"><LayoutDashboard size={17} /></span> Dashboard
      </Link>

      <div className="admin-navlabel">Manage</div>
      <Link 
        href="/admin/clubs" 
        className={`admin-navitem ${isRouteActive('/admin/clubs') ? 'active' : ''}`}
      >
        <span className="ic"><Users size={17} /></span> Clubs
        <span className="ct">{counts.clubs}</span>
      </Link>
      <Link 
        href="/admin/tournaments" 
        className={`admin-navitem ${isRouteActive('/admin/tournaments') ? 'active' : ''}`}
      >
        <span className="ic"><Trophy size={17} /></span> Tournaments
        <span className="ct">{counts.tournaments}</span>
      </Link>
      <Link 
        href="/admin/athletes" 
        className={`admin-navitem ${isRouteActive('/admin/athletes') ? 'active' : ''}`}
      >
        <span className="ic"><UserPlus size={17} /></span> Athletes
        <span className="ct">{counts.athletes}</span>
      </Link>
      <Link 
        href="/admin/results" 
        className={`admin-navitem ${isRouteActive('/admin/results') ? 'active' : ''}`}
      >
        <span className="ic"><Hash size={17} /></span> Results
        <span className="ct">{counts.results}</span>
      </Link>

      <div className="admin-navlabel">System</div>
      <Link 
        href="/admin/settings" 
        className={`admin-navitem ${isRouteActive('/admin/settings') ? 'active' : ''}`}
      >
        <span className="ic"><Settings size={17} /></span> Settings
      </Link>
    </>
  );
}

export function AdminBreadcrumb() {
  const pathname = usePathname();
  let label = 'Dashboard';
  
  if (pathname.includes('/clubs')) {
    label = 'Clubs';
  } else if (pathname.includes('/tournaments')) {
    label = 'Tournaments';
  } else if (pathname.includes('/athletes')) {
    label = 'Athletes';
  } else if (pathname.includes('/results')) {
    label = 'Results';
  } else if (pathname.includes('/settings')) {
    label = 'Settings';
  }

  return (
    <div className="admin-crumb select-none">
      Admin <span style={{ margin: '0 5px', color: 'var(--ink-3)' }}>›</span> <b>{label}</b>
    </div>
  );
}
