import React, { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import CustomButton from "../../../components/custom/CustomButton";
import CustomTable from "../../../components/custom/CustomTable";

import { MdAdd } from "react-icons/md";
import { useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../../app/store";
import { fetchAllBooks } from "../../../features/microlearning/bookSlice";
import { useAppSelector } from "../../../app/hook";
// import Coursemappingmodel from "./Coursemappingmodel";
import { getAllCourses } from "../../../features/course/courseSlice";
import Coursemappingmodel from "./Coursemappingmodel";
import CustomTableBatch from "../microlearingnew/Tabletest";
import { fetchAllModules } from "../../../features/batchSlice";
import { getSessionByBatchId } from "../../../features/sessionSlice";
import { useDispatch } from "react-redux";

export const Coursemapping = ({ batchId }: any) => {
  const dispatch = useDispatch<AppDispatch>();
  const [isVisible, setIsVisible] = useState(true);

  const {
    courses: mlData,
    loading,
  } = useSelector((state: RootState) => state.course);
  const { booklist, bookpagination } = useAppSelector((state: any) => state.book);
    const { sessions } = useAppSelector((state: any) => state.session);
        const { createbatch } = useAppSelector((state: any) => state.generaldetails);


  // If you want searchText empty by default
  const [searchText, setSearchText] = useState("");

  const [openBatchDrawer,  setOpenBatchDrawer] = useState(false);
  const [openBookRow, setOpenBookRow] = useState<number | null>(null);
  const [rows, setRows] = useState<any[]>([]);

  // Refetch sessions when component becomes visible
  useEffect(() => {
    if (isVisible && batchId) {
      dispatch(
        getSessionByBatchId({
          batchId,
          page: 0,
          size: 100,
        }) as any
      );
    }
  }, [isVisible, batchId, dispatch]);


  const columns = [
    { key: "courseId", label: "ID" },
    { key: "courseTitle", label: "Course Name" },
    { key: "courseDescription", label: "Book" },
    { key: "durationType", label: "Chapters" },
    { key: "courseDuration", label: "Micro Learning" },
    { key: "courseType", label: "Session" },
    { key: "promotionalContent", label: "Action" },
  ];

  // ===============================
  //     CLICK HANDLER FUNCTION
  // ===============================

const handleCourseClick = (id: string) => {
  dispatch(
    fetchAllBooks({
      page: 0,
      size: 20,
      searchText,
      filters: {
        courseIds: [id],
      },
    })
  );
};

  // ===============================
  //      FORMAT TABLE ROWS
  // ===============================

  useEffect(() => {
   if (!batchId || !mlData?.length) {
    setRows([]);
    return;
  }

    const formattedRows = mlData.map((item: any) => ({
      ...item,
      courseTitle: (
        <Typography
          sx={{
            textDecoration: "underline",
            cursor: "pointer",
            fontSize: "12px",
            fontWeight: "bold",
          }}
          onClick={() => handleCourseClick(item.id)}
        >
          {item.courseTitle}
        </Typography>
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
            backgroundColor: "#f9fafb",
          }}
        >
          {item.category.categoryName}
        </Box>
      ) : (
        "-"
      ),

      subCategory:
        Array.isArray(item.subCategory) && item.subCategory.length > 0 ? (
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
                    backgroundColor: "#f9fafb",
                  }}
                >
                  {sub.subCategoryName}
                </Box>
              ))}
          </Box>
        ) : item.subCategory?.subCategoryName ? (
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
            {item.subCategory.subCategoryName}
          </Box>
        ) : (
          "-"
        ),

      duration: item.Duration ?? "-",
    }));

    setRows(formattedRows);
  }, [mlData]);

  
  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Typography sx={{ fontSize: "16px", fontWeight: 700 }}>
          Mapped Files:
        </Typography>

        <CustomButton
          type="button"
          variant="contained"
          label="Add Mapping"
          size="medium"
         boxSx={{ width:"200px"}}
          startIcon={<MdAdd />}
          onClick={() => setOpenBatchDrawer(true)}
        />
      </Box>

      <Box sx={{ mt: 2 }}>
        {/* <CustomTable rows={rows} columns={columns}  /> */}
        <CustomTableBatch batchId={batchId}/>
      </Box>
 
      <Coursemappingmodel
        open={openBatchDrawer}
        onClose={() => setOpenBatchDrawer(false)}
        batchId={batchId}
      />
     
    </>
  );
};
