import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../../components/layout/Sidebar";
import CustomFilter from "../../components/custom/CustomFilter";
import { useState, createContext, useEffect, useRef } from "react";
import { images } from "../../assets/image/Images";
import { FilterProvider, useFilter } from "../../contexts/FilterContext";
import Learnerheader from "./Learnerheader";
import { GlobalAIChat } from "../../modules/learner/ai/components/GlobalAIChat";
import { SidebarContext } from "../../modules/learner/ai/AIChatWrapper";

export const FilterContext = createContext<{
  toggleFilter: () => void;
  filterOpen: boolean;
} | null>(null);

const AdminLayoutContent = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  const { filterData, setSelectedFilters } = useFilter();
  const location = useLocation();
  const sidebarRef = useRef<HTMLDivElement>(null);

  const isCommunity = location.pathname.startsWith('/community');
  const isBatchDetail = location.pathname.match(/\/trainer\/batch\/\d+$/);

const toggleFilter = () => {
  if (!filterOpen) {
    setSidebarOpen(false); // close sidebar when opening filter
  } else {
    setSidebarOpen(true);  // re-enable sidebar when closing filter
  }
  setFilterOpen(!filterOpen);
};

  const toggleSidebar = () => {
    if (!sidebarOpen) setFilterOpen(false);
    setSidebarOpen(!sidebarOpen);
  };

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (windowWidth <= 768 && sidebarOpen && sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setSidebarOpen(false);
      }
    };

    if (sidebarOpen && windowWidth <= 768) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [sidebarOpen, windowWidth]);
  
    // if (isLearnerOrTrainer && windowWidth > 768) {

  return (
    <div className="flex h-screen bg-[var(--white)] overflow-hidden">
      {/* Mobile Overlay */}
      {sidebarOpen && windowWidth <= 768 && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      <div ref={sidebarRef}>
        <Sidebar open={sidebarOpen} setOpen={toggleSidebar} />
      </div>
      {!isCommunity && <GlobalAIChat />}

      <div className="flex-1 flex flex-col h-full bg-[var(--white)] relative w-full overflow-hidden">
        {/* commonHeader  */}
        {!isBatchDetail && <Learnerheader onToggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen}/>}
        {/* {(!sidebarOpen && windowWidth > 500) && (

          <div className="flex items-center justify-between px-4 py-4 w-[238px] max-[500px]:w-[180px]">
            <img src={images.logo} alt="Logo" className="w-[110px]" />

            <div className="flex gap-2">
              <button
                onClick={toggleSidebar}
                className="border border-[var(--greyborder)] rounded p-1.5 flex items-center justify-center bg-transparent cursor-pointer hover:bg-gray-50"
              >
                <img src={images.sidebartoggle} alt="Toggle" className="w-[13px]" />
              </button>
            </div>
          </div>
        )} */}

        <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-[5px] [&::-webkit-scrollbar-thumb]:bg-[var(--greyborder)] [&::-webkit-scrollbar-thumb]:rounded-[10px]">
          <div>
            <FilterContext.Provider value={{ toggleFilter, filterOpen }}>
              <SidebarContext.Provider value={{ sidebarOpen, toggleSidebar }}>
                <Outlet />
              </SidebarContext.Provider>
            </FilterContext.Provider>
          </div>
        </div>
      </div>

      <CustomFilter
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        json={filterData}
        onFilterChange={(filters) => {
          setSelectedFilters(filters);
        }}
      />
    </div>
  );
};

const AdminLayout = () => (
  <FilterProvider>
    <AdminLayoutContent />
  </FilterProvider>
);

export default AdminLayout;
