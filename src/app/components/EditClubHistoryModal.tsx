'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Trophy, X, ShieldAlert, Save, AlertCircle, Trash2 } from 'lucide-react';
import { UserSession } from '@/lib/auth';
import { WATER_POLO_DIVISIONS } from '@/lib/config';
import SearchableSelect from './SearchableSelect';

interface EditClubHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTournamentId?: string;
  tournaments: { id: string; name: string; year: number }[];
  clubs: { id: string; name: string }[];
  session: UserSession | null;
  onSaveSuccess: () => void;
  recordData?: any;
}

export default function EditClubHistoryModal({
  isOpen,
  onClose,
  defaultTournamentId = '',
  tournaments,
  clubs: propClubs,
  session,
  onSaveSuccess,
  recordData,
}: EditClubHistoryModalProps) {
  const clubs = useMemo(() => propClubs || [], [propClubs]);
  const isNewMode = !recordData || recordData.isNew;

  const [selectedTournament, setSelectedTournament] = useState('');
  const [selectedClub, setSelectedClub] = useState('');
  const [medalsGold, setMedalsGold] = useState(0);
  const [medalsSilver, setMedalsSilver] = useState(0);
  const [medalsBronze, setMedalsBronze] = useState(0);
  const [recordsSet, setRecordsSet] = useState(0);
  const [wpDivision, setWpDivision] = useState('');
  const [wpFinish, setWpFinish] = useState('');

  const [hasResults, setHasResults] = useState(false);
  const [existingRecord, setExistingRecord] = useState<any | null>(null);
  const [loadingCheck, setLoadingCheck] = useState(false);

  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState('');
  const [mounted, setMounted] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Initialize fields when opened
  useEffect(() => {
    if (isOpen) {
      setEditError('');
      setConfirmDelete(false);
      setDeleting(false);
      
      if (recordData && !recordData.isNew) {
        setSelectedTournament(recordData.tournamentId || '');
        setSelectedClub(recordData.clubId || '');
        setMedalsGold(recordData.medalsGold ?? 0);
        setMedalsSilver(recordData.medalsSilver ?? 0);
        setMedalsBronze(recordData.medalsBronze ?? 0);
        setRecordsSet(recordData.recordsSet ?? 0);
        setWpDivision(recordData.wpDivision ?? '');
        setWpFinish(recordData.wpFinish ?? '');
        setExistingRecord(recordData);
      } else {
        setSelectedTournament('');
        setSelectedClub('');
        setMedalsGold(0);
        setMedalsSilver(0);
        setMedalsBronze(0);
        setRecordsSet(0);
        setWpDivision('');
        setWpFinish('');
        setExistingRecord(null);
      }
      setHasResults(false);
    } else {
      // Clear fields when closed to prevent stale states when re-opening
      setSelectedTournament('');
      setSelectedClub('');
      setMedalsGold(0);
      setMedalsSilver(0);
      setMedalsBronze(0);
      setRecordsSet(0);
      setWpDivision('');
      setWpFinish('');
      setExistingRecord(null);
      setHasResults(false);
    }
  }, [isOpen, recordData]);

  // Hook to check for existing results or existing summary when tournament & club are selected (creation mode only)
  useEffect(() => {
    const isNew = !recordData || recordData.isNew;
    if (!isNew) {
      return;
    }

    let active = true;

    if (selectedClub && selectedTournament) {
      setLoadingCheck(true);
      fetch(`/api/admin/clubs/check-results?clubId=${selectedClub}&tournamentId=${selectedTournament}`)
        .then((res) => res.json())
        .then((data) => {
          if (!active) return;
          setHasResults(data.hasResults || false);
          if (data.existingRecord) {
            setExistingRecord(data.existingRecord);
          } else {
            setExistingRecord(null);
          }
        })
        .catch((err) => {
          if (!active) return;
          console.error('Check results failed:', err);
        })
        .finally(() => {
          if (active) setLoadingCheck(false);
        });
    } else {
      setHasResults(false);
      setExistingRecord(null);
    }

    return () => {
      active = false;
    };
  }, [selectedClub, selectedTournament, recordData]);

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }

    setDeleting(true);
    setEditError('');

    try {
      const response = await fetch('/api/admin/clubs/history/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clubId: selectedClub,
          tournamentId: selectedTournament,
        }),
      });

      const resData = await response.json();
      if (!response.ok) {
        setEditError(resData.error || 'Failed to delete summary record.');
        setDeleting(false);
        setConfirmDelete(false);
        return;
      }

      onSaveSuccess();
    } catch (err) {
      console.error(err);
      setEditError('An unexpected network error occurred.');
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClub || !selectedTournament) {
      setEditError('Please select both a club and a tournament.');
      return;
    }

    if (isNewMode && existingRecord) {
      setEditError('An aggregate summary already exists for this club at this tournament. To edit it, please close this modal and edit the existing entry.');
      return;
    }

    setSaving(true);
    setEditError('');

    try {
      const response = await fetch('/api/admin/clubs/history/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clubId: selectedClub,
          tournamentId: selectedTournament,
          medalsGold,
          medalsSilver,
          medalsBronze,
          recordsSet,
          wpDivision: wpDivision || null,
          wpFinish: wpFinish || null,
        }),
      });

      const resData = await response.json();
      if (!response.ok) {
        setEditError(resData.error || 'Failed to save club summary.');
        setSaving(false);
        return;
      }

      onSaveSuccess();
    } catch (err) {
      console.error(err);
      setEditError('An unexpected network error occurred.');
      setSaving(false);
    }
  };

  const tournamentOptions = useMemo(() => {
    return tournaments.map((t) => ({
      id: t.id,
      name: `${t.name} (${t.year})`,
    }));
  }, [tournaments]);

  if (!isOpen) return null;

  const modalJSX = (
    <div className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none">
      <div className="tile max-w-lg w-full bg-white border-2 border-ink shadow-[5px_6px_0_#0d3a52] overflow-hidden flex flex-col max-h-[90vh] rounded-2xl animate-scaleUp">
        
        {/* Modal Header */}
        <div className="p-5 border-b-2 border-ink bg-aqua-sky/30 flex justify-between items-center select-none">
          <div className="flex items-center gap-2">
            <Trophy size={18} className="text-coral" />
            <h3 className="font-display text-xl font-bold text-ink">
              {!isNewMode ? 'Edit Club Summary' : 'Add Club Summary'}
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full border-2 border-ink bg-white flex items-center justify-center text-ink hover:bg-coral-pale hover:text-coral transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={14} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 flex flex-col gap-5 text-left">
          {editError && (
            <div className="p-3.5 bg-coral-pale border-2 border-coral rounded-xl text-xs font-semibold text-coral-deep flex items-start gap-2">
              <ShieldAlert size={15} className="shrink-0 mt-0.5" />
              <span>{editError}</span>
            </div>
          )}

          {/* Educational Purpose Notice */}
          <div className="p-4 bg-aqua-sky/15 border-2 border-dashed border-ink/20 rounded-2xl flex flex-col gap-1.5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-ink flex items-center gap-1 leading-none select-none">
              <AlertCircle size={12} className="text-coral" />
              <span>Operational Guidance: Club Summaries</span>
            </div>
            <p className="text-[11px] text-ink-2 leading-relaxed">
              This tool records <strong>aggregate stats</strong> (medals, records, and water polo rankings) 
              for tournaments where we <strong>do not</strong> have individual race results. Because public 
              pages prioritize these manual summary overrides, saving a summary for a tournament with 
              individual results <strong>will override</strong> the dynamically calculated statistics. 
              Use this tool only when individual results are unavailable.
            </p>
          </div>

          {/* Tournament & Club Selection */}
          <div className="grid grid-cols-2 gap-4">
            <SearchableSelect
              label="Tournament"
              placeholder="Search or select tournament..."
              value={selectedTournament}
              onChange={setSelectedTournament}
              options={tournamentOptions}
              disabled={!isNewMode}
            />

            <SearchableSelect
              label="Club Affiliation"
              placeholder="Search or select club..."
              value={selectedClub}
              onChange={setSelectedClub}
              options={clubs}
              disabled={!isNewMode}
            />
          </div>



          {!loadingCheck && hasResults && (
            <div className="p-3.5 bg-coral-pale border-2 border-coral rounded-xl text-xs font-semibold text-coral-deep flex items-start gap-2 animate-fadeIn">
              <ShieldAlert size={15} className="shrink-0 mt-0.5" />
              <span>
                <strong>Warning:</strong> The database already contains individual swimming results or water polo teams 
                for this club at this tournament. Adding an aggregate summary override is not recommended as it will 
                override the dynamically calculated statistics on public pages.
              </span>
            </div>
          )}

          {!loadingCheck && isNewMode && existingRecord && (
            <div className="p-3.5 bg-coral-pale border-2 border-coral rounded-xl text-xs font-semibold text-coral-deep flex items-start gap-2 animate-fadeIn">
              <ShieldAlert size={15} className="shrink-0 mt-0.5" />
              <span>
                <strong>Duplicate Record Blocked:</strong> An aggregate summary already exists for this club at this tournament. 
                Saving is disabled to prevent duplicate entries. To update this summary, please close this modal and edit the existing row.
              </span>
            </div>
          )}

          {/* Medals and Records Fields */}
          <div className="grid grid-cols-4 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-bold uppercase tracking-wider text-ink-3 text-center">Gold Medals</label>
              <input
                type="number"
                min="0"
                value={medalsGold}
                onChange={(e) => setMedalsGold(Math.max(0, parseInt(e.target.value, 10) || 0))}
                className="bg-white border-2 border-ink rounded-xl px-2 h-10 font-mono text-center font-semibold text-xs text-ink focus:outline-none focus:ring-2 focus:ring-aqua"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-bold uppercase tracking-wider text-ink-3 text-center">Silver Medals</label>
              <input
                type="number"
                min="0"
                value={medalsSilver}
                onChange={(e) => setMedalsSilver(Math.max(0, parseInt(e.target.value, 10) || 0))}
                className="bg-white border-2 border-ink rounded-xl px-2 h-10 font-mono text-center font-semibold text-xs text-ink focus:outline-none focus:ring-2 focus:ring-aqua"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-bold uppercase tracking-wider text-ink-3 text-center">Bronze Medals</label>
              <input
                type="number"
                min="0"
                value={medalsBronze}
                onChange={(e) => setMedalsBronze(Math.max(0, parseInt(e.target.value, 10) || 0))}
                className="bg-white border-2 border-ink rounded-xl px-2 h-10 font-mono text-center font-semibold text-xs text-ink focus:outline-none focus:ring-2 focus:ring-aqua"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-bold uppercase tracking-wider text-ink-3 text-center">Records Set</label>
              <input
                type="number"
                min="0"
                value={recordsSet}
                onChange={(e) => setRecordsSet(Math.max(0, parseInt(e.target.value, 10) || 0))}
                className="bg-white border-2 border-ink rounded-xl px-2 h-10 font-mono text-center font-semibold text-xs text-ink focus:outline-none focus:ring-2 focus:ring-aqua"
                required
              />
            </div>
          </div>

          {/* Water Polo Division & Final Placement */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-ink-3">WP Division (Optional)</label>
              <div className="sel-wrap w-full">
                <select
                  value={wpDivision}
                  onChange={(e) => {
                    setWpDivision(e.target.value);
                    if (!e.target.value) setWpFinish('');
                  }}
                  className="sel bg-white border-2 border-ink rounded-xl px-3 h-10 font-semibold text-xs text-ink cursor-pointer focus:outline-none focus:ring-2 focus:ring-aqua w-full"
                >
                  <option value="">None / No Standing</option>
                  {WATER_POLO_DIVISIONS.map((div) => (
                    <option key={div} value={div}>
                      {div}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-ink-3">WP Finish Rank</label>
              <input
                type="number"
                min="1"
                disabled={!wpDivision}
                value={wpFinish}
                onChange={(e) => setWpFinish(e.target.value === '' ? '' : Math.max(1, parseInt(e.target.value, 10) || 1).toString())}
                className="bg-white border-2 border-ink rounded-xl px-3 h-10 font-semibold text-xs text-ink focus:outline-none focus:ring-2 focus:ring-aqua disabled:bg-bg/40 disabled:border-ink/20 disabled:cursor-not-allowed"
                placeholder="e.g. 1"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t border-ink/10 select-none">
            {confirmDelete ? (
              <div className="flex gap-3 w-full justify-between items-center animate-fadeIn">
                <span className="text-[11px] font-bold text-coral-deep uppercase tracking-wide">Are you absolutely sure? This cannot be undone.</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={deleting}
                    onClick={handleDelete}
                    className="pill danger font-bold text-xs py-2.5 px-5 cursor-pointer"
                  >
                    {deleting ? 'Deleting...' : 'Confirm Delete'}
                  </button>
                  <button
                    type="button"
                    disabled={deleting}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setConfirmDelete(false);
                    }}
                    className="pill bg-white border-2 border-ink text-ink font-semibold text-xs py-2.5 px-5 rounded-full hover:bg-aqua-pale cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-3 justify-between w-full">
                {!isNewMode ? (
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="pill bg-white border-2 border-coral-deep text-coral-deep hover:bg-coral-pale font-bold text-xs py-2.5 px-4 rounded-full cursor-pointer"
                  >
                    Delete Record
                  </button>
                ) : (
                  <span />
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={saving}
                    className="pill bg-white border-2 border-ink text-ink font-semibold text-xs py-2.5 px-5 rounded-full hover:bg-aqua-pale cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving || !selectedClub || !selectedTournament || (isNewMode && !!existingRecord)}
                    className="pill active bg-ink text-white font-bold text-xs py-2.5 px-6 rounded-full border-2 border-ink hover:bg-ink-2 active:translate-y-[1px] disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                  >
                    <Save size={13} />
                    <span>{saving ? 'Saving...' : (!isNewMode ? 'Save Changes' : 'Create Summary')}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );

  return mounted ? createPortal(modalJSX, document.body) : null;
}
