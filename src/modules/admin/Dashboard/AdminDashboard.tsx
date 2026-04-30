import { useRef, useState } from "react";
import CustomTable from "../../../components/custom/CustomTable";
import { StatCard } from "./components/StatCard";
import { ViewToggle } from "./components/ViewToggle";
import { TabFilters } from "./components/TabFilters";
import { FilterDropdown } from "./components/FilterDropdown";
import { useDashboardData } from "./hooks/useDashboardData";
import { useSelector } from "react-redux";
import { RootState } from "../../../app/store";
import { Download } from "@phosphor-icons/react";
import {
  calculateCareerCompassChange,
  calculateEnrollmentCount,
} from "./utils/statsCalculator";
import {
  mapCareerCompassData,
  mapEnrollmentData,
  mapStatsData,
  mapBrochureHistoryData,
  mapContactInquiryData,
  mapCourseLeadData,
} from "./utils/tableDataMapper";
import {
  TABS,
  getInitialStats,
  TABLE_COLUMNS,
  DATE_OPTIONS,
  TOKEN_OPTIONS,
  TabKey,
} from "./constants/dashboardConstants";
import { useAppSelector } from "../../../app/hook";
import { SidebarContext } from "../../learner/ai/AIChatWrapper";
import React from "react";
import { HiMiniBars3BottomLeft } from "react-icons/hi2";
import { ChartBar } from "lucide-react";
const AdminDashboard = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [regDropdownOpen, setRegDropdownOpen] = useState(false);
  const [selectedReg, setSelectedReg] = useState("Today");
  const [tokenDropdownOpen, setTokenDropdownOpen] = useState(false);
  const [selectedToken, setSelectedToken] = useState("Today");
  const tokenRef = useRef<HTMLDivElement>(null);
  const { userDetails } = useAppSelector((state) => state.ar);
  const sidebarContext = React.useContext(SidebarContext);
  const {
    dashboardCourseData,
    dashboardMasterclassData,
    aiUsageData,
    assessmentResults,
    assessmentCount,
    brochureHistory,
    brochureHistoryCount,
    contactInquiry,
    contactInquiryCount,
    courseLead,
    courseLeadCount,
    loading,
  } = useDashboardData(selectedToken);

  const courseEnrollmentCount = calculateEnrollmentCount(dashboardCourseData);
  const masterclassEnrollmentCount = calculateEnrollmentCount(
    dashboardMasterclassData,
  );
  const careerCompassChange = calculateCareerCompassChange(assessmentResults);

  const updatedStats = getInitialStats().map((stat) => {
    if (stat.title === "Course Enrollments")
      return { ...stat, value: courseEnrollmentCount.toString() };
    if (stat.title === "Masterclass Enrollments")
      return { ...stat, value: masterclassEnrollmentCount.toString() };
    if (stat.title === "Token Consumed in Website AI") {
      const totalTokens =
        (aiUsageData?.totalAiUsage || 0) + (aiUsageData?.totalAppAiUsage || 0);
      return { ...stat, value: totalTokens.toLocaleString() };
    }
    if (stat.title === "Career Compass") {
      return {
        ...stat,
        value: assessmentCount.toString(),
        ...careerCompassChange,
      };
    }
    if (stat.title === "Brochure Downloads") {
      return { ...stat, value: brochureHistoryCount.toString() };
    }
    if (stat.title === "Contact Inquiry") {
      return { ...stat, value: contactInquiryCount.toString() };
    }
    if (stat.title === "Course Lead") {
      return { ...stat, value: courseLeadCount.toString() };
    }
    return stat;
  });

  const getSubtitle = (title: string) => {
    if (title === "Total Registrations") return `on ${selectedReg}`;
    if (title === "Token Consumed in Website AI") {
      if (selectedToken === "Last 7 days") return "last 7 days";
      if (selectedToken === "Last 30 days") return "last 30 days";
      return `on ${selectedToken}`;
    }
    return "vs last month";
  };

  const filteredStats =
    activeTab === "all"
      ? updatedStats
      : updatedStats.filter((s) => s.title === activeTab);

  const getTableData = () => {
    if (activeTab === "Career Compass")
      return mapCareerCompassData(assessmentResults);
    if (activeTab === "Course Enrollments")
      return mapEnrollmentData(dashboardCourseData);
    if (activeTab === "Masterclass Enrollments")
      return mapEnrollmentData(dashboardMasterclassData);
    if (activeTab === "Brochure Downloads")
      return mapBrochureHistoryData(brochureHistory);
    if (activeTab === "Contact Inquiry")
      return mapContactInquiryData(contactInquiry);
    if (activeTab === "Course Lead") return mapCourseLeadData(courseLead);
    return mapStatsData(filteredStats, getSubtitle);
  };

  const getTableColumns = () => TABLE_COLUMNS[activeTab];

  const handleViewChange = (mode: "grid" | "list") => {
    setViewMode(mode);
    if (mode === "grid") setActiveTab("all");
  };

  const isLoadingData = (title: string) =>
    loading &&
    [
      "Course Enrollments",
      "Masterclass Enrollments",
      "Token Consumed in Website AI",
      "Career Compass",
      "Brochure Downloads",
      "Contact Inquiry",
      "Course Lead",
    ].includes(title);

  const accessToken = useSelector((state: RootState) => state.ar.accessToken);

  const handleExportCourseLead = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/batch/course-lead/export`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (!response.ok) throw new Error("Export failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `course-lead-${new Date().toISOString().split("T")[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Export error:", error);
    }
  };

  const handleExportContactInquiry = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/batch/contact-inquiry/export`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (!response.ok) throw new Error("Export failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `contact-inquiry-${new Date().toISOString().split("T")[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Export error:", error);
    }
  };

  return (
    <>
      {/* Header */}
      <div className="border-b border-[#0d0d0d0d] bg-white px-4 py-[14px]">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h1 className="text-md text-gray-900 flex items-center">
              {!sidebarContext?.sidebarOpen && (
                   <button 
                     onClick={sidebarContext?.toggleSidebar}
                     className={`${userDetails?.roles?.some((role: string) => role.toUpperCase() === 'ROLE_ADMIN') ? '' : 'md:hidden'} flex items-center justify-center p-1 mr-2`}
                   >
                     {/* <img src={images.sidebartoggle} alt="Toggle" className="w-[13px]" /> */}
                     <HiMiniBars3BottomLeft style={{color:"#000",fontSize:"22px",}}/>
                   </button>
                 )}
              <ChartBar size={16} className="me-2" />
              Admin Dashboard
            </h1>
          </div>
        </div>
      </div>

      <div style={{ padding: "24px" , paddingLeft: "24px",
          paddingRight: "24px",}}>
        {/* Tabs + View toggle row */}
        <div className="flex items-center justify-between mb-4">
          {viewMode === "list" && (
            <TabFilters<TabKey>
              tabs={TABS}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          )}
          <ViewToggle viewMode={viewMode} onViewChange={handleViewChange} />
        </div>

        {viewMode === "grid" && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${filteredStats.length === 1 ? 1 : filteredStats.length === 2 ? 2 : filteredStats.length === 3 ? 3 : 4}, 1fr)`,
              gap: "16px",
            }}
          >
            {filteredStats.map((stat) => (
              <StatCard
                key={stat.title}
                icon={stat.icon}
                title={stat.title}
                value={stat.value}
                change={stat.change}
                positive={stat.positive}
                highlight={stat.highlight}
                subtitle={getSubtitle(stat.title)}
                loading={isLoadingData(stat.title)}
                onClick={() => {
                  setActiveTab(stat.title as TabKey);
                  setViewMode("list");
                }}
                filterComponent={
                  stat.title === "Total Registrations" ? (
                    <FilterDropdown
                      isOpen={regDropdownOpen}
                      onToggle={() => setRegDropdownOpen(!regDropdownOpen)}
                      selected={selectedReg}
                      onSelect={setSelectedReg}
                      options={DATE_OPTIONS}
                      minWidth="200px"
                    />
                  ) : stat.title === "Token Consumed in Website AI" ? (
                    <FilterDropdown
                      isOpen={tokenDropdownOpen}
                      onToggle={() => setTokenDropdownOpen(!tokenDropdownOpen)}
                      selected={selectedToken}
                      onSelect={setSelectedToken}
                      options={TOKEN_OPTIONS}
                    />
                  ) : undefined
                }
              />
            ))}
          </div>
        )}
      </div>

      {viewMode === "list" && (
        <>
          <style>{`.admin-dashboard-table .MuiTableCell-root { padding: 12px 20px !important; }`}</style>
          {(activeTab === "Course Lead" || activeTab === "Contact Inquiry") && (
            <div
              style={{
                padding: "0 24px 16px",
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={
                  activeTab === "Course Lead"
                    ? handleExportCourseLead
                    : handleExportContactInquiry
                }
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 20px",
                  backgroundColor: "#00bf53",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: 500,
                  transition: "background-color 0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#009c44")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "#00bf53")
                }
              >
                <Download size={18} weight="bold" />
                {activeTab === "Course Lead"
                  ? "Export Course Lead"
                  : "Export Contact Inquiry"}
              </button>
            </div>
          )}
          <div className="admin-dashboard-table">
            <CustomTable
              rows={getTableData()}
              columns={getTableColumns()}
              loading={loading}
            />
          </div>
        </>
      )}
    </>
  );
};

export default AdminDashboard;
