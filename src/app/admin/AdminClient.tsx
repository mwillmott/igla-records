'use client';

import React from 'react';
import Link from 'next/link';
import { Users, Trophy, UserPlus, Hash, Award, ChevronRight } from 'lucide-react';

interface AdminClientProps {
  stats: {
    clubs: number;
    tournaments: number;
    athletes: number;
    results: number;
  };
  adminName: string;
}

export default function AdminClient({ stats, adminName }: AdminClientProps) {
  return (
    <div className="view-enter" data-screen-label="Admin Dashboard">
      {/* Greeting Header */}
      <div className="admin-pagehead animate-fadeIn">
        <div>
          <h1>Console <em>Dashboard</em></h1>
          <div className="sub">Good morning, {adminName}. Here is the status of the IGLA+ database today.</div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="admin-grid mb-6 animate-fadeIn">
        <Link href="/admin/clubs" className="kpi tile-pressable text-decoration-none block">
          <div className="top">
            <span className="manage">Clubs</span>
            <span className="ic"><Users size={16} /></span>
          </div>
          <div className="val">{stats.clubs}</div>
          <div className="key">Active member organizations</div>
        </Link>
        
        <Link href="/admin/tournaments" className="kpi tile-pressable text-decoration-none block">
          <div className="top">
            <span className="manage">Tournaments</span>
            <span className="ic"><Trophy size={16} /></span>
          </div>
          <div className="val">{stats.tournaments}</div>
          <div className="key">Championship events</div>
        </Link>

        <Link href="/admin/athletes" className="kpi coral tile-pressable text-decoration-none block">
          <div className="top">
            <span className="manage">Athletes</span>
            <span className="ic"><UserPlus size={16} /></span>
          </div>
          <div className="val">{stats.athletes}</div>
          <div className="key">Registered profiles</div>
        </Link>

        <Link href="/admin/results" className="kpi tile-pressable text-decoration-none block">
          <div className="top">
            <span className="manage">Results</span>
            <span className="ic"><Hash size={16} /></span>
          </div>
          <div className="val">{stats.results}</div>
          <div className="key">Committed swim times</div>
        </Link>
      </div>

      {/* Main Dashboard Columns */}
      <div className="admin-cols animate-fadeIn">
        
        {/* Left Column: Welcome & System Overview Panel */}
        <div className="panel">
          <div className="panel-head">
            <h3>Welcome to the IGLA+ Admin Console</h3>
          </div>
          <div className="panel-body" style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <p style={{ fontSize: '15px', color: 'var(--ink-2)', lineHeight: '1.6', margin: 0 }}>
              Use this secure console to manage member clubs, championship events, athlete profiles, and results.
            </p>
            <p style={{ fontSize: '15px', color: 'var(--ink-2)', lineHeight: '1.6', margin: 0 }}>
              To import new championship results, navigate to the <Link href="/admin/results" style={{ color: 'var(--coral)', fontWeight: 'bold' }} className="hover:underline">Results</Link> page in the sidebar. You can upload results in CSV format, match names dynamically, and resolve conflicts in real-time.
            </p>
            <p style={{ fontSize: '15px', color: 'var(--ink-2)', lineHeight: '1.6', margin: 0 }}>
              For any help or support, please check the system settings or contact the webmaster at <a href="mailto:mwillmott@igla.org" style={{ color: 'var(--coral)', fontWeight: 'bold' }} className="hover:underline">mwillmott@igla.org</a>.
            </p>
          </div>
        </div>

        {/* Right Column: Quick Actions Panel */}
        <div className="panel">
          <div className="panel-head">
            <h3>Quick Actions</h3>
          </div>
          <div className="panel-body">
            <button type="button" className="qa" onClick={() => alert('Add Individual Result functionality is scheduled for Phase 2.')}>
              <span className="ic"><Award size={15} /></span>
              <div>
                <div className="lbl">Add Individual Result</div>
                <div className="desc">Manually enter a swim or polo result</div>
              </div>
              <ChevronRight size={14} className="chev" />
            </button>
            <Link href="/admin/tournaments" className="qa">
              <span className="ic"><Trophy size={15} /></span>
              <div>
                <div className="lbl">Add New Tournament</div>
                <div className="desc">Set up dates, venue, and logo colors</div>
              </div>
              <ChevronRight size={14} className="chev" />
            </Link>
            <Link href="/admin/clubs" className="qa">
              <span className="ic"><Users size={15} /></span>
              <div>
                <div className="lbl">Create Club Profile</div>
                <div className="desc">Register a new IGLA+ member club</div>
              </div>
              <ChevronRight size={14} className="chev" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
