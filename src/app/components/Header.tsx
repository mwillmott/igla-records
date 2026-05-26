'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Waves, Search, Bell, Shield, LogOut, ChevronDown, User } from 'lucide-react';
import { UserSession } from '@/lib/auth';

interface HeaderProps {
  session: UserSession | null;
}

export default function Header({ session }: HeaderProps) {
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const navItems = [
    { href: '/clubs', label: 'Clubs' },
    { href: '/tournaments', label: 'Tournaments' },
    { href: '/results', label: 'Results' },
  ];

  const getActiveTab = () => {
    if (pathname.startsWith('/clubs')) return '/clubs';
    if (pathname.startsWith('/tournaments')) return '/tournaments';
    if (pathname.startsWith('/results')) return '/results';
    return pathname;
  };

  const activeTab = getActiveTab();

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <Link className="brand" href="/results">
          <span className="brand-mark"><Waves size={16} /></span>
          <span className="brand-text">IGLA<span className="plus">+</span> Records</span>
        </Link>
        
        <nav>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={activeTab === item.href ? 'active' : ''}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        
        <div className="topbar-actions relative">
          {session ? (
            <div className="flex items-center gap-3">
              {session.role === 'admin' && (
                <Link
                  href="/admin"
                  className="pill active flex items-center gap-1.5 text-xs py-1.5 px-3 border-2 border-ink rounded-full bg-coral hover:bg-coral-deep text-white transition-colors"
                  title="Admin Dashboard"
                >
                  <Shield size={13} />
                  <span>Admin</span>
                </Link>
              )}
              
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="avatar cursor-pointer select-none focus:outline-none flex items-center justify-center font-bold text-sm"
                title={`${session.name} (${session.email})`}
              >
                {session.avatar || 'U'}
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="pill active flex items-center gap-1.5 bg-ink text-white font-semibold text-xs py-1.5 px-3 rounded-full hover:bg-ink-2 transition-all cursor-pointer"
            >
              <span>Sign In</span>
              <ChevronDown size={13} />
            </button>
          )}

          {/* User Auth and Simulation Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 top-11 w-64 bg-white border-2 border-ink rounded-2xl shadow-[4px_5px_0_#0d3a52] z-50 overflow-hidden flex flex-col">
              {session ? (
                <>
                  <div className="p-4 border-b-2 border-ink bg-aqua-sky/30">
                    <p className="font-bold text-ink truncate">{session.name}</p>
                    <p className="text-xs text-ink-3 truncate">{session.email}</p>
                    <p className="mt-1.5 text-[10px] font-bold uppercase tracking-wider text-ink-2">
                      Role: <span className={session.role === 'admin' ? 'text-coral' : 'text-aqua'}>{session.role}</span>
                    </p>
                  </div>
                  <Link 
                    href="/api/auth/logout"
                    onClick={() => setDropdownOpen(false)}
                    className="p-3.5 hover:bg-aqua-pale text-ink flex items-center gap-2.5 text-xs font-semibold border-none bg-transparent cursor-pointer text-left w-full transition-colors"
                  >
                    <LogOut size={14} className="text-coral" />
                    <span>Log Out</span>
                  </Link>
                </>
              ) : (
                <>
                  <div className="p-4 border-b-2 border-ink bg-aqua-sky/15">
                    <p className="font-bold text-xs text-ink-2 uppercase tracking-wide">Connect & Test</p>
                    <p className="text-xs text-ink-3 mt-1 leading-snug">Sign in to claim athlete profiles or manage tournament records.</p>
                  </div>
                  
                  {/* Google OAuth Option */}
                  <Link 
                    href="/api/auth/login"
                    onClick={() => setDropdownOpen(false)}
                    className="p-3.5 hover:bg-aqua-pale text-ink flex items-center gap-2.5 text-xs font-semibold transition-colors border-b border-ink/10"
                  >
                    <span className="w-5 h-5 rounded bg-white border border-ink/20 flex items-center justify-center font-bold text-[11px] text-coral">G</span>
                    <span>Sign in with Google</span>
                  </Link>

                  {/* Mock Sandbox Section */}
                  <div className="bg-aqua-pale/40 p-3 border-t border-ink/10">
                    <p className="text-[10px] font-bold text-ink-3 uppercase tracking-wider mb-2">Developer Simulation</p>
                    
                    <Link 
                      href="/api/auth/login?mock=admin"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 p-2 hover:bg-white hover:border-ink/20 border border-transparent rounded-lg text-xs font-semibold text-ink w-full text-left transition-all mb-1.5"
                    >
                      <span className="w-3.5 h-3.5 rounded-full bg-coral flex items-center justify-center text-[8px] text-white">A</span>
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-xs">Simulate Admin</p>
                        <p className="text-[9px] text-ink-3 truncate">admin@igla.org</p>
                      </div>
                    </Link>

                    <Link 
                      href="/api/auth/login?mock=user"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 p-2 hover:bg-white hover:border-ink/20 border border-transparent rounded-lg text-xs font-semibold text-ink w-full text-left transition-all"
                    >
                      <span className="w-3.5 h-3.5 rounded-full bg-aqua flex items-center justify-center text-[8px] text-white">S</span>
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-xs">Simulate Swimmer</p>
                        <p className="text-[9px] text-ink-3 truncate">swimmer@gmail.com</p>
                      </div>
                    </Link>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
