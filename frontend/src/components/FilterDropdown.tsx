import { useState } from 'react';
import { CharacterFilters } from '@/types';

interface FilterDropdownProps {
  filters: CharacterFilters;
  onApply: (filters: Partial<CharacterFilters>) => void;
  onClose: () => void;
  mobile?: boolean;
}

type CharacterTab = 'all' | 'starred' | 'others';
type SpeciesOption = '' | 'Human' | 'Alien';

const SPECIES: SpeciesOption[] = ['', 'Human', 'Alien'];
const STATUS_OPTS = ['', 'Alive', 'Dead', 'unknown'] as const;
const GENDER_OPTS = ['', 'Female', 'Male', 'Genderless', 'unknown'] as const;

function pill(active: boolean, mobile: boolean) {
  const base =
    'text-sm font-medium transition-colors border text-center ' +
    (mobile
      ? 'min-h-[42px] rounded-lg px-2 py-2 sm:px-3'
      : 'rounded-lg px-5 py-1.5');
  return (
    `${base} ${
      active
        ? 'bg-primary-100 text-primary-600 border-primary-100'
        : 'bg-white text-text-primary border-border hover:border-primary-600 hover:text-primary-600'
    }`
  );
}

export function FilterDropdown({ filters, onApply, onClose, mobile = false }: FilterDropdownProps) {
  const initialTab: CharacterTab =
    filters._starred === true ? 'starred' : filters._starred === false ? 'others' : 'all';

  const initialSpecies: SpeciesOption =
    filters.species === 'Human' ? 'Human' : filters.species === 'Alien' ? 'Alien' : '';

  const initialStatus = filters.status ?? '';
  const initialGender = filters.gender ?? '';

  const [charTab, setCharTab] = useState<CharacterTab>(initialTab);
  const [species, setSpecies] = useState<SpeciesOption>(initialSpecies);
  const [status, setStatus] = useState<string>(initialStatus);
  const [gender, setGender] = useState<string>(initialGender);

  const hasChange =
    charTab !== initialTab ||
    species !== initialSpecies ||
    status !== initialStatus ||
    gender !== initialGender;

  const handleFilter = () => {
    onApply({
      page: 1,
      _starred: charTab === 'starred' ? true : charTab === 'others' ? false : undefined,
      species: species || undefined,
      status: status || undefined,
      gender: gender || undefined,
    });
    onClose();
  };

  const labelClass = (isMobile: boolean) =>
    isMobile
      ? 'mb-2 text-left text-sm font-medium text-text-secondary'
      : 'mb-2 text-xs font-semibold text-text-secondary';

  const rowClass = (isMobile: boolean, gridCols?: string) =>
    isMobile
      ? gridCols
        ? `grid w-full ${gridCols} gap-2`
        : 'flex flex-wrap justify-center gap-2'
      : 'flex flex-wrap justify-center gap-2';

  const renderFilterSections = (isMobile: boolean) => (
    <div className={isMobile ? 'space-y-8' : 'space-y-4'}>
      <div>
        <p className={labelClass(isMobile)}>Characters</p>
        <div className={rowClass(isMobile, 'grid-cols-3')}>
          {(['all', 'starred', 'others'] as CharacterTab[]).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setCharTab(tab)}
              className={pill(charTab === tab, isMobile)}
            >
              {tab === 'all' ? 'All' : tab === 'starred' ? 'Starred' : 'Others'}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className={labelClass(isMobile)}>Species</p>
        <div className={rowClass(isMobile, 'grid-cols-3')}>
          {SPECIES.map((s) => (
            <button
              key={s || 'all'}
              type="button"
              onClick={() => setSpecies(s)}
              className={pill(species === s, isMobile)}
            >
              {s || 'All'}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className={labelClass(isMobile)}>Status</p>
        <div className={rowClass(isMobile, 'grid-cols-2')}>
          {STATUS_OPTS.map((s) => (
            <button
              key={s || 'all'}
              type="button"
              onClick={() => setStatus(s)}
              className={pill(status === s, isMobile)}
            >
              {s || 'All'}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className={labelClass(isMobile)}>Gender</p>
        <div className={rowClass(isMobile, 'grid-cols-3')}>
          {GENDER_OPTS.map((g) => (
            <button
              key={g || 'all'}
              type="button"
              onClick={() => setGender(g)}
              className={pill(gender === g, isMobile)}
            >
              {g || 'All'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const filterBtn = (
    <button
      onClick={handleFilter}
      disabled={!hasChange}
      className={`w-full py-3 rounded-xl text-sm font-semibold transition-all ${
        hasChange
          ? 'bg-primary-600 text-white hover:bg-primary-700'
          : 'bg-gray-100 text-text-label cursor-default'
      }`}
    >
      Filter
    </button>
  );

  if (mobile) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col justify-end">
        <div className="absolute inset-0 bg-black/40 animate-fade-in" onClick={onClose} />

        <div className="relative flex w-full max-h-[96vh] min-h-[90vh] flex-col rounded-t-xl bg-white shadow-[0_-8px_32px_rgba(0,0,0,0.12)] animate-slide-up">
          <div className="flex shrink-0 items-center px-4 pb-1 pt-5">
            <div className="flex w-10 shrink-0 items-center justify-start">
              <button
                type="button"
                onClick={onClose}
                className="-m-0.5 flex items-center justify-center p-1 text-primary-600"
                aria-label="Back"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
                </svg>
              </button>
            </div>
            <h2 className="min-w-0 flex-1 text-center text-base font-semibold text-text-primary">Filters</h2>
            <div className="w-10 shrink-0" aria-hidden />
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6 pt-10">
            {renderFilterSections(true)}
          </div>

          <div className="shrink-0 px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-4">
            {filterBtn}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute top-full left-0 right-0 z-30 mt-1 max-h-[min(80vh,560px)] overflow-y-auto rounded-2xl border border-border bg-white shadow-xl animate-slide-down">
      <div className="space-y-4 p-4">
        {renderFilterSections(false)}
        <div className="pt-1">{filterBtn}</div>
      </div>
    </div>
  );
}
