import { useEffect, useState, useContext } from "react";
import CustomTable from "../../../components/custom/CustomTable";
import { Box, Typography, TextField, IconButton, Tooltip, } from "@mui/material";
import { images } from "../../../assets/image/Images";
import { FiSearch, FiFilter } from "react-icons/fi";
import { GoChevronLeft, GoChevronRight } from "react-icons/go";
import CustomButton from "../../../components/custom/CustomButton";
import { MdAdd } from "react-icons/md";
import MicroLearningModel from "./MicroLearningModel";
import MicroLearningEditModel from "./MicroLearningEditModel";
import { FilterContext } from "../../../layouts/adminlayout/AdminLayout";
import { useFilter } from "../../../contexts/FilterContext";
import { useSelector } from "react-redux";
import { RootState } from "../../../app/store";

import { fetchMLBySearch, fetchMLFilterData } from "../../../features/microlearning/mlSlice";
import { useAppDispatch, useAppSelector } from "../../../app/hook";
import React from "react";
import { SidebarContext } from "../../learner/ai/AIChatWrapper";
import { HiMiniBars3BottomLeft } from "react-icons/hi2";
const transformFilterData = (apiData: any) => {
  const filters = [];
  
  if (apiData?.course?.data) {
    filters.push({
      title: "Course",
      count: apiData.course.count,
      type: 'checkbox' as const,
      items: apiData.course.data.map((item: any) => ({
        id: item.id,
        name: item.courseTitle
      }))
    });
  }
  
  if (apiData?.category) {
    filters.push({
      title: "Category",
      count: apiData.category.length,
      type: 'checkbox' as const,
      items: apiData.category.map((item: any) => ({
        id: item.id,
        name: item.categoryName
      }))
    });
  }
  
  if (apiData?.chapter?.data) {
    filters.push({
      title: "Chapter",
      count: apiData.chapter.count,
      type: 'checkbox' as const,
      items: apiData.chapter.data.map((item: any) => ({
        id: item.id,
        name: item.chapterTitle
      }))
    });
  }
  
  if (apiData?.book?.data) {
    filters.push({
      title: "Book",
      count: apiData.book.count,
      type: 'checkbox' as const,
      items: apiData.book.data.map((item: any) => ({
        id: item.id,
        name: item.bookTitle
      }))
    });
  }
  
  filters.push({
    title: "Duration",
    type: 'duration' as const
  });
  
  return filters;
};
const MicroLearning = () => {
  const dispatch = useAppDispatch();
  const filterContext = useContext(FilterContext);
  const { setFilterData, setFilterEnabled, selectedFilters } = useFilter();
  const handleSendFilter = (yourFilterData: any, enabled: boolean) => {
    setFilterData(yourFilterData);
    setFilterEnabled(enabled);
  };
   const { userDetails } = useAppSelector((state) => state.ar);
    const sidebarContext = React.useContext(SidebarContext);
  const toggleFilter = filterContext?.toggleFilter || (() => {});
  const filterOpen = filterContext?.filterOpen || false;
  
  const [rows, setRows] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [pagePerData] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [openEditDrawer, setOpenEditDrawer] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [searchText, setSearchText] = useState("");
    const {
    list: mlData,
    loading,
    pagination,
    filterData,
  } = useSelector((state: RootState) => state.ml);
  const columns = [
    { key: "microLearnId", label: "ML ID" },
    { key: "microLearnTitle", label: "Title" },
    { key: "shortDescrpition", label: "Short Description" },
    { key: "category", label: "Category" },
    { key: "subCategory", label: "Sub Category" },
    { key: "Duration", label: "Duration" },
  ];

  const transformFiltersForAPI = (filters: any) => {
    return {
      courseIds: filters.Course || [],
      bookIds: filters.Book || [],
      chapterIds: filters.Chapter || [],
      categoryIds: filters.Category || [],
      duration: filters.Duration || filters.duration || null,
    };
  };
const normalizeDuration = (duration: any) => {
  if (!duration) return null;
  if (Array.isArray(duration.range) && duration.range.length === 2) {
    return {
      from: Number(duration.range[0]),
      to: Number(duration.range[1]),
    };
  }
  if (duration.from != null && duration.to != null) {
    return {
      from: Number(duration.from),
      to: Number(duration.to),
    };
  }

  return null;
};


const removeEmptyFilters = (obj: Record<string, any>) => {
  const cleaned: Record<string, any> = {};

  Object.entries(obj).forEach(([key, value]) => {
    if (Array.isArray(value) && value.length > 0) {
      cleaned[key] = value;
    }

    if (
      key === "duration" &&
      value &&
      value.from != null &&
      value.to != null
    ) {
      cleaned[key] = value;
    }
  });

  return Object.keys(cleaned).length > 0 ? cleaned : undefined;
};

  const rawFilterParams = transformFiltersForAPI(selectedFilters);
  rawFilterParams.duration = normalizeDuration(rawFilterParams.duration);
  const cleanedFilters = removeEmptyFilters(rawFilterParams);

useEffect(() => {
  if (!selectedFilters || Object.keys(selectedFilters).length === 0) {
    dispatch(
      fetchMLBySearch({
        page: 0,
        limit: 10,
        search: searchText,
        ...(cleanedFilters && { filters: cleanedFilters })
      })
    );
    return;
  }


  dispatch(
    fetchMLBySearch({
      page: 0,
      limit: 10,
      search: searchText,
      ...(cleanedFilters && { filters: cleanedFilters })
    })
  );
}, [selectedFilters, searchText]);

 const handleLoadMore = async () => {
    if (loading || !pagination?.hasMore) return;
 
    await dispatch(
      fetchMLBySearch({
        page: pagination.page + 1, 
        limit: 10,
        search: searchText,
        ...(cleanedFilters && { filters: cleanedFilters })
      })
    );
  };

const handleSearch = (value: string) => {
  setSearchText(value);

  dispatch(fetchMLBySearch({
    page: 0, 
    limit: 10,
    search: value,
    ...(cleanedFilters && { filters: cleanedFilters })
  }));
};

      useEffect(() => {
    dispatch(fetchMLBySearch({ page: 0, limit: 10, search: "" }));
    dispatch(fetchMLFilterData({ page: 0, size: 4 }));
  }, [dispatch]);

  useEffect(() => {
    if (filterData) {
      const transformedData = transformFilterData(filterData);
      setFilterData(transformedData);
      setFilterEnabled(true);
    }
  }, [filterData]);


useEffect(() => {
  if (!mlData?.length) {
    setRows([]);
    return;
  }
    setPage(pagination.page ?? 0);
    setTotalPages(pagination.total === 0 ? 1 : (pagination.total ?? 1));
  const formattedRows = mlData.map((item: any) => ({
    ...item,
   microLearnTitle: (
  <Tooltip title={item.microLearnTitle} arrow>
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
        setOpenEditDrawer(true);
      }}
    >
      {item.microLearnTitle}
    </Typography>
  </Tooltip>
),
  // ✅ ADD TOOLTIP FOR DESCRIPTION
  shortDescrpition: (
    <Tooltip title={item.shortDescrpition} arrow>
      <Typography
        sx={{
          fontSize: "12px",
          maxWidth: "200px",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {item.shortDescrpition || "-"}
      </Typography>
    </Tooltip>
  ),

    category: item.category?.categoryName ? (
      <Box
        sx={{
          display: "inline-block",
          border: "1px solid #d0d5dd",
          borderRadius: "16px",
          padding: "4px 12px",
          fontSize: "12px",
          color: "#344054",
          backgroundColor: "#f9fafb"
        }}
      >
        {item.category.categoryName}
      </Box>
    ) : "-",
    subCategory: Array.isArray(item.subCategory) && item.subCategory.length > 0
      ? (
          <Box sx={{ display: "flex", gap: "4px", flexWrap: "nowrap" }}>
            {item.subCategory
              .filter((sub: any) => sub?.subCategoryName)
              .map((sub: any, index: number) => (
                <Box
                  key={index}
                  sx={{
                    border: "1px solid #d0d5dd",
                    borderRadius: "16px",
                    padding: "4px 12px",
                    fontSize: "12px",
                    color: "#344054",
                    backgroundColor: "#f9fafb"
                  }}
                >
                  {sub.subCategoryName}
                </Box>
              ))
            }
          </Box>
        )
      : item.subCategory?.subCategoryName ? (
          <Box
            sx={{
              display: "inline-block",
              border: "1px solid #d0d5dd",
              borderRadius: "16px",
              padding: "4px 12px",
              fontSize: "12px",
              color: "#344054",
              backgroundColor: "#f9fafb"
            }}
          >
            {item.subCategory.subCategoryName}
          </Box>
        ) : "-",
    duration: item.Duration ?? "-",
  }));
  setRows(formattedRows);
}, [mlData]);
  return (
    <>
      <Box
        sx={{
           borderBottom:"solid 1px var(--greyborder)",
           padding: "10px",
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
          <Box
            sx={{ background: "var(--textfour)", padding: "6px", borderRadius: "4px" }}
            component={"img"}
            src={images.microlearning}
          />
          <Typography sx={{ fontSize: "18px", fontWeight: "900" }}>
            Micro Learning
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: "20px", position: "relative" }}>
          <Box sx={{ position: "relative" }}>
            <IconButton onClick={() => setShowSearch(!showSearch)}>
              <FiSearch style={{ color: "var(--textlight)",fontSize:"18px" }} />
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
                display:"flex",
                alignItems:"center",
                justifyContent:"center",
                gap:"10px",
              }}
            >
              <Box onClick={() => setShowSearch(!showSearch)} sx={{position:"absolute",left:"0px",top:"0px",zIndex:"100",width:"20px",height:"100%",marginLeft:"10px",display:"flex",alignItems:"center",justifyContent:"start",cursor:"pointer"}}>
              <FiSearch style={{ color: "var(--textlight)",fontSize:"18px" }} />
            </Box>
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
                    background:"var(--greythree)",
                    borderRadius: "5px",
                    fontFamily:"DM-Semibold !important",
                    fontSize:"14px",
                    color:"var(--textlight)",
                    paddingLeft:"20px",
                    "& fieldset": {
                        borderColor: "transparent",
                        borderRadius: "4px",
                        
                    },
                    "&:hover fieldset": {
                        borderColor: "transparent", 
                    },
                    "&.Mui-focused fieldset": {
                        borderColor: "transparent !important", 
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
            {filterOpen ? <GoChevronRight /> :<GoChevronLeft />}
          </Box>

          <CustomButton
            type="button"
            variant="contained"
            label="Create ML"
            size="medium"
            startIcon={<MdAdd />}
            onClick={() => setOpenDrawer(true)}
          />
        </Box>
      </Box>

      <Box sx={{ m: 2 }}>
          <CustomTable
        rows={rows}
        columns={columns}
        loading={loading}
        onLoadMore={handleLoadMore}
      
      />
      <MicroLearningModel
        open={openDrawer}
        onClose={() => setOpenDrawer(false)}
      />
      <MicroLearningEditModel
        open={openEditDrawer}
        onClose={() => setOpenEditDrawer(false)}
        itemId={selectedItemId}
      />
      </Box>
    </>
  );
};

export default MicroLearning;
