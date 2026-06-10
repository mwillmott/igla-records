'use client';

import React, { useState, useMemo, useEffect, useTransition } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Upload, FileText, CheckCircle2, ShieldAlert, Award, HelpCircle, 
  Merge, UserPlus, AlertCircle, RefreshCw, MapPin, ChevronDown, 
  Trophy, Plus, Search, Edit, Trash2, ChevronLeft, ChevronRight, 
  X, Sparkles, Target, Waves, ArrowLeft, Trash, Users
} from 'lucide-react';
import EditResultModal from '../../components/EditResultModal';
import EditWPTeamModal from '../../components/EditWPTeamModal';
import EditClubHistoryModal from '../../components/EditClubHistoryModal';
import SearchableSelect from '../../components/SearchableSelect';

interface Tournament {
  id: string;
  name: string;
  year: number;
}

interface Athlete {
  id: string;
  name: string;
  current_club_id: string | null;
}

interface Club {
  id: string;
  name: string;
  flag: string;
}

interface FuzzyConflict {
  rowId: number;
  uploaded: {
    athlete_name: string;
    club_id: string;
    event: string;
    course: string;
    age_category: string;
    gender_category: string;
    time: string;
    place: string;
    record_broken: string;
  };
  candidates: any[];
}

interface Resolution {
  rowId: number;
  uploaded: any;
  action: 'merge' | 'create';
  athleteId?: string;
  athleteName?: string;
}

interface ResultsAdminClientProps {
  mode: 'swimming' | 'wp' | 'import' | 'history';
  tournaments: Tournament[];
  athletes?: Athlete[];
  clubs?: Club[];
  swimmingResults?: any[];
  waterPoloResults?: any[];
  clubHistoryResults?: any[];
  session: any;
  totalCount?: number;
  currentPage?: number;
  itemsPerPage?: number;
  stats?: any;
  ageOptions?: string[];
  divisionOptions?: string[];
}

