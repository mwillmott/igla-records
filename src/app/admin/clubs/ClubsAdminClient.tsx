'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Search, Plus, Edit, Trash2, Globe, MapPin, Trophy, X, 
  ChevronLeft, ChevronRight, ChevronDown, AlertCircle, CheckCircle2, 
  HelpCircle, Waves, Target, ShieldAlert, Save, ExternalLink
} from 'lucide-react';
import { AQUATIC_SPORTS, REGIONS } from '@/lib/config';

interface Club {
  id: string;
  name: string;
  short_name: string;
  city: string;
  country: string;
  flag: string;
  region: string;
  founded_year: number;
  color: string;
  tagline: string;
  website: string | null;
  sports: string; // Comma-separated list
  members: number;
  gold: number;
  silver: number;
  bronze: number;
  records: number;
  tournamentsAttended: number;
}

interface ClubsAdminClientProps {
  clubs: Club[];
}

const COLOR_PRESETS = [
  '#37a3c4', // Aqua
  '#ff6f50', // Coral
  '#0d3a52', // Ink
  '#f1c050', // Gold
  '#5eb87a', // Green
  '#c08b5b', // Bronze
];

export default function ClubsAdminClient({ clubs: initialClubs }: ClubsAdminClientProps) {
  const router = useRouter();
  const [clubs, setClubs] = useState<Club[]>(initialClubs);
  
  // Search, Filter, Sort and Pagination states
  const [search, setSearch] = useState('');
  const [regionFilter, setRegionFilter] = useState('All');
  const [sportFilter, setSportFilter] = useState('All');
  const [sortField, setSortField] = useState<'name' | 'members' | 'founded_year' | 'gold'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // Edit / Add form states
  const [editingClub, setEditingClub] = useState<(Partial<Club> & { isNew?: boolean }) | null>(null);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  
  // Custom tracking to determine if ID slug should auto-generate from Name
  const [isSlugOverridden, setIsSlugOverridden] = useState(false);

  // Delete states
  const [deletingClub, setDeletingClub] = useState<Club | null>(null);
  const [confirmDeleteText, setConfirmDeleteText] = useState('');
  const [impactCounts, setImpactCounts] = useState<{
    athletes: number;
    results: number;
    teams: number;
    history: number;
  } | null>(null);
  const [loadingImpact, setLoadingImpact] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Notification Toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Sync state if initialClubs props change
  useEffect(() => {
    setClubs(initialClubs);
  }, [initialClubs]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Helper: Slugify Name to ID
  const slugify = (text: string) => {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')           // Replace spaces with -
      .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
      .replace(/\-\-+/g, '-')         // Replace multiple - with single -
      .replace(/^-+/, '')             // Trim - from start
      .replace(/-+$/, '');            // Trim - from end
  };

  // Form Field change handler
  const handleFormFieldChange = (field: string, value: any) => {
    if (!editingClub) return;

    setEditingClub(prev => {
      if (!prev) return null;
      const updated = { ...prev, [field]: value };
      
      // If it is a new club, auto-generate the slug based on the name, unless the user manually edited the slug
      if (prev.isNew && field === 'name' && !isSlugOverridden) {
        updated.id = slugify(value);
      }

      return updated;
    });
  };

  const handleSlugManualChange = (val: string) => {
    setIsSlugOverridden(true);
    handleFormFieldChange('id', slugify(val));
  };

  // Handle Sport checkbox toggles in form
  const handleSportToggle = (sport: string) => {
    if (!editingClub) return;
    const currentSports = editingClub.sports ? editingClub.sports.split(',').filter(Boolean) : [];
    let nextSports = [];

    if (currentSports.includes(sport)) {
      nextSports = currentSports.filter(s => s !== sport);
    } else {
      nextSports = [...currentSports, sport];
    }

    handleFormFieldChange('sports', nextSports.join(','));
  };

  // Fetch deletion impact statistics
  const fetchImpactCounts = async (clubId: string) => {
    setLoadingImpact(true);
    setDeleteError('');
    try {
      const response = await fetch(`/api/admin/clubs/impact?id=${encodeURIComponent(clubId)}`);
      if (!response.ok) {
        throw new Error('Failed to load deletion impact preview.');
      }
      const data = await response.json();
      setImpactCounts(data);
    } catch (err: any) {
      setDeleteError(err.message || 'Error loaded linked records preview.');
    } finally {
      setLoadingImpact(false);
    }
  };

  const openDeleteModal = (club: Club) => {
    setDeletingClub(club);
    setConfirmDeleteText('');
    setImpactCounts(null);
    setDeleteError('');
    fetchImpactCounts(club.id);
  };

  const closeDeleteModal = () => {
    setDeletingClub(null);
    setConfirmDeleteText('');
    setImpactCounts(null);
  };

  const handleDeleteClub = async () => {
    if (!deletingClub) return;
    if (confirmDeleteText.trim().toLowerCase() !== deletingClub.short_name.toLowerCase()) {
      setDeleteError(`Please type "${deletingClub.short_name}" exactly to confirm.`);
      return;
    }

    setDeleting(true);
    setDeleteError('');
    try {
      const response = await fetch('/api/admin/clubs/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: deletingClub.id }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete club.');
      }

      showToast(`Club "${deletingClub.name}" deleted successfully.`);
      closeDeleteModal();
      router.refresh();
    } catch (err: any) {
      setDeleteError(err.message || 'Failed to delete club.');
    } finally {
      setDeleting(false);
    }
  };

  const handleSaveClub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClub) return;

    if (!editingClub.id || !editingClub.name || !editingClub.short_name || !editingClub.city || !editingClub.country || !editingClub.flag || !editingClub.region || !editingClub.founded_year || !editingClub.color) {
      setFormError('Please fill out all required fields.');
      return;
    }

    setSaving(true);
    setFormError('');

    try {
      const response = await fetch('/api/admin/clubs/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingClub),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to save club.');
      }

      showToast(`Club "${editingClub.name}" saved successfully.`);
      setEditingClub(null);
      router.refresh();
    } catch (err: any) {
      setFormError(err.message || 'Error occurred while saving.');
    } finally {
      setSaving(false);
    }
  };

  // Filter & Search Logic
  const filteredClubs = useMemo(() => {
    return clubs.filter(c => {
      // 1. Search Query
      if (search.trim()) {
        const query = search.toLowerCase();
        const hay = `${c.name} ${c.short_name} ${c.city} ${c.country} ${c.tagline}`.toLowerCase();
        if (!hay.includes(query)) return false;
      }

      // 2. Region Filter
      if (regionFilter !== 'All' && c.region !== regionFilter) {
        return false;
      }

      // 3. Sport Filter
      if (sportFilter !== 'All') {
        const clubSports = c.sports ? c.sports.split(',') : [];
        if (!clubSports.includes(sportFilter)) {
          return false;
        }
      }

      return true;
    });
  }, [clubs, search, regionFilter, sportFilter]);

  // Sorting Logic
  const sortedClubs = useMemo(() => {
    const list = [...filteredClubs];
    list.sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];

      // Handle null/undefined values
      if (valA === undefined || valA === null) valA = '';
      if (valB === undefined || valB === null) valB = '';

      if (typeof valA === 'string') {
        return sortDirection === 'asc' 
          ? valA.localeCompare(valB) 
          : valB.localeCompare(valA);
      } else {
        return sortDirection === 'asc'
          ? valA - valB
          : valB - valA;
      }
    });
    return list;
  }, [filteredClubs, sortField, sortDirection]);

  // Pagination Logic
  const paginatedClubs = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedClubs.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedClubs, currentPage]);

  const totalPages = Math.max(1, Math.ceil(sortedClubs.length / itemsPerPage));

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, regionFilter, sportFilter, sortField, sortDirection]);

  const toggleSort = (field: 'name' | 'members' | 'founded_year' | 'gold') => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const openAddClubModal = () => {
    setIsSlugOverridden(false);
    setEditingClub({
      isNew: true,
      id: '',
      name: '',
      short_name: '',
      city: '',
      country: '',
      flag: '🏳️‍🌈',
      region: REGIONS[0],
      founded_year: new Date().getFullYear(),
      color: COLOR_PRESETS[0],
      tagline: '',
      website: '',
      sports: 'Swimming',
      members: 0,
      gold: 0,
      silver: 0,
      bronze: 0,
      records: 0,
      tournamentsAttended: 0
    });
    setFormError('');
  };

  const openEditClubModal = (club: Club) => {
    setEditingClub({
      isNew: false,
      ...club
    });
    setFormError('');
  };

  // Quick select flag emoji options
  const FLAG_PRESETS = ['🏳️‍🌈', '🏳️‍⚧️', '🇺🇸', '🇨🇦', '🇬🇧', '🇫🇷', '🇪🇸', '🇩🇪', '🇦🇺', '🇯🇵', '🇳🇿', '🇲🇽', '🇧🇷'];

  return (
    <div className="view-enter" data-screen-label="Admin Clubs">
      {/* Toast Alert */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 p-4 rounded-xl border-2 shadow-[4px_5px_0_#0d3a52] flex items-center gap-3 animate-slideIn ${
          toast.type === 'success' 
            ? 'bg-emerald-50 border-emerald-500 text-emerald-800' 
            : 'bg-coral-pale border-coral text-coral-deep'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span className="text-xs font-bold">{toast.message}</span>
        </div>
      )}

      {/* Page head */}
      <div className="admin-pagehead animate-fadeIn">
        <div>
          <h1>Manage <em>Clubs</em></h1>
          <div className="sub">Register, edit, or remove member organizations from the directory.</div>
        </div>
        <div className="admin-actions">
          <button 
            onClick={openAddClubModal}
            className="pill active inline-flex items-center gap-2 bg-ink text-white font-semibold text-xs py-2.5 px-5 rounded-full border-2 border-ink hover:bg-ink-2 active:translate-y-[1px] cursor-pointer"
          >
            <Plus size={14} />
            <span>Create Club Profile</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="stat-strip mb-6 animate-fadeIn">
        <div className="stat-tile">
          <div className="stat-tile-val font-mono tabular-nums">{clubs.length}</div>
          <div className="stat-tile-key text-ink-3">Total Clubs</div>
        </div>
        <div className="stat-tile">
          <div className="stat-tile-val font-mono tabular-nums">
            {clubs.reduce((sum, c) => sum + (c.members || 0), 0).toLocaleString()}
          </div>
          <div className="stat-tile-key text-ink-3">Est. Total Athletes</div>
        </div>
        <div className="stat-tile">
          <div className="stat-tile-val font-mono tabular-nums">
            {new Set(clubs.map(c => c.country)).size}
          </div>
          <div className="stat-tile-key text-ink-3">Countries Represented</div>
        </div>
        <div className="stat-tile coral">
          <div className="stat-tile-val font-mono text-white tabular-nums">
            {new Set(clubs.map(c => c.region)).size}
          </div>
          <div className="stat-tile-key text-white/90">Global Regions</div>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="dt-toolbar gap-3 mb-4 select-none animate-fadeIn">
        
        {/* Search */}
        <div className="search max-w-[280px]">
          <Search size={14} />
          <input
            placeholder="Search name, city, tagline..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full text-xs"
          />
          {search && (
            <button className="search-clear" onClick={() => setSearch('')}>
              <X size={14} />
            </button>
          )}
        </div>

        {/* Region filter */}
        <div className="flex items-center gap-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-ink-3">Region:</label>
          <div className="sel-wrap min-w-[140px]">
            <select
              value={regionFilter}
              onChange={e => setRegionFilter(e.target.value)}
              className="h-10 text-xs px-3 bg-white border-2 border-ink rounded-xl font-semibold w-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-aqua"
            >
              <option value="All">All Regions</option>
              {REGIONS.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            <ChevronDown size={12} className="chev" />
          </div>
        </div>

        {/* Sport filter */}
        <div className="flex items-center gap-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-ink-3">Sport:</label>
          <div className="sel-wrap min-w-[160px]">
            <select
              value={sportFilter}
              onChange={e => setSportFilter(e.target.value)}
              className="h-10 text-xs px-3 bg-white border-2 border-ink rounded-xl font-semibold w-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-aqua"
            >
              <option value="All">All Sports</option>
              {AQUATIC_SPORTS.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <ChevronDown size={12} className="chev" />
          </div>
        </div>

        <div className="results-meta select-none">
          Showing <span className="font-mono font-bold text-ink">{sortedClubs.length}</span> of <span className="font-mono text-ink-3">{clubs.length}</span> clubs
        </div>
      </div>

      {/* Table view */}
      <div className="dt-wrap animate-fadeIn">
        <table className="dt">
          <thead>
            <tr>
              <th style={{ width: '23%' }}>
                <button 
                  onClick={() => toggleSort('name')}
                  className={`sortable ${sortField === 'name' ? 'on' : ''}`}
                >
                  Club Profile
                  {sortField === 'name' && (sortDirection === 'asc' ? ' ▲' : ' ▼')}
                </button>
              </th>
              <th style={{ width: '12%' }}>Location</th>
              <th style={{ width: '10%' }}>Region</th>
              <th style={{ width: '18%' }}>Sports</th>
              <th className="num" style={{ width: '7%' }}>
                <button 
                  onClick={() => toggleSort('founded_year')}
                  className={`sortable ${sortField === 'founded_year' ? 'on' : ''}`}
                >
                  Founded
                  {sortField === 'founded_year' && (sortDirection === 'asc' ? ' ▲' : ' ▼')}
                </button>
              </th>
              <th className="num" style={{ width: '8%' }}>
                <button 
                  onClick={() => toggleSort('members')}
                  className={`sortable ${sortField === 'members' ? 'on' : ''}`}
                >
                  Athletes
                  {sortField === 'members' && (sortDirection === 'asc' ? ' ▲' : ' ▼')}
                </button>
              </th>
              <th className="num" style={{ width: '12%' }}>
                <button 
                  onClick={() => toggleSort('gold')}
                  className={`sortable ${sortField === 'gold' ? 'on' : ''}`}
                >
                  Medals
                  {sortField === 'gold' && (sortDirection === 'asc' ? ' ▲' : ' ▼')}
                </button>
              </th>
              <th className="act" style={{ width: '10%' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedClubs.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-ink-3 italic">
                  No clubs match the search or filter criteria.
                </td>
              </tr>
            ) : (
              paginatedClubs.map((club) => {
                const sportsList = club.sports ? club.sports.split(',').filter(Boolean) : [];
                return (
                  <tr key={club.id}>
                    <td>
                      <div className="t-main">
                        <span className="flag select-none" title={club.country}>{club.flag}</span>
                        <div>
                          <div className="t-nm font-semibold flex items-center gap-1.5">
                            <Link
                              href={`/clubs/${club.id}`}
                              target="_blank"
                              className="hover:underline text-ink hover:text-coral transition-colors"
                            >
                              {club.name}
                            </Link>
                                                    <span 
                              className="w-2.5 h-2.5 rounded-full border border-ink/20 shrink-0" 
                              style={{ backgroundColor: club.color }}
                              title={`Visual Color Theme: ${club.color}`}
                            />
                          </div>
                          <div className="club-id select-none">ID: {club.id}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="text-xs font-semibold text-ink-2">{club.city}</div>
                      <div className="text-[10px] text-ink-3 mt-0.5">{club.country}</div>
                    </td>
                    <td>
                      <span className="text-xs font-semibold text-ink-2">{club.region}</span>
                    </td>
                    <td>
                      <div className="flex flex-wrap gap-1 select-none">
                        {sportsList.map(s => (
                          <span 
                            key={s} 
                            className="text-[9px] py-0.5 px-1.5 rounded-full font-semibold border bg-aqua-sky/30 border-ink/10 text-ink-2 whitespace-nowrap"
                          >
                            {s === 'Swimming' && <Waves size={8} className="inline mr-0.5" />}
                            {s === 'Water Polo' && <Target size={8} className="inline mr-0.5" />}
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="num font-mono text-xs text-ink-2">
                      {club.founded_year}
                    </td>
                    <td className="num font-mono text-xs font-semibold text-ink">
                      {club.members.toLocaleString()}
                    </td>
                    <td className="num select-none">
                      <div className="flex justify-end gap-1 select-none">
                        <span className="flex items-center gap-1 font-bold text-[9px] uppercase tracking-wider text-ink bg-white/60 border border-ink/10 py-0.5 px-1.5 rounded-full shadow-[1px_1.5px_0_#0d3a52] whitespace-nowrap">
                          <span className="w-2 h-2 rounded-full border border-ink inline-block" style={{ background: 'var(--gold)' }} />
                          <span>{club.gold} G</span>
                        </span>
                        <span className="flex items-center gap-1 font-bold text-[9px] uppercase tracking-wider text-ink bg-white/60 border border-ink/10 py-0.5 px-1.5 rounded-full shadow-[1px_1.5px_0_#0d3a52] whitespace-nowrap">
                          <span className="w-2 h-2 rounded-full border border-ink inline-block" style={{ background: 'var(--silver)' }} />
                          <span>{club.silver} S</span>
                        </span>
                        <span className="flex items-center gap-1 font-bold text-[9px] uppercase tracking-wider text-ink bg-white/60 border border-ink/10 py-0.5 px-1.5 rounded-full shadow-[1px_1.5px_0_#0d3a52] whitespace-nowrap">
                          <span className="w-2 h-2 rounded-full border border-ink inline-block" style={{ background: 'var(--bronze)' }} />
                          <span>{club.bronze} B</span>
                        </span>
                      </div>
                    </td>
                    <td className="act">
                      <div className="row-actions">
                        <Link
                          href={`/clubs/${club.id}`}
                          target="_blank"
                          className="row-btn"
                          title="View Public Profile (opens new tab)"
                        >
                          <ExternalLink size={13} />
                        </Link>
                        {club.website ? (
                          <a
                            href={club.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="row-btn"
                            title="Visit Club Website (opens new tab)"
                          >
                            <Globe size={13} />
                          </a>
                        ) : (
                          <span
                            className="row-btn opacity-35 cursor-not-allowed select-none"
                            title="No website configured"
                          >
                            <Globe size={13} className="text-ink-3" />
                          </span>
                        )}
                        <button
                          onClick={() => openEditClubModal(club)}
                          className="row-btn"
                          title="Edit Club Details"
                        >
                          <Edit size={13} />
                        </button>
                        <button
                          onClick={() => openDeleteModal(club)}
                          className="row-btn danger"
                          title="Delete Club"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Dense Table Footer & Pager */}
        <div className="dt-foot select-none">
          <div>
            Showing <span className="font-mono font-bold text-ink">{(currentPage - 1) * itemsPerPage + 1}</span>-
            <span className="font-mono font-bold text-ink">
              {Math.min(currentPage * itemsPerPage, sortedClubs.length)}
            </span> of{' '}
            <span className="font-mono font-bold text-ink">{sortedClubs.length}</span> entries
          </div>
          
          {totalPages > 1 && (
            <div className="pager">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="pg hover:bg-aqua-pale disabled:opacity-30 disabled:pointer-events-none"
              >
                <ChevronLeft size={13} />
              </button>
              
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`pg ${currentPage === i + 1 ? 'active' : 'hover:bg-aqua-pale'}`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className="pg hover:bg-aqua-pale disabled:opacity-30 disabled:pointer-events-none"
              >
                <ChevronRight size={13} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* EDIT / ADD MODAL PORTAL (DUAL COLUMN: FORM + LIVE MOCKUP PREVIEW) */}
      {editingClub && createPortal(
        <div className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div 
            className="tile bg-white border-2 border-ink shadow-[5px_6px_0_#0d3a52] overflow-hidden flex flex-col max-h-[90vh] rounded-2xl animate-scaleUp"
            style={{ width: '860px', maxWidth: '95vw' }}
          >
            {/* Header */}
            <div className="p-5 border-b-2 border-ink bg-aqua-sky/30 flex justify-between items-center select-none">
              <div className="flex items-center gap-2">
                <Globe size={18} className="text-coral" />
                <h3 className="font-display text-xl font-bold text-ink">
                  {editingClub.isNew ? 'Create New Club Profile' : `Edit Club Details: ${editingClub.name}`}
                </h3>
              </div>
              <button 
                onClick={() => setEditingClub(null)}
                className="w-8 h-8 rounded-full border-2 border-ink bg-white flex items-center justify-center text-ink hover:bg-coral-pale hover:text-coral transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X size={14} />
              </button>
            </div>

            {/* Content: Form + Live Card Preview */}
            <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
              
              {/* Left Column: Form Fields (scrollable) */}
              <form 
                onSubmit={handleSaveClub}
                className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 text-left border-r border-ink/10"
              >
                {formError && (
                  <div className="p-3.5 bg-coral-pale border-2 border-coral rounded-xl text-xs font-semibold text-coral-deep flex items-start gap-2">
                    <ShieldAlert size={15} className="shrink-0 mt-0.5" />
                    <span>{formError}</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-ink-3">Club Name <span className="text-coral">*</span></label>
                    <input 
                      type="text" 
                      value={editingClub.name || ''} 
                      onChange={e => handleFormFieldChange('name', e.target.value)}
                      placeholder="e.g. Seattle Otters"
                      className="bg-white border-2 border-ink rounded-xl px-3 h-10 font-semibold text-xs text-ink focus:outline-none focus:ring-2 focus:ring-aqua"
                      required
                    />
                  </div>

                  {/* ID Slug (Editable but auto-generated for new clubs) */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-ink-3 flex justify-between items-center">
                      <span>Unique ID Slug <span className="text-coral">*</span></span>
                      {!editingClub.isNew && <span className="text-[8px] text-ink-3 font-normal uppercase bg-bg-2 px-1 rounded border" style={{ fontFamily: 'var(--font-mono)', fontStyle: 'normal' }}>Read-Only</span>}
                    </label>
                    <input 
                      type="text" 
                      value={editingClub.id || ''} 
                      onChange={e => handleSlugManualChange(e.target.value)}
                      disabled={!editingClub.isNew}
                      placeholder="e.g. seattle-otters"
                      className={`bg-white border-2 border-ink rounded-xl px-3 h-10 font-semibold text-xs text-ink focus:outline-none focus:ring-2 focus:ring-aqua ${
                        !editingClub.isNew ? 'bg-bg/40 opacity-70 cursor-not-allowed select-none' : ''
                      }`}
                      style={{ fontFamily: 'var(--font-mono)', fontStyle: 'normal' }}
                      required
                    />
                    {editingClub.isNew && (
                      <span className="text-[9px] text-ink-3 -mt-0.5 leading-none">Auto-generates from name. Lowercase letters, numbers, and hyphens only.</span>
                    )}
                  </div>

                  {/* Short Name */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-ink-3">Short Name <span className="text-coral">*</span></label>
                    <input 
                      type="text" 
                      value={editingClub.short_name || ''} 
                      onChange={e => handleFormFieldChange('short_name', e.target.value)}
                      placeholder="e.g. Seattle"
                      className="bg-white border-2 border-ink rounded-xl px-3 h-10 font-semibold text-xs text-ink focus:outline-none focus:ring-2 focus:ring-aqua"
                      required
                    />
                  </div>

                  {/* Founded Year */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-ink-3">Founded Year <span className="text-coral">*</span></label>
                    <input 
                      type="number" 
                      min="1900"
                      max={new Date().getFullYear() + 5}
                      value={editingClub.founded_year || ''} 
                      onChange={e => handleFormFieldChange('founded_year', parseInt(e.target.value) || '')}
                      placeholder="e.g. 1995"
                      className="bg-white border-2 border-ink rounded-xl px-3 h-10 font-semibold text-xs text-ink focus:outline-none focus:ring-2 focus:ring-aqua"
                      required
                    />
                  </div>

                  {/* City */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-ink-3">City <span className="text-coral">*</span></label>
                    <input 
                      type="text" 
                      value={editingClub.city || ''} 
                      onChange={e => handleFormFieldChange('city', e.target.value)}
                      placeholder="e.g. Seattle"
                      className="bg-white border-2 border-ink rounded-xl px-3 h-10 font-semibold text-xs text-ink focus:outline-none focus:ring-2 focus:ring-aqua"
                      required
                    />
                  </div>

                  {/* Country */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-ink-3">Country <span className="text-coral">*</span></label>
                    <input 
                      type="text" 
                      value={editingClub.country || ''} 
                      onChange={e => handleFormFieldChange('country', e.target.value)}
                      placeholder="e.g. United States"
                      className="bg-white border-2 border-ink rounded-xl px-3 h-10 font-semibold text-xs text-ink focus:outline-none focus:ring-2 focus:ring-aqua"
                      required
                    />
                  </div>

                  {/* Region Select */}
                  <div className="flex flex-col gap-1.5 col-span-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-ink-3">Global Region <span className="text-coral">*</span></label>
                    <div className="sel-wrap">
                      <select 
                        value={editingClub.region || REGIONS[0]} 
                        onChange={e => handleFormFieldChange('region', e.target.value)}
                        className="bg-white border-2 border-ink rounded-xl px-3 h-10 font-semibold text-xs text-ink cursor-pointer focus:outline-none focus:ring-2 focus:ring-aqua"
                        required
                      >
                        {REGIONS.map(r => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="chev" />
                    </div>
                  </div>

                  {/* Flag Emoji Input + Quick presets */}
                  <div className="flex flex-col gap-1.5 col-span-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-ink-3">Flag Emoji / Country Flag <span className="text-coral">*</span></label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        maxLength={4}
                        value={editingClub.flag || ''} 
                        onChange={e => handleFormFieldChange('flag', e.target.value)}
                        placeholder="e.g. 🏳️‍🌈"
                        className="bg-white border-2 border-ink rounded-xl px-3 h-10 font-semibold text-xs text-ink text-center w-16 focus:outline-none focus:ring-2 focus:ring-aqua"
                        required
                      />
                      {/* Presets */}
                      <div className="flex-1 flex flex-wrap gap-1.5 items-center bg-bg/25 border-2 border-dashed border-ink/10 rounded-xl px-2.5 py-1 select-none">
                        {FLAG_PRESETS.map(emoji => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => handleFormFieldChange('flag', emoji)}
                            className="text-lg hover:scale-125 transition-transform duration-100 p-0.5 cursor-pointer leading-none"
                            title={`Pick Flag: ${emoji}`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Tagline */}
                  <div className="flex flex-col gap-1.5 col-span-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-ink-3">Club Tagline</label>
                    <input 
                      type="text" 
                      value={editingClub.tagline || ''} 
                      onChange={e => handleFormFieldChange('tagline', e.target.value)}
                      placeholder="e.g. Swimming with pride since 1995"
                      className="bg-white border-2 border-ink rounded-xl px-3 h-10 font-semibold text-xs text-ink focus:outline-none focus:ring-2 focus:ring-aqua"
                    />
                  </div>

                  {/* Website */}
                  <div className="flex flex-col gap-1.5 col-span-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-ink-3">Website URL</label>
                    <input 
                      type="url" 
                      value={editingClub.website || ''} 
                      onChange={e => handleFormFieldChange('website', e.target.value)}
                      placeholder="e.g. https://www.seattleotters.org"
                      className="bg-white border-2 border-ink rounded-xl px-3 h-10 font-semibold text-xs text-ink focus:outline-none focus:ring-2 focus:ring-aqua"
                    />
                  </div>

                  {/* Members count (career athletes size estimate) */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-ink-3">Total Club Members (Est)</label>
                    <input 
                      type="number" 
                      min="0"
                      value={editingClub.members !== undefined ? editingClub.members : 0} 
                      onChange={e => handleFormFieldChange('members', parseInt(e.target.value) || 0)}
                      className="bg-white border-2 border-ink rounded-xl px-3 h-10 font-mono font-semibold text-xs text-ink focus:outline-none focus:ring-2 focus:ring-aqua"
                      required
                    />
                  </div>

                  {/* Brand Color Swatches & Picker */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-ink-3">Brand Theme Color <span className="text-coral">*</span></label>
                    <div className="swatch-row mt-1">
                      {COLOR_PRESETS.map(c => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => handleFormFieldChange('color', c)}
                          className={`swatch ${editingClub.color === c ? 'on' : ''}`}
                          style={{ backgroundColor: c }}
                          title={`Select brand color: ${c}`}
                        />
                      ))}
                      {/* Native HTML Color Input wrapper */}
                      <div className="relative w-8 h-8 rounded-lg border-2 border-ink flex items-center justify-center bg-white cursor-pointer hover:bg-bg-2">
                        <input
                          type="color"
                          value={editingClub.color || '#37a3c4'}
                          onChange={e => handleFormFieldChange('color', e.target.value)}
                          className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                        />
                        <span className="text-[9px] font-bold text-ink-2 select-none uppercase pointer-events-none">HEX</span>
                      </div>
                    </div>
                  </div>

                  {/* Sports Selection Checkboxes (styled pick list) */}
                  <div className="flex flex-col gap-2 col-span-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-ink-3">Sports & Disciplines Offered</label>
                    <div className="pickset mt-0.5">
                      {AQUATIC_SPORTS.map(sport => {
                        const sportsList = editingClub.sports ? editingClub.sports.split(',').filter(Boolean) : [];
                        const isSelected = sportsList.includes(sport);
                        return (
                          <button
                            key={sport}
                            type="button"
                            onClick={() => handleSportToggle(sport)}
                            className={`pick ${isSelected ? 'on' : ''} cursor-pointer`}
                          >
                            <span className="bx select-none font-bold text-[9px]">
                              {isSelected ? '✓' : ''}
                            </span>
                            <span>{sport}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Submit trigger button (hidden but allows Enter key validation) */}
                <input type="submit" className="hidden" />
              </form>

              {/* Right Column: Live Mockup Card Preview */}
              <div className="w-[340px] bg-bg/30 p-6 flex flex-col items-center justify-center select-none border-t border-ink/10 md:border-t-0 md:bg-bg/15">
                <div className="w-full flex flex-col gap-4 text-left">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-ink-3 flex items-center gap-1">
                    <HelpCircle size={12} className="text-coral" />
                    <span>Real-Time Public Club Card Mockup</span>
                  </span>

                  <div 
                    className="club-card block no-underline border-2 border-ink bg-white rounded-2xl overflow-hidden shadow-[4px_5px_0_#0d3a52] w-full"
                    style={{ '--club-color': editingClub.color || '#37a3c4' } as React.CSSProperties}
                  >
                    <div className="strip" style={{ height: '10px', background: editingClub.color || '#37a3c4', borderBottom: '2px solid var(--ink)' }} />
                    <div className="body p-4.5 flex flex-col gap-3.5">
                      
                      <div className="club-head flex justify-between items-start gap-2.5">
                        <div className="min-w-0 flex-1">
                          <h3 className="club-name font-display text-2xl font-normal text-ink leading-tight truncate">
                            {editingClub.name || 'Your Club Name'}
                          </h3>
                          <div className="club-locale text-[11px] text-ink-3 mt-1 flex items-center gap-1 font-semibold">
                            <MapPin size={11} className="shrink-0" /> 
                            <span className="truncate">{editingClub.city || 'City'}, {editingClub.country || 'Country'}</span>
                          </div>
                        </div>
                        <span className="club-flag text-3xl leading-none">{editingClub.flag || '🏳️‍🌈'}</span>
                      </div>

                      <div className="club-tagline font-display italic text-[13.5px] text-ink-2 my-2.5 leading-relaxed min-h-[40px] line-clamp-2">
                        &ldquo;{editingClub.tagline || 'Your inspirational motto, mission statement, or catchphrase goes here...'}&rdquo;
                      </div>

                      <div className="club-sports flex flex-wrap gap-1">
                        {(editingClub.sports ? editingClub.sports.split(',').filter(Boolean) : []).map(s => (
                          <span 
                            key={s} 
                            className="sport-pill text-[9.5px] py-0.5 px-2 rounded-full font-semibold border bg-aqua-sky/50 text-ink border-ink/20 shrink-0"
                          >
                            {s === 'Swimming' && <Waves size={9} className="inline mr-0.5" />}
                            {s === 'Water Polo' && <Target size={9} className="inline mr-0.5" />}
                            {s}
                          </span>
                        ))}
                        {(!editingClub.sports) && (
                          <span className="text-[9.5px] text-ink-3 italic">No sports selected</span>
                        )}
                      </div>

                      <div className="club-foot flex justify-between items-end border-t border-dashed border-ink/20 pt-3.5 mt-2">
                        <div>
                          <div className="members font-display text-2xl leading-none font-normal text-ink tabular-nums">
                            {(editingClub.members || 0).toLocaleString()}
                          </div>
                          <div className="members-label text-[8.5px] font-bold uppercase tracking-wider text-ink-3 mt-1">
                            Athletes competed · est. {editingClub.founded_year || new Date().getFullYear()}
                          </div>
                        </div>
                        <span className="medal-pill flex items-center gap-1 bg-coral text-white border border-ink py-0.5 px-2.5 rounded-full text-[9.5px] font-bold tracking-wide select-none">
                          <Trophy size={9} /> {editingClub.gold || 0} G
                        </span>
                      </div>
                    </div>
                  </div>

                  {editingClub.website && (
                    <a 
                      href={editingClub.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-coral font-bold hover:underline inline-flex items-center gap-1 self-start"
                    >
                      <span>Visit club website</span>
                      <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="modal-foot flex gap-3 justify-end select-none">
              <button
                type="button"
                onClick={() => setEditingClub(null)}
                disabled={saving}
                className="pill bg-white border-2 border-ink text-ink font-semibold text-xs py-2.5 px-5 rounded-full hover:bg-aqua-pale cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveClub}
                disabled={saving}
                className="pill active bg-ink text-white font-bold text-xs py-2.5 px-6 rounded-full border-2 border-ink hover:bg-ink-2 active:translate-y-[1px] disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
              >
                <Save size={13} />
                <span>{saving ? 'Saving...' : 'Save Club Profile'}</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* DELETE CONFIRMATION MODAL PORTAL (IMPACT-AWARE SAFETY PREVIEW) */}
      {deletingClub && createPortal(
        <div className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div 
            className="modal confirm tile bg-white border-2 border-ink shadow-[5px_6px_0_#0d3a52] overflow-hidden flex flex-col max-h-[90vh] rounded-2xl animate-scaleUp"
            style={{ width: '580px', maxWidth: '100%' }}
          >
            
            {/* Header */}
            <div className="p-5 border-b-2 border-ink bg-coral-pale/35 flex justify-between items-center select-none">
              <div className="flex items-center gap-2">
                <ShieldAlert size={18} className="text-coral-deep" />
                <h3 className="font-display text-xl font-bold text-ink">
                  Delete Member Club?
                </h3>
              </div>
              <button 
                onClick={closeDeleteModal}
                className="w-8 h-8 rounded-full border-2 border-ink bg-white flex items-center justify-center text-ink hover:bg-coral-pale hover:text-coral transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X size={14} />
              </button>
            </div>

            {/* Body */}
            <div className="modal-body text-left p-6">
              <p className="text-xs text-ink-2 leading-relaxed mb-4">
                You are about to permanently delete the profile for <b className="text-ink font-semibold">{deletingClub.name}</b> from the database.
              </p>

              {/* Loader for Linked Statistics */}
              {loadingImpact ? (
                <div className="py-6 flex flex-col items-center justify-center gap-2 text-ink-3">
                  <span className="w-5 h-5 rounded-full border-2 border-ink border-t-transparent animate-spin" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Analyzing associated records...</span>
                </div>
              ) : deleteError ? (
                <div className="p-3 bg-coral-pale border border-coral/30 rounded-xl text-xs text-coral-deep flex items-start gap-2 mb-4">
                  <AlertCircle size={15} className="shrink-0 mt-0.5" />
                  <span>{deleteError}</span>
                </div>
              ) : impactCounts ? (
                <div className="confirm-impact flex flex-col gap-3 select-none">
                  {/* Danger Alert Warning Card */}
                  <div className="danger-note p-3.5 bg-coral-pale border-2 border-coral rounded-xl text-xs text-coral-deep flex flex-col gap-2">
                    <span className="font-bold flex items-center gap-1.5 leading-none">
                      <AlertCircle size={14} className="shrink-0" />
                      Associated Data Warning
                    </span>
                    <p className="text-[11px] leading-normal opacity-90">
                      Deleting this club will permanently remove all of its associated results, rosters, and championship history. Athlete profiles will not be deleted, but their club affiliation will be cleared.
                    </p>
                  </div>

                  {/* Impact Stats List */}
                  <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-ink-2">
                    <div className={`p-3 border-2 rounded-xl flex flex-col justify-center ${
                      impactCounts.results > 0 ? 'bg-coral-pale/40 border-coral/30 text-coral-deep' : 'bg-bg-2/30 border-ink/5 text-ink-3'
                    }`}>
                      <span className="font-mono text-lg leading-none font-bold tabular-nums">{impactCounts.results}</span>
                      <span className="text-[9px] uppercase tracking-wider font-bold mt-1">Swimming Results (Will be Deleted)</span>
                    </div>

                    <div className={`p-3 border-2 rounded-xl flex flex-col justify-center ${
                      impactCounts.teams > 0 ? 'bg-coral-pale/40 border-coral/30 text-coral-deep' : 'bg-bg-2/30 border-ink/5 text-ink-3'
                    }`}>
                      <span className="font-mono text-lg leading-none font-bold tabular-nums">{impactCounts.teams}</span>
                      <span className="text-[9px] uppercase tracking-wider font-bold mt-1">Water Polo Teams (Will be Deleted)</span>
                    </div>

                    <div className={`p-3 border-2 rounded-xl flex flex-col justify-center ${
                      impactCounts.history > 0 ? 'bg-coral-pale/40 border-coral/30 text-coral-deep' : 'bg-bg-2/30 border-ink/5 text-ink-3'
                    }`}>
                      <span className="font-mono text-lg leading-none font-bold tabular-nums">{impactCounts.history}</span>
                      <span className="text-[9px] uppercase tracking-wider font-bold mt-1">Championship History (Will be Deleted)</span>
                    </div>

                    <div className={`p-3 border-2 rounded-xl flex flex-col justify-center ${
                      impactCounts.athletes > 0 ? 'bg-amber-50 border-amber-300 text-amber-800' : 'bg-bg-2/30 border-ink/5 text-ink-3'
                    }`}>
                      <span className="font-mono text-lg leading-none font-bold tabular-nums">{impactCounts.athletes}</span>
                      <span className="text-[9px] uppercase tracking-wider font-bold mt-1">Athletes Affiliated (Will be Cleared)</span>
                    </div>
                  </div>
                </div>
              ) : null}

              {/* Text confirmation */}
              {!loadingImpact && (
                <div className="type-to text-xs text-ink-2 mt-4 select-none">
                  <p className="mb-2">To confirm deletion, please type the club's short name <code>{deletingClub.short_name}</code> below:</p>
                  <input
                    type="text"
                    value={confirmDeleteText}
                    onChange={e => setConfirmDeleteText(e.target.value)}
                    placeholder={deletingClub.short_name}
                    className="w-full bg-white border-2 border-ink rounded-xl px-3 h-10 font-bold text-xs text-ink focus:outline-none focus:ring-2 focus:ring-coral"
                    disabled={deleting}
                  />
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="modal-foot flex gap-3 justify-between select-none bg-bg/40">
              <span className="text-[10px] font-bold text-coral-deep uppercase tracking-wide shrink-0 max-w-[200px] flex items-center">
                ⚠️ THIS ACTION CANNOT BE UNDONE.
              </span>
              
              <div className="flex gap-2">
                <button
                  onClick={closeDeleteModal}
                  disabled={deleting}
                  className="pill bg-white border-2 border-ink text-ink font-semibold text-xs py-2.5 px-5 rounded-full hover:bg-aqua-pale cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteClub}
                  disabled={
                    deleting || 
                    loadingImpact || 
                    confirmDeleteText.trim().toLowerCase() !== deletingClub.short_name.toLowerCase()
                  }
                  className="pill danger font-bold text-xs py-2.5 px-6 rounded-full border-2 border-ink disabled:opacity-30 disabled:pointer-events-none cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 size={13} />
                  <span>{deleting ? 'Deleting...' : 'Delete Club Profile'}</span>
                </button>
              </div>
            </div>

          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
