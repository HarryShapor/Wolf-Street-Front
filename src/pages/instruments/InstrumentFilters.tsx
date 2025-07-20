import CustomSelect from "../../components/ui/CustomSelect";

interface Option {
  label: string;
  value: string;
}

interface InstrumentFiltersProps {
  filter: string;
  setFilter: (v: string) => void;
  sort: string;
  setSort: (v: string) => void;
  search: string;
  setSearch: (v: string) => void;
  typeOptions: Option[];
  sortOptions: Option[];
}

export default function InstrumentFilters({
  filter,
  setFilter,
  sort,
  setSort,
  search,
  setSearch,
  typeOptions,
  sortOptions,
}: InstrumentFiltersProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4 mb-8 w-full mt-2">
      {/* Тип инструмента - компактный */}
      <div className="flex-shrink-0 w-full md:w-36">
        <CustomSelect
          id="type-select"
          value={filter}
          onChange={setFilter}
          options={typeOptions}
          placeholder="Тип инструмента"
        />
      </div>

      {/* Сортировка - компактная, но достаточная для текста со стрелочкой */}
      <div className="flex-shrink-0 w-full md:w-44">
        <CustomSelect
          id="sort-select"
          value={sort}
          onChange={setSort}
          options={sortOptions}
          placeholder="Сортировка"
        />
      </div>

      {/* Поиск - занимает все остальное место */}
      <input
        type="text"
        placeholder="Поиск по названию или тикеру..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="flex-1 min-w-[200px] px-4 py-2 rounded-full border border-light-border dark:border-dark-border bg-white dark:bg-dark-card text-base focus:outline-none focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent transition-all font-medium text-light-fg dark:text-dark-fg"
      />
    </div>
  );
}
