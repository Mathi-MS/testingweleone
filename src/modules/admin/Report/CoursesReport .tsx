import { Box, IconButton, TextField, Typography } from "@mui/material";
import React, { useContext, useEffect, useState } from "react";
import CustomTable from "../../../components/custom/CustomTable";
import { GraduationCap } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { getLearnersReportThunk } from "../../../features/report/reportSlice";
import { RootState } from "../../../app/store";
import { useAppSelector } from "../../../app/hook";
import { fetchAllBatches } from "../../../features/allBatchesSlice";
import { useFilter } from "../../../contexts/FilterContext";
import { FilterContext } from "../../../layouts/adminlayout/AdminLayout";
import { FiFilter, FiSearch } from "react-icons/fi";
import { GoChevronLeft } from "react-icons/go";
import { HiMiniBars3BottomLeft } from "react-icons/hi2";
import { SidebarContext } from "../../learner/ai/AIChatWrapper";

const CoursesReport = () => {
  const dispatch = useDispatch<any>();

  const { learners, loading, reportPagination } = useSelector(
    (state: RootState) => state.report
  );

  const { batches } = useAppSelector((state) => state.allBatches);

  const filterContext = useContext(FilterContext);
  const toggleFilter = filterContext?.toggleFilter || (() => {});

  const { setFilterData, setFilterEnabled, selectedFilters } = useFilter();

  const [showSearch, setShowSearch] = useState(false);
  const [searchText, setSearchText] = useState("");
 const { userDetails } = useAppSelector((state) => state.ar);
    const sidebarContext = React.useContext(SidebarContext);
  /* ---------------- FILTER DATA ---------------- */

  const transformFilterData = () => {
    const filters: any[] = [];

    if (batches?.length) {
      filters.push({
        title: "Batch",
        count: batches.length,
        type: "checkbox",
        items: batches.map((b: any) => ({ id: b.id, name: b.batchName })),
      });

      filters.push({
        title: "Payment Type",
        type: "checkbox",
        count: 2,
        items: [
          { id: "FREE", name: "Free" },
          { id: "PAID", name: "Paid" },
        ],
      });

      // ✅ single date picker — type: "daterange"
      filters.push({
        title: "Date",
        type: "daterange",
        count: 0,
        items: [],
      });
    }

    return filters;
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  /* ---------------- API CALL BUILDER ---------------- */

  const buildPayload = (page: number) => {
    const batchIds = selectedFilters?.Batch || [];
    const paymentType = selectedFilters?.["Payment Type"]?.[0];
    const updatedAt = selectedFilters?.updatedAt || null; // ✅ "2026-03-01" format

    return {
      page,
      size: reportPagination?.size || 20,
      isMasterClass: false,
      ...((batchIds.length || paymentType || updatedAt) && {
        Filter: {
          ...(batchIds.length && { batchIds }),
          ...(paymentType && { paymentType }),
          ...(updatedAt && { updatedAt }),  // ✅ passed to thunk → query
        },
      }),
    };
  };

  /* ---------------- LOAD MORE ---------------- */

  const handleLoadMore = async () => {
    if (loading || !reportPagination?.hasMore) return;
    dispatch(getLearnersReportThunk(buildPayload(reportPagination.page + 1)));
  };

  /* ---------------- FILTER INIT ---------------- */

  useEffect(() => {
    if (!batches?.length) return;
    const transformed = transformFilterData();
    setFilterData(transformed);
    setFilterEnabled(true);
  }, [batches]);

  /* ---------------- FETCH DATA ---------------- */

  useEffect(() => {
    dispatch(getLearnersReportThunk(buildPayload(0)));
  }, [dispatch, JSON.stringify(selectedFilters)]);

  /* ---------------- FETCH BATCHES ---------------- */

  useEffect(() => {
    dispatch(fetchAllBatches({ isMasterClass: false, page: 0, size: 200 }));
  }, []);

  /* ---------------- TABLE ROWS ---------------- */

  let sno = 0;

  const rows =
    learners?.data?.flatMap((learner: any) =>
      (learner.batch || []).map((batch: any) => {
        sno += 1;
        return {
          sno,
          date: batch.updatedAt
            ? new Date(batch.updatedAt.replace(" IST", "")).toLocaleDateString(
                "en-IN",
                { day: "2-digit", month: "short", year: "numeric" }
              )
            : "-",
          name: learner.userName || "-",
          id: learner.userId || "-",
          mobile: learner.mobileNumber || "-",
          email: learner.email || "-",
          courseName: batch.courseName || "-",
          paymentType: batch.paymentType || "-",
        };
      })
    ) || [];

  const columns = [
    { key: "sno", label: "S.No" },
    { key: "date", label: "Date" },
    { key: "name", label: "Name" },
    { key: "id", label: "UserId" },
    { key: "mobile", label: "Mobile" },
    { key: "email", label: "Email" },
    { key: "courseName", label: "Course Name" },
    { key: "paymentType", label: "Payment Type" },
  ];

  return (
    <>
      {/* HEADER */}
      <Box
        sx={{
          padding: "10px",
          borderBottom: "solid 1px var(--greyborder)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
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
            <GraduationCap size={18} />
          </Box>
          <Typography sx={{ fontSize: "18px", fontWeight: "900" }}>
            Courses Report
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: "20px", position: "relative" }}>
          {/* SEARCH */}
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
                  },
                }}
              />
            </Box>
          </Box>

          {/* FILTER */}
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
      <Box>
        <CustomTable
          rows={rows}
          columns={columns}
          loading={loading}
          onLoadMore={handleLoadMore}
        />
      </Box>
    </>
  );
};

export default CoursesReport;