import {
  Box,
  Typography,
  IconButton,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import { HiOutlineChevronDoubleRight } from "react-icons/hi";
import { RiCollapseDiagonal2Line } from "react-icons/ri";
import { CgArrowsExpandLeft } from "react-icons/cg";
import { ChevronDown, Trash } from "lucide-react";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useDispatch } from "react-redux";
import { useAppDispatch } from "../../../../app/hook";
import CustomButton from "../../../../components/custom/CustomButton";
import { CustomInput } from "../../../../components/custom/CustomInput";
import { forminput, inputForm } from "../../../../components/custom/CustomStyles";
import { showSuccess, showError } from "../../../../components/ui/Toast";
import { fetchBatchModules, updateBatchModule } from "../../../../features/batch/batchModuleSlice";

interface Props {
  open: boolean;
  onClose: () => void;
  moduleData: any;
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

const ModuleModelEdit = ({ open, onClose, moduleData }: Props) => {
  const [expand, setExpand] = useState(false);
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();

  const {
    register,
    handleSubmit,
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

  useEffect(() => {
    if (moduleData) {
      reset({
        weeks: [{
          modules: moduleData.moduleDetails.map((detail: any) => ({
            title: detail.moduleName,
            description: detail.moduleDescription
          }))
        }]
      });
    }
  }, [moduleData, reset]);

  const weeks = watch("weeks") || [];
  const width = expand ? "80%" : "50%";

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSave = handleSubmit(async (data) => {
    if (!moduleData?.id) return;
    
    setLoading(true);
    const input = {
      batchModuleInput: {
        weekName: moduleData.weekName,
        moduleDetails: data.weeks[0].modules.map(module => ({
          moduleName: module.title,
          moduleDescription: module.description
        }))
      }
    };

    const result = await dispatch(updateBatchModule({ id: moduleData.id, input }));
    
    if (result.payload?.success === 200) {
      showSuccess("Module updated successfully");
      dispatch(fetchBatchModules(moduleData.batchId));
      handleClose();
    } else {
      showError(result.payload?.message || "Failed to update module");
    }
    setLoading(false);
  });

  const addModule = () => {
    const updatedWeeks = [...weeks];
    updatedWeeks[0].modules.push({ title: "", description: "" });
    setValue("weeks", updatedWeeks);
  };

  const removeModule = (moduleIndex: number) => {
    const updatedWeeks = [...weeks];
    updatedWeeks[0].modules.splice(moduleIndex, 1);
    setValue("weeks", updatedWeeks);
  };

  const updateModuleField = (moduleIndex: number, field: "title" | "description", value: string) => {
    setValue(`weeks.0.modules.${moduleIndex}.${field}`, value);
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
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <IconButton onClick={handleClose}>
              <HiOutlineChevronDoubleRight size={16} />
            </IconButton>
            <IconButton onClick={() => setExpand(!expand)}>
              {expand ? <RiCollapseDiagonal2Line size={16} /> : <CgArrowsExpandLeft size={16} />}
            </IconButton>
            <Typography sx={{ fontSize: 14, ml: 1 }}>
              Batch / Module / Edit
            </Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 1 }}>
            <CustomButton type="button" variant="outlined" label="Cancel" onClick={handleClose} />
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
      <Box sx={{ mt: 2, maxHeight: "calc(100vh - 160px)", overflowY: "auto", pr: 1 }}>
        <Accordion defaultExpanded sx={{ mb: 2, boxShadow: 1 }}>
          <AccordionSummary expandIcon={<ChevronDown size={20} />}>
            <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
              {moduleData?.weekName}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {weeks[0]?.modules.map((module: any, moduleIndex: number) => (
                <Box key={moduleIndex} sx={{ p: 2, border: "1px solid #E5E7EB", borderRadius: 1 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                    <Typography sx={{ fontSize: 12, fontWeight: 600 }}>Module {moduleIndex + 1}</Typography>
                    {weeks[0].modules.length > 1 && (
                      <IconButton size="small" onClick={() => removeModule(moduleIndex)}>
                        <Trash size={16} color="#EF4444" />
                      </IconButton>
                    )}
                  </Box>
                  <Box sx={forminput}>
                    <Typography variant="h3">Module Title</Typography>
                    <CustomInput
                      name={`weeks.0.modules.${moduleIndex}.title`}
                      register={register}
                      errors={errors}
                      boxSx={inputForm}
                    />
                  </Box>
                  <Box sx={{ ...forminput, alignItems: "start", mt: 2 }}>
                    <Typography variant="h3">Description</Typography>
                    <Box sx={{ ...inputForm }}>
                      <ReactQuill
                        theme="snow"
                        value={module.description}
                        onChange={(content) => updateModuleField(moduleIndex, "description", content)}
                      />
                      {errors.weeks?.[0]?.modules?.[moduleIndex]?.description && (
                        <Typography color="error" variant="caption">
                          {errors.weeks[0].modules[moduleIndex].description.message}
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
                onClick={addModule}
                boxSx={{ width: "max-content" }}
              />
            </Box>
          </AccordionDetails>
        </Accordion>
      </Box>
    </Box>
  );
};

export default ModuleModelEdit;
