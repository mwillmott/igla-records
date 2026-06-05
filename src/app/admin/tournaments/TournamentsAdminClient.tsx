'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Search, Plus, Edit, Trash2, Calendar, MapPin, Globe, X, 
  ChevronLeft, ChevronRight, ChevronDown, AlertCircle, CheckCircle2, 
  HelpCircle, ShieldAlert, Save, ExternalLink
} from 'lucide-react';
import { formatTournamentDates } from '@/app/(public)/tournaments/TournamentsClient';
import { TOURNAMENT_TYPES } from '@/lib/config';


interface Tournament {
  id: string;
  name: string;
  type: string;
  city: string;
  country: string;
  flag: string;
  year: number;
  start_date: string;
  end_date: string;
  status: 'live' | 'upcoming' | 'past';
  color: string;
  website: string | null;
  venue: string | null;
  description: string | null;
  expected_athletes: number | null;
  expected_nations: number | null;
  expected_clubs: number | null;
  participants: number | null;
  nations: number | null;
  clubs: number | null;
  records: number | null;
}

interface TournamentsAdminClientProps {
  tournaments: Tournament[];
}

const COLOR_PRESETS = [
  '#37a3c4', // Aqua
  '#ff6f50', // Coral
  '#0d3a52', // Ink
  '#f1c050', // Gold
  '#5eb87a', // Green
  '#c08b5b', // Bronze
];

const FLAG_PRESETS = ['🏳️‍🌈', '🏳️‍⚧️', '🇪🇸', '🇺🇸', '🇬🇧', '🇦🇷', '🇨🇦', '🇮🇸', '🇫🇷', '🇩🇪', '🇦🇺', '🇯🇵', '🇳🇿', '🇲🇽', '🇧🇷'];

