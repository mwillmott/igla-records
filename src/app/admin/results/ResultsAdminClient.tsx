'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Upload, FileText, CheckCircle2, ShieldAlert, Award, HelpCircle, Merge, UserPlus, AlertCircle, RefreshCw, MapPin, ChevronDown, Trophy } from 'lucide-react';

interface Tournament {
  id: string;
  name: string;
  year: number;
}

interface DBAthleteCandidate {
  id: string;
  name: string;
  club_name: string;
  hometown: string;
  pronouns: string;
  similarity: number;
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
  candidates: DBAthleteCandidate[];
}

interface Resolution {
  rowId: number;
  uploaded: any;
  action: 'merge' | 'create';
  athleteId?: string;
  athleteName?: string;
}

interface ResultsAdminClientProps {
  tournaments: Tournament[];
}

export default function ResultsAdminClient({ tournaments }: ResultsAdminClientProps) {
  const router = useRouter();
  const [selectedTournament, setSelectedTournament] = useState(tournaments[0]?.id || 'valencia-2026');
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
    formData.append('tournamentId', selectedTournament);

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
      router.refresh();
    } catch (err) {
      console.error(err);
      setErrorMessage('An unexpected error occurred during database commit.');
    } finally {
      setLoading(false);
    }
  };

  const handleResolveMerge = (conflict: FuzzyConflict, candidate: DBAthleteCandidate) => {
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

  return (
    <div className="view-enter" data-screen-label="Admin Ingestion">
      {/* Header */}
      <div className="admin-pagehead animate-fadeIn">
        <div>
          <h1>Manage <em>Results</em></h1>
          <div className="sub">Ingest, sync, or manually edit championship event results.</div>
        </div>
      </div>

      {/* Main Upload Card */}
      {!uploadResult && !commitResult && (
        <div className="panel max-w-2xl mx-auto mt-6 animate-fadeIn">
          <div className="panel-head">
            <h3>Import Swimming Results</h3>
            <span className="chip upcoming text-[9px]">CSV Ingestion</span>
          </div>

          <div className="panel-body p-6">
            <p className="text-xs text-ink-3 mb-6 leading-relaxed">
              Upload a raw CSV spreadsheet of results from a swimming tournament. 
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

              {/* Tournament selector */}
              <div className="mb-6 flex flex-col gap-2 select-none">
                <label className="text-[10px] font-bold tracking-wider text-ink-3 uppercase">Championship Event</label>
                <div className="sel-wrap">
                  <select
                    value={selectedTournament}
                    onChange={e => setSelectedTournament(e.target.value)}
                    className="sel"
                  >
                    {tournaments.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.year})
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="chev" />
                </div>
              </div>

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
      {commitResult && (
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
              href="/results"
              className="pill active bg-ink text-white font-semibold text-xs py-2.5 px-6 rounded-full border-2 border-ink hover:bg-ink-2 cursor-pointer"
            >
              View updated records
            </Link>
          </div>
        </section>
      )}

      {/* SPLIT-SCREEN MANUAL RESOLVER PANEL */}
      {uploadResult && uploadResult.fuzzyConflicts.length > 0 && activeConflict && (
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
    </div>
  );
}
