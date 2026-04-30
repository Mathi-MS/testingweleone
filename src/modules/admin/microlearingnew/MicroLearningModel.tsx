import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  Divider,
  Tooltip,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { HiOutlineChevronDoubleRight } from "react-icons/hi";
import { RiCollapseDiagonal2Line, RiDeleteBin5Line } from "react-icons/ri";
import { CgArrowsExpandLeft } from "react-icons/cg";
import { TbFileDescription } from "react-icons/tb";
import { AiOutlineDelete, AiOutlineCheckCircle } from "react-icons/ai";
import { MdRefresh } from "react-icons/md";
import { CircularProgress } from "@mui/material";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

import CustomButton from "../../../components/custom/CustomButton";
import { CustomInput } from "../../../components/custom/CustomInput";
import { CustomAutocomplete } from "../../../components/custom/CustomAutocomplete";
import { MicroLearningSchema } from "../../../validation/Schema";
import {
  forminput,
  inputForm,
  inputTitle,
} from "../../../components/custom/CustomStyles";

import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../app/store";
import {
  createML,
  addDocument,
  deleteML,
  fetchMLList,
  fetchMLBySearch,
} from "../../../features/microlearning/mlSlice";
import {
  fetchAllCategories,
  fetchSubCategories,
} from "../../../features/categoriesSlice";
import { showError, showSuccess } from "../../../components/ui/Toast";
import { useAppDispatch } from "../../../app/hook";

interface FormValues {
  microLearnTitle: string;
  category: string | null | any;
  subCategory: string[] | any;
  duration: string;
  shortDescription: string;
  files: { file: File | undefined; description: string; status?: "idle" | "uploading" | "success" | "error" }[];
}

interface Props {
  open: boolean;
  onClose: () => void;
}

