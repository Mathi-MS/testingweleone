import { Box, IconButton, TextField, Typography } from "@mui/material";
import { Compass } from "lucide-react";
import React, { useContext, useEffect, useState } from "react";
import { FiFilter, FiSearch } from "react-icons/fi";
import { GoChevronLeft } from "react-icons/go";
import { useDispatch, useSelector } from "react-redux";
import { FilterContext } from "../../../layouts/adminlayout/AdminLayout";
import CustomTable from "../../../components/custom/CustomTable";
import { getAssessmentResultsThunk } from "../../../features/report/reportSlice";
import { useFilter } from "../../../contexts/FilterContext";
import { useAppSelector } from "../../../app/hook";
import { SidebarContext } from "../../learner/ai/AIChatWrapper";
import { HiMiniBars3BottomLeft } from "react-icons/hi2";

const trackOptions = [
  { label: "Project/Product Leadership", value: "Project/Product Leadership" },
  { label: "Infra, Security & QA", value: "Infra, Security & QA" },
  { label: "AI / ML / Data Science", value: "AI / ML / Data Science" },
  { label: "Interface & Experience Design", value: "Interface & Experience Design" },
  { label: "Application Engineer", value: "Application Engineer" },
];

const CareerCompassReport = () => {
  const dispatch: any = useDispatch();

  const { assessmentResults, loading, assessmentPagination } = useSelector(
    (state: any) => state.report
  );
 const { userDetails } = useAppSelector((state) => state.ar);
    const sidebarContext = React.useContext(SidebarContext);
  const filterContext = useContext(FilterContext);
  const toggleFilter = filterContext?.toggleFilter || (() => {});
  const { setFilterData, setFilterEnabled, selectedFilters } = useFilter();

  const [showSearch, setShowSearch] = useState(false);
  const [searchText, setSearchText] = useState("");

  /* ===============================
     FILTER INIT
  =============================== */

  useEffect(() => {
    setFilterData([
      {
        title: "Track",
        type: "checkbox",
        // count: trackOptions.length,
        // ✅ id = value (the exact string API expects e.g. "Interface & Experience Design")
        items: trackOptions.map((t) => ({ id: t.value, name: t.label })),
      },
      {
         title: "Date",
        type: "daterange",
      }
      
    ]);
    setFilterEnabled(true);
  }, []);

  /* ===============================
     PAYLOAD BUILDER
  =============================== */

 const buildPayload = (page: number) => {
  // selectedFilters.Track is an array of selected checkbox values
  const selectedTracks: string[] = selectedFilters?.Track || [];
  const completedAt = selectedFilters?.updatedAt || null;

  // Only pass tracks[] when more than one is selected (i.e. "View All" scenario)
  // If single selection, pass as single track; if none, omit entirely
  const tracksPayload =
    selectedTracks.length > 1
      ? { tracks: selectedTracks }       // ✅ "View All" → array ["wert", "rtyui"]
      : selectedTracks.length === 1
      ? { tracks: [selectedTracks[0]] }  // single select → still array of 1
      : {};                              // no filter → omit

  return {
    page,
    limit: assessmentPagination?.limit || 20,
    ...tracksPayload,
    ...(completedAt ? { completedAt } : {}),
  };
};

  /* ===============================
     FETCH DATA
  =============================== */

  useEffect(() => {
    dispatch(getAssessmentResultsThunk(buildPayload(1)));
  }, [dispatch, JSON.stringify(selectedFilters)]);

  /* ===============================
     LOAD MORE
  =============================== */

  const handleLoadMore = async () => {
    if (loading || !assessmentPagination?.hasMore) return;
    dispatch(
      getAssessmentResultsThunk(buildPayload(assessmentPagination.page + 1))
    );
  };

  /* ===============================
     SEARCH HANDLER
  =============================== */

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  /* ===============================
     TABLE COLUMNS
  =============================== */

  const columns = [
    { key: "sno", label: "S.No" },
    { key: "date", label: "Date" },
    { key: "name", label: "Name" },
    { key: "mobile", label: "Mobile" },
    { key: "email", label: "Email" },
    { key: "primaryTrack", label: "Primary Track" },
    { key: "secondaryTrack", label: "Secondary Track" },
  ];

  /* ===============================
     TABLE ROWS
  =============================== */

  const rows =
    assessmentResults?.map((item: any, index: number) => ({
      sno: index + 1,
      date: item.completedAt
        ? new Date(item.completedAt).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
        : "-",
      name: item.fullName || item.username || "-",
      mobile: item.mobileNumber || "-",
      email: item.email || "-",
      primaryTrack: item.primaryTrack || "-",
      secondaryTrack: item.secondaryTrack || "-",
    })) || [];

  /* ===============================
     CLIENT-SIDE SEARCH FILTER
  =============================== */

  const filteredRows = rows.filter((row: any) => {
    const text = searchText.toLowerCase();
    return (
      row.name?.toLowerCase().includes(text) ||
      row.email?.toLowerCase().includes(text) ||
      row.mobile?.includes(text)
    );
  });

  /* ===============================
     RENDER
  =============================== */

  return (
    <>
      <Box
        sx={{
          padding: "10px",
          borderBottom: "solid 1px var(--greyborder)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* TITLE */}
        <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
                   {!sidebarContext?.sidebarOpen && (
                   <button 
                     onClick={sidebarContext?.toggleSidebar}
                     className={`${userDetails?.roles?.some((role: string) => role.toUpperCase() === 'ROLE_ADMIN') ? '' : 'md:hidden'} flex items-center justify-center p-1 mr-2`}
                   >
                     {/* <img src={images.sidebartoggle} alt="Toggle" className="w-[13px]" /> */}
                     <HiMiniBars3BottomLeft style={{color:"#000",fontSize:"22px",}}/>
                   </button>
                 )}
          <Box sx={{ padding: "6px", borderRadius: "4px" }}>
            <Compass size={18} />
          </Box>
          <Typography sx={{ fontSize: "18px", fontWeight: "900" }}>
            Career Compass Report
          </Typography>
        </Box>

        {/* SEARCH + FILTER */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            position: "relative",
          }}
        >
          {/* SEARCH ICON + INPUT */}
          <Box sx={{ position: "relative" }}>
            <IconButton onClick={() => setShowSearch(!showSearch)}>
              <FiSearch style={{ color: "var(--textlight)", fontSize: "18px" }} />
            </IconButton>

            <Box
              sx={{
                position: "absolute",
                right: 0,
                top: "50%",
                transform: "translateY(-50%)",
                width: showSearch ? "250px" : "0px",
                overflow: "hidden",
                transition: "width 0.4s ease",
              }}
            >
              <TextField
                variant="outlined"
                size="small"
                placeholder="Search..."
                value={searchText}
                onChange={(e) => handleSearch(e.target.value)}
                sx={{
                  width: "250px",
                  "& .MuiOutlinedInput-root": {
                    height: "35px",
                    background: "white",
                    borderRadius: "2px",
                    "& fieldset": {
                      borderColor: "var(--greyborder)",
                      borderRadius: "4px",
                    },
                    "&:hover fieldset": { borderColor: "var(--primary)" },
                    "&.Mui-focused fieldset": {
                      borderColor: "var(--primary) !important",
                      borderWidth: "1.5px",
                    },
                  },
                }}
              />
            </Box>
          </Box>

          {/* FILTER BUTTON */}
          <Box
            onClick={toggleFilter}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "80px",
              border: "solid 1px var(--greyborder)",
              padding: "7px 5px",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            <FiFilter style={{ color: "var(--primary)" }} />
            <GoChevronLeft />
          </Box>
        </Box>
      </Box>

      {/* TABLE */}
      <CustomTable
        rows={filteredRows}
        columns={columns}
        loading={loading}
        onLoadMore={handleLoadMore}
      />
    </>
  );
};

export default CareerCompassReport;