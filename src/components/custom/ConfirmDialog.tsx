import { Dialog, DialogContent, Box, Typography, IconButton } from "@mui/material";
import CustomButton from "./CustomButton";
import { IoClose } from "react-icons/io5";
import { RiErrorWarningLine } from "react-icons/ri";

interface ConfirmDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    loading?: boolean;
}

const ConfirmDialog = ({
    open,
    onClose,
    onConfirm,
    title,
    message,
    confirmLabel = "Delete",
    cancelLabel = "Cancel",
    loading = false,
}: ConfirmDialogProps) => {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="xs"
            PaperProps={{
                sx: {
                    borderRadius: "12px",
                    padding: "16px",
                },
            }}
        >
            <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 1 }}>
                <IconButton onClick={onClose} size="small">
                    <IoClose />
                </IconButton>
            </Box>

            <DialogContent sx={{ p: 0, textAlign: "center" }}>
                <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
                    <Box
                        sx={{
                            width: 48,
                            height: 48,
                            borderRadius: "50%",
                            backgroundColor: "#FEE4E2",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <RiErrorWarningLine size={24} color="#D92D20" />
                    </Box>
                </Box>

                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    {title}
                </Typography>
                <Typography sx={{ color: "#667085", fontSize: "14px", mb: 4 }}>
                    {message}
                </Typography>

                <Box sx={{ display: "flex", gap: 2 }}>
                    <CustomButton
                        type="button"
                        variant="outlined"
                        label={cancelLabel}
                        onClick={onClose}
                        sx={{
                            flex: 1,
                            borderRadius: "8px",
                            borderColor: "#D0D5DD",
                            color: "#344054",
                            textTransform: "none",
                            background: "#fff",
                            "&:hover": {
                                borderColor: "#D0D5DD",
                                background: "#f9f9fb"
                            }
                        }}
                    />
                    <CustomButton
                        type="button"
                        variant="contained"
                        label={confirmLabel}
                        onClick={onConfirm}
                        loading={loading}
                        sx={{
                            flex: 1,
                            borderRadius: "8px",
                            background: "#D92D20",
                            "&:hover": { background: "#B42318" },
                            textTransform: "none",
                        }}
                    />
                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default ConfirmDialog;
