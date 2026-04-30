import React, { useEffect, useRef, useState } from "react";
import CustomTable from "../../../../../components/custom/CustomTable";
import { getAssessmentById, getAssessmentBySessionId } from "../../../../../features/trainerSlice";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { useAppDispatch } from "../../../../../app/hook";
import { RootState } from "../../../../../app/store";
import { Box, IconButton } from "@mui/material";
import { Eye } from "lucide-react";
import QuizReview from "./TrainerAssessmentmodel";

export const TrainerAssessment = () => {
  const dispatch = useAppDispatch();
  const { sessionId } = useParams();

  const scrollRef = useRef<HTMLDivElement>(null);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any>(null);

  const {
    assessmentList,
    assessmentLoading,
    assessmentPagination,
    assessmentById,
    assessmentByIdLoading,
  } = useSelector((state: RootState) => state.trainer);

  useEffect(() => {
    if (sessionId) {
      dispatch(getAssessmentBySessionId({ sessionId, page: 0, size: 10 }));
    }
  }, [dispatch, sessionId]);

  const handleLoadMore = async () => {
    if (assessmentLoading || !assessmentPagination?.hasMore) return;
    await dispatch(
      getAssessmentBySessionId({
        sessionId: sessionId!,
        page: assessmentPagination.page + 1,
        size: assessmentPagination.size,
      })
    );
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 10) {
        handleLoadMore();
      }
    };
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, [assessmentLoading, assessmentPagination]);

  const handleClose = () => {
    setOpenDrawer(false);
    setSelectedRow(null);
  };

  const columns = [
    { key: "sno", label: "S.No" },
    { key: "learnerCode", label: "Learner Code" },
    { key: "learnerName", label: "Name" },
    { key: "learnerEmail", label: "Email" },
    { key: "assessmentCount", label: "Attempts" },
    { key: "latestAttemptPercentage", label: "Score (%)" },
    {
      key: "action",
      label: "View",
      renderCell: (params: any) => (
        <Box>
          <IconButton
            onClick={() => {
              const row = params.row ?? params;
              setSelectedRow(row);
              setOpenDrawer(true);
              dispatch(getAssessmentById({ id: row.id, attemptFilter: null }));
            }}
          >
            <Eye />
          </IconButton>
        </Box>
      ),
    },
  ];

  const rows = assessmentList.map((item: any, index: number) => ({
    sno: index + 1,
    ...item,
    learnerCode: item.learnerCode || "-",
    learnerName: item.learnerName || "Unknown",
    learnerEmail: item.learnerEmail || "-",
  }));

  return (
    <>
      <div
        ref={scrollRef}
        style={{
          minHeight: "90px",
          maxHeight: "400px",
          overflowY: "auto",
        }}
      >
        <CustomTable
          rows={rows}
          columns={columns}
          loading={assessmentLoading}
          onLoadMore={handleLoadMore}
        />
      </div>

      <QuizReview
        open={openDrawer}
        onClose={handleClose}
        data={assessmentById}
        loading={assessmentByIdLoading}
        selectedRow={selectedRow}
      />
    </>
  );
};