const MicroLearningModel = ({ open, onClose }: Props) => {
  const dispatch = useAppDispatch();

  const [expand, setExpand] = useState(false);
  const [activeEditorIndex, setActiveEditorIndex] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [createdMlId, setCreatedMlId] = useState<string | null>(null);
  const width = expand ? "80%" : "50%";
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    setError,
    clearErrors,
    getValues,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(MicroLearningSchema),
    defaultValues: {
      microLearnTitle: "",
      category: null,
      subCategory: [],
      duration: "",
      shortDescription: "",
      files: [{ file: undefined, description: "", status: "idle" }],
    },
  });
  const files = watch("files");
  const selectedCategory = watch("category");
  
  const onSubmit = async (data: FormValues) => {
    let currentMlId = createdMlId;

    if (!currentMlId) {
      try {
        setUploading(true);
        const res = await dispatch(
          createML({
            microLearnTitle: data.microLearnTitle,
            Duration: Number(data.duration),
            category: data.category,
            subCategory: data.subCategory,
            shortDescrpition: data.shortDescription,
          })
        ).unwrap();

        if ((res as any).code == 409){
          showError((res as any).message || "Something went wrongg");
        }
        if ((res as any).code == 200){
          currentMlId = (res as any).data?.id || null;
          setCreatedMlId((res as any).data?.id || null);
        }
                
        
      } catch (err: any) {
        showError(err.message || "Something went wrong");
        setUploading(false);
        return;
      }
    }

    if (currentMlId) {
      const validFiles = data.files.map((item, index) => ({ ...item, index })).filter(
        (item) => item.file !== undefined && item.description
      );

      let hasError = false;

      for (const { file, description, index, status } of validFiles) {
        if (status === "success") continue;

        if (file) {
          try {
            const currentFiles = getValues("files");
            const updatedFiles = [...currentFiles];
            updatedFiles[index].status = "uploading";
            setValue("files", updatedFiles);

            const result = await dispatch(
              addDocument({
                ml_id: currentMlId,
                file: file,
                trainingnotes: description,
              })
            ).unwrap();
            
            if (result && result.message === "success") {
              const successFiles = [...getValues("files")];
              successFiles[index].status = "success";
              setValue("files", successFiles);
            } else {
              throw new Error("Upload failed");
            }
          } catch (err) {
            const errorFiles = [...getValues("files")];
            errorFiles[index].status = "error";
            setValue("files", errorFiles);
            showError("Upload failed");
            hasError = true;
          }
          // finally {
          //   setValue("files", [{ file: undefined, description: "", status: "idle" }]);
          // }
        }
      }

      if (!hasError) {
        const allUploaded = getValues("files")
            .filter(f => f.file && f.description)
            .every(f => f.status === "success");
            
        if (allUploaded) {
            showSuccess("MicroLearning Created Successfully");
            setValue("files", [{ file: undefined, description: "", status: "idle" }]);
            dispatch(fetchMLBySearch({ page: 0, limit: 10, filters:null }));
                reset({
                  microLearnTitle: "",
                  category: null,
                  subCategory: [],
                  duration: "",
                  shortDescription: "",
                  files: [{ file: undefined, description: "", status: "idle" }],
                });
            clearErrors("files");
            onClose();
            setActiveEditorIndex(null);
        }
      }
    }
    setUploading(false);
  };

  useEffect(() => {
    if (open) {
      dispatch(fetchAllCategories());
      reset();
      setUploading(false);
      setCreatedMlId(null);
    }
  }, [open, dispatch, reset]); 
  useEffect(() => {
    if (selectedCategory && selectedCategory !== null) {
      dispatch(fetchSubCategories(selectedCategory as string));
    }
  }, [selectedCategory, dispatch]);

  const { categories, subCategories } = useSelector(
    (state: RootState) => state.categories
  );

  const { filters } = useSelector((state: RootState) => state.ml);

  const categoryOptions =
    categories?.map((c: any) => ({
      label: c.categoryName,
      value: c.id,
    })) ?? [];

  const subCategoryOptions =
    subCategories?.map((s: any) => ({
      label: s.subCategoryName,
      value: s.id,
    })) ?? [];

  const handleFileChange = (index: number, fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    const updated = [...(files || [])];
    const newFiles = Array.from(fileList);

    updated[index] = { ...updated[index], file: newFiles[0] };

    const additionalFiles = newFiles.slice(1).map((f) => ({
      file: f,
      description: "",
      status: "idle" as const,
    }));

    updated.splice(index + 1, 0, ...additionalFiles);

    const lastItem = updated[updated.length - 1];
    if (lastItem.file) {
      updated.push({ file: undefined, description: "", status: "idle" });
    }

    setValue("files", updated, { shouldValidate: true, shouldDirty: true });
  };

  const handleDescriptionChange = (index: number, description: string) => {
    const updated = [...(files || [])];
    updated[index] = { ...updated[index], description };
    setValue("files", updated, { shouldValidate: true, shouldDirty: true });

    if (index === updated.length - 1) {
      const currentItem = updated[index];
      const isNotEmpty = description && description !== "<p><br></p>" && description.trim() !== "";
      
      if (currentItem.file && isNotEmpty) {
        setValue("files", [...updated, { file: undefined, description: "", status: "idle" }], { shouldValidate: false });
      }
    }
  };

  const handleDelete = (index: number) => {
    const updated = [...(files || [])];
    updated.splice(index, 1);
    
    if (updated.length === 0) {
        updated.push({ file: undefined, description: "", status: "idle" });
    } else {
        const lastItem = updated[updated.length - 1];
        if (lastItem.file) {
             updated.push({ file: undefined, description: "", status: "idle" });
        }
    }
    
    setValue("files", updated, { shouldValidate: true, shouldDirty: true });
    if (activeEditorIndex === index) {
      setActiveEditorIndex(null);
    } else if (activeEditorIndex !== null && activeEditorIndex > index) {
      setActiveEditorIndex(activeEditorIndex - 1);
    }
  };

  const handleClose = () => {
    const hasSuccess = getValues("files").some((f) => f.status === "success");
    if (!hasSuccess && createdMlId) {
      dispatch(deleteML([createdMlId])).then(() => {
        dispatch(fetchMLList({ page: 0, limit: 10, filters }));
      });
    } else if (hasSuccess) {
      dispatch(fetchMLBySearch({ page: 0, limit: 10, filters: null }));
    }
    clearErrors();
    reset({
      microLearnTitle: "",
      category: null,
      subCategory: [],
      duration: "",
      shortDescription: "",
      files: [{ file: undefined, description: "", status: "idle" }],
    });
    setCreatedMlId(null);
    setUploading(false);
    onClose();
    setActiveEditorIndex(null);
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
        "& .ql-editor ": {
          minHeight: "max-content",
        },
      }}
    >
      <Box component="form" onSubmit={handleSubmit(onSubmit as any)}>
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
              MicroLearning / Creation
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
              label={uploading ? "Saving..." : "Save"}
              disabled={uploading}
            />
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
          <CustomInput
            placeholder="Microlearning Title..."
            name="microLearnTitle"
            register={register}
            errors={errors}
            boxSx={inputTitle}
            disabled={uploading}
          />

          <Box sx={forminput}>
            <Typography variant="h3">Category</Typography>
            <CustomAutocomplete
              name="category"
              control={control}
              options={categoryOptions}
              errors={errors}
              boxSx={inputForm}
              disabled={uploading}
            />
          </Box>

          <Box sx={forminput}>
            <Typography variant="h3">Sub Category</Typography>
            <CustomAutocomplete
              name="subCategory"
              control={control}
              options={subCategoryOptions}
              multiple
              errors={errors}
              boxSx={inputForm}
              disabled={!selectedCategory || uploading}
            />
          </Box>

          <Box sx={forminput}>
            <Typography variant="h3">Duration (Min)</Typography>
            <CustomInput
              name="duration"
              type="number"
              register={register}
              errors={errors}
              boxSx={inputForm}
              disabled={uploading}
            />
          </Box>

          <Box sx={forminput}>
            <Typography variant="h3">Short Description</Typography>
            <CustomInput
              name="shortDescription"
              register={register}
              errors={errors}
              boxSx={inputForm}
              disabled={uploading}
            />
          </Box>

          <Box sx={{...forminput,alignItems:"start"}}>
            <Typography variant="h3" sx={{marginTop:"15px"}}>Upload Files</Typography>
            <Box
              sx={{ display: "flex", flexDirection: "column", width: "100%" }}
            >
              
              {files?.map((item, index) => (
                <Box key={index} sx={{ mb: 2, position: "relative" }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      width:" 100%",
                      fontSize: "13px",
                       
                    }}
                  >
                    <Box
                      sx={{
                        border: "1px dashed transparent",
                        padding:"10px 14px",
                         borderRadius:"5px",
                         maxWidth:"300px",
                         position:"relative",
                        cursor: item.status === "success" || uploading ? "default" : "pointer",
                        flexGrow: 1,
                        opacity: item.status === "success" || uploading ? 0.7 : 1,
                        "&:hover": !(item.status === "success" || uploading) ? {
                          background: "var(--greythree)",
                          border: "1px solid transparent",
                        } : undefined
                      }}
                      onClick={() => {
                        if (item.status !== "success" && !uploading) {
                          document.getElementById(`file-${index}`)?.click();
                        }
                      }}
                    >
                      {item.file ? (
                        <Tooltip title={item.file.name}>
                          <span>
                            {item.file.name.length > 30
                              ? `${item.file.name.slice(0, 30)}...`
                              : item.file.name}
                          </span>
                        </Tooltip>
                      ) : (
                        "+ Add a file"
                      )}
                      {/* {item.file && (
                      <>
                        <IconButton
                          sx={{ ml: 1 ,position:"absolute",right:"5px",top:"0px",bottom:"0px",margin:"auto" ,
                            width:"30px",height:"30px",padding:"0px",color:"var(--text)",
    borderRadius: "4px",
    "&:hover": {
      backgroundColor: "#e7e6e6ff",
    }, }}
                          onClick={() =>
                            setActiveEditorIndex(
                              activeEditorIndex === index ? null : index
                            )
                          }
                          disabled={uploading}
                        >
                          <TbFileDescription size={16} />
                        </IconButton>
                        </>)} */}
                    </Box>

                    {item.file && (
                      <>
                        <IconButton
                          sx={{ ml: 1 ,color:"var(--text)",
                          borderRadius: "4px",
                          "&:hover": {
                            backgroundColor: "#e7e6e6ff",
                          }, }}
                          onClick={() =>
                            setActiveEditorIndex(
                              activeEditorIndex === index ? null : index
                            )
                          }
                          color={
                            activeEditorIndex === index ? "primary" : "default"
                          }
                          disabled={uploading}
                        >
                          <TbFileDescription size={16} />
                        </IconButton>

                        {item.status === "uploading" && (
                          <CircularProgress size={16} sx={{ ml: 1,borderRadius: "4px", }} />
                        )}
                        
                        {item.status === "success" && (
                          <IconButton sx={{ ml: 1,borderRadius: "4px", }} color="success">
                            <AiOutlineCheckCircle size={16} />
                          </IconButton>
                        )}

                        {item.status === "error" && (
                          <IconButton 
                            sx={{ ml: 1 }}
                            onClick={handleSubmit(onSubmit as any)}
                            title="Retry Upload"
                            disabled={uploading}
                          >
                            <MdRefresh size={16} />
                          </IconButton>
                        )}

                        {item.status !== "success" && (
                          <IconButton
                            sx={{ ml: 1,borderRadius: "4px", }}
                            onClick={() => handleDelete(index)}
                            color="error"
                            disabled={uploading}
                          >
                            <RiDeleteBin5Line size={16} />
                          </IconButton>
                        )}
                      </>
                    )}
                  </Box>

                  {activeEditorIndex === index && (
                    <Box sx={{ mt: 2, width: "100%",maxWidth:"500px",minWidth:"300px" }}>
                      <ReactQuill
                        value={item.description || ""}
                        onChange={(v) => handleDescriptionChange(index, v)}
                        readOnly={item.status === "success" || uploading}
                        modules={item.status === "success" || uploading ? { toolbar: false } : undefined}
                      />
                    </Box>
                  )}
                  {errors.files?.[index]?.file && (
                    <Typography color="error" variant="caption">
                      {errors.files[index]?.file?.message}
                    </Typography>
                  )}
                  {errors.files?.[index]?.description && uploading === false && (
                    <Typography color="error" variant="caption" display="block">
                      {errors.files[index]?.description?.message}
                    </Typography>
                  )}

                  <input
                    id={`file-${index}`}
                    type="file"
                    multiple
                    hidden
                    onChange={(e) => {
                      handleFileChange(index, e.target.files);
                    }}
                  />
                </Box>
              ))}
              {errors.files?.root && (
                <Typography color="error" variant="caption" sx={{ mb: 1 }}>
                  {errors.files.root.message}
                </Typography>
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default MicroLearningModel;