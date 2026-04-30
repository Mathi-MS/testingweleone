import { useContext, useEffect, useState } from "react";
import { RootState } from "../../../app/store";
import { useAppDispatch, useAppSelector } from "../../../app/hook";
import { fetchAllChapters, fetchMicroLearnFilterData } from "../../../features/chapterSlice";
import { Box, IconButton, TextField, Tooltip, Typography } from "@mui/material";
import CustomButton from "../../../components/custom/CustomButton";
import { GoChevronLeft } from "react-icons/go";
import { MdAdd } from "react-icons/md";
import { FiFilter, FiSearch } from "react-icons/fi";
import CustomTable from "../../../components/custom/CustomTable";
import { BookModal } from "./BookModel";
import { FilterContext } from "../../../layouts/adminlayout/AdminLayout";
import { useFilter } from "../../../contexts/FilterContext";
import { fetchAllBooks } from "../../../features/bookSlice";
import { images } from "../../../assets/image/Images";
import { HiMiniBars3BottomLeft } from "react-icons/hi2";
import React from "react";
import { SidebarContext } from "../../learner/ai/AIChatWrapper";


export default function Books() {
  const dispatch = useAppDispatch();
  const { chapters, pagination, loading, filteredData } = useAppSelector(
    (state: any) => state.chapters
  );
  const { list: mlData } = useAppSelector((state: RootState) => state.ml);
  const { booklist, bookpagination } = useAppSelector((state: any) => state.book);
    const { userDetails } = useAppSelector((state) => state.ar);
    const sidebarContext = React.useContext(SidebarContext);
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

    return filters;
  };

  const transformFiltersForAPI = (filters: any) => {
    return {
      courseIds: filters.Course || [],
      chapterIds: filters.Chapter || [], // ✅ FIXED
      microlearnIds: filters.Microlearning || [],
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

    const transformed = transformFilterData(filteredData);
    setFilterData(transformed);
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
    { key: "bookId", label: "Book ID" },
    { key: "bookTitle", label: "Title" },
    { key: "bookDescription", label: "Short Description" },
    { key: "chapterName", label: "ChapterTitle" },
    // { key: "createdAt", label: "Created At" },
  ];

  // ✅ Load more uses Redux pagination.page + 1, checks hasMore
  const handleLoadMore = async () => {
    if (loading || !bookpagination?.hasMore) return;
    await dispatch(
      fetchAllBooks({
        page: bookpagination.page + 1, // ✅ ALWAYS from redux
        size: 20,
        searchText: searchText,
      })
    );
  };

  useEffect(() => {
    if (!booklist?.length) {
      setRows([]);
      return;
    }

    const formattedRows = booklist.map((item: any) => ({
      ...item,

      bookTitle: (
        <Tooltip title={item.bookTitle} arrow>
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
          {item.bookTitle}
        </Typography>
        </Tooltip>
      ),
        bookDescription: (
          <Tooltip title={item.bookDescription} arrow>
            <Typography
              sx={{
                fontSize: "12px",
                maxWidth: "200px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {item.bookDescription || "-"}
            </Typography>
          </Tooltip>
        ),

      // ✅ Chapter name from `chapter` array
      chapterName:
        Array.isArray(item.chapter) && item.chapter.length > 0 ? (
          <Box sx={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
            {item.chapter
              .filter((ch: any) => ch?.chapterName)
              .map((ch: any, index: number) => (
                <Box
                  key={index}
                  sx={{
                    border: "1px solid #d0d5dd",
                    borderRadius: "16px",
                    padding: "4px 12px",
                    fontSize: "12px",
                    color: "#344054",
                    backgroundColor: "#f9fafb",
                  }}
                >
                  {ch.chapterName}
                </Box>
              ))}
          </Box>
        ) : (
          "-"
        ),
    }));

    setRows(formattedRows);
  }, [booklist]);

  const handleSearch = (value: string) => {
    setSearchText(value); // ONLY update state
  };

  useEffect(() => {
    dispatch(fetchAllChapters({ page: 0, size: 20, searchtext: "" }));
    dispatch(fetchMicroLearnFilterData({ page: 0, size: 4 }));
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
      fetchAllBooks({
        page: 0,
        size: 20,
        searchText,
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
            Book
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
          {/* 🔍 SEARCH ICON + MUI TEXTFIELD */}
          <Box sx={{ position: "relative" }}>
            <IconButton onClick={() => setShowSearch(!showSearch)}>
              <FiSearch
                style={{ color: "var(--textlight)", fontSize: "18px" }}
              />
            </IconButton>

            {/* SLIDE INPUT */}
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
            label="Book"
            size="medium"
            startIcon={<MdAdd />}
            onClick={() => {
              setSelectedItemId(null); // ✅ CREATE mode
              setOpenChapterDrawer(true); // ✅ open drawer
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
      <BookModal
        open={openChapterDrawer}
        itemId={selectedItemId} // null = create, id = edit
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
