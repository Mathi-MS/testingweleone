import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Divider,
  IconButton,
  Typography,
} from "@mui/material";
import CustomButton from "../../../../../components/custom/CustomButton";
import { RiCollapseDiagonal2Line } from "react-icons/ri";
import { HiOutlineChevronDoubleRight } from "react-icons/hi2";
import { CgArrowsExpandLeft } from "react-icons/cg";
import { getAssessmentById } from "../../../../../features/trainerSlice";
import { useAppDispatch } from "../../../../../app/hook";

type Props = {
  open: boolean;
  onClose: () => void;
  data?: any;
  loading?: boolean;
  selectedRow?: any;
};

const formatDate = (str?: string) => {
  if (!str) return "-";
  const parts = str.trim().split(/\s+/);
  if (parts.length < 6) return str;
  const day = parts[2].padStart(2, "0");
  const month = parts[1];
  const year = parts[5];
  const time = parts[3];
  const [hour, minute] = time.split(":");
  const h = parseInt(hour);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${day} ${month} ${year}, ${hour12}:${minute} ${ampm}`;
};

const QuizReview = ({ open, onClose, data, loading, selectedRow }: Props) => {
  const [expand, setExpand] = useState(false);
  const [selectedAttemptIndex, setSelectedAttemptIndex] = useState(0);
  const dispatch = useAppDispatch();

  // ✅ FIX: Use a ref to track whether this is the first data load
  // so we only reset the index when the drawer opens fresh,
  // NOT on every subsequent attempt fetch.
  const isFirstLoad = useRef(true);

  useEffect(() => {
    if (isFirstLoad.current) {
      setSelectedAttemptIndex(0);
      isFirstLoad.current = false;
    }
  }, [data]);

  // ✅ FIX: Reset the ref whenever the drawer opens so the next open starts fresh
  useEffect(() => {
    if (open) {
      isFirstLoad.current = true;
    }
  }, [open]);

  if (!open) return null;

  const width = expand ? "80%" : "50%";

  const attempts = data?.assessmentAttempts ?? [];
  const currentAttempt = attempts[selectedAttemptIndex] ?? attempts[0];
  const answers: any[] = currentAttempt?.answers ?? [];

  const handleCancel = () => {
    onClose();
  };

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        right: 0,
        width: width,
        height: "100vh",
        background: "#fff",
        transition: "0.4s ease",
        boxShadow: "-4px 0px 15px rgba(0,0,0,0.15)",
        zIndex: 1300,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* TOP BAR */}
      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "10px 16px",
          borderBottom: "1px solid #eee",
          background: "#fff",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <IconButton onClick={handleCancel}>
            <HiOutlineChevronDoubleRight size={16} />
          </IconButton>

          <IconButton onClick={() => setExpand(!expand)}>
            {expand ? (
              <RiCollapseDiagonal2Line size={18} />
            ) : (
              <CgArrowsExpandLeft size={14} />
            )}
          </IconButton>

          <Typography sx={{ fontSize: "14px", ml: 1 }}>
            Assessment / View
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 1 }}>
          <CustomButton
            type="button"
            variant="outlined"
            label="Cancel"
            onClick={handleCancel}
          />
        </Box>
      </Box>

      {/* PROFILE HEADER */}
      <Box className="bg-white px-5 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* LEFT */}
          <div className="flex items-center gap-4">
            {selectedRow?.ProfilePhotoUrl ? (
              <img
                src={selectedRow.ProfilePhotoUrl}
                alt="profile"
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-semibold">
                {(selectedRow?.learnerName || data?.learnerName || "?")[0].toUpperCase()}
              </div>
            )}
            <div>
              <h3 className="text-sm font-semibold text-gray-900">
                {selectedRow?.learnerName || data?.learnerName || "-"}
              </h3>
              <p className="text-xs text-gray-500">
                {selectedRow?.learnerEmail || data?.learnerEmail || "-"}
              </p>
              <div className="flex gap-3 text-xs text-gray-400 mt-1">
                <span>📅 {formatDate(currentAttempt?.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-3">
            <select
              className="text-xs border rounded-md px-3 py-1"
              value={selectedAttemptIndex}
              onChange={(e) => {
                const index = Number(e.target.value);
                // ✅ FIX: Pass index correctly (was missing the argument)
                setSelectedAttemptIndex(index);
                dispatch(
                  getAssessmentById({
                    id: selectedRow?.id,
                    attemptFilter: index + 1,
                  })
                );
              }}
            >
              {Array.from(
                { length: selectedRow?.assessmentCount || 0 },
                (_, i) => (
                  <option key={i} value={i}>
                    Attempt {i + 1}
                  </option>
                )
              )}
            </select>
          </div>
        </div>

        {/* SCORE */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2" />
          <span className="text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-600">
            Score: {currentAttempt?.scoredMarks ?? 0} / {currentAttempt?.totalMarks ?? 0} ({currentAttempt?.percentage ?? 0}%)
          </span>
        </div>
      </Box>

      <Divider />

      {/* QUESTIONS */}
      <Box sx={{ flex: 1, overflowY: "auto" }}>
        {loading ? (
          <div className="flex justify-center items-center h-40 text-sm text-gray-400">
            Loading...
          </div>
        ) : (
          <div className="bg-gray-100 p-5 space-y-5">
            {answers.map((q: any, index: number) => {
              const correctOpts: string[] = q.correctOptions ?? [];
              const selectedOpts: string[] = q.selectedOption ?? [];
              const isCorrect: boolean = q.isCorrect ?? false;

              return (
                <div
                  key={q.questionId}
                  className="bg-white rounded-xl border p-5"
                >
                  {/* HEADER */}
                  <div className="flex justify-between mb-4">
                    <div className="flex gap-3">
                      <div
                        className={`w-7 h-7 flex items-center justify-center rounded-full text-white ${
                          isCorrect ? "bg-green-500" : "bg-red-500"
                        }`}
                      >
                        {isCorrect ? "✓" : "X"}
                      </div>

                      <h4 className="text-sm font-semibold">
                        Question {index + 1}: {q.question}
                      </h4>
                      {q.answerType && (
                        <span className="text-xs text-gray-400">({q.answerType})</span>
                      )}
                    </div>

                    <span
                      className={`text-xs px-3 py-1 rounded-full ${
                        isCorrect
                          ? "bg-green-100 text-green-600"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {isCorrect ? "Correct" : "Wrong"}
                    </span>
                  </div>

                  {/* OPTIONS */}
                  <div className="space-y-3">
                    {(q.options ?? []).map((option: any, optIndex: number) => {
                      const isCorrectOpt = correctOpts.includes(option.optionId);
                      const isSelected = selectedOpts.includes(option.optionId);
                      const letter = String.fromCharCode(65 + optIndex);

                      return (
                        <div
                          key={option.optionId}
                          className={`flex justify-between items-center p-3 rounded-lg border ${
                            isCorrectOpt
                              ? "bg-green-100 border-green-400"
                              : isSelected
                              ? "bg-red-100 border-red-400"
                              : "bg-gray-50 border-gray-200"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-5 h-5 flex items-center justify-center rounded-full text-xs ${
                                isCorrectOpt
                                  ? "bg-green-500 text-white"
                                  : isSelected
                                  ? "bg-red-500 text-white"
                                  : "bg-gray-300"
                              }`}
                            >
                              {isCorrectOpt ? "✓" : isSelected ? "X" : letter}
                            </div>

                            <span className="text-sm">{option.optionText}</span>
                          </div>

                          {isCorrectOpt && (
                            <span className="text-xs text-green-600 border px-2 py-1 rounded">
                              Correct Answer
                            </span>
                          )}

                          {isSelected && !isCorrectOpt && (
                            <span className="text-xs text-red-600 border px-2 py-1 rounded">
                              Student's Answer
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Box>
    </Box>
  );
};

export default QuizReview;