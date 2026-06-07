'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Search, Plus, Edit, Trash2, MapPin, X, 
  ChevronLeft, ChevronRight, ChevronDown, AlertCircle, CheckCircle2, 
  HelpCircle, Waves, Target, ShieldAlert, Save, ExternalLink, User, Mail
} from 'lucide-react';
import { PRONOUNS } from '@/lib/config';

interface Athlete {
  id: string;
  name: string;
  current_club_id: string | null;
  club_name: string | null;
  club_flag: string | null;
  pronouns: string;
  hometown: string;
  is_claimed: number;
  email: string | null;
  swim_count: number;
  wp_count: number;
}

interface Club {
  id: string;
  name: string;
  flag: string;
}

interface AthletesAdminClientProps {
  athletes: Athlete[];
  clubs: Club[];
}

export default function AthletesAdminClient({ athletes: initialAthletes, clubs }: AthletesAdminClientProps) {
  const router = useRouter();
  const [athletes, setAthletes] = useState<Athlete[]>(initialAthletes);
  
  // Search, Filter, Sort and Pagination states
  const [search, setSearch] = useState('');
  const [clubFilter, setClubFilter] = useState('All');
  const [claimFilter, setClaimFilter] = useState('All');
  const [sportFilter, setSportFilter] = useState('All');
  const [sortField, setSortField] = useState<'name' | 'club' | 'claimed' | 'results'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // Edit / Add form states
  const [editingAthlete, setEditingAthlete] = useState<(Partial<Athlete> & { isNew?: boolean }) | null>(null);
  const [showCustomPronouns, setShowCustomPronouns] = useState(false);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  
  // Custom tracking to determine if ID slug should auto-generate from Name
  const [isSlugOverridden, setIsSlugOverridden] = useState(false);

  // Delete states
  const [deletingAthlete, setDeletingAthlete] = useState<Athlete | null>(null);
  const [confirmDeleteText, setConfirmDeleteText] = useState('');
  const [impactCounts, setImpactCounts] = useState<{
    results: number;
    brokenRecords: number;
    rosters: number;
  } | null>(null);
  const [loadingImpact, setLoadingImpact] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Notification Toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Sync state if initialAthletes props change
  useEffect(() => {
    setAthletes(initialAthletes);
  }, [initialAthletes]);

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
    if (!editingAthlete) return;

    setEditingAthlete(prev => {
      if (!prev) return null;
      const updated = { ...prev, [field]: value };
      
      // If it is a new athlete, auto-generate the slug based on the name, unless the user manually edited the slug
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
  const fetchImpactCounts = async (athleteId: string) => {
    setLoadingImpact(true);
    setDeleteError('');
    try {
      const response = await fetch(`/api/admin/athletes/impact?id=${encodeURIComponent(athleteId)}`);
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

  const openDeleteModal = (athlete: Athlete) => {
    setDeletingAthlete(athlete);
    setConfirmDeleteText('');
    setImpactCounts(null);
    setDeleteError('');
    fetchImpactCounts(athlete.id);
  };

  const closeDeleteModal = () => {
    setDeletingAthlete(null);
    setConfirmDeleteText('');
    setImpactCounts(null);
  };

  const handleDeleteAthlete = async () => {
    if (!deletingAthlete) return;
    if (confirmDeleteText.trim().toLowerCase() !== deletingAthlete.name.toLowerCase()) {
      setDeleteError(`Please type "${deletingAthlete.name}" exactly to confirm.`);
      return;
    }

    setDeleting(true);
    setDeleteError('');
    try {
      const response = await fetch('/api/admin/athletes/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: deletingAthlete.id }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete athlete.');
      }

      showToast(`Athlete "${deletingAthlete.name}" deleted successfully.`);
      closeDeleteModal();
      router.refresh();
    } catch (err: any) {
      setDeleteError(err.message || 'Failed to delete athlete.');
    } finally {
      setDeleting(false);
    }
  };

  const handleSaveAthlete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAthlete) return;

    if (!editingAthlete.id || !editingAthlete.name) {
      setFormError('Full Name and Profile ID Slug are required.');
      return;
    }

    setSaving(true);
    setFormError('');

    try {
      const response = await fetch('/api/admin/athletes/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingAthlete),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to save athlete.');
      }

      showToast(`Athlete "${editingAthlete.name}" saved successfully.`);
      setEditingAthlete(null);
      router.refresh();
    } catch (err: any) {
      setFormError(err.message || 'Error occurred while saving.');
    } finally {
      setSaving(false);
    }
  };

  // Filter & Search Logic
  const filteredAthletes = useMemo(() => {
    return athletes.filter(a => {
      // 1. Search Query
      if (search.trim()) {
        const query = search.toLowerCase();
        const hay = `${a.name} ${a.id} ${a.hometown || ''} ${a.email || ''} ${a.club_name || ''}`.toLowerCase();
        if (!hay.includes(query)) return false;
      }

      // 2. Club Filter
      if (clubFilter !== 'All') {
        if (clubFilter === 'Independent' && a.current_club_id !== null) {
          return false;
        }
        if (clubFilter !== 'Independent' && a.current_club_id !== clubFilter) {
          return false;
        }
      }

      // 3. Claim Filter
      if (claimFilter !== 'All') {
        const isClaimed = a.is_claimed === 1;
        if (claimFilter === 'Claimed' && !isClaimed) return false;
        if (claimFilter === 'Unclaimed' && isClaimed) return false;
      }

      // 4. Sport/Discipline Filter
      if (sportFilter !== 'All') {
        if (sportFilter === 'Swimming' && a.swim_count === 0) return false;
        if (sportFilter === 'WaterPolo' && a.wp_count === 0) return false;
        if (sportFilter === 'Inactive' && (a.swim_count > 0 || a.wp_count > 0)) return false;
      }

      return true;
    });
  }, [athletes, search, clubFilter, claimFilter, sportFilter]);

  // Sorting Logic
  const sortedAthletes = useMemo(() => {
    const list = [...filteredAthletes];
    list.sort((a, b) => {
      let valA: any = '';
      let valB: any = '';

      if (sortField === 'name') {
        valA = a.name;
        valB = b.name;
      } else if (sortField === 'club') {
        valA = a.club_name || '';
        valB = b.club_name || '';
      } else if (sortField === 'claimed') {
        valA = a.is_claimed;
        valB = b.is_claimed;
      } else if (sortField === 'results') {
        valA = a.swim_count + a.wp_count;
        valB = b.swim_count + b.wp_count;
      }

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
  }, [filteredAthletes, sortField, sortDirection]);

  // Pagination Logic
  const paginatedAthletes = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedAthletes.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedAthletes, currentPage]);

  const totalPages = Math.max(1, Math.ceil(sortedAthletes.length / itemsPerPage));

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, clubFilter, claimFilter, sportFilter, sortField, sortDirection]);

  const toggleSort = (field: 'name' | 'club' | 'claimed' | 'results') => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const openAddAthleteModal = () => {
    setIsSlugOverridden(false);
    setShowCustomPronouns(false);
    setEditingAthlete({
      isNew: true,
      id: '',
      name: '',
      current_club_id: null,
      club_name: null,
      club_flag: null,
      pronouns: '',
      hometown: '',
      is_claimed: 0,
      email: null,
      swim_count: 0,
      wp_count: 0
    });
    setFormError('');
  };

  const openEditAthleteModal = (athlete: Athlete) => {
    setIsSlugOverridden(true);
    const hasCustomPronoun = !!(athlete.pronouns && !PRONOUNS.includes(athlete.pronouns as any));
    setShowCustomPronouns(hasCustomPronoun);
    setEditingAthlete({
      isNew: false,
      ...athlete
    });
    setFormError('');
  };

  return (
    <div className="view-enter" data-screen-label="Admin Athletes">
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
          <h1>Manage <em>Athletes</em></h1>
          <div className="sub">Register, edit, or remove competitor profiles from the central database.</div>
        </div>
        <div className="admin-actions">
          <button 
            onClick={openAddAthleteModal}
            className="pill active inline-flex items-center gap-2 bg-ink text-white font-semibold text-xs py-2.5 px-5 rounded-full border-2 border-ink hover:bg-ink-2 active:translate-y-[1px] cursor-pointer"
          >
            <Plus size={14} />
            <span>Create Athlete Profile</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="stat-strip mb-6 animate-fadeIn">
        <div className="stat-tile">
          <div className="stat-tile-val font-mono tabular-nums">{athletes.length}</div>
          <div className="stat-tile-key text-ink-3">Total Athletes</div>
        </div>
        <div className="stat-tile">
          <div className="stat-tile-val font-mono tabular-nums">
            {athletes.filter(a => a.is_claimed === 1).length}
          </div>
          <div className="stat-tile-key text-ink-3">Claimed Profiles</div>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="dt-toolbar gap-3 mb-4 select-none animate-fadeIn">
        
        {/* Search */}
        <div className="search max-w-[280px]">
          <Search size={14} />
          <input
            placeholder="Search name, ID, hometown, email..."
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

        {/* Club filter */}
        <div className="flex items-center gap-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-ink-3">Club:</label>
          <div className="sel-wrap min-w-[150px]">
            <select
              value={clubFilter}
              onChange={e => setClubFilter(e.target.value)}
              className="h-10 text-xs px-3 bg-white border-2 border-ink rounded-xl font-semibold w-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-aqua"
            >
              <option value="All">All Clubs</option>
              <option value="Independent">Independent / No Club</option>
              {clubs.map(c => (
                <option key={c.id} value={c.id}>{c.flag} {c.name}</option>
              ))}
            </select>
            <ChevronDown size={12} className="chev" />
          </div>
        </div>

        {/* Claim Status filter */}
        <div className="flex items-center gap-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-ink-3">Status:</label>
          <div className="sel-wrap min-w-[130px]">
            <select
              value={claimFilter}
              onChange={e => setClaimFilter(e.target.value)}
              className="h-10 text-xs px-3 bg-white border-2 border-ink rounded-xl font-semibold w-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-aqua"
            >
              <option value="All">All Profiles</option>
              <option value="Claimed">Claimed</option>
              <option value="Unclaimed">Unclaimed</option>
            </select>
            <ChevronDown size={12} className="chev" />
          </div>
        </div>

        {/* Sport/Discipline filter */}
        <div className="flex items-center gap-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-ink-3">Discipline:</label>
          <div className="sel-wrap min-w-[140px]">
            <select
              value={sportFilter}
              onChange={e => setSportFilter(e.target.value)}
              className="h-10 text-xs px-3 bg-white border-2 border-ink rounded-xl font-semibold w-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-aqua"
            >
              <option value="All">All Disciplines</option>
              <option value="Swimming">Swimmers</option>
              <option value="WaterPolo">Water Polo Players</option>
              <option value="Inactive">Inactive / No Results</option>
            </select>
            <ChevronDown size={12} className="chev" />
          </div>
        </div>

        <div className="results-meta select-none">
          Showing <span className="font-mono font-bold text-ink">{sortedAthletes.length}</span> of <span className="font-mono text-ink-3">{athletes.length}</span> athletes
        </div>
      </div>

      {/* Table view */}
      <div className="dt-wrap animate-fadeIn">
        <table className="dt">
          <thead>
            <tr>
              <th style={{ width: '22%' }}>
                <button 
                  onClick={() => toggleSort('name')}
                  className={`sortable ${sortField === 'name' ? 'on' : ''}`}
                >
                  Athlete Profile
                  {sortField === 'name' && (sortDirection === 'asc' ? ' ▲' : ' ▼')}
                </button>
              </th>
              <th style={{ width: '18%' }}>
                <button 
                  onClick={() => toggleSort('club')}
                  className={`sortable ${sortField === 'club' ? 'on' : ''}`}
                >
                  Club Affiliation
                  {sortField === 'club' && (sortDirection === 'asc' ? ' ▲' : ' ▼')}
                </button>
              </th>
              <th style={{ width: '15%' }}>Demographics</th>
              <th style={{ width: '17%' }}>Email Address</th>
              <th className="num" style={{ width: '10%' }}>
                <button 
                  onClick={() => toggleSort('results')}
                  className={`sortable ${sortField === 'results' ? 'on' : ''}`}
                >
                  Results
                  {sortField === 'results' && (sortDirection === 'asc' ? ' ▲' : ' ▼')}
                </button>
              </th>
              <th style={{ width: '10%' }}>
                <button 
                  onClick={() => toggleSort('claimed')}
                  className={`sortable ${sortField === 'claimed' ? 'on' : ''}`}
                >
                  Profile Status
                  {sortField === 'claimed' && (sortDirection === 'asc' ? ' ▲' : ' ▼')}
                </button>
              </th>
              <th className="act" style={{ width: '8%' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedAthletes.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-ink-3 italic">
                  No athletes match the search or filter criteria.
                </td>
              </tr>
            ) : (
              paginatedAthletes.map((athlete) => {
                const isClaimed = athlete.is_claimed === 1;
                const totalActivity = athlete.swim_count + athlete.wp_count;
                return (
                  <tr key={athlete.id}>
                    <td>
                      <div className="t-main">
                        <span className="text-xl select-none" style={{ filter: 'grayscale(0.3)' }}><User size={16} className="text-ink-2" /></span>
                        <div>
                          <div className="t-nm font-semibold flex items-center gap-1.5">
                            <Link
                              href={`/athletes/${athlete.id}`}
                              target="_blank"
                              className="hover:underline text-ink hover:text-coral transition-colors"
                            >
                              {athlete.name}
                            </Link>
                          </div>
                          <div className="club-id select-none">ID: {athlete.id}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      {athlete.current_club_id ? (
                        <div className="flex items-center gap-1.5">
                          <span className="text-base select-none">{athlete.club_flag}</span>
                          <Link
                            href={`/clubs/${athlete.current_club_id}`}
                            target="_blank"
                            className="hover:underline text-xs font-semibold text-ink-2 hover:text-coral"
                          >
                            {athlete.club_name}
                          </Link>
                        </div>
                      ) : (
                        <span className="text-xs text-ink-3 italic">Independent / Unaffiliated</span>
                      )}
                    </td>
                    <td>
                      <div className="text-xs text-ink-2 font-semibold">
                        {athlete.hometown || <span className="text-ink-3 italic font-normal">No hometown</span>}
                      </div>
                      <div className="text-[10px] text-ink-3 mt-0.5">
                        {athlete.pronouns ? <span>{athlete.pronouns}</span> : <span className="italic">Pronouns unspecified</span>}
                      </div>
                    </td>
                    <td>
                      {athlete.email ? (
                        <a 
                          href={`mailto:${athlete.email}`}
                          className="text-xs font-mono font-semibold text-ink hover:underline flex items-center gap-1 hover:text-coral transition-colors"
                        >
                          <Mail size={11} className="text-ink-3 shrink-0" />
                          <span className="truncate max-w-[140px]" title={athlete.email}>{athlete.email}</span>
                        </a>
                      ) : (
                        <span className="text-xs text-ink-3 italic">None</span>
                      )}
                    </td>
                    <td className="num">
                      <div className="flex flex-col items-end gap-0.5">
                        <span className="font-mono text-xs font-semibold text-ink">
                          {totalActivity} total
                        </span>
                        <span className="text-[9px] text-ink-3 whitespace-nowrap">
                          {athlete.swim_count} swim · {athlete.wp_count} polo
                        </span>
                      </div>
                    </td>
                    <td>
                      {isClaimed ? (
                        <span className="inline-flex items-center gap-1 text-[9px] py-0.5 px-2 rounded-full font-bold bg-emerald-100 border border-emerald-300 text-emerald-800 w-fit select-none uppercase tracking-wider">
                          <CheckCircle2 size={10} /> Claimed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[9px] py-0.5 px-2 rounded-full font-bold bg-amber-50 border border-amber-300 text-amber-800 w-fit select-none uppercase tracking-wider">
                          Unclaimed
                        </span>
                      )}
                    </td>
                    <td className="act">
                      <div className="row-actions">
                        <Link
                          href={`/athletes/${athlete.id}`}
                          target="_blank"
                          className="row-btn"
                          title="View Public Profile (opens new tab)"
                        >
                          <ExternalLink size={13} />
                        </Link>
                        <button
                          onClick={() => openEditAthleteModal(athlete)}
                          className="row-btn"
                          title="Edit Profile"
                        >
                          <Edit size={13} />
                        </button>
                        <button
                          onClick={() => openDeleteModal(athlete)}
                          className="row-btn delete"
                          title="Delete Athlete Profile"
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
              {Math.min(currentPage * itemsPerPage, sortedAthletes.length)}
            </span> of{' '}
            <span className="font-mono font-bold text-ink">{sortedAthletes.length}</span> entries
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
      {editingAthlete && createPortal(
        <div className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div 
            className="tile bg-white border-2 border-ink shadow-[5px_6px_0_#0d3a52] overflow-hidden flex flex-col max-h-[90vh] rounded-2xl animate-scaleUp"
            style={{ width: '860px', maxWidth: '95vw' }}
          >
            {/* Header */}
            <div className="p-5 border-b-2 border-ink bg-aqua-sky/30 flex justify-between items-center select-none">
              <div className="flex items-center gap-2">
                <User size={18} className="text-coral" />
                <h3 className="font-display text-xl font-bold text-ink">
                  {editingAthlete.isNew ? 'Create New Athlete Profile' : `Edit Athlete Profile: ${editingAthlete.name}`}
                </h3>
              </div>
              <button 
                onClick={() => setEditingAthlete(null)}
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
                onSubmit={handleSaveAthlete}
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
                    <label className="text-[10px] font-bold uppercase tracking-wider text-ink-3">Full Name <span className="text-coral">*</span></label>
                    <input 
                      type="text" 
                      placeholder="e.g. Jane Doe"
                      value={editingAthlete.name || ''}
                      onChange={e => handleFormFieldChange('name', e.target.value)}
                      className="bg-white border-2 border-ink rounded-xl px-3 h-10 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-aqua"
                      required
                      disabled={saving}
                    />
                  </div>

                  {/* Slug / ID */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-ink-3">Profile ID Slug <span className="text-coral">*</span></label>
                    <input 
                      type="text" 
                      placeholder="e.g. jane-doe"
                      value={editingAthlete.id || ''}
                      onChange={e => handleSlugManualChange(e.target.value)}
                      className="bg-white border-2 border-ink rounded-xl px-3 h-10 text-xs text-ink font-mono focus:outline-none focus:ring-2 focus:ring-aqua disabled:bg-bg/40 disabled:text-ink-3 disabled:cursor-not-allowed"
                      required
                      disabled={!editingAthlete.isNew || saving}
                    />
                    {editingAthlete.isNew && (
                      <span className="text-[9px] text-ink-3">Creates unique URL: /athletes/<b>{editingAthlete.id || 'slug'}</b></span>
                    )}
                    {!editingAthlete.isNew && (
                      <span className="text-[9px] text-ink-3">Database key slug is locked and cannot be changed.</span>
                    )}
                  </div>

                  {/* Current Club */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-ink-3">Current Club</label>
                    <div className="sel-wrap w-full">
                      <select
                        value={editingAthlete.current_club_id || ''}
                        onChange={e => {
                          const val = e.target.value;
                          const selectedClub = clubs.find(c => c.id === val);
                          handleFormFieldChange('current_club_id', val || null);
                          handleFormFieldChange('club_name', selectedClub ? selectedClub.name : null);
                          handleFormFieldChange('club_flag', selectedClub ? selectedClub.flag : null);
                        }}
                        className="h-10 text-xs px-3 bg-white border-2 border-ink rounded-xl font-semibold w-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-aqua"
                        disabled={saving}
                      >
                        <option value="">Independent / Unaffiliated</option>
                        {clubs.map(c => (
                          <option key={c.id} value={c.id}>{c.flag} {c.name}</option>
                        ))}
                      </select>
                      <ChevronDown size={12} className="chev" />
                    </div>
                  </div>

                  {/* Hometown */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-ink-3">Hometown</label>
                    <input 
                      type="text" 
                      placeholder="e.g. San Francisco, CA"
                      value={editingAthlete.hometown || ''}
                      onChange={e => handleFormFieldChange('hometown', e.target.value)}
                      className="bg-white border-2 border-ink rounded-xl px-3 h-10 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-aqua"
                      disabled={saving}
                    />
                  </div>

                  {/* Pronouns select dropdown (config based) */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-ink-3">Pronouns</label>
                    <div className="sel-wrap w-full">
                      <select
                        value={showCustomPronouns ? 'custom' : (editingAthlete.pronouns || '')}
                        onChange={e => {
                          const val = e.target.value;
                          if (val === 'custom') {
                            setShowCustomPronouns(true);
                            handleFormFieldChange('pronouns', '');
                          } else {
                            setShowCustomPronouns(false);
                            handleFormFieldChange('pronouns', val);
                          }
                        }}
                        className="h-10 text-xs px-3 bg-white border-2 border-ink rounded-xl font-semibold w-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-aqua"
                        disabled={saving}
                      >
                        <option value="">None / Not Specified</option>
                        {PRONOUNS.map(p => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                        <option value="custom">Custom...</option>
                      </select>
                      <ChevronDown size={12} className="chev" />
                    </div>
                    {showCustomPronouns && (
                      <input 
                        type="text" 
                        placeholder="Type custom pronouns (e.g. she/they)"
                        value={editingAthlete.pronouns || ''}
                        onChange={e => handleFormFieldChange('pronouns', e.target.value)}
                        className="bg-white border-2 border-ink rounded-xl px-3 h-10 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-aqua w-full mt-1.5 animate-fadeIn"
                        disabled={saving}
                      />
                    )}
                  </div>

                  {/* Email Input (always optional and available) */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-ink-3">Email Address</label>
                    <div className="flex items-center gap-2 bg-white border-2 border-ink rounded-xl px-3.5 h-10 focus-within:ring-2 focus-within:ring-aqua w-full">
                      <Mail size={13} className="text-ink-3 shrink-0" />
                      <input 
                        type="email" 
                        placeholder="e.g. athlete@example.com"
                        value={editingAthlete.email || ''}
                        onChange={e => handleFormFieldChange('email', e.target.value)}
                        className="border-none outline-none bg-transparent text-xs text-ink w-full p-0 focus:ring-0"
                        disabled={saving}
                      />
                    </div>
                    <span className="text-[9px] text-ink-3">Optional. Enforces strict uniqueness across all profiles if set.</span>
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
                    <span>Real-Time Public Profile Hero Preview</span>
                  </span>

                  {/* Micro Athlete Hero Mockup */}
                  <div 
                    className="tile tile-lg hero tile-depth-aqua mb-2 text-white p-5 w-full flex flex-col gap-3 rounded-2xl border-2 border-ink shadow-[4px_5px_0_#0d3a52] overflow-hidden"
                    style={{ background: 'var(--ink)' }}
                  >
                    <span className="eyebrow eyebrow-on-dark text-[9px] py-0.5 px-2 border border-white/20 rounded-full w-fit uppercase font-bold tracking-wider opacity-85">
                      ● Athlete profile
                    </span>
                    <h3 className="font-display text-2xl font-normal text-white truncate leading-tight my-1">
                      {editingAthlete.name || 'Athlete Name'}
                    </h3>
                    
                    <div className="flex flex-col gap-1.5 text-[10px] text-white/85">
                      <div className="flex items-center gap-1 font-semibold">
                        <Target size={11} /> 
                        <span className="truncate">{editingAthlete.current_club_id ? `${editingAthlete.club_flag} ${editingAthlete.club_name}` : 'Independent / Unaffiliated'}</span>
                      </div>
                      <div className="flex items-center gap-1 font-semibold">
                        <MapPin size={11} /> 
                        <span className="truncate">{editingAthlete.hometown || 'Hometown not specified'}</span>
                      </div>
                      {editingAthlete.pronouns && (
                        <div className="opacity-75 font-mono italic">
                          ({editingAthlete.pronouns})
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 mt-2 select-none">
                      {editingAthlete.is_claimed === 1 ? (
                        <span className="btn success py-1 px-2.5 rounded-lg flex items-center gap-1 bg-emerald-500 border border-white/30 text-white font-bold text-[9px] uppercase tracking-wide">
                          <CheckCircle2 size={10} /> Profile Claimed
                        </span>
                      ) : (
                        <span className="btn py-1 px-2.5 rounded-lg flex items-center gap-1 bg-white/10 border border-white/20 text-white/95 font-bold text-[9px] uppercase tracking-wide">
                          Claimable
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1 p-3 bg-white border-2 border-ink rounded-xl text-[10px] text-ink-2 shadow-[2px_3px_0_#0d3a52]">
                    <span className="font-bold uppercase tracking-wider text-ink-3">Current Stats Summary</span>
                    <div className="flex justify-between border-b border-dashed border-ink/10 py-1 font-mono">
                      <span>Swimming results count:</span>
                      <span className="font-bold text-ink">{editingAthlete.swim_count || 0}</span>
                    </div>
                    <div className="flex justify-between py-1 font-mono">
                      <span>Water polo roster entries:</span>
                      <span className="font-bold text-ink">{editingAthlete.wp_count || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="modal-foot flex gap-3 justify-end select-none">
              <button
                type="button"
                onClick={() => setEditingAthlete(null)}
                disabled={saving}
                className="pill bg-white border-2 border-ink text-ink font-semibold text-xs py-2.5 px-5 rounded-full hover:bg-aqua-pale cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveAthlete}
                disabled={saving}
                className="pill active bg-ink text-white font-bold text-xs py-2.5 px-6 rounded-full border-2 border-ink hover:bg-ink-2 active:translate-y-[1px] disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
              >
                <Save size={13} />
                <span>{saving ? 'Saving...' : 'Save Profile'}</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* DELETE CONFIRMATION MODAL PORTAL (IMPACT-AWARE SAFETY PREVIEW) */}
      {deletingAthlete && createPortal(
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
                  Delete Athlete Profile?
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
                You are about to permanently delete the profile for <b className="text-ink font-semibold">{deletingAthlete.name}</b> from the database.
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
                      Deleting this athlete profile will affect their championship results and rosters.
                      Swim results will be preserved but marked as unlinked. Roster positions will be deleted.
                    </p>
                  </div>

                  {/* Impact Stats List */}
                  <div className="grid grid-cols-3 gap-2 text-xs font-semibold text-ink-2">
                    <div className={`p-3 border-2 rounded-xl flex flex-col justify-center ${
                      impactCounts.results > 0 ? 'bg-coral-pale/40 border-coral/30 text-coral-deep' : 'bg-bg-2/30 border-ink/5 text-ink-3'
                    }`}>
                      <span className="font-mono text-lg leading-none font-bold tabular-nums">{impactCounts.results}</span>
                      <span className="text-[9px] uppercase tracking-wider font-bold mt-1">Swimming Results (Set to Null)</span>
                    </div>

                    <div className={`p-3 border-2 rounded-xl flex flex-col justify-center ${
                      impactCounts.brokenRecords > 0 ? 'bg-coral-pale/40 border-coral/30 text-coral-deep' : 'bg-bg-2/30 border-ink/5 text-ink-3'
                    }`}>
                      <span className="font-mono text-lg leading-none font-bold tabular-nums">{impactCounts.brokenRecords}</span>
                      <span className="text-[9px] uppercase tracking-wider font-bold mt-1">Records Broken (Set to Null)</span>
                    </div>

                    <div className={`p-3 border-2 rounded-xl flex flex-col justify-center ${
                      impactCounts.rosters > 0 ? 'bg-coral-pale/40 border-coral/30 text-coral-deep' : 'bg-bg-2/30 border-ink/5 text-ink-3'
                    }`}>
                      <span className="font-mono text-lg leading-none font-bold tabular-nums">{impactCounts.rosters}</span>
                      <span className="text-[9px] uppercase tracking-wider font-bold mt-1">Polo Rosters (Will be Deleted)</span>
                    </div>
                  </div>
                </div>
              ) : null}

              {/* Text confirmation */}
              {!loadingImpact && (
                <div className="type-to text-xs text-ink-2 mt-4 select-none">
                  <p className="mb-2">To confirm deletion, please type the athlete's full name <code>{deletingAthlete.name}</code> below:</p>
                  <input
                    type="text"
                    value={confirmDeleteText}
                    onChange={e => setConfirmDeleteText(e.target.value)}
                    placeholder={deletingAthlete.name}
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
                  onClick={handleDeleteAthlete}
                  disabled={
                    deleting || 
                    loadingImpact || 
                    confirmDeleteText.trim().toLowerCase() !== deletingAthlete.name.toLowerCase()
                  }
                  className="pill danger font-bold text-xs py-2.5 px-6 rounded-full border-2 border-ink disabled:opacity-30 disabled:pointer-events-none cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 size={13} />
                  <span>{deleting ? 'Deleting...' : 'Delete Profile'}</span>
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
