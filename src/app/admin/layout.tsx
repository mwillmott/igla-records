import { getSession } from '@/lib/auth';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { 
  ShieldAlert, ArrowLeft, Waves, LogOut, Eye 
} from 'lucide-react';
import db from '@/db';
import AdminSidebarNav, { AdminBreadcrumb } from './AdminSidebarNav';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();

  // Security Wall: Deny access to non-admins
  if (!session || session.role !== 'admin') {
    return (
      <div className="view-enter flex flex-col items-center justify-center min-h-[60vh] py-12 select-none">
        <section className="tile tile-lg p-10 max-w-lg text-center bg-white/70 border-2 border-ink shadow-[5px_6px_0_#0d3a52]">
          <div className="mx-auto w-14 h-14 rounded-full bg-coral-pale text-coral-deep flex items-center justify-center mb-6 border-2 border-ink">
            <ShieldAlert size={28} />
          </div>
          <h1 className="font-display text-4xl text-ink font-normal mb-3">Access Denied</h1>
          <p className="text-xs text-ink-3 leading-relaxed mb-6">
            You must be logged in with an official <span className="font-semibold text-coral">@igla.org</span> email address 
            to access the administration dashboard.
          </p>
          <Link 
            href="/results" 
            className="pill active inline-flex items-center gap-2 bg-ink text-white font-semibold text-xs py-2.5 px-5 rounded-full border-2 border-ink hover:bg-ink-2 active:translate-y-[1px]"
          >
            <ArrowLeft size={14} />
            <span>Back to Records</span>
          </Link>
        </section>
      </div>
    );
  }

  // Query counts dynamically from the database for the sidebar stats
  const clubsCount = db.prepare('SELECT COUNT(*) AS count FROM clubs').get() as { count: number };
  const tournamentsCount = db.prepare('SELECT COUNT(*) AS count FROM tournaments').get() as { count: number };
  const athletesCount = db.prepare('SELECT COUNT(*) AS count FROM athletes').get() as { count: number };
  const resultsCount = db.prepare('SELECT COUNT(*) AS count FROM swimming_results').get() as { count: number };

  const initials = session.name ? session.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'AD';

  return (
    <div className="admin-shell h-dvh overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <span className="brand-mark"><Waves size={15} /></span>
          <div>
            <div className="at">IGLA<span className="plus">+</span></div>
            <span className="badge">Admin Console</span>
          </div>
        </div>

        <AdminSidebarNav 
          counts={{
            clubs: clubsCount.count,
            tournaments: tournamentsCount.count,
            athletes: athletesCount.count,
            results: resultsCount.count,
          }}
        />

        {/* Sidebar Profile & Logout Footer */}
        <div className="admin-sidebar-foot">
          <div className="avatar">{initials}</div>
          <div className="min-w-0 flex-1">
            <div className="who truncate text-xs">{session.name || 'Administrator'}</div>
            <div className="role text-[9px] uppercase tracking-wider text-aqua-sky mt-0.5">{session.role}</div>
          </div>
          <Link href="/api/auth/logout" className="out" title="Log Out">
            <LogOut size={15} />
          </Link>
        </div>
      </aside>

      {/* Main Panel Content Column */}
      <div className="admin-main">
        <div className="admin-topbar">
          <AdminBreadcrumb />
          <Link href="/results" className="ghost-link">
            <Eye size={14} /> View public site
          </Link>
        </div>

        <div className="admin-body">
          {children}
        </div>
      </div>
    </div>
  );
}
