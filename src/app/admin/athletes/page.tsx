import { getSession } from '@/lib/auth';
import Link from 'next/link';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminAthletesPage() {
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
            to access the administration panel.
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

  return (
    <div className="animate-fadeIn">
      <div className="admin-pagehead">
        <div>
          <h1>Manage <em>Athletes</em></h1>
          <div className="sub">Verify profiles, edit pronouns, joined year, and claim statuses.</div>
        </div>
      </div>
      
      <div className="tile p-8 bg-white border-2 border-ink shadow-[4px_5px_0_#0d3a52] text-center max-w-lg mx-auto mt-8 select-none">
        <h3 className="font-display text-2xl text-ink font-normal mb-2">Athletes Panel</h3>
        <p className="text-xs text-ink-3 leading-relaxed mb-6">
          This panel is scheduled for development in Phase 4. Here you will be able to review claimed profiles, link results to athlete accounts, edit athlete hometowns, and manage pronouns.
        </p>
        <Link 
          href="/admin" 
          className="pill active inline-flex items-center gap-2 bg-ink text-white font-semibold text-xs py-2.5 px-5 rounded-full border-2 border-ink hover:bg-ink-2 active:translate-y-[1px] cursor-pointer"
        >
          <span>Back to Dashboard</span>
        </Link>
      </div>
    </div>
  );
}
