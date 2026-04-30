import { createContext, useContext, useState, ReactNode } from 'react';

interface FilterContextType {
  filterData: any;
  setFilterData: (data: any) => void;
  filterEnabled: boolean;
  setFilterEnabled: (enabled: boolean) => void;
  selectedFilters: any;
  setSelectedFilters: (filters: any) => void;
  totalItems: number;
  setTotalItems: (count: number) => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const FilterProvider = ({ children }: { children: ReactNode }) => {
  const [filterData, setFilterData] = useState(null);
  const [filterEnabled, setFilterEnabled] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({});
  const [totalItems, setTotalItems] = useState(0);

  return (
    <FilterContext.Provider value={{ 
      filterData, 
      setFilterData, 
      filterEnabled, 
      setFilterEnabled, 
      selectedFilters, 
      setSelectedFilters,
      totalItems,
      setTotalItems
    }}>
      {children}
    </FilterContext.Provider>
  );
};

export const useFilter = () => {
  const context = useContext(FilterContext);
  if (!context) throw new Error('useFilter must be used within FilterProvider');
  return context;
};