export default function ResultsAdminClient({ 
  mode,
  tournaments, 
  athletes: propAthletes, 
  clubs: propClubs, 
  swimmingResults, 
  waterPoloResults, 
  clubHistoryResults, 
  session,
  totalCount = 0,
  currentPage = 1,
  itemsPerPage = 15,
  stats: propStats,
  ageOptions: propAgeOptions,
  divisionOptions: propDivisionOptions
}: ResultsAdminClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const athletes = useMemo(() => propAthletes || [], [propAthletes]);
  const clubs = useMemo(() => propClubs || [], [propClubs]);
  const stats = useMemo(() => propStats || {}, [propStats]);
  const ageOptions = useMemo(() => propAgeOptions || [], [propAgeOptions]);
  const divisionOptions = useMemo(() => propDivisionOptions || [], [propDivisionOptions]);
  
  // Data State sync
  const [swimResults, setSwimResults] = useState(swimmingResults || []);
  const [wpResults, setWpResults] = useState(waterPoloResults || []);
  const [historyResults, setHistoryResults] = useState(clubHistoryResults || []);

  useEffect(() => {
    if (swimmingResults) {
      setSwimResults(swimmingResults);
    }
  }, [swimmingResults]);

  useEffect(() => {
    if (waterPoloResults) {
      setWpResults(waterPoloResults);
    }
  }, [waterPoloResults]);

  useEffect(() => {
    if (clubHistoryResults) {
      setHistoryResults(clubHistoryResults);
    }
  }, [clubHistoryResults]);

  // Read active filters and sorting from URL params
  const selectedTournament = searchParams.get('tournamentId') || 'All';
  const swimCourse = searchParams.get('course') || 'All';
  const swimAge = searchParams.get('age') || 'All';
  const swimGender = searchParams.get('gender') || 'All';
  const swimRecordOnly = searchParams.get('record') === 'Yes' || searchParams.get('record') === 'true';
  const wpDivision = searchParams.get('division') || 'All';
  
  const sortField = (searchParams.get('sort') || (mode === 'swimming' ? 'event' : 'place')) as any;
  const sortDirection = (searchParams.get('dir') || 'asc') as 'asc' | 'desc';

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Local state for search bar query to keep typing fluid
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');

  // Helper to update URL query params in a single transition
  const updateUrlParams = (newParams: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null || value === '' || value === 'All') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    if (!newParams.hasOwnProperty('page')) {
      params.delete('page');
    }

    startTransition(() => {
      router.push(`/admin/results/${mode}?${params.toString()}`, { scroll: false });
    });
  };

  // Debounce search updates
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== (searchParams.get('q') || '')) {
        updateUrlParams({ q: searchQuery || null });
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Sync search input if URL changes externally (e.g. browser back button)
  useEffect(() => {
    setSearchQuery(searchParams.get('q') || '');
  }, [searchParams]);

  // Modals edit state
  const [editingSwimRecord, setEditingSwimRecord] = useState<any | null>(null);
  const [editingWpRecord, setEditingWpRecord] = useState<any | null>(null);
  const [editingClubHistoryRecord, setEditingClubHistoryRecord] = useState<any | null>(null);

  // CSV Ingestion file upload state
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Staged upload state
  const [uploadResult, setUploadResult] = useState<{
    tournamentId: string;
    exactMatches: any[];
    newAthletes: any[];
    fuzzyConflicts: FuzzyConflict[];
  } | null>(null);

  // Manual resolutions state
  const [conflictIndex, setConflictIndex] = useState(0);
  const [resolutions, setResolutions] = useState<Map<number, Resolution>>(new Map());
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  
  // Transaction final result state
  const [commitResult, setCommitResult] = useState<{
    success: boolean;
    message: string;
    result: { insertCount: number; newAthletesCount: number; newRecordsCount: number };
  } | null>(null);

  // Handle CSV Ingestion File Upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setErrorMessage('');
      setUploadResult(null);
      setCommitResult(null);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setErrorMessage('Please select a championship results CSV file first.');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setUploadResult(null);

    const formData = new FormData();
    formData.append('file', file);
    const targetTournamentId = selectedTournament === 'All' ? (tournaments[0]?.id || '') : selectedTournament;
    formData.append('tournamentId', targetTournamentId);

    try {
      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.error || 'Failed to upload and parse CSV.');
        setLoading(false);
        return;
      }

      setUploadResult(data);
      setConflictIndex(0);
      setResolutions(new Map());
      setSelectedCandidateId(data.fuzzyConflicts[0]?.candidates[0]?.id || null);
      
      // Auto-commit if no conflicts exist
      if (data.fuzzyConflicts.length === 0) {
        await commitData(data, new Map());
      }
    } catch (err) {
      console.error(err);
      setErrorMessage('An unexpected connection error occurred during upload.');
    } finally {
      setLoading(false);
    }
  };

  // Perform the manual commit transaction
  const commitData = async (stagedData: any, activeResolutions: Map<number, Resolution>) => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tournamentId: stagedData.tournamentId,
          exactMatches: stagedData.exactMatches,
          newAthletes: stagedData.newAthletes,
          resolutions: Array.from(activeResolutions.values()),
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        setErrorMessage(data.error || 'Database transaction commit failed.');
        setLoading(false);
        return;
      }

      setCommitResult(data);
      setUploadResult(null); // Clear staged state
      showToast('Import completed successfully!');
      router.refresh();
    } catch (err) {
      console.error(err);
      setErrorMessage('An unexpected error occurred during database commit.');
    } finally {
      setLoading(false);
    }
  };

  const handleResolveMerge = (conflict: FuzzyConflict, candidate: any) => {
    setResolutions(prev => {
      const next = new Map(prev);
      next.set(conflict.rowId, {
        rowId: conflict.rowId,
        uploaded: conflict.uploaded,
        action: 'merge',
        athleteId: candidate.id,
        athleteName: candidate.name,
      });
      return next;
    });
    advanceConflict();
  };

  const handleResolveCreate = (conflict: FuzzyConflict) => {
    setResolutions(prev => {
      const next = new Map(prev);
      next.set(conflict.rowId, {
        rowId: conflict.rowId,
        uploaded: conflict.uploaded,
        action: 'create',
      });
      return next;
    });
    advanceConflict();
  };

  const advanceConflict = () => {
    if (!uploadResult) return;
    const nextIdx = conflictIndex + 1;
    if (nextIdx < uploadResult.fuzzyConflicts.length) {
      setConflictIndex(nextIdx);
      setSelectedCandidateId(uploadResult.fuzzyConflicts[nextIdx].candidates[0]?.id || null);
    }
  };

  const regressConflict = () => {
    const prevIdx = conflictIndex - 1;
    if (prevIdx >= 0 && uploadResult) {
      setConflictIndex(prevIdx);
      const prevConflict = uploadResult.fuzzyConflicts[prevIdx];
      const prevRes = resolutions.get(prevConflict.rowId);
      setSelectedCandidateId(prevRes?.athleteId || prevConflict.candidates[0]?.id || null);
    }
  };

  const activeConflict = uploadResult?.fuzzyConflicts[conflictIndex];
  const allResolved = uploadResult ? resolutions.size === uploadResult.fuzzyConflicts.length : false;

  // Drive pagination directly from server-paginated props
  const paginatedSwim = swimResults;
  const paginatedWp = wpResults;
  const paginatedHistory = historyResults;

  const totalPages = Math.max(1, Math.ceil(totalCount / itemsPerPage));

  const toggleSort = (field: typeof sortField) => {
    const nextDir = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
    updateUrlParams({ sort: field, dir: nextDir });
  };

  const handleOpenAddModal = () => {
    const defaultTournamentId = selectedTournament === 'All' ? (tournaments[0]?.id || '') : selectedTournament;
    if (mode === 'swimming') {
      setEditingSwimRecord({
        isNew: true,
        tournamentId: defaultTournamentId,
      });
    } else if (mode === 'wp') {
      setEditingWpRecord({
        isNew: true,
        tournamentId: defaultTournamentId,
      });
    }
  };

  const handleSaveSuccess = () => {
    setEditingSwimRecord(null);
    setEditingWpRecord(null);
    showToast('Record saved successfully!');
    router.refresh();
  };

  // Header Title metadata
  const currentTournamentName = tournaments.find(t => t.id === selectedTournament)?.name || 'Championship';

  return (
    <div className="view-enter" data-screen-label={mode === 'swimming' ? 'Admin Swimming' : mode === 'wp' ? 'Admin Water Polo' : 'Admin Import'}>
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

      {/* Header */}
      <div className="admin-pagehead animate-fadeIn animate-duration-200">
        <div>
          <h1>
            Manage {mode === 'swimming' ? <em>Swimming</em> : mode === 'wp' ? <em>Water Polo</em> : mode === 'history' ? <em>Club Summaries</em> : <em>Ingestion</em>}
          </h1>
          <div className="sub" style={mode === 'history' ? { maxWidth: '750px' } : undefined}>
            {mode === 'swimming' && 'Edit, remove, or register individual swimming results and all-time records.'}
            {mode === 'wp' && 'Manage water polo division team standings and final placements.'}
            {mode === 'history' && (
              <span>
                Manage aggregate legacy tournament summaries (medals, records, and water polo rankings) for clubs. 
                Use these stubs <strong>only</strong> when individual results are unavailable. Because public profiles 
                prioritize these manual summaries, adding one for a tournament with individual results 
                <strong>will override</strong> the dynamically calculated stats. Ideally, register individual results instead.
              </span>
            )}
            {mode === 'import' && 'Upload raw championship spreadsheets and resolve naming ambiguities.'}
          </div>
        </div>
        <div className="admin-actions flex gap-2">
          {mode !== 'import' && (
            <>
              <Link 
                href="/admin/results/import"
                className="pill bg-white border-2 border-ink text-ink font-semibold text-xs py-2.5 px-5 rounded-full hover:bg-aqua-pale cursor-pointer flex items-center gap-2"
              >
                <Upload size={14} />
                <span>Import CSV</span>
              </Link>
              {mode !== 'history' && (
                <button 
                  onClick={handleOpenAddModal}
                  className="pill active inline-flex items-center gap-2 bg-ink text-white font-semibold text-xs py-2.5 px-5 rounded-full border-2 border-ink hover:bg-ink-2 active:translate-y-[1px] cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Add {mode === 'swimming' ? 'Swimmer Result' : 'Polo Team Result'}</span>
                </button>
              )}
              <button 
                onClick={() => setEditingClubHistoryRecord({ isNew: true })}
                className="pill coral inline-flex items-center gap-2 font-semibold text-xs py-2.5 px-5 rounded-full border-2 border-ink hover:bg-coral-deep active:translate-y-[1px] cursor-pointer"
              >
                <Plus size={14} />
                <span>Add Club Summary</span>
              </button>
            </>
          )}
          {mode === 'import' && !uploadResult && !commitResult && (
            <Link 
              href="/admin/results/swimming"
              className="pill bg-white border-2 border-ink text-ink font-semibold text-xs py-2.5 px-5 rounded-full hover:bg-aqua-pale cursor-pointer flex items-center gap-2"
            >
              <ArrowLeft size={14} />
              <span>Back to Records</span>
            </Link>
          )}
        </div>
      </div>

      {/* KPI Stats Strip */}
      {mode === 'history' && (
        <div className="stat-strip mb-6 animate-fadeIn">
          <div className="stat-tile">
            <div className="stat-tile-val font-mono tabular-nums">
              {stats.historyCount || 0}
            </div>
            <div className="stat-tile-key text-ink-3">Summaries Logged</div>
          </div>
          <div className="stat-tile">
            <div className="stat-tile-val font-mono tabular-nums">
              {stats.totalMedals || 0}
            </div>
            <div className="stat-tile-key text-ink-3">Total Medals</div>
          </div>
          <div className="stat-tile coral">
            <div className="stat-tile-val font-mono text-white tabular-nums">
              {stats.totalRecords || 0}
            </div>
            <div className="stat-tile-key text-white/90">All-Time Records</div>
          </div>
        </div>
      )}

      {mode === 'swimming' && (
        <div className="stat-strip mb-6 animate-fadeIn">
          <div className="stat-tile">
            <div className="stat-tile-val font-mono tabular-nums">
              {stats.resultsCount || 0}
            </div>
            <div className="stat-tile-key text-ink-3">Results Logged</div>
          </div>
          <div className="stat-tile">
            <div className="stat-tile-val font-mono tabular-nums">
              {stats.competitorsCount || 0}
            </div>
            <div className="stat-tile-key text-ink-3">Unique Competitors</div>
          </div>
          <div className="stat-tile coral">
            <div className="stat-tile-val font-mono text-white tabular-nums">
              {stats.recordsCount || 0}
            </div>
            <div className="stat-tile-key text-white/90">All-Time Records set</div>
          </div>
        </div>
      )}

      {mode === 'wp' && (
        <div className="stat-strip mb-6 animate-fadeIn">
          <div className="stat-tile">
            <div className="stat-tile-val font-mono tabular-nums">
              {stats.teamsCount || 0}
            </div>
            <div className="stat-tile-key text-ink-3">Teams Registered</div>
          </div>
          <div className="stat-tile">
            <div className="stat-tile-val font-mono tabular-nums">
              {stats.divisionsCount || 0}
            </div>
            <div className="stat-tile-key text-ink-3">Divisions</div>
          </div>
          <div className="stat-tile coral">
            <div className="stat-tile-val font-mono text-white tabular-nums">
              {stats.championsCount || 0}
            </div>
            <div className="stat-tile-key text-white/90">Champions Crowned</div>
          </div>
        </div>
      )}

      {/* CSV IMPORT SCREEN */}
      {mode === 'import' && !uploadResult && !commitResult && (
        <div className="panel max-w-2xl mx-auto mt-6 animate-fadeIn">
          <div className="panel-head bg-aqua-sky/20">
            <h3>Import Swimming Results CSV</h3>
            <span className="chip upcoming text-[9px]">Ingest Spreadsheet</span>
          </div>

          <div className="panel-body p-6">
            <p className="text-xs text-ink-3 mb-6 leading-relaxed">
              Upload a raw CSV spreadsheet of results for <strong>{currentTournamentName}</strong>. 
              The system will parse the records, auto-link matching profiles, and prompt 
              you to resolve conflicts.
              <br />
              <span className="font-semibold text-coral mt-2 block">
                ⚠️ Note: This tool currently only supports swimming results.
              </span>
            </p>

            <form onSubmit={handleUpload}>
              {errorMessage && (
                <div className="mb-5 p-4 bg-coral-pale border-2 border-coral rounded-xl text-xs font-semibold text-coral-deep flex items-start gap-2.5">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <SearchableSelect
                label="Championship Event"
                placeholder="Search tournament..."
                value={selectedTournament === 'All' ? tournaments[0]?.id || '' : selectedTournament}
                onChange={val => updateUrlParams({ tournamentId: val })}
                options={useMemo(() => tournaments.map(t => ({ id: t.id, name: `${t.name} (${t.year})` })), [tournaments])}
              />

              {/* File Picker */}
              <div className="mb-6 flex flex-col gap-2">
                <label className="text-[10px] font-bold tracking-wider text-ink-3 uppercase">CSV Result File</label>
                <div className="relative border-2 border-dashed border-ink/20 hover:border-ink/50 transition-all rounded-xl p-8 text-center flex flex-col items-center justify-center bg-bg/15 group cursor-pointer">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <Upload size={32} className="text-ink-3 group-hover:text-coral transition-colors mb-3" />
                  {file ? (
                    <div>
                      <p className="text-sm font-bold text-ink flex items-center justify-center gap-1.5">
                        <FileText size={16} className="text-coral" />
                        <span>{file.name}</span>
                      </p>
                      <p className="text-[10px] text-ink-3 mt-1 font-mono">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm font-semibold text-ink">Drag and drop your CSV file here, or click to browse</p>
                      <p className="text-[10px] text-ink-3 mt-1">Accepts only standard CSV spreadsheets</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 border-t border-ink/10 pt-6">
                <div className="text-[10px] font-semibold text-ink-3 flex items-center gap-1">
                  <HelpCircle size={13} />
                  <span>CSV must contain athlete_name, club_id, event, course, age_category, gender_category, time, and place.</span>
                </div>
                
                <button
                  type="submit"
                  disabled={loading || !file}
                  className="pill active flex items-center gap-2 bg-ink text-white font-semibold text-xs py-3 px-6 rounded-full border-2 border-ink hover:bg-ink-2 active:translate-y-[1px] disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                >
                  {loading ? (
                    <>
                      <RefreshCw size={13} className="animate-spin" />
                      <span>Parsing CSV...</span>
                    </>
                  ) : (
                    <>
                      <Upload size={13} />
                      <span>Ingest Results</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* COMMIT SUCCESS SCREEN */}
      {mode === 'import' && commitResult && (
        <section className="tile tile-lg p-10 max-w-2xl mx-auto mt-6 bg-white/90 border-2 border-ink shadow-[5px_6px_0_#0d3a52] text-center select-none animate-fadeIn">
          <div className="mx-auto w-14 h-14 rounded-full bg-emerald-100 border-2 border-emerald-500 text-emerald-600 flex items-center justify-center mb-6">
            <CheckCircle2 size={32} />
          </div>
          
          <h2 className="font-display text-4xl text-ink font-normal mb-3">Championship Synchronized!</h2>
          
          <p className="text-xs text-ink-3 leading-relaxed max-w-lg mx-auto mb-8">
            {commitResult.message} The relational database integrity was audited, and all athlete career timelines 
            have been dynamically updated.
          </p>

          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-8">
            <div className="bg-bg/20 border-2 border-ink/10 rounded-xl p-3.5">
              <div className="font-display text-3xl font-normal text-ink leading-none">{commitResult.result.insertCount}</div>
              <div className="text-[9px] uppercase tracking-wider font-bold text-ink-3 mt-1.5">Swim times committed</div>
            </div>
            <div className="bg-bg/20 border-2 border-ink/10 rounded-xl p-3.5">
              <div className="font-display text-3xl font-normal text-ink leading-none">{commitResult.result.newAthletesCount}</div>
              <div className="text-[9px] uppercase tracking-wider font-bold text-ink-3 mt-1.5">New Athletes created</div>
            </div>
            <div className="bg-bg/20 border-2 border-ink/10 rounded-xl p-3.5">
              <div className="font-display text-3xl font-normal text-coral leading-none">{commitResult.result.newRecordsCount}</div>
              <div className="text-[9px] uppercase tracking-wider font-bold text-ink-3 mt-1.5">All-time records set</div>
            </div>
          </div>

          <div className="flex gap-3 justify-center select-none">
            <button
              onClick={() => {
                setFile(null);
                setCommitResult(null);
              }}
              className="pill bg-white border-2 border-ink text-ink font-semibold text-xs py-2.5 px-6 rounded-full hover:bg-aqua-pale cursor-pointer"
            >
              Upload another file
            </button>
            <Link
              href="/admin/results/swimming"
              onClick={() => {
                setCommitResult(null);
                setFile(null);
              }}
              className="pill active bg-ink text-white font-semibold text-xs py-2.5 px-6 rounded-full border-2 border-ink hover:bg-ink-2 cursor-pointer inline-flex items-center justify-center"
            >
              Back to Dashboard
            </Link>
          </div>
        </section>
      )}

      {/* SPLIT-SCREEN MANUAL RESOLVER PANEL */}
      {mode === 'import' && uploadResult && uploadResult.fuzzyConflicts.length > 0 && activeConflict && (
        <div className="flex flex-col gap-6 mt-6 animate-fadeIn">
          {/* Progress Header */}
          <div className="tile p-4 bg-coral-pale/40 border-2 border-coral rounded-xl flex items-center justify-between gap-4 select-none shadow-sm">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-coral text-white font-bold text-xs flex items-center justify-center shrink-0">!</span>
              <span className="text-xs font-semibold text-ink">
                Fuzzy Name Ambiguities Detected · Naming Conflicts require your manual validation.
              </span>
            </div>
            <div className="text-xs font-bold text-ink-2 font-mono bg-white px-3 py-1 border border-ink/10 rounded-full">
              Conflict {conflictIndex + 1} of {uploadResult.fuzzyConflicts.length}
            </div>
          </div>

          {/* SPLIT SCREEN COLUMNS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            
            {/* LEFT PANEL: UPLOADED RECORD DETAILS */}
            <div className="tile p-6 bg-white border-2 border-ink shadow-[3px_4px_0_#0d3a52] flex flex-col gap-5">
              <div className="pb-3 border-b-2 border-ink flex items-center justify-between select-none">
                <span className="text-[10px] font-bold tracking-wider text-ink-3 uppercase">CSV Uploaded Row</span>
                <span className="status-pill upcoming text-[9px]">Unresolved</span>
              </div>

              <div>
                <h3 className="font-display text-4xl text-ink font-normal leading-tight">
                  {activeConflict.uploaded.athlete_name}
                </h3>
                <p className="text-xs font-bold text-coral flex items-center gap-1 mt-1.5 select-none">
                  <Award size={13} />
                  <span>Staged Swimmer Result</span>
                </p>
              </div>

              {/* Data fields */}
              <div className="grid grid-cols-2 gap-4 text-xs select-none">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-ink-3">Representing Club ID</p>
                  <p className="font-bold text-ink mt-1 bg-bg-2 px-2.5 py-1.5 border border-ink/5 rounded-lg w-fit">{activeConflict.uploaded.club_id}</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-ink-3">Age & Gender</p>
                  <p className="font-bold text-ink mt-1 bg-bg-2 px-2.5 py-1.5 border border-ink/5 rounded-lg w-fit">
                    {activeConflict.uploaded.age_category} · {activeConflict.uploaded.gender_category}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-ink-3">Event & Course</p>
                  <p className="font-semibold text-ink mt-1">{activeConflict.uploaded.event} ({activeConflict.uploaded.course})</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-ink-3">Swim Time</p>
                  <p className="font-mono font-bold text-sm text-ink mt-1">{activeConflict.uploaded.time}</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-ink-3">Placement & Records</p>
                  <p className="font-semibold text-ink mt-1 flex items-center gap-1.5">
                    <span className="place-badge w-6 h-6 flex items-center justify-center font-bold text-xs place-other">{activeConflict.uploaded.place}</span>
                    {String(activeConflict.uploaded.record_broken) === 'true' && (
                      <span className="status-pill live text-[8px] bg-coral text-white border border-ink py-0.5 px-1.5 rounded-full select-none font-bold">★ Record</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Action trigger: create new athlete */}
              <button
                onClick={() => handleResolveCreate(activeConflict)}
                className="mt-4 w-full py-3 rounded-xl border-2 border-ink bg-white hover:bg-aqua-pale text-ink font-bold text-xs shadow-[3px_4px_0_#0d3a52] active:translate-y-[1px] active:shadow-[1px_2px_0_#0d3a52] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <UserPlus size={15} />
                <span>Create Brand New Athlete Profile</span>
              </button>
            </div>

            {/* RIGHT PANEL: DATABASE FUZZY MATCH CANDIDATES */}
            <div className="tile p-6 bg-white border-2 border-ink shadow-[3px_4px_0_#0d3a52] flex flex-col gap-4">
              <div className="pb-3 border-b-2 border-ink flex items-center justify-between select-none">
                <span className="text-[10px] font-bold tracking-wider text-ink-3 uppercase">Database Fuzzy Candidates</span>
                <span className="text-[10px] font-bold text-ink-2 font-mono">Similarity Threshold &ge; 70%</span>
              </div>

              {/* Candidates list */}
              <div className="flex flex-col gap-3 max-h-[360px] overflow-y-auto pr-1">
                {activeConflict.candidates.map((cand) => {
                  const isSelected = selectedCandidateId === cand.id;
                  return (
                    <button
                      key={cand.id}
                      onClick={() => setSelectedCandidateId(cand.id)}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all cursor-pointer flex gap-4 ${
                        isSelected 
                          ? 'border-ink bg-aqua-sky/20 shadow-[2px_3px_0_#0d3a52]' 
                          : 'border-ink/10 hover:border-ink/30 bg-white'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 border-ink text-xs font-bold shrink-0 ${
                        isSelected ? 'bg-ink text-white' : 'bg-bg text-ink'
                      }`}>
                        {cand.similarity}%
                      </div>
                      
                      <div className="min-w-0 flex-1">
                        <div className="flex justify-between items-start select-none">
                          <p className="font-bold text-ink truncate text-sm">{cand.name}</p>
                          <span className="text-[10px] text-ink-3 font-semibold">{cand.pronouns}</span>
                        </div>
                        <p className="text-[10.5px] text-ink-2 truncate mt-1">Current: <span className="font-semibold text-ink">{cand.club_name}</span></p>
                        <p className="text-[10px] text-ink-3 truncate mt-0.5 flex items-center gap-0.5"><MapPin size={9} /> {cand.hometown}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Action trigger: Merge with selected candidate */}
              {selectedCandidateId && (
                <button
                  onClick={() => {
                    const cand = activeConflict.candidates.find(c => c.id === selectedCandidateId);
                    if (cand) handleResolveMerge(activeConflict, cand);
                  }}
                  className="w-full py-3 rounded-xl border-2 border-ink bg-ink hover:bg-ink-2 text-white font-bold text-xs shadow-[3px_4px_0_#0d3a52] active:translate-y-[1px] active:shadow-[1px_2px_0_#0d3a52] transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
                >
                  <Merge size={15} />
                  <span>Merge with Selected database Swimmer</span>
                </button>
              )}
            </div>

          </div>

          {/* Resolution Navigation footer */}
          <div className="flex justify-between items-center select-none pt-4 border-t border-ink/10">
            <button
              onClick={regressConflict}
              disabled={conflictIndex === 0}
              className="pill bg-white border-2 border-ink text-ink font-semibold text-xs py-2.5 px-5 rounded-full hover:bg-aqua-pale disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
            >
              Previous Conflict
            </button>

            {/* Resolved Summary checklist */}
            <div className="text-xs font-semibold text-ink-3">
              Staged resolutions: <span className="font-mono font-bold text-coral">{resolutions.size}</span> of{' '}
              <span className="font-mono font-bold text-ink">{uploadResult.fuzzyConflicts.length}</span> conflicts resolved
            </div>

            {allResolved ? (
              <button
                onClick={() => commitData(uploadResult, resolutions)}
                className="pill active bg-ink text-white font-bold text-xs py-3 px-8 rounded-full border-2 border-ink hover:bg-ink-2 active:translate-y-[1px] cursor-pointer flex items-center gap-1.5 shadow-[2px_3px_0_#0d3a52]"
              >
                <CheckCircle2 size={13} />
                <span>Validate & Commit Results</span>
              </button>
            ) : (
              <button
                disabled
                className="pill bg-white border-2 border-ink/20 text-ink-3/50 font-bold text-xs py-3 px-8 rounded-full pointer-events-none opacity-40"
              >
                Resolve all to commit
              </button>
            )}
          </div>
        </div>
      )}

      {/* PRIMARY CRUD WORKSPACE VIEW */}
      {mode !== 'import' && (
        <div className="animate-fadeIn animate-duration-250">
          {/* Filtering Toolbar */}
          <div className="flex flex-col gap-4 mb-5 select-none bg-white p-4 rounded-2xl border-2 border-ink shadow-[3px_4px_0_#0d3a52]">
            {/* Top Row: Championship & Search */}
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 justify-between w-full">
              {/* Tournament Selector */}
              <div className="flex flex-col gap-1 w-full sm:w-auto">
                <span className="text-[9px] font-bold uppercase tracking-wider text-ink-3">Championship Event</span>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-aqua-sky/20 border-2 border-ink text-ink select-none shrink-0">
                    <Trophy size={18} className="text-coral" />
                  </div>
                  <SearchableSelect
                    placeholder="Search tournament..."
                    value={selectedTournament}
                    onChange={val => updateUrlParams({ tournamentId: val })}
                    options={useMemo(() => [
                      { id: 'All', name: 'All Championships' },
                      ...tournaments.map(t => ({ id: t.id, name: `${t.name} (${t.year})` }))
                    ], [tournaments])}
                    className="min-w-[240px] sm:min-w-[280px] w-full"
                  />
                </div>
              </div>

              {/* Search box */}
              <div className="flex flex-col sm:items-end gap-1 w-full sm:w-auto">
                <span className="text-[9px] font-bold uppercase tracking-wider text-ink-3 sm:mr-1">Search Results</span>
                <div className="search w-full sm:w-[320px] h-10 bg-white !flex-none" style={{ flex: 'none' }}>
                  <Search size={14} className="text-ink-2" />
                  <input
                    placeholder={
                      mode === 'swimming' 
                        ? "Search event, swimmer, club..." 
                        : mode === 'wp' 
                        ? "Search team, club, division..." 
                        : "Search club..."
                    }
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full text-xs font-semibold placeholder:text-ink-3 placeholder:font-normal"
                  />
                  {searchQuery && (
                    <button className="search-clear" onClick={() => setSearchQuery('')}>
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Row: Additional Filters */}
            <div className="flex flex-wrap items-end gap-4 pt-4 border-t border-dashed border-ink/20 w-full">
              {/* Swimming specific filters */}
              {mode === 'swimming' && (
                <>
                  {/* Course */}
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-ink-3">Course</span>
                    <div className="sel-wrap min-w-[110px]">
                      <select
                        value={swimCourse}
                        onChange={e => updateUrlParams({ course: e.target.value })}
                        className="sel h-10 text-xs pl-3 pr-8 bg-white font-semibold w-full cursor-pointer focus:outline-none"
                      >
                        <option value="All">All Courses</option>
                        <option value="LCM">LCM (50m)</option>
                        <option value="SCM">SCM (25m)</option>
                      </select>
                      <ChevronDown size={12} className="chev" />
                    </div>
                  </div>

                  {/* Age */}
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-ink-3">Age Group</span>
                    <div className="sel-wrap min-w-[110px]">
                      <select
                        value={swimAge}
                        onChange={e => updateUrlParams({ age: e.target.value })}
                        className="sel h-10 text-xs pl-3 pr-8 bg-white font-semibold w-full cursor-pointer focus:outline-none"
                      >
                        <option value="All">All Ages</option>
                        {ageOptions.map(age => (
                          <option key={age} value={age}>{age}</option>
                        ))}
                      </select>
                      <ChevronDown size={12} className="chev" />
                    </div>
                  </div>

                  {/* Gender */}
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-ink-3">Gender Category</span>
                    <div className="sel-wrap min-w-[130px]">
                      <select
                        value={swimGender}
                        onChange={e => updateUrlParams({ gender: e.target.value })}
                        className="sel h-10 text-xs pl-3 pr-8 bg-white font-semibold w-full cursor-pointer focus:outline-none"
                      >
                        <option value="All">All Genders</option>
                        <option value="Men">Men</option>
                        <option value="Women">Women</option>
                        <option value="Mixed">Mixed</option>
                      </select>
                      <ChevronDown size={12} className="chev" />
                    </div>
                  </div>

                  {/* Record Toggle */}
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-ink-3">Record Status</span>
                    <button
                      onClick={() => updateUrlParams({ record: swimRecordOnly ? 'No' : 'Yes' })}
                      className={`h-10 px-4 flex items-center gap-2 border-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        swimRecordOnly 
                          ? 'bg-coral border-ink text-white shadow-[2px_2px_0_rgba(0,0,0,0.15)] hover:bg-coral-deep' 
                          : 'bg-white border-ink text-ink hover:bg-aqua-pale'
                      }`}
                    >
                      <Sparkles size={12} className={swimRecordOnly ? 'text-white' : 'text-coral'} />
                      <span>Records Only</span>
                    </button>
                  </div>
                </>
              )}

              {/* Water Polo specific filters */}
              {mode === 'wp' && (
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-ink-3">Division</span>
                  <div className="sel-wrap min-w-[180px]">
                    <select
                      value={wpDivision}
                      onChange={e => updateUrlParams({ division: e.target.value })}
                      className="sel h-10 text-xs pl-3 pr-8 bg-white font-semibold w-full cursor-pointer focus:outline-none"
                    >
                      <option value="All">All Divisions</option>
                      {divisionOptions.map(div => (
                        <option key={div} value={div}>{div}</option>
                      ))}
                    </select>
                    <ChevronDown size={12} className="chev" />
                  </div>
                </div>
              )}

              {/* Clear Filters Button */}
              {((mode === 'swimming' && (swimCourse !== 'All' || swimAge !== 'All' || swimGender !== 'All' || swimRecordOnly)) || 
                (mode === 'wp' && wpDivision !== 'All')) && (
                <button
                  onClick={() => {
                    if (mode === 'swimming') {
                      updateUrlParams({ course: 'All', age: 'All', gender: 'All', record: 'No' });
                    } else {
                      updateUrlParams({ division: 'All' });
                    }
                  }}
                  className="h-10 px-4 ml-auto flex items-center gap-1.5 border-2 border-dashed border-ink/30 rounded-xl text-xs font-bold text-ink-2 hover:border-ink hover:text-ink hover:bg-bg-2 transition-all cursor-pointer"
                >
                  <X size={13} />
                  <span>Clear Filters</span>
                </button>
              )}
            </div>
          </div>

          {/* Results Table Section */}
          <div className="dt-wrap relative">
            {isPending && (
              <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] flex items-center justify-center z-10 animate-fadeIn animate-duration-150">
                <div className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-ink rounded-full shadow-[2px_3px_0_#000]">
                  <RefreshCw className="animate-spin text-coral" size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-ink">Loading results...</span>
                </div>
              </div>
            )}
            <table className="dt">
              {mode === 'swimming' ? (
                <>
                  <thead>
                    <tr>
                      <th style={{ width: '8%' }}>
                        <button 
                          type="button"
                          onClick={() => toggleSort('place')}
                          className={`sortable ${sortField === 'place' ? 'on' : ''}`}
                        >
                          Place
                          {sortField === 'place' && (sortDirection === 'asc' ? ' ▲' : ' ▼')}
                        </button>
                      </th>
                      <th style={{ width: '22%' }}>
                        <button 
                          type="button"
                          onClick={() => toggleSort('athlete')}
                          className={`sortable ${sortField === 'athlete' ? 'on' : ''}`}
                        >
                          Athlete Swimmer
                          {sortField === 'athlete' && (sortDirection === 'asc' ? ' ▲' : ' ▼')}
                        </button>
                      </th>
                      <th style={{ width: '25%' }}>
                        <button 
                          type="button"
                          onClick={() => toggleSort('event')}
                          className={`sortable ${sortField === 'event' ? 'on' : ''}`}
                        >
                          Swim Event
                          {sortField === 'event' && (sortDirection === 'asc' ? ' ▲' : ' ▼')}
                        </button>
                      </th>
                      <th style={{ width: '15%' }}>Categories</th>
                      <th style={{ width: '10%' }}>Swim Time</th>
                      <th style={{ width: '12%' }}>Record Status</th>
                      <th className="act" style={{ width: '8%' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedSwim.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-ink-3 italic">
                          No swimming results match your filters for this tournament.
                        </td>
                      </tr>
                    ) : (
                      paginatedSwim.map((r) => {
                        return (
                          <tr key={r.id}>
                            <td className="num select-none">
                              <span className={`place-badge inline-flex items-center justify-center w-6 h-6 rounded-full font-bold text-xs ${
                                r.place === 1 ? 'place-1' : r.place === 2 ? 'place-2' : r.place === 3 ? 'place-3' : 'place-other'
                              }`}>
                                {r.place}
                              </span>
                            </td>
                            <td>
                              <div className="font-semibold text-ink">
                                {r.athleteId ? (
                                  <Link href={`/athletes/${r.athleteId}`} target="_blank" className="hover:underline hover:text-coral transition-colors">
                                    {r.athlete}
                                  </Link>
                                ) : (
                                  <span>{r.athlete || 'Independent'}</span>
                                )}
                              </div>
                              <div className="text-[10px] text-ink-3 flex items-center gap-1.5 mt-0.5 select-none">
                                <span>{r.club}</span>
                              </div>
                            </td>
                            <td>
                              <div className="font-bold text-ink-2">{r.event}</div>
                              <span className="text-[9px] uppercase font-mono tracking-wider mt-1 px-1 bg-bg-2 border border-ink/10 rounded select-none">{r.course}</span>
                            </td>
                            <td>
                              <div className="text-xs text-ink-2 font-semibold">Age {r.age}</div>
                              <div className="text-[10px] text-ink-3 mt-0.5">{r.gender}</div>
                            </td>
                            <td className="font-mono text-xs font-bold text-ink tabular-nums">
                              {r.time}
                            </td>
                            <td>
                              {r.is_all_time_record === 1 ? (
                                <span className={`inline-flex items-center gap-1 text-[9px] py-0.5 px-2 rounded-full font-bold border uppercase tracking-wider select-none ${
                                  r.held === 1 
                                    ? 'bg-coral text-white border-ink' 
                                    : 'bg-bg-2 border-ink/20 text-ink-3'
                                }`}>
                                  <Sparkles size={9} />
                                  <span>{r.held === 1 ? 'Reigning' : 'Broken'}</span>
                                </span>
                              ) : (
                                <span className="text-[10px] text-ink-3 italic select-none">Regular</span>
                              )}
                            </td>
                            <td className="act">
                              <div className="row-actions">
                                <button
                                  onClick={() => setEditingSwimRecord(r)}
                                  className="row-btn"
                                  title="Edit Swim Result"
                                >
                                  <Edit size={12} />
                                </button>
                                <button
                                  onClick={async () => {
                                    if (confirm(`Are you sure you want to delete this swimming result?`)) {
                                      try {
                                        const res = await fetch('/api/admin/records/delete', {
                                          method: 'POST',
                                          headers: { 'Content-Type': 'application/json' },
                                          body: JSON.stringify({ type: 'swimming', id: r.id })
                                        });
                                        if (res.ok) {
                                          showToast('Result deleted.');
                                          router.refresh();
                                        } else {
                                          showToast('Failed to delete.', 'error');
                                        }
                                      } catch (err) {
                                        showToast('Error deleting.', 'error');
                                      }
                                    }
                                  }}
                                  className="row-btn danger"
                                  title="Delete Swim Result"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </>
              ) : mode === 'wp' ? (
                <>
                  <thead>
                    <tr>
                      <th style={{ width: '8%' }}>Rank</th>
                      <th style={{ width: '30%' }}>
                        <button 
                          type="button"
                          onClick={() => toggleSort('teamName')}
                          className={`sortable ${sortField === 'teamName' ? 'on' : ''}`}
                        >
                          Water Polo Team
                          {sortField === 'teamName' && (sortDirection === 'asc' ? ' ▲' : ' ▼')}
                        </button>
                      </th>
                      <th style={{ width: '22%' }}>Club Represented</th>
                      <th style={{ width: '15%' }}>Division</th>
                      <th className="num" style={{ width: '15%' }}>
                        <button 
                          type="button"
                          onClick={() => toggleSort('points')}
                          className={`sortable ${sortField === 'points' ? 'on' : ''}`}
                        >
                          Record (Wins/Losses)
                          {sortField === 'points' && (sortDirection === 'asc' ? ' ▲' : ' ▼')}
                        </button>
                      </th>
                      <th className="act" style={{ width: '10%' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedWp.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-ink-3 italic">
                          No water polo standings match your filters for this tournament.
                        </td>
                      </tr>
                    ) : (
                      paginatedWp.map((w) => {
                        return (
                          <tr key={w.id}>
                            <td className="num select-none">
                              <span className={`place-badge inline-flex items-center justify-center w-6 h-6 rounded-full font-bold text-xs ${
                                w.placement === 1 ? 'place-1' : w.placement === 2 ? 'place-2' : w.placement === 3 ? 'place-3' : 'place-other'
                              }`}>
                                {w.placement}
                              </span>
                            </td>
                            <td>
                              <div className="font-bold text-ink">
                                <Link href={`/tournaments/${selectedTournament}?sport=wp`} target="_blank" className="hover:underline hover:text-coral transition-colors">
                                  {w.teamName}
                                </Link>
                              </div>
                              <div className="text-[10px] text-ink-3 flex items-center gap-1.5 mt-0.5 select-none font-semibold">
                                <Users size={11} />
                                <span>{w.rosterCount ?? 0} {w.rosterCount === 1 ? 'player' : 'players'} registered</span>
                              </div>
                            </td>
                            <td className="text-xs font-semibold text-ink-2">
                              {w.clubName ? (
                                <Link href={`/clubs/${w.clubId}`} target="_blank" className="hover:underline hover:text-coral">
                                  {w.clubName}
                                </Link>
                              ) : (
                                <span className="italic text-ink-3">Independent</span>
                              )}
                            </td>
                            <td className="text-xs font-semibold text-ink-2">
                              {w.division}
                            </td>
                            <td className="num font-mono text-xs text-ink-2">
                              <div className="flex flex-col text-right">
                                <span className="font-semibold text-ink">
                                  {w.wins ?? 0}W – {w.losses ?? 0}L
                                </span>
                                <span className="text-[9px] text-ink-3">
                                  {w.goalsFor ?? 0} GF / {w.goalsAgainst ?? 0} GA
                                </span>
                                <span className="text-[9px] text-coral font-bold mt-0.5">
                                  {w.points ?? 0} Pts
                                </span>
                              </div>
                            </td>
                            <td className="act">
                              <div className="row-actions">
                                <button
                                  onClick={() => setEditingWpRecord(w)}
                                  className="row-btn"
                                  title="Edit Standings"
                                >
                                  <Edit size={12} />
                                </button>
                                <button
                                  onClick={async () => {
                                    if (confirm(`Are you sure you want to delete the standing for ${w.teamName}? This will also delete roster spots.`)) {
                                      try {
                                        const res = await fetch('/api/admin/records/delete', {
                                          method: 'POST',
                                          headers: { 'Content-Type': 'application/json' },
                                          body: JSON.stringify({ type: 'wp', id: w.id })
                                        });
                                        if (res.ok) {
                                          showToast('Team deleted.');
                                          router.refresh();
                                        } else {
                                          showToast('Failed to delete.', 'error');
                                        }
                                      } catch (err) {
                                        showToast('Error deleting.', 'error');
                                      }
                                    }
                                  }}
                                  className="row-btn danger"
                                  title="Delete Standing"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </>
              ) : (
                <>
                  <thead>
                    <tr>
                      <th style={{ width: '25%' }}>
                        <button 
                          type="button"
                          onClick={() => toggleSort('tournament')}
                          className={`sortable ${sortField === 'tournament' ? 'on' : ''}`}
                        >
                          Tournament
                          {sortField === 'tournament' && (sortDirection === 'asc' ? ' ▲' : ' ▼')}
                        </button>
                      </th>
                      <th style={{ width: '25%' }}>
                        <button 
                          type="button"
                          onClick={() => toggleSort('club')}
                          className={`sortable ${sortField === 'club' ? 'on' : ''}`}
                        >
                          Club
                          {sortField === 'club' && (sortDirection === 'asc' ? ' ▲' : ' ▼')}
                        </button>
                      </th>
                      <th style={{ width: '20%' }}>Medals (G / S / B)</th>
                      <th style={{ width: '10%' }}>Records Set</th>
                      <th style={{ width: '12%' }}>Water Polo Standing</th>
                      <th className="act" style={{ width: '8%' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedHistory.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-ink-3 italic">
                          No club tournament summaries match your filters.
                        </td>
                      </tr>
                    ) : (
                      paginatedHistory.map((h) => {
                        const hasWpStanding = !!h.wpDivision;
                        return (
                          <tr key={`${h.clubId}-${h.tournamentId}`}>
                            <td>
                              <div className="font-bold text-ink">
                                <Link href={`/tournaments/${h.tournamentId}`} target="_blank" className="hover:underline hover:text-coral transition-colors">
                                  {h.tournamentName}
                                </Link>
                              </div>
                              <span className="text-[10px] text-ink-3 select-none">{h.tournamentYear}</span>
                            </td>
                            <td>
                              <div className="font-semibold text-ink flex items-center gap-1.5">
                                <span className="text-sm shrink-0" role="img" aria-label="flag">{h.clubFlag}</span>
                                <Link href={`/clubs/${h.clubId}`} target="_blank" className="hover:underline hover:text-coral transition-colors">
                                  {h.clubName}
                                </Link>
                              </div>
                              <span className="text-[10px] text-ink-3 font-mono select-none">{h.clubId.toUpperCase()}</span>
                            </td>
                            <td>
                              <div className="flex items-center gap-1 select-none">
                                <span className="flex items-center gap-1 font-bold text-[9px] uppercase tracking-wider text-ink bg-white/60 border border-ink/10 py-0.5 px-1.5 rounded-full shadow-[1px_1.5px_0_#0d3a52] whitespace-nowrap" title="Gold Medals">
                                  <span className="w-2 h-2 rounded-full border border-ink inline-block" style={{ background: 'var(--gold)' }} />
                                  <span>{h.medalsGold} G</span>
                                </span>
                                <span className="flex items-center gap-1 font-bold text-[9px] uppercase tracking-wider text-ink bg-white/60 border border-ink/10 py-0.5 px-1.5 rounded-full shadow-[1px_1.5px_0_#0d3a52] whitespace-nowrap" title="Silver Medals">
                                  <span className="w-2 h-2 rounded-full border border-ink inline-block" style={{ background: 'var(--silver)' }} />
                                  <span>{h.medalsSilver} S</span>
                                </span>
                                <span className="flex items-center gap-1 font-bold text-[9px] uppercase tracking-wider text-ink bg-white/60 border border-ink/10 py-0.5 px-1.5 rounded-full shadow-[1px_1.5px_0_#0d3a52] whitespace-nowrap" title="Bronze Medals">
                                  <span className="w-2 h-2 rounded-full border border-ink inline-block" style={{ background: 'var(--bronze)' }} />
                                  <span>{h.medalsBronze} B</span>
                                </span>
                              </div>
                            </td>
                            <td className="font-mono text-xs font-bold text-ink tabular-nums">
                              {h.recordsSet > 0 ? (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-coral-pale border border-coral/30 rounded text-coral-deep font-bold">
                                  ★ {h.recordsSet}
                                </span>
                              ) : (
                                <span className="text-ink-3">0</span>
                              )}
                            </td>
                            <td>
                              {hasWpStanding ? (
                                <div className="flex flex-col">
                                  <span className="text-xs font-semibold text-ink">{h.wpDivision}</span>
                                  <span className="text-[10px] text-ink-3">Rank: {h.wpFinish}</span>
                                </div>
                              ) : (
                                <span className="text-[10px] text-ink-3 italic">None</span>
                              )}
                            </td>
                            <td className="act">
                              <div className="row-actions">
                                <button
                                  type="button"
                                  onClick={() => setEditingClubHistoryRecord(h)}
                                  className="row-btn"
                                  title="Edit Club Summary"
                                >
                                  <Edit size={12} />
                                </button>
                                <button
                                  type="button"
                                  onClick={async () => {
                                    if (confirm(`Are you sure you want to delete the tournament summary for ${h.clubName} at ${h.tournamentName}?`)) {
                                      try {
                                        const res = await fetch('/api/admin/clubs/history/delete', {
                                          method: 'POST',
                                          headers: { 'Content-Type': 'application/json' },
                                          body: JSON.stringify({ clubId: h.clubId, tournamentId: h.tournamentId })
                                        });
                                        if (res.ok) {
                                          showToast('Club tournament history summary deleted.');
                                          router.refresh();
                                        } else {
                                          showToast('Failed to delete.', 'error');
                                        }
                                      } catch (err) {
                                        showToast('Error deleting.', 'error');
                                      }
                                    }
                                  }}
                                  className="row-btn danger"
                                  title="Delete Club Summary"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </>
              )}
            </table>

            {/* Pagination Footer */}
            <div className="dt-foot select-none">
              <div>
                Showing <span className="font-mono font-bold text-ink">{totalCount === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}</span>-
                <span className="font-mono font-bold text-ink">
                  {Math.min(currentPage * itemsPerPage, totalCount)}
                </span> of{' '}
                <span className="font-mono font-bold text-ink">
                  {totalCount}
                </span> entries
              </div>
              
              {totalPages > 1 && (
                <div className="pager">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => { if (currentPage > 1) updateUrlParams({ page: (currentPage - 1).toString() }); }}
                    className="pg hover:bg-aqua-pale disabled:opacity-30 disabled:pointer-events-none"
                  >
                    <ChevronLeft size={13} />
                  </button>
                  
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => updateUrlParams({ page: (i + 1).toString() })}
                      className={`pg ${currentPage === i + 1 ? 'active' : 'hover:bg-aqua-pale'}`}
                    >
                      {i + 1}
                    </button>
                  ))}

                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => { if (currentPage < totalPages) updateUrlParams({ page: (currentPage + 1).toString() }); }}
                    className="pg hover:bg-aqua-pale disabled:opacity-30 disabled:pointer-events-none"
                  >
                    <ChevronRight size={13} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SWIMMING EDIT / CREATE MODAL */}
      <EditResultModal
        isOpen={editingSwimRecord !== null}
        onClose={() => setEditingSwimRecord(null)}
        recordData={editingSwimRecord}
        athletes={athletes}
        clubs={clubs}
        session={session}
        onSaveSuccess={handleSaveSuccess}
      />

      {/* WATER POLO EDIT / CREATE MODAL */}
      <EditWPTeamModal
        isOpen={editingWpRecord !== null}
        onClose={() => setEditingWpRecord(null)}
        recordData={editingWpRecord}
        clubs={clubs}
        session={session}
        onSaveSuccess={handleSaveSuccess}
      />

      {/* CLUB TOURNAMENT HISTORY SUMMARY MODAL */}
      <EditClubHistoryModal
        isOpen={editingClubHistoryRecord !== null}
        onClose={() => setEditingClubHistoryRecord(null)}
        defaultTournamentId={selectedTournament === 'All' ? '' : selectedTournament}
        recordData={editingClubHistoryRecord}
        tournaments={tournaments}
        clubs={clubs}
        session={session}
        onSaveSuccess={() => {
          setEditingClubHistoryRecord(null);
          showToast('Club summary record saved successfully!');
          router.refresh();
        }}
      />
    </div>
  );
}
