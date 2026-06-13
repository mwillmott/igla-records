'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Trophy, X, ShieldAlert, Save, Clock } from 'lucide-react';
import { UserSession } from '@/lib/auth';
import { SWIMMING_AGE_CATEGORIES } from '@/lib/config';

interface EditResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  recordData: any;
  athletes: { id: string; name: string }[];
  clubs?: { id: string; name: string }[];
  session: UserSession | null;
  onSaveSuccess: () => void;
}

export default function EditResultModal({
  isOpen,
  onClose,
  recordData,
  athletes,
  clubs = [],
  session,
  onSaveSuccess,
}: EditResultModalProps) {
  const [editFields, setEditFields] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState('');
  const [mounted, setMounted] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Initialize form fields when modal is opened with recordData
  useEffect(() => {
    if (isOpen && recordData) {
      setEditError('');
      setConfirmDelete(false);
      setDeleting(false);
      setEditFields({
        event: recordData.event || '',
        course: recordData.course || 'LCM',
        age_category: recordData.age || recordData.age_category || recordData.category || '',
        gender_category: recordData.gender || recordData.gender_category || 'Men',
        time: recordData.time || '',
        place: recordData.place || 1,
        is_all_time_record: recordData.is_all_time_record === 1 || recordData.is_all_time_record === true || recordData.record === 1 || false,
        record_still_held: recordData.held === 1 || recordData.record_still_held === 1 || !recordData.brokenBy || false,
        athlete_id: recordData.athleteId || recordData.athlete_id || '',
        club_id: recordData.clubId || recordData.club_id || '',
        broken_by_athlete_id: recordData.brokenById || recordData.broken_by_athlete_id || '',
        verified: recordData.isNew || !recordData.id ? true : (recordData.verified === 1 || recordData.verified === true || false),
      });
    }
  }, [isOpen, recordData]);

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }

    setDeleting(true);
    setEditError('');

    try {
      const response = await fetch('/api/admin/records/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'swimming',
          id: recordData.id,
        }),
      });

      const resData = await response.json();
      if (!response.ok) {
        setEditError(resData.error || 'Failed to delete record.');
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

  if (!isOpen || !recordData) return null;

  const updateField = (field: string, value: any) => {
    setEditFields((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setEditError('');

    const isNew = recordData.isNew || !recordData.id;
    const url = isNew ? '/api/admin/records/create' : '/api/admin/records/update';

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'swimming',
          id: recordData.id,
          tournamentId: recordData.tournamentId || recordData.tournament_id,
          fields: editFields,
        }),
      });

      const resData = await response.json();
      if (!response.ok) {
        setEditError(resData.error || (isNew ? 'Failed to create record.' : 'Failed to update record.'));
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

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) {
        return dateStr;
      }
      return d.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return dateStr;
    }
  };

  const modalJSX = (
    <div className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none">
      <div className="tile max-w-lg w-full bg-white border-2 border-ink shadow-[5px_6px_0_#0d3a52] overflow-hidden flex flex-col max-h-[90vh] rounded-2xl animate-scaleUp">
        
        {/* Modal Header */}
        <div className="p-5 border-b-2 border-ink bg-aqua-sky/30 flex justify-between items-center select-none">
          <div className="flex items-center gap-2">
            <Trophy size={18} className="text-coral" />
            <h3 className="font-display text-xl font-bold text-ink">
              {recordData.isNew ? 'Create Swimming Result' : 'Edit Swimming Record'}
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
        <form onSubmit={handleSaveEdit} className="flex-1 overflow-y-auto p-6 flex flex-col gap-5 text-left">
          {editError && (
            <div className="p-3.5 bg-coral-pale border-2 border-coral rounded-xl text-xs font-semibold text-coral-deep flex items-start gap-2">
              <ShieldAlert size={15} className="shrink-0 mt-0.5" />
              <span>{editError}</span>
            </div>
          )}

          {/* Swimming Form Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-ink-3">Event Name</label>
              <input 
                type="text" 
                value={editFields.event || ''} 
                onChange={e => updateField('event', e.target.value)}
                className="bg-white border-2 border-ink rounded-xl px-3 h-10 font-semibold text-xs text-ink focus:outline-none focus:ring-2 focus:ring-aqua"
                required
              />
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-ink-3">Course</label>
              <select 
                value={editFields.course || 'LCM'} 
                onChange={e => updateField('course', e.target.value)}
                className="bg-white border-2 border-ink rounded-xl px-3 h-10 font-semibold text-xs text-ink cursor-pointer focus:outline-none focus:ring-2 focus:ring-aqua"
              >
                <option value="LCM">Long Course (LCM)</option>
                <option value="SCM">Short Course (SCM)</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-ink-3">Age Category</label>
              <select 
                value={editFields.age_category || ''} 
                onChange={e => updateField('age_category', e.target.value)}
                className="bg-white border-2 border-ink rounded-xl px-3 h-10 font-semibold text-xs text-ink cursor-pointer focus:outline-none focus:ring-2 focus:ring-aqua"
                required
              >
                <option value="" disabled>Select Age Category</option>
                {SWIMMING_AGE_CATEGORIES.map(age => (
                  <option key={age} value={age}>{age}</option>
                ))}
                {editFields.age_category && !(SWIMMING_AGE_CATEGORIES as readonly string[]).includes(editFields.age_category) && (
                  <option value={editFields.age_category}>{editFields.age_category}</option>
                )}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-ink-3">Gender Category</label>
              <select 
                value={editFields.gender_category || 'Men'} 
                onChange={e => updateField('gender_category', e.target.value)}
                className="bg-white border-2 border-ink rounded-xl px-3 h-10 font-semibold text-xs text-ink cursor-pointer focus:outline-none focus:ring-2 focus:ring-aqua"
              >
                <option value="Men">Men</option>
                <option value="Women">Women</option>
                <option value="Mixed">Mixed</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-ink-3">Record Time</label>
              <input 
                type="text" 
                value={editFields.time || ''} 
                onChange={e => updateField('time', e.target.value)}
                className="bg-white border-2 border-ink rounded-xl px-3 h-10 font-mono font-semibold text-xs text-ink focus:outline-none focus:ring-2 focus:ring-aqua"
                placeholder="e.g. 2:04.53"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-ink-3">Placement Place</label>
              <input 
                type="number" 
                min="1"
                value={editFields.place || 1} 
                onChange={e => updateField('place', parseInt(e.target.value) || 1)}
                className="bg-white border-2 border-ink rounded-xl px-3 h-10 font-semibold text-xs text-ink focus:outline-none focus:ring-2 focus:ring-aqua"
                required
              />
            </div>
          </div>

          <SearchableSelect
            label="Athlete"
            placeholder="Search or select athlete..."
            value={editFields.athlete_id || ''}
            onChange={id => {
              updateField('athlete_id', id);
              const selectedAthleteObj = athletes.find(a => a.id === id) as any;
              if (selectedAthleteObj?.current_club_id && !editFields.club_id) {
                updateField('club_id', selectedAthleteObj.current_club_id);
              }
            }}
            options={athletes}
          />

          <SearchableSelect
            label="Club Affiliation"
            placeholder="Search or select club..."
            value={editFields.club_id || ''}
            onChange={id => updateField('club_id', id)}
            options={clubs}
          />

          {/* Toggle for all time record */}
          <div className="flex items-center justify-between gap-4 p-3 bg-bg-2 border-2 border-ink/10 rounded-xl select-none">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-ink">All-Time Record Status</span>
              <span className="text-[10px] text-ink-3">Is this swim time an official all-time IGLA+ record?</span>
            </div>
            <input 
              type="checkbox" 
              checked={editFields.is_all_time_record || false}
              onChange={e => {
                updateField('is_all_time_record', e.target.checked);
                if (!e.target.checked) {
                  updateField('record_still_held', false);
                }
              }}
              className="w-5 h-5 accent-coral cursor-pointer"
            />
          </div>

          {/* Toggle switches for record held */}
          {editFields.is_all_time_record && (
            <div className="flex items-center justify-between gap-4 p-3 bg-bg-2 border-2 border-ink/10 rounded-xl select-none">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-ink">Record Currently Standing</span>
                <span className="text-[10px] text-ink-3">Is this result currently the reigning all-time record?</span>
              </div>
              <input 
                type="checkbox" 
                checked={editFields.record_still_held || false}
                onChange={e => updateField('record_still_held', e.target.checked)}
                className="w-5 h-5 accent-coral cursor-pointer"
              />
            </div>
          )}

          {/* If not still held, select who broke it */}
          {editFields.is_all_time_record && !editFields.record_still_held && (
            <SearchableSelect
              label="Record Broken By"
              placeholder="Search or select athlete..."
              value={editFields.broken_by_athlete_id || ''}
              onChange={id => updateField('broken_by_athlete_id', id)}
              options={athletes}
            />
          )}

          {/* Toggle for Verification Status */}
          <div className="flex items-center justify-between gap-4 p-3 bg-bg-2 border-2 border-ink/10 rounded-xl select-none">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-ink">Verified Status</span>
              <span className="text-[10px] text-ink-3">Has this result been verified by an admin?</span>
            </div>
            <input 
              type="checkbox" 
              checked={editFields.verified || false}
              onChange={e => updateField('verified', e.target.checked)}
              className="w-5 h-5 accent-coral cursor-pointer"
            />
          </div>

          {/* BEAUTIFUL AUDIT TRAIL LOG */}
          {!recordData.isNew && (
            <div className="p-4 bg-aqua-sky/15 border-2 border-dashed border-ink/20 rounded-2xl flex flex-col gap-2.5 mt-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-ink flex items-center gap-1 leading-none select-none">
                <Clock size={11} className="text-coral" />
                <span>Audit History Trail</span>
              </div>
              
              <div className="text-xs flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-[11px] text-ink-2">
                  <span>Verification Status:</span>
                  <span className={`font-bold text-[9px] uppercase tracking-wide px-1.5 py-0.5 rounded border select-none ${
                    recordData.verified === 1 
                      ? 'bg-emerald-50 border-emerald-500/20 text-emerald-700' 
                      : 'bg-amber-50 border-amber-500/20 text-amber-700'
                  }`}>
                    {recordData.verified === 1 ? 'Verified' : 'Pending'}
                  </span>
                </div>
                {recordData.verified === 1 && recordData.verifiedBy && (
                  <>
                    <div className="flex justify-between items-center text-[11px] text-ink-2">
                      <span>Verified By:</span>
                      <span className="font-semibold text-ink">{recordData.verifiedBy}</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-ink-3 font-mono leading-none">
                      <span>Verified At:</span>
                      <span>{formatDate(recordData.verifiedAt)}</span>
                    </div>
                    <div className="h-[1.5px] border-t border-dashed border-ink/20 my-1" />
                  </>
                )}
                <div className="flex justify-between items-center text-[11px] text-ink-2">
                  <span>Originally Created By:</span>
                  <span className="font-semibold text-ink">{recordData.created_by || 'system@igla.org'}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] text-ink-3 font-mono leading-none">
                  <span>Timestamp:</span>
                  <span>{formatDate(recordData.created_at)}</span>
                </div>
                
                {recordData.updated_by && (
                  <>
                    <div className="h-[1.5px] border-t border-dashed border-ink/20 my-1" />
                    <div className="flex justify-between items-center text-[11px] text-ink-2">
                      <span>Last Updated By:</span>
                      <span className="font-semibold text-coral">{recordData.updated_by}</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-ink-3 font-mono leading-none">
                      <span>Timestamp:</span>
                      <span>{formatDate(recordData.updated_at)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

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
                {!recordData.isNew ? (
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
                    disabled={saving}
                    className="pill active bg-ink text-white font-bold text-xs py-2.5 px-6 rounded-full border-2 border-ink hover:bg-ink-2 active:translate-y-[1px] disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                  >
                    <Save size={13} />
                    <span>{saving ? 'Saving...' : (recordData.isNew ? 'Create Result' : 'Save Changes')}</span>
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

interface SearchableSelectProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (id: string) => void;
  options: { id: string; name: string }[];
}

function SearchableSelect({ label, placeholder, value, onChange, options }: SearchableSelectProps) {
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync search input with selected value
  useEffect(() => {
    const selected = options.find(o => o.id === value);
    setSearch(selected ? selected.name : '');
  }, [value, options]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        const selected = options.find(o => o.id === value);
        setSearch(selected ? selected.name : '');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [value, options]);

  const filteredOptions = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return options;
    return options.filter(o => o.name.toLowerCase().includes(q));
  }, [search, options]);

  return (
    <div className="flex flex-col gap-1.5 relative" ref={containerRef}>
      <label className="text-[10px] font-bold uppercase tracking-wider text-ink-3">{label}</label>
      <div className="relative">
        <input
          type="text"
          value={search}
          placeholder={placeholder}
          onFocus={() => setIsOpen(true)}
          onChange={e => {
            setSearch(e.target.value);
            setIsOpen(true);
            if (!e.target.value) {
              onChange('');
            }
          }}
          className="w-full bg-white border-2 border-ink rounded-xl px-3 h-10 font-semibold text-xs text-ink focus:outline-none focus:ring-2 focus:ring-aqua"
        />
        {search && (
          <button
            type="button"
            onClick={() => {
              setSearch('');
              onChange('');
              setIsOpen(false);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-3 hover:text-ink cursor-pointer flex items-center justify-center"
            style={{ border: 'none', background: 'transparent' }}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute top-[100%] left-0 right-0 mt-1 bg-white border-2 border-ink rounded-xl shadow-[3px_4px_0_#0d3a52] max-h-48 overflow-y-auto z-50 flex flex-col">
          {filteredOptions.length === 0 ? (
            <div className="p-3 text-xs text-ink-3 text-center">No athletes found</div>
          ) : (
            filteredOptions.map(o => (
              <button
                key={o.id}
                type="button"
                onClick={() => {
                  onChange(o.id);
                  setSearch(o.name);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-xs font-semibold hover:bg-aqua-pale text-ink transition-colors cursor-pointer border-b border-ink/5 last:border-0 ${
                  o.id === value ? 'bg-aqua-sky/20 font-bold' : ''
                }`}
              >
                {o.name}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
