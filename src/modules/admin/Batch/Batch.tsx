import { Box, IconButton, TextField, Typography, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { FiSearch, FiFilter } from "react-icons/fi";
import { GoChevronLeft } from "react-icons/go";
import { CalendarCheck } from "lucide-react";
import CustomButton from "../../../components/custom/CustomButton";
import { MdAdd } from "react-icons/md";
import { useEffect, useState, useCallback, useMemo } from "react";
import BatchModel from "./BatchModel";
import { useDispatch, useSelector } from "react-redux";
import { getAllBatchThunk, publishBatchThunk } from "../../../features/batchSlice";
import { RootState, AppDispatch } from "../../../app/store";
import CustomTable from "../../../components/custom/CustomTable";
import toast from "react-hot-toast";
import dayjs, { Dayjs } from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import BatchFilter, { BatchFilters } from "./BatchFilter";
import { showError, showSuccess } from "../../../components/ui/Toast";
import { useAppSelector } from "../../../app/hook";
import React from "react";
import { SidebarContext } from "../../learner/ai/AIChatWrapper";
import { HiMiniBars3BottomLeft } from "react-icons/hi2";

const INITIAL_FILTERS: BatchFilters = {
  search: "",
  selectedTypes: [],
  selectedStatuses: [],
  selectedLanguages: [],
  selectedCategories: [],
  selectedEnrollmentStatuses: [],
  selectedpaymentType: [],
  selectedTrack: "",
  selectedTimeZone: "",
  selectedCategory: "",
  selectedTrainer: "",
  selectedCourses: [],
  maxPrice: "",
  batchStartDate: null,
  batchEndDate: null,
  enrollmentStartDate: null,
  enrollmentEndDate: null,
};
const renderStatus = (isActive: boolean) => {
  const map: any = {
    DRAFT: { label: "Draft", color: "#D59347", bg: "#D593471A" },
    ACTIVE: { label: "Active", color: "#00B048", bg: "#00B0481A" },
  };
  const s = map[isActive ? "ACTIVE" : "DRAFT"];
  return (
    <Box sx={{ display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "4px 12px", borderRadius: "16px", fontSize: "12px", fontWeight: 600, color: s.color, backgroundColor: s.bg, minWidth: "80px" }}>
      {s.label}
    </Box>
  );
};
const Batch = () => {
  const columns = [
    { key: "batchId",        label: "Batch ID" },
    { key: "batchName",      label: "Batch Name" },
    { key: "isMasterClass",  label: "Type" },
    { key: "batchStartDate", label: "Start Date" },
    { key: "batchEndDate",   label: "End Date" },
    { key: "courseMapping",  label: "Course Mapping" },
    { key: "SessionCovered", label: "Session Covered" },
    { key: "isPublish",      label: "Batch Status" },
    { key: "action",         label: "Action" },
  ];

  const dispatch = useDispatch<AppDispatch>();
  const { batch, totalCount, page, loading } = useSelector((state: RootState) => state.batch);
  const { modalTrainers: trainersList } = useSelector((state: any) => state.trainer);
  const { courses: mlData } = useSelector((state: RootState) => state.course);

  // UI state
  const [isFilterCollapsed, setIsFilterCollapsed] = useState(true);
  const [showSearch, setShowSearch]               = useState(false);
  const [selectedItemId, setSelectedItemId]       = useState<string | null>(null);
  const [openDrawer, setOpenDrawer]               = useState(false);
  const [rows, setRows]                           = useState<any[]>([]);
  const [confirmOpen, setConfirmOpen]             = useState(false);
  const [publishItemId, setPublishItemId]         = useState<string | null>(null);
  const { userDetails } = useAppSelector((state) => state.ar);
  const sidebarContext = React.useContext(SidebarContext);
  // Filter state
  const [filters, setFilters] = useState<BatchFilters>(INITIAL_FILTERS);
  const [priceDebounce, setPriceDebounce] = useState<NodeJS.Timeout | null>(null);

  const updateFilter = (key: keyof BatchFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    
    if (key === "maxPrice") {
      if (priceDebounce) clearTimeout(priceDebounce);
      const timeout = setTimeout(() => {
        setFilters((prev) => ({ ...prev, [key]: value }));
      }, 500);
      setPriceDebounce(timeout);
    }
  };

  // ── Applied filter count ─────────────────────────────────────────────────────
  const appliedFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.search.trim())                     count++;
    if (filters.selectedTypes.length)              count++;
    if (filters.selectedStatuses.length)           count++;
    if (filters.selectedLanguages.length)          count++;
    if (filters.selectedCategories.length)         count++;
    if (filters.selectedpaymentType.length)        count++;
    if (filters.selectedTrack)                     count++;
    if (filters.selectedTimeZone)                  count++;
    if (filters.selectedCategory)                  count++;
    if (filters.selectedTrainer)                   count++;
    if (filters.selectedCourses.length)            count++;
    if (filters.maxPrice)                          count++;
    if (filters.selectedEnrollmentStatuses.length) count++;
    if (filters.batchStartDate)                    count++;
    if (filters.batchEndDate)                      count++;
    if (filters.enrollmentStartDate)               count++;
    if (filters.enrollmentEndDate)                 count++;
    return count;
  }, [filters]);

  // ── Build filter payload ─────────────────────────────────────────────────────
  const buildFilterPayload = useCallback(() => {
    const f: any = {};

    if (filters.selectedTypes.length === 1)
      f.isMasterClass = filters.selectedTypes[0] === "true";

    if (filters.selectedStatuses.length === 1)
      f.isPublish = filters.selectedStatuses[0] === "true";

    if (filters.selectedLanguages.length)
      f.language = filters.selectedLanguages;

    if (filters.selectedpaymentType.length)
      f.paymentType = filters.selectedpaymentType;

    if (filters.selectedTrack)
      f.track = filters.selectedTrack;

    if (filters.selectedTimeZone)
      f.timeZone = filters.selectedTimeZone;

    if (filters.selectedCategory)
      f.categories = [filters.selectedCategory];

    if (filters.selectedTrainer)
      f.trainerId = filters.selectedTrainer;

    if (filters.selectedCourses.length)
      f.courseId = filters.selectedCourses;

    if (filters.maxPrice)
      f.priceRange = filters.maxPrice;

    if (filters.selectedCategories.length)
      f.categories = filters.selectedCategories;

    if (filters.selectedEnrollmentStatuses.length)
      f.enrollmentStatus = filters.selectedEnrollmentStatuses;

    if (filters.batchStartDate)
      f.batchStartDate = dayjs(filters.batchStartDate).format("YYYY-MM-DD");

    if (filters.batchEndDate)
      f.batchEndDate = dayjs(filters.batchEndDate).format("YYYY-MM-DD");

    if (filters.enrollmentStartDate)
      f.enrollmentStartDate = dayjs(filters.enrollmentStartDate).format("YYYY-MM-DD");

    if (filters.enrollmentEndDate)
      f.enrollmentEndDate = dayjs(filters.enrollmentEndDate).format("YYYY-MM-DD");

    return Object.keys(f).length ? f : null;
  }, [filters]);

  // ── Fetch on filter/search change ────────────────────────────────────────────
