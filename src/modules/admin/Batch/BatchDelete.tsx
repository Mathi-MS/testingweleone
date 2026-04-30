import { createPortal } from "react-dom";
import { Box, Typography, IconButton } from "@mui/material";
import { IoClose } from "react-icons/io5";
import CustomButton from "../../../components/custom/CustomButton";

interface DeleteFileDialogProps {
  open: boolean;
  batchId?: string;
  batchName?: string;
  status?: string;
  isUpdating?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteFileDialog({
  open,
  batchId,
  batchName,
  status,
  isUpdating = false,
  onClose,
  onConfirm,
}: DeleteFileDialogProps) {
  if (!open) return null;

  return createPortal(
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
          width: "800px",
          maxWidth: "40%",
          textAlign: "center",
          position: "relative",
        }}
      >
        {/* Close button */}
        <IconButton
          sx={{ position: "absolute", right: 8, top: 8, color: "#666" }}
          onClick={onClose}
        >
          <IoClose size={20} />
        </IconButton>

        {/* Title */}
        <Typography
          sx={{
            fontSize: 16,
            fontWeight: 600,
            mb: 3,
            textAlign: "left",
            display: "flex",
            gap: 1,
          }}
        >
          <Box component="span" sx={{ color: "var(--primary)" }}>
            {batchId || "-"}
          </Box>
          <Box component="span" sx={{ color: "#333" }}>
            : Delete this batch?
          </Box>
        </Typography>

        {/* Description */}
        <Typography
          sx={{ fontSize: 15, color: "#333", mb: 2, fontWeight: 500 }}
        >
          Are you sure you want to move this{" "}
          <Box
            component="span"
            sx={{ color: "var(--primary)", fontWeight: 600 }}
          >
            {batchName || "Batch"}
          </Box>{" "}
          to Trash? You can restore it later from the Trash if needed.
        </Typography>

        {/* Optional Status */}
        {status && (
          <Typography sx={{ fontSize: 13, color: "#777", mb: 4 }}>
            Status: {status}
          </Typography>
        )}

        {/* Buttons */}
        <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
          <CustomButton
            type="button"
            variant="outlined"
            label="Cancel"
            onClick={onClose}
            disabled={isUpdating}
            boxSx={{
              bgcolor: "#f1f3f4",
              color: "#333",
              border: "none",
              px: 4,
              width: "max-content",
              "&:hover": { bgcolor: "#e8eaed", border: "none" },
            }}
          />

          <CustomButton
            type="button"
            variant="contained"
            label={isUpdating ? "Moving..." : "Move to Trash"}
            onClick={onConfirm}
            disabled={isUpdating}
            boxSx={{
              bgcolor: "#ff7070",
              "&:hover": { bgcolor: "#ff5252" },
              px: 4,
              width: "max-content",
            }}
          />
        </Box>
      </Box>
    </Box>,
    document.body
  );
}