import { useState, useRef, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { GET_CHARACTERS } from '@/graphql/queries';
import { Character, CharacterFilters, PaginatedCharacters } from '@/types';
import { CharacterListItem } from '@/components/CharacterListItem';
import { CharacterDetailPanel } from '@/components/CharacterDetailPanel';
import { FilterDropdown } from '@/components/FilterDropdown';
import { useUser } from '@/hooks/useUser';

const DEFAULT_FILTERS: CharacterFilters = { sort: 'asc', page: 1 };

function useIsMobile(breakpoint = 640) {
  const [mobile, setMobile] = useState(() => window.innerWidth < breakpoint);
  useEffect(() => {
    const handler = () => setMobile(window.innerWidth < breakpoint);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, [breakpoint]);
  return mobile;
}

export function CharactersPage() {
  const { id } = useParams<{ id?: string }>();
  const navigate  = useNavigate();
  const userId    = useUser();

  const [filters,    setFilters]    = useState<CharacterFilters>(DEFAULT_FILTERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  const selectedId = id ? parseInt(id) : null;
  const isMobileView = useIsMobile();

  const showBothSections = filters._starred === undefined;

  const baseVars = useMemo(
    () => ({ ...buildBaseQueryVars(filters), userId }),
    [filters]
  );

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const normalizedSearch = searchTerm.trim();
      const nextName = normalizedSearch || undefined;
      if ((filters.name ?? undefined) === nextName) return;
      setFilters((prev) => ({ ...prev, name: nextName, page: 1 }));
    }, 650);

    return () => window.clearTimeout(timeoutId);
  }, [searchTerm, filters.name]);

  useEffect(() => {
    setSearchTerm(filters.name ?? '');
  }, [filters.name]);

  const { data: dataStarred, loading: loadingStarred } = useQuery<{ characters: PaginatedCharacters }>(
    GET_CHARACTERS,
    {
      variables: { ...baseVars, onlyFavorites: true },
      skip: !showBothSections,
      notifyOnNetworkStatusChange: true,
    }
  );

  const { data: dataOthers, loading: loadingOthers } = useQuery<{ characters: PaginatedCharacters }>(
    GET_CHARACTERS,
    {
      variables: { ...baseVars, onlyFavorites: false },
      skip: !showBothSections,
      notifyOnNetworkStatusChange: true,
    }
  );

  const { data: dataSingle, loading: loadingSingle } = useQuery<{ characters: PaginatedCharacters }>(
    GET_CHARACTERS,
    {
      variables: { ...buildQueryVars(filters), userId },
      skip: showBothSections,
      notifyOnNetworkStatusChange: true,
    }
  );

  /* Close dropdown on outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setShowFilter(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const showStarred = filters._starred !== false;
  const showOthers = filters._starred !== true;

  let starred: Character[] = [];
  let others: Character[] = [];
  let loading = false;
  let resultsTotal = 0;
  /** API totals for section headers (not the same as items on the current page). */
  let sectionStarredTotal = 0;
  let sectionOthersTotal = 0;

  if (showBothSections) {
    starred = showStarred ? (dataStarred?.characters.results ?? []).filter((c) => !c.isDeleted) : [];
    others = showOthers ? (dataOthers?.characters.results ?? []).filter((c) => !c.isDeleted) : [];
    loading = loadingStarred || loadingOthers;
    resultsTotal =
      (dataStarred?.characters.total ?? 0) + (dataOthers?.characters.total ?? 0);

    sectionStarredTotal = dataStarred?.characters.total ?? starred.length;
    sectionOthersTotal = dataOthers?.characters.total ?? others.length;

    const starredIds = new Set(starred.map((c) => c.id));
    others = others.filter((c) => !starredIds.has(c.id));
    starred = starred.map((c) => ({ ...c, isFavorite: true }));
    others = others.map((c) => ({ ...c, isFavorite: false }));
  } else {
    const allChars = dataSingle?.characters.results ?? [];
    loading = loadingSingle;
    resultsTotal = dataSingle?.characters.total ?? 0;
    if (filters._starred === true) {
      starred = showStarred ? allChars.filter((c) => !c.isDeleted) : [];
      sectionStarredTotal = dataSingle?.characters.total ?? starred.length;
    } else {
      others = showOthers ? allChars.filter((c) => !c.isDeleted) : [];
      sectionOthersTotal = dataSingle?.characters.total ?? others.length;
    }
  }

  const activeFilters = [
    filters._starred !== undefined,
    !!filters.species,
    !!filters.name,
    !!filters.status,
    !!filters.gender,
  ].filter(Boolean).length;

  /** Line separators (mobile + active filters only), aligned with the “Advanced search” reference. */
  const showMobileFilterSeparators = isMobileView && activeFilters > 0;

  const onSelect = (c: Character) => navigate(`/character/${c.id}`);
  const onBack   = ()             => navigate('/');

  /* ─────────────────────────────────────────── */
  return (
    <div className="flex w-full h-full">

      {/* ══════════════════ SIDEBAR ══════════════════ */}
      <aside
        className={`
          w-full sm:w-[375px] flex-shrink-0 flex flex-col bg-white
          ${selectedId && isMobileView ? 'hidden' : 'flex'}
        `}
      >
        {/* Title — "Advanced search" header in mobile when filters active */}
        {isMobileView && activeFilters > 0 ? (
          <div className="px-5 pt-5 pb-3 flex items-center justify-between">
            <button
              onClick={() => setFilters({ ...DEFAULT_FILTERS, _starred: undefined })}
              className="flex items-center text-primary-600"
              aria-label="Back"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
              </svg>
            </button>
            <span className="text-base font-semibold text-text-primary">Advanced search</span>
            <button
              onClick={() => setFilters({ ...DEFAULT_FILTERS, _starred: undefined })}
              className="text-sm font-semibold text-primary-600"
            >
              Done
            </button>
          </div>
        ) : (
          <h1 className="px-5 pt-6 pb-4 text-[20px] font-semibold text-text-primary leading-tight">
            Rick and Morty list
          </h1>
        )}

        {/* Search + filter */}
        <div className="relative px-4 pb-1" ref={filterRef}>
          <div className="flex items-center gap-2 rounded-xl bg-[#F2F2F2] px-3 py-2.5 transition-all focus-within:ring-2 focus-within:ring-primary-100">

            {/* Search icon */}
            <svg className="h-4 w-4 flex-shrink-0 fill-text-label" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>

            <input
              type="text"
              placeholder="Search or filter results"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="min-w-0 flex-1 bg-transparent text-sm text-text-primary placeholder-text-label outline-none"
              data-testid="search-input"
            />

            {/* 3-vertical-sliders icon — matches Figma */}
            <button
              type="button"
              onClick={() => setShowFilter((v) => !v)}
              className={`flex-shrink-0 transition-colors ${
                showFilter || activeFilters > 0 ? 'text-primary-600' : 'text-text-label hover:text-primary-600'
              }`}
              aria-label="Toggle filters"
              data-testid="filter-toggle"
            >
              <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="4.5" y="3" width="2" height="18" rx="1" fill="currentColor"/>
                <circle cx="5.5" cy="8" r="2.5" fill="white" stroke="currentColor" strokeWidth="2"/>
                <rect x="11" y="3" width="2" height="18" rx="1" fill="currentColor"/>
                <circle cx="12" cy="15" r="2.5" fill="white" stroke="currentColor" strokeWidth="2"/>
                <rect x="17.5" y="3" width="2" height="18" rx="1" fill="currentColor"/>
                <circle cx="18.5" cy="10" r="2.5" fill="white" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </button>
          </div>

          {showFilter && (
            <FilterDropdown
              filters={filters}
              onApply={(f) => setFilters((p) => ({ ...p, ...f, _starred: f._starred }))}
              onClose={() => setShowFilter(false)}
              mobile={isMobileView}
            />
          )}
        </div>

        {/* Sort A–Z / Z–A */}
        <div className="px-4 pb-2 pt-1 flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-text-label">Sort by name</span>
          <div className="flex rounded-lg border border-border p-0.5 bg-[#F2F2F2]">
            <button
              type="button"
              onClick={() => setFilters((p) => ({ ...p, sort: 'asc', page: 1 }))}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                (filters.sort ?? 'asc') === 'asc'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
              data-testid="sort-asc"
            >
              A–Z
            </button>
            <button
              type="button"
              onClick={() => setFilters((p) => ({ ...p, sort: 'desc', page: 1 }))}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                filters.sort === 'desc'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
              data-testid="sort-desc"
            >
              Z–A
            </button>
          </div>
        </div>

        {/* Active filters summary: on mobile, lines match character row separator width (mx-5) */}
        {activeFilters > 0 && (
          <div
            className={
              isMobileView
                ? 'mx-5 shrink-0 border-b border-t border-gray-200'
                : 'shrink-0'
            }
          >
            <div
              className={`flex items-center justify-between gap-2 py-2.5 ${
                isMobileView ? 'px-4' : 'px-5'
              }`}
            >
              <span className="text-sm font-semibold text-[#2563EB]">{resultsTotal} Results</span>
              <button
                type="button"
                onClick={() => setFilters({ ...DEFAULT_FILTERS, _starred: undefined })}
                className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold transition-opacity hover:opacity-80"
                style={{ background: 'rgba(99,216,56,0.2)', color: '#3B8520' }}
              >
                {activeFilters} Filter
                <svg className="h-3 w-3 fill-current" viewBox="0 0 24 24">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Character list */}
        <div className="flex-1 overflow-y-auto pb-2 pt-1">
          {loading && starred.length === 0 && others.length === 0 ? (
            <SkeletonList />
          ) : (
            <>
              {starred.length > 0 && (
                <section>
                  {showMobileFilterSeparators ? (
                    <FilterSectionHeader
                      text={`STARRED CHARACTERS (${sectionStarredTotal})`}
                      isFirstSection
                    />
                  ) : (
                    <SectionLabel text={`STARRED CHARACTERS (${sectionStarredTotal})`} />
                  )}
                  {starred.map((c, idx) => (
                    <CharacterListItem
                      key={c.id}
                      character={c}
                      isSelected={c.id === selectedId}
                      userId={userId}
                      onSelect={onSelect}
                      variant="card"
                      divider={idx < starred.length - 1}
                    />
                  ))}
                </section>
              )}

              {others.length > 0 && (
                <section
                  className={
                    !showMobileFilterSeparators && starred.length > 0 ? 'mt-2' : ''
                  }
                >
                  {showMobileFilterSeparators ? (
                    <FilterSectionHeader
                      text={`CHARACTERS (${sectionOthersTotal})`}
                      isFirstSection={starred.length === 0}
                    />
                  ) : (
                    <SectionLabel text={`CHARACTERS (${sectionOthersTotal})`} />
                  )}
                  {others.map((c, idx) => (
                    <CharacterListItem
                      key={c.id}
                      character={c}
                      isSelected={c.id === selectedId}
                      userId={userId}
                      onSelect={onSelect}
                      variant="list"
                      divider={idx < others.length - 1}
                    />
                  ))}
                </section>
              )}

              {!loading && starred.length === 0 && others.length === 0 && (
                <div className="text-center py-16 px-6">
                  <p className="text-3xl mb-2">🔭</p>
                  <p className="text-sm text-text-secondary">
                    {filters._starred === true
                      ? 'No starred characters yet'
                      : filters._starred === false
                      ? 'No other characters found'
                      : 'No characters found'}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </aside>

      {/* ══════════════════ DETAIL ══════════════════ */}
      <main
        className={`
          flex min-h-0 min-w-0 flex-1 flex-col bg-white overflow-hidden
          [box-shadow:-4px_0_12px_rgba(0,0,0,0.06)]
          ${selectedId && isMobileView ? 'flex' : 'hidden sm:flex'}
        `}
      >
        {selectedId ? (
          <CharacterDetailPanel
            characterId={selectedId}
            userId={userId}
            onBack={isMobileView ? onBack : undefined}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <span className="px-6 py-3 bg-gray-100 text-text-secondary text-sm font-medium rounded-xl select-none">
              Select character
            </span>
          </div>
        )}
      </main>
    </div>
  );
}

/* ── Helpers ── */

function SectionLabel({ text }: { text: string }) {
  return (
    <p className="px-5 pt-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-text-label">
      {text}
    </p>
  );
}

/**
 * Mobile section headers with filters: title and a line below (design ref),
 * without an extra top line duplicating the Results/filters block border.
 */
function FilterSectionHeader({
  text,
  isFirstSection,
}: {
  text: string;
  isFirstSection: boolean;
}) {
  return (
    <div className={isFirstSection ? 'mt-2' : 'mt-4'}>
      <p className="px-5 pb-2 pt-3 text-[11px] font-semibold uppercase tracking-wider text-text-label">
        {text}
      </p>
      <div className="mx-5 h-px shrink-0 bg-gray-200" aria-hidden />
    </div>
  );
}

function SkeletonList() {
  return (
    <div className="px-4 space-y-1 animate-pulse">
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-2 py-3">
          <div className="w-10 h-10 rounded-full bg-gray-100 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-gray-100 rounded-full w-3/4" />
            <div className="h-2.5 bg-gray-100 rounded-full w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Shared filters + sort + page (no starred/others split). */
function buildBaseQueryVars(f: CharacterFilters) {
  const v: Record<string, unknown> = { sort: f.sort ?? 'asc', page: f.page ?? 1 };
  if (f.name)    v.name    = f.name;
  if (f.species) v.species = f.species;
  if (f.status)  v.status  = f.status;
  if (f.gender)  v.gender  = f.gender;
  if (f.origin)  v.origin  = f.origin;
  return v;
}

function buildQueryVars(f: CharacterFilters) {
  const v = buildBaseQueryVars(f);
  if (f._starred !== undefined) v.onlyFavorites = f._starred;
  return v;
}
