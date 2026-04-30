import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  IconButton,
  Divider,
  TextField,
  FormControl,
  Paper,
} from "@mui/material";
import { HiOutlineChevronDoubleRight } from "react-icons/hi";
import { RiCollapseDiagonal2Line } from "react-icons/ri";
import { CgArrowsExpandLeft } from "react-icons/cg";
import { Plus } from "lucide-react";
import CustomButton from "../../../../components/custom/CustomButton";
import { getQuestionByBatchThunk } from "../../../../features/quizSlice";

import { CustomInfiniteAutocomplete } from "../../../../components/custom/CustomInfiniteAutocomplete";
import {
  addQuizQuestionThunk,
  deleteQuizThunk,
  getQuestionBySessionThunk,
  resetQuizState,
  updateQuizQuestionThunk,
} from "../../../../features/quizSlice";
import {
  Question,
  Option,
  makeQuestion,
  uid,
  fieldSx,
  QuestionCard,
} from "./AssessmentComponents";
import { showError, showSuccess } from "../../../../components/ui/Toast";
import { IoClose } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../../../app/store";
import { getSessionByBatchId } from "../../../../features/sessionSlice";

interface Props {
  open: boolean;
  onClose: () => void;
  batchId?: string;
  sessionId?: string;
  mode: string;
}