export default function TournamentsAdminClient({ tournaments: initialTournaments }: TournamentsAdminClientProps) {
  const router = useRouter();
  const [tournaments, setTournaments] = useState<Tournament[]>(initialTournaments);
  
  // Search, Filter, Sort and Pagination states
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortField, setSortField] = useState<'year' | 'name' | 'participants' | 'records'>('year');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Edit / Add form states
  const [editingTournament, setEditingTournament] = useState<(Partial<Tournament> & { isNew?: boolean }) | null>(null);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  
  // Custom tracking to determine if ID slug should auto-generate from Name
  const [isSlugOverridden, setIsSlugOverridden] = useState(false);

  // Delete states
  const [deletingTournament, setDeletingTournament] = useState<Tournament | null>(null);
  const [confirmDeleteText, setConfirmDeleteText] = useState('');
  const [impactCounts, setImpactCounts] = useState<{
    results: number;
    teams: number;
    history: number;
  } | null>(null);
  const [loadingImpact, setLoadingImpact] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Notification Toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Sync state if initialTournaments props change
  useEffect(() => {
    setTournaments(initialTournaments);
  }, [initialTournaments]);

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
    if (!editingTournament) return;

    setEditingTournament(prev => {
      if (!prev) return null;
      const updated = { ...prev, [field]: value };
      
      // Auto-update year if start_date is set
      if (field === 'start_date' && value) {
        const parts = value.split('-');
        if (parts.length === 3) {
          updated.year = parseInt(parts[0], 10);
        }
      }

      // If it is a new tournament, auto-generate the slug based on the name, unless the user manually edited the slug
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

  // Fetch deletion impact statistics
  const fetchImpactCounts = async (tournamentId: string) => {
    setLoadingImpact(true);
    setDeleteError('');
    try {
      const response = await fetch(`/api/admin/tournaments/impact?id=${encodeURIComponent(tournamentId)}`);
      if (!response.ok) {
        throw new Error('Failed to load deletion impact preview.');
      }
      const data = await response.json();
      setImpactCounts(data);
    } catch (err: any) {
      setDeleteError(err.message || 'Error loading linked records preview.');
    } finally {
      setLoadingImpact(false);
    }
  };

  const openDeleteModal = (tournament: Tournament) => {
    setDeletingTournament(tournament);
    setConfirmDeleteText('');
    setImpactCounts(null);
    setDeleteError('');
    fetchImpactCounts(tournament.id);
  };

  const closeDeleteModal = () => {
    setDeletingTournament(null);
    setConfirmDeleteText('');
    setImpactCounts(null);
  };

  const handleDeleteTournament = async () => {
    if (!deletingTournament) return;
    if (confirmDeleteText.trim().toLowerCase() !== deletingTournament.name.toLowerCase()) {
      setDeleteError(`Please type "${deletingTournament.name}" exactly to confirm.`);
      return;
    }

    setDeleting(true);
    setDeleteError('');
    try {
      const response = await fetch('/api/admin/tournaments/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: deletingTournament.id }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete tournament.');
      }

      showToast(`Tournament "${deletingTournament.name}" deleted successfully.`);
      closeDeleteModal();
      router.refresh();
    } catch (err: any) {
      setDeleteError(err.message || 'Failed to delete tournament.');
    } finally {
      setDeleting(false);
    }
  };

  const handleSaveTournament = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTournament) return;

    if (!editingTournament.id || !editingTournament.name || !editingTournament.type || !editingTournament.city || !editingTournament.country || !editingTournament.flag || !editingTournament.year || !editingTournament.start_date || !editingTournament.end_date || !editingTournament.status || !editingTournament.color) {
      setFormError('Please fill out all required fields.');
      return;
    }

    setSaving(true);
    setFormError('');

    try {
      const response = await fetch('/api/admin/tournaments/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingTournament),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to save tournament.');
      }

      showToast(`Tournament "${editingTournament.name}" saved successfully.`);
      setEditingTournament(null);
      router.refresh();
    } catch (err: any) {
      setFormError(err.message || 'Error occurred while saving.');
    } finally {
      setSaving(false);
    }
  };

  // Filter & Search Logic
  const filteredTournaments = useMemo(() => {
    return tournaments.filter(t => {
      // 1. Search Query
      if (search.trim()) {
        const query = search.toLowerCase();
        const hay = `${t.name} ${t.type} ${t.city} ${t.country} ${t.venue} ${t.year}`.toLowerCase();
        if (!hay.includes(query)) return false;
      }

      // 2. Status Filter
      if (statusFilter !== 'All' && t.status !== statusFilter.toLowerCase()) {
        return false;
      }

      return true;
    });
  }, [tournaments, search, statusFilter]);

  // Sorting Logic
  const sortedTournaments = useMemo(() => {
    const list = [...filteredTournaments];
    list.sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];

      // Handle null/undefined values
      if (valA === undefined || valA === null) valA = 0;
      if (valB === undefined || valB === null) valB = 0;

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
  }, [filteredTournaments, sortField, sortDirection]);

  // Pagination Logic
  const paginatedTournaments = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedTournaments.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedTournaments, currentPage]);

  const totalPages = Math.max(1, Math.ceil(sortedTournaments.length / itemsPerPage));

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, sortField, sortDirection]);

  const toggleSort = (field: 'year' | 'name' | 'participants' | 'records') => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection(field === 'year' ? 'desc' : 'asc');
    }
  };

  const openAddTournamentModal = () => {
    setIsSlugOverridden(false);
    setEditingTournament({
      isNew: true,
      id: '',
      name: '',
      type: 'IGLA+ Championship',
      city: '',
      country: '',
      flag: '🏳️‍🌈',
      year: new Date().getFullYear(),
      start_date: '',
      end_date: '',
      status: 'upcoming',
      color: COLOR_PRESETS[0],
      website: '',
      venue: '',
      description: '',
      expected_athletes: 0,
      expected_nations: 0,
      expected_clubs: 0,
      participants: 0,
      clubs: 0,
      records: 0
    });
    setFormError('');
  };

  const openEditTournamentModal = (tournament: Tournament) => {
    setEditingTournament({
      isNew: false,
      ...tournament,
      // Default empty statistics to 0 for easier edit form control
      expected_athletes: tournament.expected_athletes || 0,
      expected_nations: tournament.expected_nations || 0,
      expected_clubs: tournament.expected_clubs || 0,
      participants: tournament.participants || 0,
      clubs: tournament.clubs || 0,
      records: tournament.records || 0,
    });
    setFormError('');
  };

  return (
    <div className="view-enter" data-screen-label="Admin Tournaments">
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
          <h1>Manage <em>Tournaments</em></h1>
          <div className="sub">Add new championships or edit metadata and attendance statistics.</div>
        </div>
        <div className="admin-actions">
          <button 
            onClick={openAddTournamentModal}
            className="pill active inline-flex items-center gap-2 bg-ink text-white font-semibold text-xs py-2.5 px-5 rounded-full border-2 border-ink hover:bg-ink-2 active:translate-y-[1px] cursor-pointer"
          >
            <Plus size={14} />
            <span>Add Tournament Profile</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="stat-strip mb-6 animate-fadeIn">
        <div className="stat-tile">
          <div className="stat-tile-val font-mono tabular-nums">{tournaments.length}</div>
          <div className="stat-tile-key text-ink-3">Total Tournaments</div>
        </div>
        <div className="stat-tile">
          <div className="stat-tile-val font-mono tabular-nums">
            {tournaments.filter(t => t.status === 'past').reduce((sum, t) => sum + (t.participants || 0), 0).toLocaleString()}
          </div>
          <div className="stat-tile-key text-ink-3">Total Athletes Hosted</div>
        </div>
        <div className="stat-tile">
          <div className="stat-tile-val font-mono tabular-nums">
            {tournaments.filter(t => t.status === 'upcoming').length}
          </div>
          <div className="stat-tile-key text-ink-3">Upcoming Cities</div>
        </div>
        <div className="stat-tile coral">
          <div className="stat-tile-val font-mono text-white tabular-nums">
            {tournaments.reduce((sum, t) => sum + (t.records || 0), 0)}
          </div>
          <div className="stat-tile-key text-white/90">New All-Time Records</div>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="dt-toolbar gap-3 mb-4 select-none animate-fadeIn">
        
        {/* Search */}
        <div className="search max-w-[280px]">
          <Search size={14} />
          <input
            placeholder="Search name, city, type..."
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

        {/* Status filter */}
        <div className="flex items-center gap-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-ink-3">Status:</label>
          <div className="sel-wrap min-w-[140px]">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="h-10 text-xs px-3 bg-white border-2 border-ink rounded-xl font-semibold w-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-aqua"
            >
              <option value="All">All Statuses</option>
              <option value="Past">Past</option>
              <option value="Live">Live</option>
              <option value="Upcoming">Upcoming</option>
            </select>
            <ChevronDown size={12} className="chev" />
          </div>
        </div>

        <div className="results-meta select-none">
          Showing <span className="font-mono font-bold text-ink">{sortedTournaments.length}</span> of <span className="font-mono text-ink-3">{tournaments.length}</span> tournaments
        </div>
      </div>

      {/* Table view */}
      <div className="dt-wrap animate-fadeIn">
        <table className="dt">
          <thead>
            <tr>
              <th style={{ width: '8%' }}>
                <button 
                  onClick={() => toggleSort('year')}
                  className={`sortable ${sortField === 'year' ? 'on' : ''}`}
                >
                  Year
                  {sortField === 'year' && (sortDirection === 'asc' ? ' ▲' : ' ▼')}
                </button>
              </th>
              <th style={{ width: '27%' }}>
                <button 
                  onClick={() => toggleSort('name')}
                  className={`sortable ${sortField === 'name' ? 'on' : ''}`}
                >
                  Tournament Profile
                  {sortField === 'name' && (sortDirection === 'asc' ? ' ▲' : ' ▼')}
                </button>
              </th>
              <th style={{ width: '15%' }}>Location</th>
              <th style={{ width: '15%' }}>Dates</th>
              <th style={{ width: '10%' }}>Status</th>
              <th className="num" style={{ width: '15%' }}>
                <button 
                  onClick={() => toggleSort('participants')}
                  className={`sortable ${sortField === 'participants' ? 'on' : ''}`}
                >
                  Athletes / Clubs
                  {sortField === 'participants' && (sortDirection === 'asc' ? ' ▲' : ' ▼')}
                </button>
              </th>
              <th className="act" style={{ width: '10%' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedTournaments.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-ink-3 italic">
                  No tournaments match the search or filter criteria.
                </td>
              </tr>
            ) : (
              paginatedTournaments.map((t) => {
                return (
                  <tr key={t.id}>
                    <td className="font-mono text-xs font-bold text-ink">
                      {t.year}
                    </td>
                    <td>
                      <div className="t-main">
                        <span className="flag select-none" title={t.country}>{t.flag}</span>
                        <div>
                          <div className="t-nm font-semibold flex items-center gap-1.5">
                            <Link
                              href={`/tournaments/${t.id}`}
                              target="_blank"
                              className="hover:underline text-ink hover:text-coral transition-colors"
                            >
                              {t.name}
                            </Link>
                            <span 
                              className="w-2.5 h-2.5 rounded-full border border-ink/20 shrink-0" 
                              style={{ backgroundColor: t.color }}
                              title={`Theme color: ${t.color}`}
                            />
                          </div>
                          <div className="club-id select-none">ID: {t.id} · {t.type}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="text-xs font-semibold text-ink-2">{t.city}</div>
                      <div className="text-[10px] text-ink-3 mt-0.5">{t.country}</div>
                    </td>
                    <td className="text-xs text-ink-2 font-medium">
                      {formatTournamentDates(t.start_date, t.end_date)}
                    </td>
                    <td>
                      {t.status === 'live' && (
                        <span className="status-pill live inline-flex items-center gap-1 bg-coral text-white font-bold py-0.5 px-2 rounded-full border border-ink text-[9px] uppercase tracking-wider">
                          <span className="dot w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                          <span>Live</span>
                        </span>
                      )}
                      {t.status === 'upcoming' && (
                        <span className="status-pill upcoming inline-flex items-center bg-white text-ink font-bold py-0.5 px-2 rounded-full border border-ink text-[9px] uppercase tracking-wider">
                          Upcoming
                        </span>
                      )}
                      {t.status === 'past' && (
                        <span className="status-pill past inline-flex items-center bg-bg-2 text-ink font-bold py-0.5 px-2 rounded-full border border-ink/40 text-[9px] uppercase tracking-wider">
                          Past
                        </span>
                      )}
                    </td>
                    <td className="num font-mono text-xs text-ink-2">
                      <div className="flex flex-col text-right">
                        <span className="font-semibold text-ink">
                          {(t.status === 'upcoming' ? t.expected_athletes : t.participants)?.toLocaleString() || '—'} Ath
                        </span>
                        <span className="text-[9px] text-ink-3">
                          {(t.status === 'upcoming' ? t.expected_clubs : t.clubs) || '—'} Clb
                        </span>
                      </div>
                    </td>
                    <td className="act">
                      <div className="row-actions">
                        <Link
                          href={`/tournaments/${t.id}`}
                          target="_blank"
                          className="row-btn"
                          title="View Public page (opens new tab)"
                        >
                          <ExternalLink size={13} />
                        </Link>
                        <button
                          onClick={() => openEditTournamentModal(t)}
                          className="row-btn"
                          title="Edit Tournament Details"
                        >
                          <Edit size={13} />
                        </button>
                        <button
                          onClick={() => openDeleteModal(t)}
                          className="row-btn danger"
                          title="Delete Tournament"
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
              {Math.min(currentPage * itemsPerPage, sortedTournaments.length)}
            </span> of{' '}
            <span className="font-mono font-bold text-ink">{sortedTournaments.length}</span> entries
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

      {/* EDIT / ADD MODAL PORTAL */}
      {editingTournament && createPortal(
        <div className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div 
            className="tile bg-white border-2 border-ink shadow-[5px_6px_0_#0d3a52] overflow-hidden flex flex-col max-h-[90vh] rounded-2xl animate-scaleUp"
            style={{ width: '860px', maxWidth: '95vw' }}
          >
            {/* Header */}
            <div className="p-5 border-b-2 border-ink bg-aqua-sky/30 flex justify-between items-center select-none">
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-coral" />
                <h3 className="font-display text-xl font-bold text-ink">
                  {editingTournament.isNew ? 'Add Tournament Profile' : `Edit Tournament: ${editingTournament.name}`}
                </h3>
              </div>
              <button 
                onClick={() => setEditingTournament(null)}
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
                onSubmit={handleSaveTournament}
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
                    <label className="text-[10px] font-bold uppercase tracking-wider text-ink-3">Tournament Name <span className="text-coral">*</span></label>
                    <input 
                      type="text" 
                      value={editingTournament.name || ''} 
                      onChange={e => handleFormFieldChange('name', e.target.value)}
                      placeholder="e.g. Seattle 2029"
                      className="bg-white border-2 border-ink rounded-xl px-3 h-10 font-semibold text-xs text-ink focus:outline-none focus:ring-2 focus:ring-aqua"
                      required
                    />
                  </div>

                  {/* ID Slug (Editable but auto-generated for new records) */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-ink-3 flex justify-between items-center">
                      <span>Unique ID Slug <span className="text-coral">*</span></span>
                      {!editingTournament.isNew && <span className="text-[8px] text-ink-3 font-normal uppercase bg-bg-2 px-1 rounded border" style={{ fontFamily: 'var(--font-mono)', fontStyle: 'normal' }}>Read-Only</span>}
                    </label>
                    <input 
                      type="text" 
                      value={editingTournament.id || ''} 
                      onChange={e => handleSlugManualChange(e.target.value)}
                      disabled={!editingTournament.isNew}
                      placeholder="e.g. seattle-2029"
                      className={`bg-white border-2 border-ink rounded-xl px-3 h-10 font-semibold text-xs text-ink focus:outline-none focus:ring-2 focus:ring-aqua ${
                        !editingTournament.isNew ? 'bg-bg/40 opacity-70 cursor-not-allowed select-none' : ''
                      }`}
                      style={{ fontFamily: 'var(--font-mono)', fontStyle: 'normal' }}
                      required
                    />
                    {editingTournament.isNew && (
                      <span className="text-[9px] text-ink-3 -mt-0.5 leading-none">Auto-generates. Lowercase letters, numbers, and hyphens only.</span>
                    )}
                  </div>

                  {/* Tournament Type */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-ink-3">Tournament Type <span className="text-coral">*</span></label>
                    <div className="sel-wrap">
                      <select 
                        value={editingTournament.type || 'IGLA+ Championship'} 
                        onChange={e => handleFormFieldChange('type', e.target.value)}
                        className="bg-white border-2 border-ink rounded-xl px-3 h-10 font-semibold text-xs text-ink cursor-pointer w-full focus:outline-none focus:ring-2 focus:ring-aqua"
                        required
                      >
                        {TOURNAMENT_TYPES.map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="chev" />
                    </div>
                  </div>

                  {/* Status Select */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-ink-3">Status <span className="text-coral">*</span></label>
                    <div className="sel-wrap">
                      <select 
                        value={editingTournament.status || 'upcoming'} 
                        onChange={e => handleFormFieldChange('status', e.target.value)}
                        className="bg-white border-2 border-ink rounded-xl px-3 h-10 font-semibold text-xs text-ink cursor-pointer w-full focus:outline-none focus:ring-2 focus:ring-aqua"
                        required
                      >
                        <option value="upcoming">Upcoming</option>
                        <option value="live">Live</option>
                        <option value="past">Past</option>
                      </select>
                      <ChevronDown size={14} className="chev" />
                    </div>
                  </div>

                  {/* Start Date */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-ink-3">Start Date <span className="text-coral">*</span></label>
                    <input 
                      type="date" 
                      value={editingTournament.start_date || ''} 
                      onChange={e => handleFormFieldChange('start_date', e.target.value)}
                      className="bg-white border-2 border-ink rounded-xl px-3 h-10 font-mono font-semibold text-xs text-ink focus:outline-none focus:ring-2 focus:ring-aqua"
                      required
                    />
                  </div>

                  {/* End Date */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-ink-3">End Date <span className="text-coral">*</span></label>
                    <input 
                      type="date" 
                      value={editingTournament.end_date || ''} 
                      onChange={e => handleFormFieldChange('end_date', e.target.value)}
                      className="bg-white border-2 border-ink rounded-xl px-3 h-10 font-mono font-semibold text-xs text-ink focus:outline-none focus:ring-2 focus:ring-aqua"
                      required
                    />
                  </div>

                  {/* City */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-ink-3">City <span className="text-coral">*</span></label>
                    <input 
                      type="text" 
                      value={editingTournament.city || ''} 
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
                      value={editingTournament.country || ''} 
                      onChange={e => handleFormFieldChange('country', e.target.value)}
                      placeholder="e.g. United States"
                      className="bg-white border-2 border-ink rounded-xl px-3 h-10 font-semibold text-xs text-ink focus:outline-none focus:ring-2 focus:ring-aqua"
                      required
                    />
                  </div>

                  {/* Flag Emoji Input + Quick presets */}
                  <div className="flex flex-col gap-1.5 col-span-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-ink-3">Flag Emoji <span className="text-coral">*</span></label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        maxLength={4}
                        value={editingTournament.flag || ''} 
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

                  {/* Website */}
                  <div className="flex flex-col gap-1.5 col-span-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-ink-3">Website URL</label>
                    <input 
                      type="url" 
                      value={editingTournament.website || ''} 
                      onChange={e => handleFormFieldChange('website', e.target.value)}
                      placeholder="e.g. https://seattle2029.igla.org"
                      className="bg-white border-2 border-ink rounded-xl px-3 h-10 font-semibold text-xs text-ink focus:outline-none focus:ring-2 focus:ring-aqua"
                    />
                  </div>

                  {/* Venue */}
                  <div className="flex flex-col gap-1.5 col-span-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-ink-3">Venue / Facility</label>
                    <input 
                      type="text" 
                      value={editingTournament.venue || ''} 
                      onChange={e => handleFormFieldChange('venue', e.target.value)}
                      placeholder="e.g. Weyerhaeuser King County Aquatic Center"
                      className="bg-white border-2 border-ink rounded-xl px-3 h-10 font-semibold text-xs text-ink focus:outline-none focus:ring-2 focus:ring-aqua"
                    />
                  </div>

                  {/* Description */}
                  <div className="flex flex-col gap-1.5 col-span-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-ink-3">Description</label>
                    <textarea 
                      value={editingTournament.description || ''} 
                      onChange={e => handleFormFieldChange('description', e.target.value)}
                      placeholder="A short summary detailing the highlights of this event..."
                      rows={2}
                      className="bg-white border-2 border-ink rounded-xl p-3 font-semibold text-xs text-ink focus:outline-none focus:ring-2 focus:ring-aqua resize-none"
                    />
                  </div>

                  {/* Brand Color Swatches & Picker */}
                  <div className="flex flex-col gap-1.5 col-span-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-ink-3">Brand Theme Color <span className="text-coral">*</span></label>
                    <div className="swatch-row mt-1">
                      {COLOR_PRESETS.map(c => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => handleFormFieldChange('color', c)}
                          className={`swatch ${editingTournament.color === c ? 'on' : ''}`}
                          style={{ backgroundColor: c }}
                          title={`Select brand color: ${c}`}
                        />
                      ))}
                      {/* Native HTML Color Input wrapper */}
                      <div className="relative w-8 h-8 rounded-lg border-2 border-ink flex items-center justify-center bg-white cursor-pointer hover:bg-bg-2">
                        <input
                          type="color"
                          value={editingTournament.color || '#37a3c4'}
                          onChange={e => handleFormFieldChange('color', e.target.value)}
                          className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                        />
                        <span className="text-[9px] font-bold text-ink-2 select-none uppercase pointer-events-none">HEX</span>
                      </div>
                    </div>
                  </div>

                  {/* CONDITIONAL STATS FIELDS BASED ON STATUS */}
                  {editingTournament.status !== 'upcoming' && (
                    <>
                      {/* ACTUAL STATS FIELDS */}
                      <div className="col-span-2 border-t border-dashed border-ink/20 pt-3.5 mt-2">
                        <h4 className="text-[10px] font-bold uppercase tracking-wider text-ink mb-3">Actual Attendance Stats</h4>
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[9px] font-bold uppercase tracking-wider text-ink-3">Participants (Athletes)</label>
                            <input 
                              type="number" 
                              min="0"
                              value={editingTournament.participants ?? ''} 
                              onChange={e => handleFormFieldChange('participants', e.target.value === '' ? null : parseInt(e.target.value))}
                              className="bg-white border-2 border-ink rounded-xl px-3 h-10 font-mono font-semibold text-xs text-ink focus:outline-none"
                            />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[9px] font-bold uppercase tracking-wider text-ink-3">Nations represented</label>
                            <input 
                              type="number" 
                              min="0"
                              value={editingTournament.nations ?? ''} 
                              onChange={e => handleFormFieldChange('nations', e.target.value === '' ? null : parseInt(e.target.value))}
                              className="bg-white border-2 border-ink rounded-xl px-3 h-10 font-mono font-semibold text-xs text-ink focus:outline-none"
                            />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[9px] font-bold uppercase tracking-wider text-ink-3">Clubs represented</label>
                            <input 
                              type="number" 
                              min="0"
                              value={editingTournament.clubs ?? ''} 
                              onChange={e => handleFormFieldChange('clubs', e.target.value === '' ? null : parseInt(e.target.value))}
                              className="bg-white border-2 border-ink rounded-xl px-3 h-10 font-mono font-semibold text-xs text-ink focus:outline-none"
                            />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[9px] font-bold uppercase tracking-wider text-ink-3">New records set</label>
                            <input 
                              type="number" 
                              min="0"
                              value={editingTournament.records ?? ''} 
                              onChange={e => handleFormFieldChange('records', e.target.value === '' ? null : parseInt(e.target.value))}
                              className="bg-white border-2 border-ink rounded-xl px-3 h-10 font-mono font-semibold text-xs text-ink focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Submit trigger button */}
                <input type="submit" className="hidden" />
              </form>

              {/* Right Column: Live Mockup Card Preview */}
              <div className="w-[340px] bg-bg/30 p-6 flex flex-col items-center justify-center select-none border-t border-ink/10 md:border-t-0 md:bg-bg/15">
                <div className="w-full flex flex-col gap-4 text-left">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-ink-3 flex items-center gap-1">
                    <HelpCircle size={12} className="text-coral" />
                    <span>Real-Time Tournament Card Preview</span>
                  </span>

                  <div 
                    className="tile block no-underline overflow-hidden w-full text-left"
                    style={{
                      padding: '20px',
                      background: `var(--depth-overlay), ${editingTournament.color || '#37a3c4'}`,
                      color: 'white',
                      border: '2px solid var(--ink)',
                      boxShadow: 'var(--tile-shadow-sm)',
                      borderRadius: '16px',
                    }}
                  >
                    <span className="eyebrow eyebrow-on-dark flex items-center gap-1 w-fit text-[9px] uppercase tracking-wider font-bold mb-2">
                      {editingTournament.status === 'live' && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse inline-block" />}
                      <span>{editingTournament.status || 'upcoming'} · {editingTournament.year || 2026}</span>
                    </span>
                    <h3 className="display text-white font-normal leading-none my-2 text-2xl truncate">
                      <em>{editingTournament.city || 'City'} </em> 
                      <span className="hl">{editingTournament.year || 2026}</span>
                    </h3>
                    <div className="font-display italic text-xs text-white/80 mb-3 truncate">
                      {editingTournament.type || 'Tournament Type'}
                    </div>
                    
                    <div className="text-[10px] text-white/95 flex flex-col gap-1.5 pt-2 border-t border-white/20 select-none">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={11} />
                        <span>{formatTournamentDates(editingTournament.start_date || '', editingTournament.end_date || '') || 'Dates not set'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin size={11} />
                        <span className="truncate">{editingTournament.venue || 'Venue not set'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm leading-none select-none">{editingTournament.flag || '🏳️‍🌈'}</span>
                        <span className="truncate">{editingTournament.city || 'City'}, {editingTournament.country || 'Country'}</span>
                      </div>
                    </div>

                    {editingTournament.status === 'upcoming' ? (
                      (editingTournament.expected_athletes || editingTournament.expected_nations || editingTournament.expected_clubs) ? (
                        <div className="mt-4 pt-3 border-t border-white/10 grid grid-cols-3 gap-2 text-center" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>
                          <div>
                            <div className="font-display text-white text-base leading-none font-bold">{(editingTournament.expected_athletes || 0).toLocaleString()}+</div>
                            <div className="text-[7px] font-bold tracking-wider uppercase text-white/70 mt-1">Expected</div>
                          </div>
                          <div>
                            <div className="font-display text-white text-base leading-none font-bold">{editingTournament.expected_nations || 0}</div>
                            <div className="text-[7px] font-bold tracking-wider uppercase text-white/70 mt-1">Nations</div>
                          </div>
                          <div>
                            <div className="font-display text-white text-base leading-none font-bold">{editingTournament.expected_clubs || 0}</div>
                            <div className="text-[7px] font-bold tracking-wider uppercase text-white/70 mt-1">Clubs</div>
                          </div>
                        </div>
                      ) : null
                    ) : (
                      (editingTournament.participants || editingTournament.nations || editingTournament.clubs || editingTournament.records) ? (
                        <div className="mt-4 pt-3 border-t border-white/10 grid grid-cols-4 gap-1 text-center" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
                          <div>
                            <div className="font-display text-white text-base leading-none font-bold">{(editingTournament.participants || 0).toLocaleString()}</div>
                            <div className="text-[7px] font-bold tracking-wider uppercase text-white/70 mt-1">Athletes</div>
                          </div>
                          <div>
                            <div className="font-display text-white text-base leading-none font-bold">{editingTournament.nations || 0}</div>
                            <div className="text-[7px] font-bold tracking-wider uppercase text-white/70 mt-1">Nations</div>
                          </div>
                          <div>
                            <div className="font-display text-white text-base leading-none font-bold">{editingTournament.clubs || 0}</div>
                            <div className="text-[7px] font-bold tracking-wider uppercase text-white/70 mt-1">Clubs</div>
                          </div>
                          <div>
                            <div className="font-display text-white text-base leading-none font-bold text-coral-pale">{editingTournament.records || 0}</div>
                            <div className="text-[7px] font-bold tracking-wider uppercase text-white/70 mt-1">Records</div>
                          </div>
                        </div>
                      ) : null
                    )}
                  </div>

                  {editingTournament.website && (
                    <a 
                      href={editingTournament.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-coral font-bold hover:underline inline-flex items-center gap-1 self-start"
                    >
                      <span>Visit event website</span>
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
                onClick={() => setEditingTournament(null)}
                disabled={saving}
                className="pill bg-white border-2 border-ink text-ink font-semibold text-xs py-2.5 px-5 rounded-full hover:bg-aqua-pale cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveTournament}
                disabled={saving}
                className="pill active bg-ink text-white font-bold text-xs py-2.5 px-6 rounded-full border-2 border-ink hover:bg-ink-2 active:translate-y-[1px] disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
              >
                <Save size={13} />
                <span>{saving ? 'Saving...' : 'Save Tournament'}</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingTournament && createPortal(
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
                  Delete Tournament?
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
                You are about to permanently delete the profile for <b className="text-ink font-semibold">{deletingTournament.name}</b> from the database.
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
                      Deleting this tournament will permanently remove all of its associated results and water polo standing entries. Championship attendance history records for clubs will be unlinked (set to no tournament affiliation).
                    </p>
                  </div>

                  {/* Impact Stats List */}
                  <div className="grid grid-cols-3 gap-2 text-xs font-semibold text-ink-2">
                    <div className={`p-3 border-2 rounded-xl flex flex-col justify-center ${
                      impactCounts.results > 0 ? 'bg-coral-pale/40 border-coral/30 text-coral-deep' : 'bg-bg-2/30 border-ink/5 text-ink-3'
                    }`}>
                      <span className="font-mono text-lg leading-none font-bold tabular-nums">{impactCounts.results}</span>
                      <span className="text-[9px] uppercase tracking-wider font-bold mt-1">Swimming Results (Deleted)</span>
                    </div>

                    <div className={`p-3 border-2 rounded-xl flex flex-col justify-center ${
                      impactCounts.teams > 0 ? 'bg-coral-pale/40 border-coral/30 text-coral-deep' : 'bg-bg-2/30 border-ink/5 text-ink-3'
                    }`}>
                      <span className="font-mono text-lg leading-none font-bold tabular-nums">{impactCounts.teams}</span>
                      <span className="text-[9px] uppercase tracking-wider font-bold mt-1">Water Polo Teams (Deleted)</span>
                    </div>

                    <div className={`p-3 border-2 rounded-xl flex flex-col justify-center ${
                      impactCounts.history > 0 ? 'bg-amber-50 border-amber-300 text-amber-800' : 'bg-bg-2/30 border-ink/5 text-ink-3'
                    }`}>
                      <span className="font-mono text-lg leading-none font-bold tabular-nums">{impactCounts.history}</span>
                      <span className="text-[9px] uppercase tracking-wider font-bold mt-1">Club History (Unlinked)</span>
                    </div>
                  </div>
                </div>
              ) : null}

              {/* Text confirmation */}
              {!loadingImpact && (
                <div className="type-to text-xs text-ink-2 mt-4 select-none">
                  <p className="mb-2">To confirm deletion, please type the tournament's name <code>{deletingTournament.name}</code> below:</p>
                  <input
                    type="text"
                    value={confirmDeleteText}
                    onChange={e => setConfirmDeleteText(e.target.value)}
                    placeholder={deletingTournament.name}
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
                  onClick={handleDeleteTournament}
                  disabled={
                    deleting || 
                    loadingImpact || 
                    confirmDeleteText.trim().toLowerCase() !== deletingTournament.name.toLowerCase()
                  }
                  className="pill danger font-bold text-xs py-2.5 px-6 rounded-full border-2 border-ink disabled:opacity-30 disabled:pointer-events-none cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 size={13} />
                  <span>{deleting ? 'Deleting...' : 'Delete Tournament'}</span>
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
