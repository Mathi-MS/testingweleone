import {
  Box,
  Typography,
  IconButton,
} from "@mui/material";
import { HiOutlineChevronDoubleRight } from "react-icons/hi";
import { FiSearch } from "react-icons/fi";
import { RiDeleteBin5Line } from "react-icons/ri";
import { useState, useEffect, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";

import CustomButton from "../../../components/custom/CustomButton";
import CustomTable from "../../../components/custom/CustomTable";

import { AppDispatch } from "../../../app/store";
import { getAllCourses } from "../../../features/course/courseSlice";
import { batchMappingThunk } from "../../../features/batch/coursemapping";
import { fetchAllModules } from "../../../features/batchSlice";
import { useAppSelector } from "../../../app/hook";
import { getSessionByBatchId } from "../../../features/sessionSlice";

/* ---------------- TABLE COLUMNS ---------------- */
const columns = [
  { key: "sn", label: "SL.No" },
  { key: "courses", label: "Courses" },
  { key: "action", label: "Action" },
];

/* ---------------- DEBOUNCE ---------------- */
const debounce = (func: any, delay: number) => {
  let timer: any;
  return (...args: any[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => func(...args), delay);
  };
};

/* ---------------- HELPER ---------------- */
const uniqueArray = (arr: string[]) => [...new Set(arr)];

const Coursemappingmodel = ({ open, onClose, batchId }: any) => {
  const dispatch = useDispatch<AppDispatch>();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { sessions } = useAppSelector((state: any) => state.session);
  const { createbatch } = useAppSelector((state: any) => state.generaldetails);

  const { courses: mlData, loading, pagination } = useSelector(
    (state: any) => state.course
  );

  const [search, setSearch] = useState("");
  const [rows, setRows] = useState<any[]>([]);
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
  const [selectedCourseDbIds, setSelectedCourseDbIds] = useState<string[]>([]);
  const [openDropdown, setOpenDropdown] = useState(false);
  const [page, setPage] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);


  /* ---------------- INITIAL LOAD ---------------- */
  useEffect(() => {
    if (!open) {
      setIsInitialized(false);
      return;
    }

    setPage(0);
    dispatch(
      getAllCourses({
        page: 0,
        size: 10,
        searchtext: null,
        coursefilter: null,
      })
    );

    // Fetch sessions for existing batch
    const id = batchId || createbatch?.data?.id;
    if (id) {
      dispatch(getSessionByBatchId({ batchId: id, page: 0, size: 100 }));
    }
  }, [open, batchId, createbatch?.data?.id, dispatch]);

  /* ---------------- PREFILL FROM SESSION API ---------------- */
  useEffect(() => {
    if (!open || !sessions?.length || !mlData?.length || isInitialized) return;

    const collectedCourseIds: string[] = [];

    sessions.forEach((session: any) => {
      if (Array.isArray(session.courseId)) {
        collectedCourseIds.push(...session.courseId);
      } else if (typeof session.courseId === "string") {
        collectedCourseIds.push(session.courseId);
      }
    });

    const uniqueCourseIds = uniqueArray(collectedCourseIds);
    if (uniqueCourseIds.length === 0) return;

    const prefilledRows = uniqueCourseIds.map((cid, index) => {
      const course = mlData.find((c: any) => c.courseId === cid);
      return {
        sn: index + 1,
        id: cid,
        dbId: course?.id,
        courses: course ? course.courseTitle : cid,
      };
    });

    setRows(prefilledRows);
    setSelectedCourseIds(uniqueCourseIds);
    setSelectedCourseDbIds(prefilledRows.map(r => r.dbId).filter(Boolean));
    setIsInitialized(true);
  }, [open, sessions, mlData, isInitialized]);

  /* ---------------- SEARCH ---------------- */
  const fetchCourses = useCallback(
    (text: string, pg: number) => {
      dispatch(
        getAllCourses({
          page: pg,
          size: 10,
          searchtext: text || null,
          coursefilter: null,
        })
      );
    },
    [dispatch]
  );

  const handleSearch = useCallback(
    debounce((text: string) => {
      setPage(0);
      fetchCourses(text, 0);
    }, 400),
    []
  );

  useEffect(() => {
    handleSearch(search);
  }, [search]);

  /* ---------------- INFINITE SCROLL ---------------- */
  const handleScroll = () => {
    if (!dropdownRef.current || loading) return;

    const div = dropdownRef.current;
    const reachedBottom =
      div.scrollTop + div.clientHeight >= div.scrollHeight - 20;

    if (reachedBottom && page + 1 < pagination.totalPages) {
      const next = page + 1;
      setPage(next);
      fetchCourses(search, next);
    }
  };

  /* ---------------- SELECT COURSE ---------------- */
  const handleCourseSelect = (course: any) => {
    if (selectedCourseIds.includes(course.courseId)) return;

    setRows((prev) => [
      ...prev,
      {
        sn: prev.length + 1,
        id: course.courseId,
        dbId: course.id,
        courses: course.courseTitle,
      },
    ]);

    setSelectedCourseIds((prev) => [...prev, course.courseId]);
    setSelectedCourseDbIds((prev) => [...prev, course.id]);
  };

  /* ---------------- DELETE COURSE ---------------- */
  const handleDelete = (courseId: string) => {
    const rowToDelete = rows.find(r => r.id === courseId);
    
    setRows((prev) =>
      prev
        .filter((r) => r.id !== courseId)
        .map((r, i) => ({ ...r, sn: i + 1 }))
    );

    setSelectedCourseIds((prev) => prev.filter((id) => id !== courseId));
    if (rowToDelete?.dbId) {
      setSelectedCourseDbIds((prev) => prev.filter((id) => id !== rowToDelete.dbId));
    }
  };

  const rowsWithActions = rows.map((row) => ({
    ...row,
    action: (
      <RiDeleteBin5Line
        size={20}
        color="red"
        style={{ cursor: "pointer" }}
        onClick={() => handleDelete(row.id)}
      />
    ),
  }));

  /* ---------------- SAVE ---------------- */
  const handleSaveDraft = async () => {
    try {
      const result = await dispatch(
        batchMappingThunk({
          id: createbatch?.data?.id || batchId,
          courseId: selectedCourseDbIds,
        })
      ).unwrap();
console.log(result,'result');

      if (result) {
        await dispatch(
          fetchAllModules({
            courseIds: selectedCourseDbIds,
          }) as any
        );
      }

      onClose();
    } catch (error) {
      console.error('Failed to save course mapping:', error);
    }
  };

  /* ---------------- CLICK OUTSIDE ---------------- */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpenDropdown(false);
      }
    };

    if (openDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openDropdown]);

  /* ---------------- UI ---------------- */
  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        right: open ? 0 : "-100%",
        width: "70%",
        height: "100vh",
        background: "#fff",
        transition: "0.4s",
        boxShadow: "-5px 0px 20px rgba(0,0,0,0.1)",
        p: 2,
        zIndex: 9999,
        overflowY: "auto",
      }}
    >
      {/* HEADER */}
      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <IconButton onClick={onClose}>
            <HiOutlineChevronDoubleRight size={20} />
          </IconButton>
          <Typography sx={{ ml: 1, fontSize: 14 }}>
            Batch / Courses Mapping
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Box>
          <CustomButton variant="outlined" label="Cancel" onClick={onClose} type="button"/>
          </Box>
          <Box>
          <CustomButton
            variant="contained"
            label="save"
            onClick={handleSaveDraft}
            disabled={selectedCourseIds.length === 0}
            type="button"
          />
          </Box>
        </Box>
      </Box>

      {/* SEARCH */}
      <Box sx={{ position: "relative", mt: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", border: "1px solid #ddd", p: 1 }}>
          <FiSearch />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setOpenDropdown(true)}
            placeholder={`Search Courses (${rows.length} selected)`}
            style={{ border: "none", outline: "none", marginLeft: 10, width: "100%" }}
          />
        </Box>

        {openDropdown && (
          <Box
            ref={dropdownRef}
            onScroll={handleScroll}
            sx={{ maxHeight: 220, overflowY: "auto", border: "1px solid #ddd" }}
          >
            {mlData?.map((course: any) => {
              const disabled = selectedCourseIds.includes(course.courseId);
              return (
                <Box
                  key={course.courseId}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    if (!disabled) handleCourseSelect(course);
                  }}
                  sx={{
                    p: 2,
                    cursor: disabled ? "not-allowed" : "pointer",
                    background: disabled ? "#E3F2FD" : "transparent",
                  }}
                >
                  <Typography>{course.courseTitle}</Typography>
                </Box>
              );
            })}
          </Box>
        )}
      </Box>

      {/* TABLE */}
      <Box sx={{ mt: 5 }}>
        <CustomTable rows={rowsWithActions} columns={columns} loading={loading} />
      </Box>
    </Box>
  );
};

export default Coursemappingmodel;