useEffect(() => {
  const payload = {
    page: 0,
    size: 20,
    search: filters.search.trim() || null,
    filters: buildFilterPayload(),
  }



  dispatch(getAllBatchThunk(payload));
}, [dispatch, filters]);

  // ── Format rows ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!batch?.length) { setRows([]); return; }

    setRows(
      batch.map((item: any) => ({
        ...item,

        isPublish: renderStatus(item.isPublish),

        courseMapping:
          item.courseCount > 0 ? (
            <Typography sx={{ fontSize: "12px", fontWeight: 600 }}>
              {item.courseCount} Courses
            </Typography>
          ) : "-",

        isMasterClass: (
          <Box sx={{
            display: "inline-block", padding: "4px 12px",
            borderRadius: "16px", fontSize: "12px", fontWeight: 600,
          }}>
            {item.isMasterClass ? "Masterclass" : "Batch"}
          </Box>
        ),

        action: (
          <Box sx={{ display: "flex", gap: 1 }}>
            <CustomButton
              label={item.isPublish ? "Published" : "Publish"}
              size="small"
              variant={item.isPublish ? "outlined" : "contained"}
              disabled={item.isPublish}
              onClick={() => { setPublishItemId(item.id); setConfirmOpen(true); }}
              type="button"
            />
          </Box>
        ),  

        batchName: (
          <Typography
            sx={{
              textDecoration: "underline", cursor: "pointer",
              fontSize: "12px", fontWeight: "bold",
            }}
            onClick={() => { setSelectedItemId(item.id); setOpenDrawer(true); }}
          >
            {item.batchName}
          </Typography>
        ),
      }))
    );
  }, [batch]);

  // ── Load more ────────────────────────────────────────────────────────────────
  const handleLoadMore = async () => {
    if (loading || batch.length >= totalCount) return;
    await dispatch(
      getAllBatchThunk({
        page: page + 1,
        size: 20,
        search: filters.search.trim() || null,
        filters: buildFilterPayload(),
      })
    );
  };

  const handleCloseDrawer = () => { setOpenDrawer(false); setSelectedItemId(null); };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <>
        {/* ── Top bar ── */}
        <Box sx={{
          borderBottom: "solid 1px var(--greyborder)",
          padding: "10px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
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

            <Box sx={{
              background: "var(--textfour)", padding: "6px",
              borderRadius: "4px", svg: { fontSize: "16px !important" },
            }}>
              <CalendarCheck size={16} />
            </Box>

            <Typography sx={{ fontSize: "18px", fontWeight: "900" }}>Batch</Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: "20px", position: "relative" }}>
            {/* Search */}
            <Box sx={{ position: "relative" }}>
              <IconButton onClick={() => setShowSearch(!showSearch)}>
                <FiSearch style={{ color: "var(--textlight)", fontSize: "18px" }} />
              </IconButton>

              <Box sx={{
                position: "absolute", right: 0, top: "50%",
                transform: "translateY(-50%)",
                width: showSearch ? "250px" : "0px",
                overflow: "hidden", transition: "width 0.4s ease",
                display: "flex", alignItems: "center", gap: "10px",
              }}>
                <Box
                  onClick={() => setShowSearch(!showSearch)}
                  sx={{ position: "absolute", left: "10px", zIndex: 100, display: "flex", alignItems: "center", cursor: "pointer" }}
                >
                  <FiSearch style={{ color: "var(--textlight)", fontSize: "18px" }} />
                </Box>

                <TextField
                  variant="outlined"
                  size="small"
                  placeholder="Search..."
                  value={filters.search}
                  onChange={(e) => updateFilter("search", e.target.value)}
                  sx={{
                    width: "250px",
                    "& .MuiOutlinedInput-root": {
                      height: "35px",
                      background: "var(--greythree)",
                      borderRadius: "5px",
                      fontSize: "14px",
                      color: "var(--textlight)",
                      paddingLeft: "20px",
                      "& fieldset": { borderColor: "transparent" },
                    },
                  }}
                />
              </Box>
            </Box>
            <Box
              onClick={() => setIsFilterCollapsed((prev) => !prev)}
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
              <GoChevronLeft style={{ transform: isFilterCollapsed ? "rotate(0deg)" : "rotate(180deg)", transition: "transform 0.3s" }} />
            </Box>
            {/* Create */}
            <CustomButton
              type="button"
              variant="contained"
              label="Create Batch"
              size="medium"
              startIcon={<MdAdd />}
              onClick={() => setOpenDrawer(true)}
            />
            <BatchModel open={openDrawer} itemId={selectedItemId} onClose={handleCloseDrawer} />
          </Box>
        </Box>

        {/* ── Body: table + sidebar ── */}
        <Box sx={{ display: "flex", height: "calc(100vh - 91px)", overflow: "hidden" }}>

          {/* ── Table ── */}
          <Box sx={{ flex: 1, overflow: "auto" }}>
            <CustomTable
              rows={rows}
              columns={columns}
              loading={loading}
              onLoadMore={handleLoadMore}
            />
          </Box>

          {/* ── Filter Sidebar ── */}
          {!isFilterCollapsed && (
            <BatchFilter
              filters={filters}
              updateFilter={updateFilter}
              onClearAll={() => setFilters(INITIAL_FILTERS)}
              appliedFiltersCount={appliedFiltersCount}
              trainersList={trainersList}
              mlData={mlData}
            />
          )}
        </Box>

        {/* ── Publish confirm dialog ── */}
        <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} maxWidth="xs" fullWidth>
          <DialogTitle sx={{ fontWeight: 700 }}>Confirm Publish</DialogTitle>
          <DialogContent sx={{ fontSize: "14px", color: "#475467" }}>
            Are you sure you want to publish this batch and map it to both
            <strong> Website </strong> and <strong> Product</strong>?
          </DialogContent>
          <DialogActions sx={{ padding: "16px" }}>
            <CustomButton
              type="button" variant="outlined" label="Cancel"
              onClick={() => setConfirmOpen(false)}
              boxSx={{ width: 100 }}
            />
            <CustomButton
              type="button" variant="contained" label="Yes, Publish" size="medium"
              boxSx={{ width: 100 }}
              onClick={() => {
                if (!publishItemId) return;
                dispatch(publishBatchThunk({ batchId: publishItemId }))
                  .unwrap()
                  .then(() => {
                    showSuccess("Batch published successfully");
                    showSuccess("Updated successfully on both the website and the product.");
                    dispatch(getAllBatchThunk({ page: 0, size: 20 }));
                  })
                  .catch((err) => showError(err?.message || err))
                  .finally(() => { setConfirmOpen(false); setPublishItemId(null); });
              }}
            />
          </DialogActions>
        </Dialog>
      </>
    </LocalizationProvider>
  );
};

export default Batch; 