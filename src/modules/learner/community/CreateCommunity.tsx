import {
  Box,
  Typography,
  TextField,
  MenuItem,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  IconButton,
} from "@mui/material";
import { HiOutlineChevronDoubleRight } from "react-icons/hi";
import CustomButton from "../../../components/custom/CustomButton";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useAppDispatch } from "../../../app/hook";
import { forminput, inputForm } from "../../../components/custom/CustomStyles";
import { CREATE_CHAT } from "../../../graphql/mutations/chatMutations";
import { communityClient } from "../../../graphql/client";
import { fetchAllBatches } from "../../../features/allBatchesSlice";
import { fetchCommunities } from "../../../features/communitySlice";

interface Props {
  open: boolean;
  onClose: () => void;
}

const CreateCommunity = ({ open, onClose }: Props) => {
  const dispatch = useAppDispatch();
  const { batches } = useSelector((state: any) => state.allBatches);
  const userId = useSelector((state: any) => state.ar.userDetails?.id);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "",
    accessType: "open",
    batchId: "",
    category: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchAllBatches({ page: 0, size: 100 }));
  }, [dispatch]);

  const handleClose = () => {
    setFormData({
      name: "",
      description: "",
      type: "",
      accessType: "open",
      batchId: "",
      category: "",
    });
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const input: any = {
        title: formData.name,
        description: formData.description,
        type:
          formData.type === "COURSE_GROUP"
            ? "COURSE_GROUP"
            : formData.accessType,
        category: formData.category,
      };

      if (formData.type === "COURSE_GROUP" && formData.batchId) {
        input.batchId = formData.batchId;
      }

      const { data } = await communityClient.mutate({
        mutation: CREATE_CHAT,
        variables: { input },
        refetchQueries: ["getAllChat"],
        context: { headers: { "x-user-id": userId } },
      });
      console.log("Community created:", data.createChat);
      dispatch(fetchCommunities());
      handleClose();
    } catch (error) {
      console.error("Error creating community:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        right: open ? 0 : "-100%",
        width: "40%",
        height: "100vh",
        background: "#fff",
        transition: "0.4s",
        boxShadow: "-4px 0px 15px rgba(0,0,0,0.15)",
        p: 3,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <IconButton onClick={handleClose}>
            <HiOutlineChevronDoubleRight size={16} />
          </IconButton>
          <Typography sx={{ fontSize: 16, ml: 1, fontWeight: 600 }}>
            Create Learning Community
          </Typography>
        </Box>
      </Box>

      <form
        onSubmit={handleSubmit}
        style={{ flex: 1, display: "flex", flexDirection: "column" }}
      >
        <Box sx={{ flex: 1, overflowY: "auto", pr: 1, px: 1 }}>
          {/* Community Name */}
          <Box
            sx={{
              ...forminput,
              display: "flex",
              gap: 1,
              alignItems: "flex-start",
              mb: 2,
            }}
          >
            <Typography
              sx={{
                flex: "0 0 150px",
                fontWeight: 500,
                mt: 0.5,
                fontSize: "0.875rem",
              }}
            >
              Community Name <span style={{ color: "red" }}>*</span>
            </Typography>
            <Box sx={{ flex: 1 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Enter community name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                sx={{
                  ...inputForm,
                  "& .MuiInputBase-root": { height: 36, fontSize: "0.875rem" },
                }}
              />
            </Box>
          </Box>

          {/* Description */}
          <Box
            sx={{
              ...forminput,
              display: "flex",
              gap: 1,
              alignItems: "flex-start",
              mb: 2,
            }}
          >
            <Typography
              sx={{
                flex: "0 0 150px",
                fontWeight: 500,
                mt: 0.5,
                fontSize: "0.875rem",
              }}
            >
              Description <span style={{ color: "red" }}>*</span>
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              size="small"
              placeholder="Enter description (max 50 characters)"
              value={formData.description}
              onChange={(e) => {
                if (e.target.value.length <= 50) {
                  setFormData({ ...formData, description: e.target.value });
                }
              }}
              required
              helperText={`${formData.description.length}/50`}
              sx={{
                ...inputForm,
                "& .MuiInputBase-root": {
                  fontSize: "14px",
                  padding: "8px 12px",
                },
                "& .MuiInputBase-input": {
                  padding: 0,
                },
              }}
            />
          </Box>

          {/* Category */}
          <Box
            sx={{
              ...forminput,
              display: "flex",
              gap: 1,
              alignItems: "flex-start",
              mb: 2,
            }}
          >
            <Typography
              sx={{
                flex: "0 0 150px",
                fontWeight: 500,
                mt: 0.5,
                fontSize: "0.875rem",
              }}
            >
              Category <span style={{ color: "red" }}>*</span>
            </Typography>
            <Box sx={{ flex: 1 }}>
              <TextField
                fullWidth
                select
                size="small"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                required
                sx={{
                  ...inputForm,
                  "& .MuiInputBase-root": { height: 36, fontSize: "0.875rem" },
                }}
                SelectProps={{
                  displayEmpty: true,
                  renderValue: (selected) => {
                    if (!selected) {
                      return (
                        <span style={{ color: "#9CA3AF" }}>
                          Select Category
                        </span>
                      );
                    }
                    return String(selected).replace(/_/g, " ");
                  },
                  MenuProps: {
                    disablePortal: true,
                    sx: { zIndex: 10000 },
                  },
                }}
              >
                <MenuItem disabled value="">
                  Select Category
                </MenuItem>
                <MenuItem value="AI">AI</MenuItem>
                <MenuItem value="Design">Design</MenuItem>
                <MenuItem value="Business">Business</MenuItem>
                <MenuItem value="Robotics">Robotics</MenuItem>
                <MenuItem value="Product_Management">
                  Product Management
                </MenuItem>
                <MenuItem value="Finance">Finance</MenuItem>
                <MenuItem value="AR/VR">AR/VR</MenuItem>
              </TextField>
            </Box>
          </Box>

          {/* Type */}
          <Box
            sx={{
              ...forminput,
              display: "flex",
              gap: 1,
              alignItems: "flex-start",
              mb: 2,
            }}
          >
            <Typography
              sx={{
                flex: "0 0 150px",
                fontWeight: 500,
                mt: 0.5,
                fontSize: "0.875rem",
              }}
            >
              Type <span style={{ color: "red" }}>*</span>
            </Typography>
            <Box sx={{ flex: 1 }}>
              <TextField
                fullWidth
                select
                size="small"
                value={formData.type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    type: e.target.value,
                    batchId: "",
                  })
                }
                required
                sx={{
                  ...inputForm,
                  "& .MuiInputBase-root": { height: 36, fontSize: "0.875rem" },
                }}
                SelectProps={{
                  displayEmpty: true,
                  renderValue: (selected) => {
                    if (!selected) {
                      return (
                        <span style={{ color: "#9CA3AF" }}>Select Type</span>
                      );
                    }
                    return selected === "public" ? "Public" : "Batch";
                  },
                  MenuProps: {
                    disablePortal: true,
                    sx: { zIndex: 10000 },
                  },
                }}
              >
                <MenuItem disabled value="">
                  Select Type
                </MenuItem>
                <MenuItem value="public">Public</MenuItem>
                <MenuItem value="COURSE_GROUP">Batch</MenuItem>
              </TextField>
            </Box>
          </Box>

          {/* Conditional: Public - Access Type */}
          {formData.type === "public" && (
            <Box
              sx={{
                ...forminput,
                display: "flex",
                gap: 1,
                alignItems: "flex-start",
                mb: 2,
              }}
            >
              <Typography
                sx={{
                  flex: "0 0 150px",
                  fontWeight: 500,
                  mt: 0.5,
                  fontSize: "0.875rem",
                }}
              >
                Access Type <span style={{ color: "red" }}>*</span>
              </Typography>
              <Box sx={{ flex: 1 }}>
                <FormControl component="fieldset">
                  <RadioGroup
                    value={formData.accessType}
                    onChange={(e) =>
                      setFormData({ ...formData, accessType: e.target.value })
                    }
                  >
                    <FormControlLabel
                      value="FREE_GROUP"
                      control={<Radio size="small" />}
                      label="Open"
                    />
                    <FormControlLabel
                      value="MODERATED_GROUP"
                      control={<Radio size="small" />}
                      label="Request Access"
                    />
                  </RadioGroup>
                </FormControl>
              </Box>
            </Box>
          )}

          {/* Conditional: Batch - Batch Selection */}
          {formData.type === "COURSE_GROUP" && (
            <Box
              sx={{
                ...forminput,
                display: "flex",
                gap: 1,
                alignItems: "flex-start",
                mb: 2,
              }}
            >
              <Typography
                sx={{
                  flex: "0 0 150px",
                  fontWeight: 500,
                  mt: 0.5,
                  fontSize: "0.875rem",
                }}
              >
                Select Batch <span style={{ color: "red" }}>*</span>
              </Typography>
              <Box sx={{ flex: 1 }}>
                <TextField
                  fullWidth
                  select
                  size="small"
                  value={formData.batchId}
                  onChange={(e) =>
                    setFormData({ ...formData, batchId: e.target.value })
                  }
                  required
                  sx={{
                    ...inputForm,
                    "& .MuiInputBase-root": {
                      height: 36,
                      fontSize: "0.875rem",
                    },
                  }}
                  SelectProps={{
                    displayEmpty: true,
                    renderValue: (selected) => {
                      if (!selected) {
                        return (
                          <span style={{ color: "#9CA3AF" }}>Select Batch</span>
                        );
                      }
                      const batch = batches.find((b: any) => b.id === selected);
                      return batch?.batchName || selected;
                    },
                    MenuProps: {
                      disablePortal: true,
                      PaperProps: {
                        style: {
                          maxHeight: 300,
                          maxWidth: 300,
                        },
                      },
                      sx: { zIndex: 10000 },
                    },
                  }}
                >
                  <MenuItem disabled value="">
                    Select Batch
                  </MenuItem>
                  {batches.map((batch: any) => (
                    <MenuItem key={batch.id} value={batch.id}>
                      {batch.batchName}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
            </Box>
          )}
        </Box>

        {/* Footer Buttons */}
        <Box
          sx={{
            display: "flex",
            gap: 2,
            pt: 2,
            borderTop: "1px solid #e0e0e0",
          }}
        >
          <CustomButton
            type="button"
            variant="outlined"
            label="Cancel"
            onClick={handleClose}
            boxSx={{
              flex: 1,
              "&:hover": {
                backgroundColor: "transparent",
                color: "inherit",
                borderColor: "inherit",
              },
            }}
          />
          <CustomButton
            type="submit"
            variant="contained"
            label={loading ? "Creating..." : "Create Community"}
            boxSx={{ flex: 1 }}
            disabled={loading}
          />
        </Box>
      </form>
    </Box>
  );
};

export default CreateCommunity;
