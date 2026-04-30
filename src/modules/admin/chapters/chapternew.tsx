import { useContext, useEffect, useMemo, useState } from "react";
import CustomTable from "../../../components/custom/CustomTable";
import {Box,Typography,TextField,IconButton,debounce, Tooltip} from "@mui/material";
import { images } from "../../../assets/image/Images";
import { FiSearch, FiFilter } from "react-icons/fi";
import { GoChevronLeft } from "react-icons/go";
import CustomButton from "../../../components/custom/CustomButton";
import { MdAdd } from "react-icons/md";
import { ChapterModel } from "./ChapterModel";
import {
  fetchAllChapters,
  fetchMicroLearnFilterData,
} from "../../../features/chapterSlice";
import { useAppDispatch, useAppSelector } from "../../../app/hook";
import { FilterContext } from "../../../layouts/adminlayout/AdminLayout";
import { useFilter } from "../../../contexts/FilterContext";
import { RootState } from "../../../app/store";
import { HiMiniBars3BottomLeft } from "react-icons/hi2";
import { SidebarContext } from "../../learner/ai/AIChatWrapper";
import React from "react";

export default function Chapternew() {
  const dispatch = useAppDispatch();
  const { chapters, pagination, loading, filteredData } = useAppSelector(
    (state: any) => state.chapters
  );
  const { list: mlData } = useAppSelector((state: RootState) => state.ml);
  const { userDetails } = useAppSelector((state) => state.ar);
  const sidebarContext = React.useContext(SidebarContext);
  // ✅ UPDATED: Added Chapter section
  const transformFilterData = (apiData: any) => {
    const filters = [];

    if (apiData?.course?.data) {
      filters.push({
        title: "Course",
        count: apiData.course.count,
        type: "checkbox",
        items: apiData.course.data.map((c: any) => ({
          id: c.id,
          name: c.courseTitle,
        })),
      });
    }

    if (apiData?.book?.data) {
      filters.push({
        title: "Book",
        count: apiData.book.count,
        type: "checkbox",
        items: apiData.book.data.map((b: any) => ({
          id: b.id,
          name: b.bookTitle,
        })),
      });
    }

    if (apiData?.microlearn?.data) {
      filters.push({
        title: "Microlearning",
        count: apiData.microlearn.count,
        type: "checkbox",
        items: apiData.microlearn.data.map((m: any) => ({
          id: m.id,
          name: m.microLearnTitle,
        })),
      });
    }

    // ✅ ADD CHAPTER SECTION
    if (apiData?.chapter?.data) {
      filters.push({
        title: "Chapter",
        count: apiData.chapter.count,
        type: "checkbox",
        items: apiData.chapter.data.map((ch: any) => ({
          id: ch.id,
          name: ch.chapterTitle,
        })),
      });
    }

    return filters;
  };

  // ✅ UPDATED: Added chapterIds
  const transformFiltersForAPI = (filters: any) => {
    return {
      courseIds: filters.Course || [],
      bookIds: filters.Book || [],
      microlearnIds: filters.Microlearning || [],
      chapterIds: filters.Chapter || [], // ✅ ADD THIS
    };
  };

  const removeEmptyArrays = (obj: Record<string, any[]>) => {
    const cleaned: Record<string, any[]> = {};

    Object.entries(obj).forEach(([key, value]) => {
      if (Array.isArray(value) && value.length > 0) {
        cleaned[key] = value;
      }
    });

    return Object.keys(cleaned).length > 0 ? cleaned : undefined;
  };

  const microLearningItems =
    mlData?.map((item, index) => ({
      id: String(item.microLearnId ?? index),
      name: item.microLearnTitle,
    })) ?? [];

  useEffect(() => {
    if (!filteredData) return;

    setFilterData(transformFilterData(filteredData));
    setFilterEnabled(true);
  }, [filteredData]);

  const filterContext = useContext(FilterContext);
  const { setFilterData, setFilterEnabled, selectedFilters } = useFilter();
  
  const handleSendFilter = (yourFilterData: any, enabled: boolean) => {
    setFilterData(yourFilterData);
    setFilterEnabled(enabled);
  };
  
  const toggleFilter = filterContext?.toggleFilter || (() => {});
  const [rows, setRows] = useState<any[]>([]);
  const [openChapterDrawer, setOpenChapterDrawer] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [searchText, setSearchText] = useState("");

  const columns = [
    { key: "chapterId", label: "Chapter ID" },
    { key: "chapterTitle", label: "Title" },
    { key: "chapterDescription", label: "Short Description" },
    { key: "microLearnTitle", label: "microLearnTitle" },
  ];

  const handleLoadMore = async () => {
    if (loading || !pagination?.hasMore) return;

    await dispatch(
      fetchAllChapters({
        page: pagination.page + 1,
        size: 20,
        searchtext: searchText,
      })
    );
  };

  useEffect(() => {
    if (!chapters?.length) {
      setRows([]);
      return;
    }

    const formattedRows = chapters.map((item: any) => ({
      ...item,
        chapterDescription: (
    <Tooltip title={item.chapterDescription} arrow>
      <Typography
        sx={{
          fontSize: "12px",
          maxWidth: "200px",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {item.chapterDescription || "-"}
      </Typography>
    </Tooltip>
  ),
      chapterTitle: (
        <Tooltip title={item.chapterTitle} arrow>
        <Typography
          sx={{
        textDecoration: "underline",
        cursor: "pointer",
        fontSize: "12px",
        fontWeight: "bold",
        maxWidth: "120px",      // control width
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
          }}
          onClick={() => {
            setSelectedItemId(item.id);
            setOpenChapterDrawer(true);
          }}
        >
          {item.chapterTitle}
        </Typography>
        </Tooltip>
      ),

      microLearnTitle:
        Array.isArray(item.microLearn) && item.microLearn.length > 0 ? (
          <Box sx={{ display: "flex", gap: "4px", flexWrap: "nowrap" }}>
            {item.microLearn
              .filter((m: any) => m?.microLearnTitle)
              .map((m: any, index: number) => (
                <Box
                  key={index}
                  sx={{
                    display: "inline-block",
                    border: "1px solid #d0d5dd",
                    borderRadius: "16px",
                    padding: "4px 12px",
                    fontSize: "12px",
                    color: "#344054",
                    backgroundColor: "#f9fafb",
                  }}
                >
                  {m.microLearnTitle}
                </Box>
              ))}
          </Box>
        ) : item.microLearn?.microLearnTitle ? (
          <Box
            sx={{
              display: "inline-block",
              border: "1px solid #d0d5dd",
              borderRadius: "16px",
              padding: "4px 12px",
              fontSize: "12px",
              color: "#344054",
              backgroundColor: "#f9fafb",
            }}
          >
            {item.microLearn.microLearnTitle}
          </Box>
        ) : (
          "-"
        ),
    }));

    setRows(formattedRows);
  }, [chapters]);

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  useEffect(() => {
    dispatch(fetchAllChapters({ page: 0, size: 20, searchtext: "" }));
    dispatch(fetchMicroLearnFilterData({ page: 0, size: 4 })); // ✅ 4 items for sidebar
  }, [dispatch]);

  useEffect(() => {
    if (!filteredData) return;

    const transformed = transformFilterData(filteredData);
    setFilterData(transformed);
    setFilterEnabled(true);
  }, [filteredData]);

  useEffect(() => {
    const rawFilterParams = transformFiltersForAPI(selectedFilters || {});
    const cleanedFilters = removeEmptyArrays(rawFilterParams);

    dispatch(
      fetchAllChapters({
        page: 0,
        size: 20,
        searchtext: searchText,
        ...(cleanedFilters && { filters: cleanedFilters }),
      })
    );
  }, [selectedFilters, searchText]);

  return (
    <>
      {/* HEADER */}
      <Box
        sx={{
          padding: "10px",
          borderBottom:"solid 1px var(--greyborder)",
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
          <Box
            sx={{
              background: "var(--textfour)",
              padding: "6px",
              borderRadius: "4px",
            }}
            component={"img"}
            src={images.microlearning}
          />
          <Typography sx={{ fontSize: "18px", fontWeight: "900" }}>
            Chapter
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
          {/* SEARCH ICON + MUI TEXTFIELD */}
          <Box sx={{ position: "relative" }}>
            <IconButton onClick={() => setShowSearch(!showSearch)}>
              <FiSearch
                style={{ color: "var(--textlight)", fontSize: "18px" }}
              />
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
                    "&:hover fieldset": {
                      borderColor: "var(--primary)",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "var(--primary) !important",
                      borderWidth: "1.5px",
                    },
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: "var(--primary)",
                  },
                }}
              />
            </Box>
          </Box>

          {/* FILTER BOX */}
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

          {/* ADD BUTTON */}
          <CustomButton
            type="button"
            variant="contained"
            label="Create Chapter"
            size="medium"
            startIcon={<MdAdd />}
            onClick={() => {
              setSelectedItemId(null);
              setOpenChapterDrawer(true);
            }}
          />
        </Box>
      </Box>

      <Box sx={{ m: 2 }}>
          {/* TABLE */}
      <CustomTable
        rows={rows}
        columns={columns}
        loading={loading}
        onLoadMore={handleLoadMore}
      />
      
      <ChapterModel
        open={openChapterDrawer}
        itemId={selectedItemId}
        onClose={() => {
          setOpenChapterDrawer(false);
          setSelectedItemId(null);
          if (filteredData) {
            setFilterData(transformFilterData(filteredData));
            setFilterEnabled(true);
          }
        }}
      />
      </Box>
    </>
  );
}