export const Assessmentmodel = ({
  open,
  onClose,
  batchId,
  sessionId,
  mode,
}: Props) => {
  const isView = mode === "view";
  const isEdit = mode === "edit";
  const isCreate = mode === "create";

  const { quiz, questions: fetchedQuestions } = useSelector(
    (state: any) => state.quiz
  );
  const [expand, setExpand] = useState(false);
  const width = expand ? "80%" : "50%";
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const { sessions, pagination } = useSelector((state: any) => state.session);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [selectedSession, setSelectedSession] = useState("");
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState<number | "">("");
  const [passMark, setPassMark] = useState<number | "">(50);
  const [questions, setQuestions] = useState<Question[]>([makeQuestion()]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const sessionList = Array.isArray(sessions) ? sessions : sessions?.data || [];
  const [isDeleting, setIsDeleting] = useState(false);
  const [errors, setErrors] = useState({ title: false, session: false });

  useEffect(() => {
    dispatch(getSessionByBatchId({ batchId: batchId!, page: 0, size: 10 }));
  }, [dispatch, batchId]);

  // Fetch & pre-fill when editing or viewing
  useEffect(() => {
    if (open && sessionId) {
      dispatch(getQuestionBySessionThunk(sessionId));
    }
    if (!open) dispatch(resetQuizState());
  }, [open, isEdit, sessionId]);

  useEffect(() => {
    if ((!isEdit && !isView) || !quiz) return;
    setTitle(quiz.title ?? "");
    setSelectedSession(quiz.sessionId ?? "");
    setDuration(quiz.duration ?? "");
    setPassMark(quiz.passMark ?? 50);
    if (Array.isArray(fetchedQuestions) && fetchedQuestions.length > 0) {
      setQuestions(
        fetchedQuestions.map((q: any) => {
          const answerType: any =
            q.answerType === "SINGLE"
              ? "single"
              : q.answerType === "MULTIPLE"
              ? "multi"
              : q.answerType === "TEXT"
              ? "text"
              : "number";
          const options: Option[] = (q.options ?? []).map((o: any) => ({
            id: o.optionId,
            label: o.optionText,
          }));
          const correctAnswers: string[] =
            answerType === "single" || answerType === "multi"
              ? (q.correctOptions ?? []).filter((c: string) =>
                  options.some((o) => o.id === c)
                )
              : (q.correctOptions ?? []);
          return {
            id: q.id ?? uid(),
            title: q.question ?? "",
            answerType,
            options,
            correctAnswers,
            customField: {
              placeholder: q.customField?.placeholder ?? "",
              helperText: q.customField?.helperText ?? "",
              required: q.customField?.required ?? false,
              minLength: q.customField?.minLength ?? undefined,
              maxLength: q.customField?.maxLength ?? undefined,
            },
            expanded: q.expanded ?? true,
            marks: q.marks ?? 1,
          };
        })
      );
    }
  }, [quiz, fetchedQuestions, isEdit, isView]);

  const loadMoreSessions = () => {
    if (!sessionsLoading && pagination.hasMore) {
      setSessionsLoading(true);
      dispatch(getSessionByBatchId({ batchId: batchId!, page: pagination.page + 1, size: 10 }))
        .finally(() => setSessionsLoading(false));
    }
  };

  const reset = () => {
    setTitle("");
    setDuration("");
    setPassMark(50);
    setSelectedSession("");
    setQuestions([makeQuestion()]);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const addQuestion = () =>
    setQuestions((prev) => [...prev, makeQuestion()]);

  const updateQuestion = useCallback((id: string, updated: Question) => {
    setQuestions((prev) => prev.map((q) => (q.id === id ? updated : q)));
  }, []);

  const deleteQuestion = (id: string) =>
    setQuestions((prev) => prev.filter((q) => q.id !== id));

  const duplicateQuestion = (id: string) => {
    setQuestions((prev) => {
      const idx = prev.findIndex((q) => q.id === id);
      if (idx === -1) return prev;
      const copy: Question = {
        ...JSON.parse(JSON.stringify(prev[idx])),
        id: uid(),
        expanded: true,
      };
      const next = [...prev];
      next.splice(idx + 1, 0, copy);
      return next;
    });
  };

  const totalMarks = questions.reduce(
    (s, q) => s + (Number(q.marks) || 0),
    0
  );

  const handleSave = async () => {
    const titleErr = !title.trim();
    const sessionErr = !isEdit && !selectedSession;
    if (titleErr || sessionErr) {
      setErrors({ title: titleErr, session: sessionErr });
      return;
    }
    setErrors({ title: false, session: false });
    const formattedQuestions = questions.map((q) => {
      const optionMap = q.options.map((opt, index) => ({
        optionId: String.fromCharCode(65 + index),
        optionText: opt.label,
        originalId: opt.id,
      }));

      const correctOptions = optionMap
        .filter((opt) => q.correctAnswers.includes(opt.originalId))
        .map((opt) => opt.optionId);

      return {
        questionType: "MCQ",
        question: q.title,
        answerType:
          q.answerType === "single"
            ? "SINGLE"
            : q.answerType === "multi"
            ? "MULTIPLE"
            : q.answerType === "text"
            ? "TEXT"
            : "NUMBER",
        options:
          q.answerType === "single" || q.answerType === "multi"
            ? optionMap.map(({ optionId, optionText }) => ({
                optionId,
                optionText,
              }))
            : [],
        correctOptions:
          q.answerType === "text" || q.answerType === "number"
            ? q.correctAnswers
            : correctOptions,
        customField: {
          placeholder: q.customField.placeholder,
          helperText: q.customField.helperText,
          required: q.customField.required,
          minLength: q.customField.minLength,
          maxLength: q.customField.maxLength,
        },
        marks: q.marks,
        expanded: q.expanded,
      };
    });

    try {
      let res;

      if (isEdit) {
        res = await dispatch(
          updateQuizQuestionThunk({
            sessionId: sessionId!,
            title,
            duration: Number(duration),
            passMark: Number(passMark),
            input: formattedQuestions,
          })
        ).unwrap();
      } else {
        res = await dispatch(
          addQuizQuestionThunk({
            batchId: batchId!,
            sessionId: selectedSession,
            title,
            duration: Number(duration),
            passMark: Number(passMark),
            input: formattedQuestions,
          })
        ).unwrap();
      }

      if (res?.success === 200) {
        showSuccess(
          res.message ||
            (isEdit ? "Updated successfully" : "Saved successfully")
        );
        reset();
        onClose();
      } else {
        showError(res?.message || "Something went wrong");
      }
    } catch (error) {
      console.error(error);
      showError(
        isEdit ? "Failed to update assessment" : "Failed to save assessment"
      );
    }
  };

  const handleDelete = async () => {
    if (!isEdit) return;

    try {
      setIsDeleting(true);

      const res = await dispatch(deleteQuizThunk(sessionId)).unwrap();

      if (res?.success === 200) {
        await dispatch(getQuestionByBatchThunk({ batchId: batchId!, page: 0, size: 10 }));
        showSuccess(res.message || "Assessment deleted successfully");
        reset();
        onClose();
      } else {
        showError(res?.message || "Something went wrong");
      }
    } catch (error) {
      console.error(error);
      showError("Failed to delete assessment");
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        right: open ? 0 : "-100%",
        width,
        height: "100vh",
        background: "#fff",
        transition: "width 0.3s ease, right 0.4s ease",
        boxShadow: "-4px 0px 15px rgba(0,0,0,0.15)",
        p: 2,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Top bar */}
      <Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <IconButton onClick={handleClose}>
              <HiOutlineChevronDoubleRight size={16} />
            </IconButton>
            <IconButton onClick={() => setExpand((v) => !v)}>
              {expand ? (
                <RiCollapseDiagonal2Line size={16} />
              ) : (
                <CgArrowsExpandLeft size={16} />
              )}
            </IconButton>
            <Typography sx={{ fontSize: 14, ml: 1 }}>
              Batch / Assessment /{" "}
              {isView ? "View" : isEdit ? "Edit" : "Creation"}
            </Typography>
          </Box>

          {/* ✅ Hide all action buttons in view mode */}
          {!isView && (
            <Box sx={{ display: "flex", gap: 1 }}>
              {isEdit ? (
                <CustomButton
                  type="button"
                  variant="outlined"
                  label="Delete"
                  onClick={() => setShowDeleteDialog(true)}
                  disabled={loading}
                />
              ) : (
                <CustomButton
                  type="button"
                  variant="outlined"
                  label="Cancel"
                  onClick={handleClose}
                  disabled={loading}
                />
              )}
              <CustomButton
                type="button"
                variant="contained"
                label={
                  loading
                    ? isEdit
                      ? "Updating..."
                      : "Saving..."
                    : isEdit
                    ? "Update"
                    : "Save"
                }
                disabled={loading}
                onClick={handleSave}
                boxSx={{ whiteSpace: "nowrap", px: "30px" }}
              />
            </Box>
          )}
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Questions header – outside scroll so it stays fixed */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 1.2,
          mt: 1,
        }}
      >
        <Typography
          sx={{
            fontSize: 12,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: 0.6,
          }}
        >
          Questions ({questions.length})
        </Typography>

        {!isView && (
          <Box
            onClick={addQuestion}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 600,
              px: 1.5,
              py: 0.5,
              borderRadius: 1.5,
              border: "1.5px solid #6366f130",
              userSelect: "none",
              "&:hover": { background: "#6366f115" },
            }}
          >
            <Plus size={13} />
            Add Question
          </Box>
        )}
      </Box>

      {/* Scrollable body */}
      <Box sx={{ flex: 1, overflowY: "auto", pr: 0.5 }}>
        {/* Assessment Details */}
        <Paper
          elevation={0}
          sx={{
            border: "1.5px solid #e2e8f0",
            borderRadius: 2.5,
            p: 2,
            mb: 2,
          }}
        >
          <Typography
            sx={{
              fontSize: 12,
              fontWeight: 700,
              mb: 1.5,
              textTransform: "uppercase",
              letterSpacing: 0.6,
            }}
          >
            Assessment Details
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 1.5,
              mb: 1.5,
            }}
          >
            {/* ✅ Read-only in view mode */}
            <TextField
              label="Assessment Title *"
              placeholder="e.g. Mid-term Quiz"
              value={title}
              onChange={(e) => { if (!isView) { setTitle(e.target.value); setErrors((p) => ({ ...p, title: false })); } }}
              size="small"
              fullWidth
              error={errors.title}
              helperText={errors.title ? "Assessment title is required" : ""}
              sx={fieldSx}
              InputProps={{ readOnly: isView }}
            />
            <FormControl size="small" fullWidth sx={fieldSx}>
              <CustomInfiniteAutocomplete
                name="session"
                errors={errors.session ? { session: { message: "Session is required" } } : {}}
                placeholder="Select session *"
                options={sessionList.map((s: any) => ({
                  title: s.id,
                  label: s.sessionName,
                }))}
                multiple={false}
                value={selectedSession}
                onChange={(val: string) => { if (!isView) { setSelectedSession(val); setErrors((p) => ({ ...p, session: false })); } }}
                onInputChange={(value: string) => {
                  if (!isView) console.log("Search:", value);
                }}
                onScrollEnd={loadMoreSessions}
                CustomStyles={fieldSx}
                boxSx={{ position: "relative", zIndex: 1 }}
                disabled={isView} // ✅ Disable autocomplete in view mode
              />
            </FormControl>
          </Box>

          <Box
            sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1.5 }}
          >
            {/* ✅ Read-only in view mode */}
            <TextField
              label="Duration (minutes)"
              type="number"
              value={duration}
              onChange={(e) =>
                !isView &&
                setDuration(e.target.value ? Number(e.target.value) : "")
              }
              size="small"
              fullWidth
              sx={fieldSx}
              inputProps={{ min: 1 }}
              InputProps={{ readOnly: isView }}
            />
            <TextField
              label="Pass Mark (%)"
              type="number"
              value={passMark}
              onChange={(e) =>
                !isView &&
                setPassMark(e.target.value ? Number(e.target.value) : "")
              }
              size="small"
              fullWidth
              sx={fieldSx}
              inputProps={{ min: 0, max: 100 }}
              InputProps={{ readOnly: isView }}
            />
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 1.5,
                border: "1.5px solid #e2e8f0",
                px: 2,
                background: "#fafafe",
              }}
            >
              <Typography sx={{ fontSize: 12, color: "#64748b" }}>
                Total Marks:{" "}
                <Box component="span" sx={{ fontWeight: 700 }}>
                  {totalMarks}
                </Box>
              </Typography>
            </Box>
          </Box>
        </Paper>

        {questions.map((q, i) => (
          <QuestionCard
            key={q.id}
            question={q}
            index={i}
            // ✅ Block onChange, delete, duplicate in view mode
            onChange={(updated) => !isView && updateQuestion(q.id, updated)}
            onDelete={() => !isView && deleteQuestion(q.id)}
            onDuplicate={() => !isView && duplicateQuestion(q.id)}
            canDelete={!isView && questions.length > 1}
            readOnly={isView} // ✅ Pass readOnly prop to QuestionCard
          />
        ))}

        <Box sx={{ height: 32 }} />
      </Box>

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <Box
          sx={{
            position: "fixed",
            inset: 0,
            bgcolor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10000,
          }}
        >
          <Box
            sx={{
              bgcolor: "white",
              borderRadius: 2,
              p: 4,
              width: "500px",
              maxWidth: "90%",
              textAlign: "center",
              position: "relative",
            }}
          >
            <IconButton
              sx={{ position: "absolute", right: 8, top: 8, color: "#666" }}
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              <IoClose size={20} />
            </IconButton>

            <Typography
              sx={{ fontSize: 18, fontWeight: 600, mb: 2, textAlign: "left" }}
            >
              Move to Trash?
            </Typography>

            <Typography
              sx={{ fontSize: 15, color: "#555", mb: 3, textAlign: "left" }}
            >
              Are you sure you want to move{" "}
              <Box
                component="span"
                sx={{ color: "var(--primary)", fontWeight: 600 }}
              >
                {title || "this item"}
              </Box>{" "}
              to trash?
            </Typography>

            <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
              <CustomButton
                type="button"
                variant="outlined"
                label="Cancel"
                onClick={() => setShowDeleteDialog(false)}
                disabled={isDeleting}
                boxSx={{
                  bgcolor: "#f1f3f4",
                  color: "#333",
                  border: "none",
                  px: 3,
                  "&:hover": { bgcolor: "#e8eaed", border: "none" },
                }}
              />
              <CustomButton
                type="button"
                variant="contained"
                label={isDeleting ? "Moving..." : "Move to Trash"}
                onClick={handleDelete}
                disabled={isDeleting}
                boxSx={{
                  bgcolor: "#ff7070",
                  "&:hover": { bgcolor: "#ff5252" },
                  px: 3,
                }}
              />
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
};