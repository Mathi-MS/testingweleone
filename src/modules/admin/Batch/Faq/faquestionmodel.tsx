import TextField from "@mui/material/TextField";
import {
  Box,
  Divider,
  IconButton,
  Typography,
  Chip,
  Tooltip,
  Fade,
} from "@mui/material";
import { Plus, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { HiOutlineChevronDoubleRight } from "react-icons/hi2";
import { RiCollapseDiagonal2Line } from "react-icons/ri";
import { CgArrowsExpandLeft } from "react-icons/cg";
import { createFaqThunk, deleteFaqThunk, getFaqByIdThunk, updateFaqThunk } from "../../../../features/FqaSlice";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../../app/store";
import CustomButton from "../../../../components/custom/CustomButton";
import { showSuccess, showError } from "../../../../components/ui/Toast";
import { IoClose } from "react-icons/io5";
import { getQuestionByBatchThunk } from "../../../../features/quizSlice";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FAQItem {
  question: string;
  answer: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  batchId?: string | number;
  isEdit?: boolean;
  initialFaqs?: FAQItem[];
  itemId?: string | number;
  onSave?: (faqs: FAQItem[]) => void;
}

// ─── FAQ Card ─────────────────────────────────────────────────────────────────

interface FAQCardProps {
  faq: FAQItem;
  index: number;
  showRemove: boolean;
  submitClicked: boolean;
  onChange: (index: number, field: "question" | "answer", value: string) => void;
  onRemove: (index: number) => void;
}

const FAQCard = ({
  faq,
  index,
  showRemove,
  submitClicked,
  onChange,
  onRemove,
}: FAQCardProps) => {
  const [focused, setFocused] = useState<"question" | "answer" | null>(null);

  const questionError = submitClicked && !faq.question.trim();
  const answerError = submitClicked && !faq.answer.trim();

  return (
    <Fade in timeout={250}>
      <Box
        sx={{
          mb: 2,
          p: 2,
          border: "1px solid",
          borderColor:
            questionError || answerError
              ? "#ef4444"
              : focused
              ? "var(--primary)"
              : "#e5e7eb",
          borderRadius: "12px",
          position: "relative",
          background: "#fff",
          transition: "border-color 0.2s ease, box-shadow 0.2s ease",
          boxShadow:
            questionError || answerError
              ? "0 0 0 3px rgba(239,68,68,0.08)"
              : focused
              ? "0 0 0 3px rgba(99,102,241,0.08)"
              : "none",
        }}
      >
        {/* Card header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            mb: 1.5,
          }}
        >
          <Chip
            label={`Q ${index + 1}`}
            size="small"
            sx={{
              height: 22,
              fontSize: "11px",
              fontWeight: 600,
              background: "#ede9fe",
              color: "var(--primary)",
              border: "none",
              borderRadius: "6px",
              "& .MuiChip-label": { px: 1 },
            }}
          />
          <Typography sx={{ fontSize: "12px", color: "#9ca3af", flex: 1 }}>
            FAQ item {index + 1}
          </Typography>

          {showRemove && (
            <Tooltip title="Remove this FAQ" placement="top">
              <IconButton
                size="small"
                onClick={() => onRemove(index)}
                sx={{
                  width: 26,
                  height: 26,
                  color: "#9ca3af",
                  border: "1px solid #e5e7eb",
                  borderRadius: "6px",
                  "&:hover": {
                    background: "#fef2f2",
                    color: "#ef4444",
                    borderColor: "#fca5a5",
                  },
                  transition: "all 0.15s ease",
                }}
              >
                <Trash2 size={13} />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        {/* Question */}
        <Box sx={{ mb: 1.5 }}>
          <Typography
            sx={{
              fontSize: "10px",
              fontWeight: 600,
              color: questionError ? "#ef4444" : "#9ca3af",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              mb: 0.5,
              transition: "color 0.2s ease",
            }}
          >
            Question 
          </Typography>
          <TextField
            fullWidth
            size="small"
            placeholder="Type your question here…"
            value={faq.question}
            onFocus={() => setFocused("question")}
            onBlur={() => setFocused(null)}
            onChange={(e) => onChange(index, "question", e.target.value)}
            error={questionError}
            helperText={questionError ? "Question is required" : ""}
            sx={{
              "& .MuiOutlinedInput-root": {
                fontSize: "13px",
                borderRadius: "8px",
                background: "#f9fafb",
                "& fieldset": {
                  borderColor: questionError ? "#ef4444" : "#bbf7d0",
                },
                "&:hover fieldset": {
                  borderColor: questionError ? "#ef4444" : "#bbf7d0",
                },
                "&.Mui-focused fieldset": {
                  borderColor: questionError ? "#ef4444" : "#bbf7d0",
                  borderWidth: "1px",
                },
              },
              "& .MuiFormHelperText-root": {
                fontSize: "11px",
                mt: 0.5,
                ml: 0,
              },
            }}
          />
        </Box>

        {/* Answer */}
        <Box>
          <Typography
            sx={{
              fontSize: "10px",
              fontWeight: 600,
              color: answerError ? "#ef4444" : "#9ca3af",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              mb: 0.5,
              transition: "color 0.2s ease",
            }}
          >
            Answer 
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="Provide a clear, concise answer…"
            value={faq.answer}
            onFocus={() => setFocused("answer")}
            onBlur={() => setFocused(null)}
            onChange={(e) => onChange(index, "answer", e.target.value)}
            error={answerError}
            helperText={answerError ? "Answer is required" : ""}
            sx={{
              "& .MuiOutlinedInput-root": {
                fontSize: "13px",
                borderRadius: "8px",
                background: "#f9fafb",
                "& fieldset": {
                  borderColor: answerError ? "#ef4444" : "#bbf7d0",
                },
                "&:hover fieldset": {
                  borderColor: answerError ? "#ef4444" : "#bbf7d0",
                },
                "&.Mui-focused fieldset": {
                  borderColor: answerError ? "#ef4444" : "#bbf7d0",
                  borderWidth: "1px",
                },
              },
              "& .MuiFormHelperText-root": {
                fontSize: "11px",
                mt: 0.5,
                ml: 0,
              },
            }}
          />
        </Box>
      </Box>
    </Fade>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export const Faquestionmodel = ({
  open,
  onClose,
  batchId,
  isEdit = false,
  initialFaqs,
  itemId,
  onSave,
}: Props) => {

  
  const [expand, setExpand] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchingFaq, setFetchingFaq] = useState(false);
  const [submitClicked, setSubmitClicked] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const width = expand ? "80%" : "50%";

  const [faqs, setFaqs] = useState<FAQItem[]>([{ question: "", answer: "" }]);

  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (!open) return;
    setSubmitClicked(false);
    if (isEdit && itemId) {
      setFetchingFaq(true);
      dispatch(getFaqByIdThunk({ id: String(itemId) }))
        .unwrap()
        .then((res) => {
          setFaqs([{ question: res.data.question, answer: res.data.answer }]);
        })
        .catch(() => setFaqs([{ question: "", answer: "" }]))
        .finally(() => setFetchingFaq(false));
    } else {
      setFaqs(initialFaqs ?? [{ question: "", answer: "" }]);
    }
  }, [open, isEdit, itemId]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleClose = () => {
    setSubmitClicked(false); 
    setFaqs([{ question: "", answer: "" }]);
    onClose();
  };

  const addFAQ = () => {
    setSubmitClicked(false); // reset so new card doesn't immediately show errors
    setFaqs((prev) => [...prev, { question: "", answer: "" }]);
  };

  const removeFAQ = (index: number) => {
    setFaqs((prev) => prev.filter((_, i) => i !== index));
  };

  const handleChange = (
    index: number,
    field: "question" | "answer",
    value: string
  ) => {
    setFaqs((prev) =>
      prev.map((faq, i) => (i === index ? { ...faq, [field]: value } : faq))
    );
  };

  const handleDelete = async () => {
    if (!isEdit) return;

    try {
      setIsDeleting(true);

      const res = await dispatch(deleteFaqThunk({ id: itemId })).unwrap();

      if (res?.success === 200) {
        showSuccess(res.message || "FAQ deleted successfully");
        await dispatch(getQuestionByBatchThunk({ batchId: batchId!, page: 0, size: 10 }));
        setShowDeleteDialog(false);
        onClose();
      } else {
        showError(res?.message || "Something went wrong");
      }
    } catch (error) {
      console.error(error);
      showError("Failed to delete FAQ");
    } finally {
      setIsDeleting(false);
    }
  };
const handleSave = async () => {
  setSubmitClicked(true);

  const isValid = faqs.every((f) => f.question.trim() && f.answer.trim());
  if (!isValid) return;

  setLoading(true);

  try {
    if ( itemId ) {
      // ── UPDATE ──────────────────────────────────────────────────
      const faq = faqs[0]; // edit mode always has a single FAQ
      const res = await dispatch(
        updateFaqThunk({
          id: String(itemId),
          input: {
            question: faq.question,
            answer: faq.answer,
          },
        })
      ).unwrap();

      if (res?.message) showSuccess(res.message);
      onSave?.(faqs);
      handleClose();

    } else {
      // ── CREATE ──────────────────────────────────────────────────
      if (!batchId) {
        alert("Batch ID missing");
        return;
      }

      const res = await dispatch(
        createFaqThunk({
          batchId: String(batchId),
          input: faqs.map((faq) => ({ question: faq.question, answer: faq.answer })) as any,
        })
      ).unwrap();

      if (res?.message) showSuccess(res.message);

      onSave?.(faqs);
      handleClose();
    }
  } catch (err: any) {
    showError(err?.message || "Something went wrong");
  } finally {
    setLoading(false);
  }
};



  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Drawer */}
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
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <IconButton onClick={handleClose}>
              <HiOutlineChevronDoubleRight size={16} color="var(--black)" />
            </IconButton>
            <IconButton onClick={() => setExpand(!expand)}>
              {expand ? (
                <RiCollapseDiagonal2Line size={18} color="var(--black)" />
              ) : (
                <CgArrowsExpandLeft size={14} color="var(--black)" />
              )}
            </IconButton>
            <Typography
              sx={{
                fontSize: "14px",
                fontFamily: "DM-Semibold !important",
                color: "var(--textlight)",
              }}
            >
         Batch / Frequently Asked Questions / {itemId ? "Edit" : "Creation"}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 1 }}>
            {itemId ? (
              <CustomButton
                type="button"
                variant="outlined"
                label="Delete"
                disabled={loading}
                onClick={() => setShowDeleteDialog(true)}
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
              label={loading ? "Saving..." : itemId ? "Update" : "Save"}
              onClick={handleSave}
              disabled={loading}
            />
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* ── Body ───────────────────────────────────────────────────────── */}
        {fetchingFaq ? (
          <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", fontSize: "13px" }}>
            Loading...
          </Box>
        ) : (
        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            px: 2.5,
            py: 2,
            "&::-webkit-scrollbar": { width: "4px" },
            "&::-webkit-scrollbar-track": { background: "transparent" },
            "&::-webkit-scrollbar-thumb": {
              background: "#c4b5fd",
              borderRadius: "4px",
            },
          }}
        >
          {faqs.length === 0 ? (
            <Box
              sx={{
                textAlign: "center",
                py: 6,
                color: "#bbf7d0",
                fontSize: "13px",
              }}
            >
              No FAQ items yet. Click "Add Question" below.
            </Box>
          ) : (
            faqs.map((faq, index) => (
              <FAQCard
                key={index}
                faq={faq}
                index={index}
                showRemove={faqs.length > 1}
                submitClicked={submitClicked}
                onChange={handleChange}
                onRemove={removeFAQ}
              />
            ))
          )}

          {/* Add FAQ button */}
          <Box
            onClick={addFAQ}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
              py: 1.5,
              border: "1.5px dashed #6366f130",
              borderRadius: "12px",
              cursor: "pointer",
              color: "var(--primary)",
              fontSize: "13px",
              fontWeight: 500,
              background: "transparent",
              transition: "all 0.15s ease",
              mt: 1,
              "&:hover": {
                background: "#bbf7d0",
                borderColor: "#bbf7d0",
              },
            }}
          >
            <Plus size={15} />
            Add Question
          </Box>
        </Box>
        )}
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
                        { "this Question"}
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
    </>
  );
};

export default Faquestionmodel;