import {
  Box,
  Typography,
  IconButton,
  Divider,
  TextField,
  InputAdornment,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import { HiOutlineChevronDoubleRight } from "react-icons/hi";
import { RiCollapseDiagonal2Line } from "react-icons/ri";
import { CgArrowsExpandLeft } from "react-icons/cg";
import { IoSearchOutline } from "react-icons/io5";
import { ChevronDown, Plus, Trash } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useDispatch } from "react-redux";
import CustomButton from "../../../../components/custom/CustomButton";
import { CustomInput } from "../../../../components/custom/CustomInput";
import { forminput, inputForm } from "../../../../components/custom/CustomStyles";
import { addBatchModule } from "../../../../features/batchSlice";
import { showSuccess, showError } from "../../../../components/ui/Toast";
import { fetchBatchModules } from "../../../../features/batch/batchModuleSlice";

interface Props {
  open: boolean;
  onClose: () => void;
  batchId?: string;
}

const ModuleSchema = z.object({
  weeks: z.array(
    z.object({
      modules: z.array(
        z.object({
          title: z.string().min(1, "Module title is required"),
          description: z.string().min(1, "Description is required"),
        })
      ).min(1, "At least one module is required"),
    })
  ).min(1, "At least one week is required"),
});

type FormValues = z.infer<typeof ModuleSchema>;

const ModuleModel = ({ open, onClose, batchId }: Props) => {
  const [expand, setExpand] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(ModuleSchema),
    defaultValues: {
      weeks: [{ modules: [{ title: "", description: "" }] }],
    },
  });

  const weeks = watch("weeks") || [];

  const width = expand ? "80%" : "50%";

  const handleClose = () => {
    reset();
    setSearchTerm("");
    onClose();
  };

  const handleSave = handleSubmit(async (data) => {
    if (!batchId) return;
    
    setLoading(true);
    const input = data.weeks.map((week, index) => ({
      weekName: `Week ${index + 1}`,
      moduleDetails: week.modules.map(module => ({
        moduleName: module.title,
        moduleDescription: module.description
      }))
    }));

    const result = await dispatch(addBatchModule({ batchId, input }) as any);
    
    if (result.payload?.success === 200) {
      showSuccess("Modules added successfully");
      dispatch(fetchBatchModules(batchId) as any);
      handleClose();
    } else {
      showError(result.payload?.message || "Failed to add modules");
    }
    setLoading(false);
  });

  const addWeek = () => {
    setValue("weeks", [...weeks, { modules: [{ title: "", description: "" }] }]);
  };

  const addModule = (weekIndex: number) => {
    const updatedWeeks = [...weeks];
    updatedWeeks[weekIndex].modules.push({ title: "", description: "" });
    setValue("weeks", updatedWeeks);
  };

  const removeModule = (weekIndex: number, moduleIndex: number) => {
    const updatedWeeks = [...weeks];
    updatedWeeks[weekIndex].modules.splice(moduleIndex, 1);
    setValue("weeks", updatedWeeks);
  };

  const updateModuleField = (weekIndex: number, moduleIndex: number, field: "title" | "description", value: string) => {
    setValue(`weeks.${weekIndex}.modules.${moduleIndex}.${field}`, value);
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
        transition: "0.4s",
        boxShadow: "-4px 0px 15px rgba(0,0,0,0.15)",
        p: 2,
        zIndex: 9999,
      }}
    >
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
            <IconButton onClick={() => setExpand(!expand)}>
              {expand ? (
                <RiCollapseDiagonal2Line size={16} />
              ) : (
                <CgArrowsExpandLeft size={16} />
              )}
            </IconButton>
            <Typography sx={{ fontSize: 14, ml: 1 }}>
              Batch / Module / Creation
            </Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 1 }}>
            <CustomButton
              type="button"
              variant="outlined"
              label="Cancel"
              onClick={handleClose}
            />
            <CustomButton
              type="submit"
              variant="contained"
              label={loading ? "Saving..." : "Save"}
              disabled={loading}
              onClick={handleSave}
              boxSx={{ whiteSpace: "nowrap", px: "30px" }}
            />
          </Box>
        </Box>
      </Box>
      <Divider sx={{ my: 2 }} />
      <Box
        sx={{
          mt: 2,
          maxHeight: "calc(100vh - 160px)",
          overflowY: "auto",
          pr: 1,
        }}
      >

        {/* Module form fields will go here */}
        <Box sx={{ mb: 2 ,display:"flex",justifyContent:"end"}}>
          <CustomButton
            type="button"
            variant="contained"
            label="Add Week"
            onClick={addWeek}
            boxSx={{ width: "max-content", mb: 2, }}
          />
        </Box>

        {weeks.map((week, weekIndex) => (
          <Accordion key={weekIndex} defaultExpanded sx={{ mb: 2, boxShadow: 1 }}>
            <AccordionSummary expandIcon={<ChevronDown size={20} />}>
              <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
                Week {weekIndex + 1}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {week.modules.map((module: any, moduleIndex: number) => (
                  <Box key={moduleIndex} sx={{ p: 2, border: "1px solid #E5E7EB", borderRadius: 1 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                      <Typography sx={{ fontSize: 12, fontWeight: 600 }}>Module {moduleIndex + 1}</Typography>
                      {week.modules.length > 1 && (
                        <IconButton size="small" onClick={() => removeModule(weekIndex, moduleIndex)}>
                          <Trash size={16} color="#EF4444" />
                        </IconButton>
                      )}
                    </Box>
                    <Box sx={forminput}>
                      <Typography variant="h3">Module Title</Typography>
                      <CustomInput
                        name={`weeks.${weekIndex}.modules.${moduleIndex}.title`}
                        register={register}
                        errors={errors}
                        boxSx={inputForm}
                      />
                    </Box>
                    <Box sx={{ ...forminput, alignItems: "start",mt:2 }}>
                      <Typography variant="h3">Description</Typography>
                      <Box sx={{ ...inputForm }}>
                        <ReactQuill
                          theme="snow"
                          value={module.description}
                          onChange={(content) => updateModuleField(weekIndex, moduleIndex, "description", content)}
                        />
                        {errors.weeks?.[weekIndex]?.modules?.[moduleIndex]?.description && (
                          <Typography color="error" variant="caption">
                            {errors.weeks[weekIndex].modules[moduleIndex].description.message}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Box>
                ))}
                <CustomButton
                  type="button"
                  variant="outlined"
                  label="Add Module"
                  onClick={() => addModule(weekIndex)}
                  boxSx={{ width: "max-content" }}
                />
              </Box>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    </Box>
  );
};

export default ModuleModel;