import {
  Box,
  Dialog,
  DialogContent,
  Typography,
  IconButton,
  Avatar,
  Button
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

interface Props {
  open: boolean;
  onClose: () => void;
  responseData: any;
}

const UploadSummaryDialog = ({ open, onClose, responseData }: Props) => {
  if (!responseData) return null;

  const {
    totalCount,
    mappedCount,
    failedCount,
    notFoundLearners,
    alreadyMappedLearners,
    inactiveLearners,
    rowErrors,
  } = responseData;

  return (
    <Dialog open={open} onClose={onClose} maxWidth={false}       
  PaperProps={{
    sx: {
      width: "50%",      
      borderRadius: "10px",
    },
  }}
 sx={{zIndex:"999999999999999999999999999"}}>
      <DialogContent sx={{ p: 4 }}>
        {/* Header */}
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography sx={{ fontSize: 16, fontWeight: 600 }}>
            Bulk Upload
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Success Message */}
        <Typography
          sx={{
            textAlign: "center",
            color: "#22C55E",
            fontSize: 16,
            fontWeight: 600,
            mt: 2,
          }}
        >
          {mappedCount} out of {totalCount} learners uploaded Successfully
        </Typography>

        {/* Failed label */}
        <Typography sx={{ mt: 3, fontSize: 14, fontWeight: 600 }}>
          Failed to upload:
        </Typography>

        {/* Failed Box */}
        <Box
          sx={{
            border: "1px solid #EF4444",
            borderRadius: "8px",
            mt: 1,
            px: 3,
            py: 2,
            backgroundColor: "#FFF5F5",
          }}
        >
          {
              inactiveLearners && inactiveLearners.length > 0 && (
                <Typography
            sx={{
              textAlign: "center",
              fontSize: 14,
              fontWeight: 600,
              mb: 2,
            }}
          >
            Inactive Learners
          </Typography>
              )
            }

          {/* Learners Grid */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 2,
            }}
          >
            {inactiveLearners.map((id: any, index: number) => (
              <Box
                key={index}
                sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
              >
                <Avatar sx={{ width: 28, height: 28 }} />
                <Box>
                  <Typography sx={{ fontSize: 13, fontWeight: 500 }}>
                    {id?.learnerName || "-"}
                  </Typography>
                  <Typography sx={{ fontSize: 11, color: "#6B7280" }}>
                    {id?.learnerId || "-"}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
          {
              notFoundLearners && notFoundLearners.length > 0 && (
                <Typography
            sx={{
              textAlign: "center",
              fontSize: 14,
              fontWeight: 600,
              mb: 2,
            }}
          >
            Learners Not Found
          </Typography>
              )
            }

          {/* Learners Grid */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 2,
            }}
          >
            {notFoundLearners && notFoundLearners.map((id: any, index: number) => (
              <Box
                key={index}
                sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
              >
                <Avatar sx={{ width: 28, height: 28 }} />
                <Box>
                  <Typography sx={{ fontSize: 13, fontWeight: 500 }}>
                    {id?.learnerName || "-"}
                  </Typography>
                  <Typography sx={{ fontSize: 11, color: "#6B7280" }}>
                    {id?.learnerId || "-"}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
          {
              alreadyMappedLearners && alreadyMappedLearners.length > 0 && (
                <Typography
            sx={{
              textAlign: "center",
              fontSize: 14,
              fontWeight: 600,
              mb: 2,
            }}
          >
            Already Mapped Learners
          </Typography>
              )
            }
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 2,
            }}
          >
            {alreadyMappedLearners && alreadyMappedLearners?.map((id: any, index: number) => (
              <Box
                key={index}
                sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
              >
                <Avatar sx={{ width: 28, height: 28 }} />
                <Box>
                  <Typography sx={{ fontSize: 13, fontWeight: 500 }}>
                    {id?.learnerName || "-"}
                  </Typography>
                  <Typography sx={{ fontSize: 11, color: "#6B7280" }}>
                    {id?.learnerId || "-"}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
                    {/* Row Errors */}
        {rowErrors && rowErrors.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography sx={{ fontSize: 14, fontWeight: 600, mb: 2, color: "#EF4444" }}>
              Row Errors:
            </Typography>
            <Box sx={{ 
              backgroundColor: "#FEF2F2", 
              border: "1px solid #FECACA", 
              borderRadius: "8px", 
              p: 2 
            }}>
              {rowErrors.map((error: string, index: number) => (
                <Typography key={index} sx={{ fontSize: 12, color: "#DC2626", mb: 0.5 }}>
                  • {error}
                </Typography>
              ))}
            </Box>
          </Box>
        )}
        {/* Actions */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 2,
            mt: 4,
          }}
        >
          <Button
            variant="outlined"
            sx={{
              borderColor: "#22C55E",
              color: "#22C55E",
              px: 4,
              fontSize: 12,
              borderRadius: "8px",
            }}
            onClick={onClose}
          >
            Back
          </Button>

          <Button
            variant="contained"
            sx={{
              backgroundColor: "#22C55E",
              px: 4,
              borderRadius: "8px",
              fontSize: 12,
              "&:hover": {
                backgroundColor: "#16A34A",
              },
            }}
            onClick={onClose}
          >
            Got it
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default UploadSummaryDialog;
