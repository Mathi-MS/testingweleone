import { Box, IconButton, TextField, Typography } from "@mui/material";
import React, { useContext, useEffect, useState } from "react";
import CustomTable from "../../../components/custom/CustomTable";
import { useDispatch, useSelector } from "react-redux";
import { getLearnersReportThunk } from "../../../features/report/reportSlice";
import { FilterContext } from "../../../layouts/adminlayout/AdminLayout";
import { FiFilter, FiSearch } from "react-icons/fi";
import { GoChevronLeft } from "react-icons/go";
import { PlayCircle } from "lucide-react";
import { useAppSelector } from "../../../app/hook";
import { useFilter } from "../../../contexts/FilterContext";
import { fetchAllBatches } from "../../../features/allBatchesSlice";
import { SidebarContext } from "../../learner/ai/AIChatWrapper";
import { HiMiniBars3BottomLeft } from "react-icons/hi2";

const MasterclassReport = () => {
  const dispatch = useDispatch<any>();

  const {
    masterclassLearners: learners,
    loading,
    masterclassPagination,        // ✅ use masterclassPagination for load more
  } = useSelector((state: any) => state.report);

  const { batches } = useAppSelector((state) => state.allBatches);
 const { userDetails } = useAppSelector((state) => state.ar);
    const sidebarContext = React.useContext(SidebarContext);
  const filterContext = useContext(FilterContext);
  const toggleFilter = filterContext?.toggleFilter || (() => {});

  const [showSearch, setShowSearch] = useState(false);
  const [searchText, setSearchText] = useState("");

  const { setFilterData, setFilterEnabled, selectedFilters } = useFilter();

  /* ---------------- COLUMNS ---------------- */

  const columns = [
    { key: "sno", label: "S.No" },
    { key: "date", label: "Date" },
    { key: "name", label: "Name" },
    { key: "id", label: "UserId" },
    { key: "mobile", label: "Mobile" },
    { key: "email", label: "Email" },
    { key: "masterclassname", label: "Masterclass Name" },
    { key: "paymentType", label: "Payment Type" },
  ];

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
        items: [
          { id: "FREE", name: "Free" },
          { id: "PAID", name: "Paid" },
        ],
      });

      filters.push({
        title: "Date",
        type: "daterange",
        items: [],
      });
    }

    return filters;
  };

  /* ---------------- PAYLOAD BUILDER ---------------- */

  const buildPayload = (page: number) => {
    const batchIds = selectedFilters?.Batch || [];
    const paymentType = selectedFilters?.["Payment Type"]?.[0];
    const updatedAt = selectedFilters?.updatedAt || null;

    return {
      page,
      size: masterclassPagination?.size || 20,
      isMasterClass: true,                              // ✅ always true here
      ...((batchIds.length || paymentType || updatedAt) && {
        Filter: {
          ...(batchIds.length && { batchIds }),
          ...(paymentType && { paymentType }),
          ...(updatedAt && { updatedAt }),
        },
      }),
    };
  };

  /* ---------------- HANDLERS ---------------- */

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const handleLoadMore = async () => {
    if (loading || !masterclassPagination?.hasMore) return;
    dispatch(
      getLearnersReportThunk(buildPayload(masterclassPagination.page + 1)) // ✅ masterclassPagination
    );
  };

  /* ---------------- EFFECTS ---------------- */

  // ✅ set filter sections when batches load
  useEffect(() => {
    if (!batches?.length) return;
    const transformed = transformFilterData();
    setFilterData(transformed);
    setFilterEnabled(true);
  }, [batches]);

  // ✅ re-fetch on filter change
  useEffect(() => {
    dispatch(getLearnersReportThunk(buildPayload(0)));
  }, [dispatch, JSON.stringify(selectedFilters)]);

    useEffect(() => {
      dispatch(fetchAllBatches({ isMasterClass: true, page: 0, size: 200 }));
    }, []);
  /* ---------------- TABLE ROWS ---------------- */

  let sno = 0;

  const rows =
    learners?.data?.flatMap((item: any) => {
      if (!item.batch || item.batch.length === 0) {
        sno += 1;
        return [
          {
            sno,
            date: "-",
            name: item.userName,
            id: item.learnerId,
            mobile: item.mobileNumber || "-",
            email: item.email,
            masterclassname: "-",
            paymentType: "-",
          },
        ];
      }

      return item.batch.map((b: any) => {
        sno += 1;
        return {
          sno,
          date: b.updatedAt
            ? new Date(b.updatedAt.replace(" IST", "")).toLocaleDateString(
                "en-IN",
                { day: "2-digit", month: "short", year: "numeric" }
              )
            : "-",
          name: item.userName,
          id: item.userId,
          mobile: item.mobileNumber || "-",
          email: item.email,
          masterclassname: b.courseName?.trim() || "-",
          paymentType: b.paymentType || "-",
        };
      });
    }) || [];

  /* ---------------- RENDER ---------------- */

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
        {/* LEFT TITLE */}
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
            <PlayCircle size={18} />
          </Box>
          <Typography sx={{ fontSize: "18px", fontWeight: "900" }}>
            Masterclass Report
          </Typography>
        </Box>

        {/* RIGHT ACTIONS */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            position: "relative",
          }}
        >
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
                    "& fieldset": { borderColor: "var(--greyborder)", borderRadius: "4px" },
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

export default MasterclassReport;