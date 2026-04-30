interface Tab {
  key: string;
  label: string;
}

interface TabFiltersProps<T extends string = string> {
  tabs: readonly Tab[];
  activeTab: T;
  onTabChange: (key: T) => void;
}

export const TabFilters = <T extends string = string>({
  tabs,
  activeTab,
  onTabChange,
}: TabFiltersProps<T>) => (
  <div className="flex gap-2 flex-wrap">
    {tabs.map((tab) => (
      <button
        key={tab.key}
        onClick={() => onTabChange(tab.key as T)}
        className={`px-4 py-2 text-xs rounded-2xl border transition-colors ${
          activeTab === tab.key
            ? "bg-green-100 text-green-800 border-green-200"
            : "text-gray-500 border-gray-200 hover:bg-gray-50"
        }`}
      >
        {tab.label}
      </button>
    ))}
  </div>
);
