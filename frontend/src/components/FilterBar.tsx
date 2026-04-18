import { CharacterFilters, SortOrder } from '@/types';

interface FilterBarProps {
  filters: CharacterFilters;
  onChange: (filters: Partial<CharacterFilters>) => void;
  onReset: () => void;
}

const STATUS_OPTIONS = ['', 'Alive', 'Dead', 'unknown'];
const SPECIES_OPTIONS = ['', 'Human', 'Alien', 'Humanoid', 'Poopybutthole', 'Mythological Creature', 'Animal', 'Robot', 'Cronenberg', 'Disease', 'unknown'];
const GENDER_OPTIONS = ['', 'Female', 'Male', 'Genderless', 'unknown'];
const SORT_OPTIONS: { value: SortOrder; label: string }[] = [
  { value: 'asc', label: 'Name A → Z' },
  { value: 'desc', label: 'Name Z → A' },
];

export function FilterBar({ filters, onChange, onReset }: FilterBarProps) {
  const hasActiveFilters =
    filters.name || filters.status || filters.species || filters.gender || filters.origin;

  return (
    <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-4 mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
        <input
          type="text"
          placeholder="🔍 Search by name..."
          value={filters.name || ''}
          onChange={(e) => onChange({ name: e.target.value, page: 1 })}
          className="col-span-1 sm:col-span-2 lg:col-span-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-rm-green/50 focus:ring-1 focus:ring-rm-green/30 transition-all"
          data-testid="filter-name"
        />

        <select
          value={filters.status || ''}
          onChange={(e) => onChange({ status: e.target.value || undefined, page: 1 })}
          className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-rm-green/50 focus:ring-1 focus:ring-rm-green/30 transition-all"
          data-testid="filter-status"
        >
          <option value="" className="bg-rm-darker text-white">All Status</option>
          {STATUS_OPTIONS.slice(1).map((s) => (
            <option key={s} value={s} className="bg-rm-darker text-white">{s}</option>
          ))}
        </select>

        <select
          value={filters.species || ''}
          onChange={(e) => onChange({ species: e.target.value || undefined, page: 1 })}
          className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-rm-green/50 focus:ring-1 focus:ring-rm-green/30 transition-all"
          data-testid="filter-species"
        >
          <option value="" className="bg-rm-darker text-white">All Species</option>
          {SPECIES_OPTIONS.slice(1).map((s) => (
            <option key={s} value={s} className="bg-rm-darker text-white">{s}</option>
          ))}
        </select>

        <select
          value={filters.gender || ''}
          onChange={(e) => onChange({ gender: e.target.value || undefined, page: 1 })}
          className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-rm-green/50 focus:ring-1 focus:ring-rm-green/30 transition-all"
          data-testid="filter-gender"
        >
          <option value="" className="bg-rm-darker text-white">All Genders</option>
          {GENDER_OPTIONS.slice(1).map((g) => (
            <option key={g} value={g} className="bg-rm-darker text-white">{g}</option>
          ))}
        </select>

        <div className="flex gap-2">
          <select
            value={filters.sort || 'asc'}
            onChange={(e) => onChange({ sort: e.target.value as SortOrder, page: 1 })}
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-rm-green/50 focus:ring-1 focus:ring-rm-green/30 transition-all"
            data-testid="filter-sort"
          >
            {SORT_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value} className="bg-rm-darker text-white">{label}</option>
            ))}
          </select>

          {hasActiveFilters && (
            <button
              onClick={onReset}
              className="px-3 py-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 text-sm transition-colors"
              title="Clear filters"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
