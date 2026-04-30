import { Box, IconButton, Typography, Divider, Tooltip, Button } from "@mui/material";
import CustomButton from "../../../components/custom/CustomButton";
import { HiOutlineChevronDoubleRight } from "react-icons/hi";
import { RiCollapseDiagonal2Line, RiDeleteBin5Line } from "react-icons/ri";
import { CgArrowsExpandLeft } from "react-icons/cg";
import { useState, useEffect, useRef } from "react";
import { MdOutlineDelete, MdOutlineEdit, MdRefresh } from "react-icons/md";
import { IoClose, IoChevronDown } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../app/store";
import { fetchMLById, deleteML, updateML, addDocument, deleteDocument, fetchMLBySearch, updateDocumentNotes } from "../../../features/microlearning/mlSlice";
import { fetchAllCategories, fetchSubCategories } from "../../../features/categoriesSlice";
import { showSuccess, showError } from "../../../components/ui/Toast";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { ChevronsLeft, ChevronsRight, Trash } from "lucide-react";
import { CustomInput } from "../../../components/custom/CustomInput";
import { CustomAutocomplete } from "../../../components/custom/CustomAutocomplete";
import { useForm } from "react-hook-form";
import { forminput, inputForm, inputTitle } from "../../../components/custom/CustomStyles";
import { TbFileDescription } from "react-icons/tb";
import { AiOutlineDelete, AiOutlineCheckCircle } from "react-icons/ai";
import { CircularProgress } from "@mui/material";
import { MicroLearningSchema, MicroLearningSchemaEdit } from "../../../validation/Schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppDispatch, useAppSelector } from "../../../app/hook";
import { fetchMappedModules } from "../../../features/chapterSlice";

interface Props {
  open: boolean;
  onClose: () => void;
  itemId: string | null;
}

const MicroLearningEditModel = ({ open, onClose, itemId }: Props) => {
  const dispatch = useAppDispatch();
  const [expand, setExpand] = useState(true);
  const [currentDocIndex, setCurrentDocIndex] = useState(0);
  const [isIframeLoading, setIsIframeLoading] = useState(true);
  const [showFileList, setShowFileList] = useState(false);
  const [showDocDeleteDialog, setShowDocDeleteDialog] = useState(false);
  const [docToDelete, setDocToDelete] = useState<{id: string, name: string} | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);


  const formatUsageItems = (items: string[]) => {
    const rows: string[][] = [];
    for (let i = 0; i < items.length; i += 3) {
      rows.push(items.slice(i, i + 3));
    }
    return rows.map((row, idx) => (
      <span key={idx}>
        {row.join(" ")}
        {idx < rows.length - 1 && <br />}
      </span>
    ));
  };

  const [isDeletingDoc, setIsDeletingDoc] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeEditorIndex, setActiveEditorIndex] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [trainerNotes, setTrainerNotes] = useState("");
  const [isBottomButtonOpened, setIsBottomButtonOpened] = useState(false);
  
  const [files, setFiles] = useState<{
    file: File | undefined;
    description: string;
    status: "idle" | "uploading" | "success" | "error";
    error?: string;
  }[]>([{ file: undefined, description: "", status: "idle" }]);

  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [showAddDocument, setShowAddDocument] = useState(false);
  const width = expand ? "80%" : "50%";
  
  const { register, handleSubmit, control, watch, setValue, reset, formState: { errors, isDirty } } = useForm({
    resolver: zodResolver(MicroLearningSchemaEdit),
    defaultValues: {
      microLearnTitle: "",
      category: "",
      subCategory: [] as any[],
      duration: "",
      shortDescription: "",
    },
  });

  const selectedCategory = watch("category");

  const { currentML } = useSelector((state: RootState) => state.ml);
  const { categories, subCategories } = useSelector((state: RootState) => state.categories);
  const {mappedModules} = useAppSelector((state) => state.chapters);
  
  const trainingDocs = currentML?.trainingDocs || [];

  const handleClose = () => {
    if (trainingDocs.length > 0) {
      onClose();
    } else {
      showError("At least one file needed");
    }
  };
  const categoryOptions = categories?.map((c: any) => ({ label: c.categoryName, value: c.id })) ?? [];
  const subCategoryOptions = subCategories?.map((s: any) => ({ label: s.subCategoryName, value: s.id })) ?? [];

  const handleResetForm = () => {
    if (currentML) {
      const category = currentML.category;
      const categoryId = (typeof category === 'object' && category !== null) ? category.id : category;
      reset({
        microLearnTitle: currentML.microLearnTitle || "",
        category: categoryId || "",
        subCategory: currentML.subCategory?.map((s: any) => (typeof s === 'object' && s !== null) ? s.id : s) || [],
        duration: currentML.Duration?.toString() || "",
        shortDescription: currentML.shortDescrpition || "",
      });
    }
  };

  const onSubmit = async (data: any) => {
    if (!itemId) return;
    try {
      setIsUpdating(true);
      const res = await dispatch(updateML({
        microLearnId: itemId,
        data: {
          microLearnTitle: data.microLearnTitle,
          Duration: Number(data.duration),
          category: data.category,
          subCategory: data.subCategory,
          shortDescrpition: data.shortDescription,
        }
      })).unwrap();
      if ((res as any).code == 409){
          showError((res as any).message || "Something went wrongg");
        }
        if ((res as any).code == 200){
            showSuccess("Micro learning updated successfully");
            dispatch(fetchMLBySearch({ page: 0, limit: 10, filters:null }));
            handleClose();
            setShowEditForm(false);
        }
    } catch (error) {
      showError("Failed to update micro learning");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveDescription = async (index: number) => {
    const currentFile = files[index];
    
    if (!currentFile.file) {
      showError("Please upload a file");
      return;
    }

    if (!currentFile.description) {
      showError("Please add description");
      return;
    }

    if (!itemId) {
      showError("MicroLearning ID missing");
      return;
    }

    try {
      setUploading(true);
      
      const updatedFiles = [...files];
      updatedFiles[index] = { ...currentFile, status: "uploading" };
      setFiles(updatedFiles);

      await dispatch(
        addDocument({
          ml_id: itemId,
          file: currentFile.file,
          trainingnotes: currentFile.description,
        })
      ).unwrap();

      showSuccess("File uploaded successfully");

      const successFiles = [...files];
      successFiles[index] = { ...currentFile, status: "success" };
      setFiles(successFiles);
      
      setActiveEditorIndex(null);
      dispatch(fetchMLById(itemId));
    } catch (err: any) {
      const errorFiles = [...files];
      errorFiles[index] = { ...currentFile, status: "error" };
      setFiles(errorFiles);
      showError(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleBulkUpload = async () => {
    if (!itemId) return;

    const filesToUpload = files.map((f, i) => ({ ...f, index: i }))
        .filter(f => f.file && f.status !== "success");

    if (filesToUpload.length === 0) {
        showError("Please add files to upload");
        return;
    }

    // Validation
    let hasError = false;
    const updatedFiles = [...files];

    filesToUpload.forEach(item => {
        const isEmptyDescription = !item.description || item.description === "<p><br></p>" || item.description.trim() === "";
        
        if (isEmptyDescription) {
            updatedFiles[item.index] = { ...updatedFiles[item.index], error: "Description is required" };
            hasError = true;
        } else {
             // Clear existing error if description is valid
             if (updatedFiles[item.index].error) {
                 const { error, ...rest } = updatedFiles[item.index];
                 updatedFiles[item.index] = rest;
             }
        }
    });

    if (hasError) {
        setFiles(updatedFiles);
        // Automatically open the first editor with error
        const firstErrorIndex = updatedFiles.findIndex(f => f.error);
        if (firstErrorIndex !== -1) {
            setActiveEditorIndex(firstErrorIndex);
        }
        return;
    }

    setUploading(true);
    // Clear any residual errors
    setFiles(updatedFiles.map(f => {
        const { error, ...rest } = f;
        return rest;
    }));

    for (const item of filesToUpload) {
        try {
            setFiles(prev => {
                const newFiles = [...prev];
                newFiles[item.index] = { ...newFiles[item.index], status: "uploading" };
                return newFiles;
            });

            await dispatch(addDocument({
                ml_id: itemId,
                file: item.file!,
                trainingnotes: item.description,
            })).unwrap();

            setFiles(prev => {
                const newFiles = [...prev];
                newFiles[item.index] = { ...newFiles[item.index], status: "success" };
                return newFiles;
            });
        } catch (error: any) {
            console.error("Upload error", error);
            setFiles(prev => {
                const newFiles = [...prev];
                newFiles[item.index] = { ...newFiles[item.index], status: "error" };
                return newFiles;
            });
            showError(`Failed to upload ${item.file?.name}`);
        }
    }

    setUploading(false);
    dispatch(fetchMLById(itemId));
  };

  const handleFileChange = (index: number, fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    const newFiles = Array.from(fileList);
    const updated = [...files];

    // Update current index with first file
    updated[index] = { 
        ...updated[index], 
        file: newFiles[0],
        status: "idle",
        error: undefined 
    };

    // Add remaining files
    const additionalFiles = newFiles.slice(1).map((f) => ({
      file: f,
      description: "",
      status: "idle" as const,
    }));

    updated.splice(index + 1, 0, ...additionalFiles);

    // Add empty slot if last item has file
    const lastItem = updated[updated.length - 1];
    if (lastItem.file) {
      updated.push({ file: undefined, description: "", status: "idle" });
    }

    setFiles(updated);
  };

  const handleDescriptionChange = (index: number, description: string) => {
    const updated = [...files];
    updated[index] = { ...updated[index], description };
    
    // Clear error on change if it exists
    if (updated[index].error) {
         const isNotEmpty = description && description !== "<p><br></p>" && description.trim() !== "";
         if (isNotEmpty) {
             const { error, ...rest } = updated[index];
             updated[index] = rest;
         }
    }
    
    setFiles(updated);

    if (index === updated.length - 1) {
      const currentItem = updated[index];
      const isNotEmpty = description && description !== "<p><br></p>" && description.trim() !== "";
      
      if (currentItem.file && isNotEmpty) {
        setFiles([...updated, { file: undefined, description: "", status: "idle" }]);
      }
    }
  };

  const handleDelete = (index: number) => {
    const updated = [...files];
    updated.splice(index, 1);
    
    if (updated.length === 0) {
        updated.push({ file: undefined, description: "", status: "idle" });
    } else {
        const lastItem = updated[updated.length - 1];
        if (lastItem.file) {
             updated.push({ file: undefined, description: "", status: "idle" });
        }
    }
    
    setFiles(updated);
    if (activeEditorIndex === index) {
      setActiveEditorIndex(null);
    } else if (activeEditorIndex !== null && activeEditorIndex > index) {
      setActiveEditorIndex(activeEditorIndex - 1);
    }
  };
  
  const currentDoc = trainingDocs[currentDocIndex];

  useEffect(() => {
    if (currentDoc) {
      setTrainerNotes(currentDoc.trainerGuideNotes || "");
      setIsBottomButtonOpened(false);
    }
  }, [currentDoc]);

  const handleUpdateNotes = async () => {
    if (!itemId || !currentDoc) return;
    const docId = (currentDoc as any).id || currentDoc.docId || (currentDoc as any).doc_id || (currentDoc as any).trainingDocsdocId;
    if (!docId) return;

    try {
      setIsUpdating(true);
      await dispatch(updateDocumentNotes({
        ml_id: itemId,
        doc_id: docId,
        trainingnotes: trainerNotes
      })).unwrap();
      showSuccess("Trainer notes updated successfully");
      dispatch(fetchMLById(itemId));
      setIsBottomButtonOpened(false);
    } catch (error) {
      showError("Failed to update trainer notes");
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    if (open && itemId) {
      dispatch(fetchMLById(itemId));
      dispatch(fetchAllCategories());
      setCurrentDocIndex(0);
      setFiles([{ file: undefined, description: "", status: "idle" }]);
      setActiveEditorIndex(null);
    }
  }, [open, itemId, dispatch]);

  useEffect(() => {
    if (currentML && showEditForm) {
      const category = currentML.category;
      const categoryId = (typeof category === 'object' && category !== null) ? category.id : category;

      reset({
        microLearnTitle: currentML.microLearnTitle || "",
        category: categoryId || "",
        subCategory: [],
        duration: currentML.Duration?.toString() || "",
        shortDescription: currentML.shortDescrpition || "",
      });
      
      if (categoryId) {
        dispatch(fetchSubCategories(categoryId)).then(() => {
          if (currentML.subCategory && Array.isArray(currentML.subCategory)) {
            setValue("subCategory", currentML.subCategory.map((s: any) => (typeof s === 'object' && s !== null) ? s.id : s));
          }
        });
      }
    }
  }, [currentML, showEditForm, reset, setValue, dispatch]);

  useEffect(() => {
    if (selectedCategory) {
      dispatch(fetchSubCategories(selectedCategory));
    }
  }, [selectedCategory, dispatch]);

  useEffect(() => {
    const docType = (currentDoc?.docType || "").toLowerCase();
    if (docType === 'pdf') {
      setIsIframeLoading(true);
    } else {
      setIsIframeLoading(false);
    }
  }, [currentDoc]);

  useEffect(() => {
    const handleClickOutside = () => setShowFileList(false);
    if (showFileList) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showFileList]);
  useEffect(() => {
    if (itemId) {
      dispatch(
        fetchMappedModules({
          id: itemId,
          type: "microLearn",
        })
      );
    }
  }, [dispatch, itemId]);
  const renderFilePreview = () => {
    if (!currentDoc) return null;
    const { docType, docUrl } = currentDoc;
    const safeDocType = (docType || "").toLowerCase();

    if (safeDocType === 'pdf') {
      return (
        <Box sx={{ position: 'relative', width: '100%', height: '400px' }}>
          {isIframeLoading && (
            <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f5f5f5', zIndex: 10 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Box sx={{ width: 48, height: 48, border: '2px solid #e5e7eb', borderTop: '2px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite', mx: 'auto' }} />
                <Typography sx={{ mt: 2, color: '#6b7280' }}>Loading document...</Typography>
              </Box>
            </Box>
          )}
          <iframe
            src={`https://docs.google.com/gview?url=${encodeURIComponent(docUrl || "")}&embedded=true`}
            style={{ width: '100%', height: '400px', border: 'none', borderRadius: 8 }}
            title="PDF Viewer"
            onLoad={() => setIsIframeLoading(false)}
          />
        </Box>
      );
    }
    if (['jpg', 'jpeg', 'png', 'gif'].includes(safeDocType)) {
      return <Box component="img" src={docUrl || undefined} sx={{ width: '100%', height: '400px', objectFit: 'contain', borderRadius: 2, bgcolor: '#f5f5f5' }} />;
    }
    if (['mp4', 'webm', 'ogg'].includes(safeDocType)) {
      return <video controls src={docUrl || undefined} style={{ width: '100%', height: '400px', borderRadius: 8 }} />;
    }
    return (
      <Box sx={{ width: '100%', height: '400px', bgcolor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 2 }}>
        <Typography>{docType?.toUpperCase()}</Typography>
      </Box>
    );
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
          minHeight: "max-content"
        }
      }}
    >
      <Box>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <IconButton onClick={handleClose}>
              <HiOutlineChevronDoubleRight size={16} />
            </IconButton>
            {/* <IconButton onClick={() => setExpand(!expand)}>
              {expand ? <RiCollapseDiagonal2Line size={16} /> : <CgArrowsExpandLeft size={16} />}
            </IconButton> */}
            <Typography sx={{ fontSize: 14, ml: 1 }}>
              MicroLearning / {currentML?.microLearnId || 'Loading...'}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 1 }}>
            <CustomButton
              type="button"
              variant="outlined"
              label="Delete"
              startIcon={<MdOutlineDelete size={16} color="var(--textlight)" />}
              boxSx={{ color: "var(--textlight)", borderColor: "var(--greyborderthree)","&:hover .MuiButton-startIcon svg": {
                color: "var(--greythree) !important",
              }, }}
              onClick={() => setShowDeleteDialog(true)}
              disabled={isDeleting}
            />
            <CustomButton
              type="button"
              variant="outlined"
              label={showAddDocument ? "Basic Details" : "Add Document"}
              onClick={() => {
                setShowAddDocument(!showAddDocument);
                setShowEditForm(false);
              }}
              boxSx={{ whiteSpace: "nowrap", px: 2 }}
            />
          </Box>
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      {showAddDocument && (
        <Box sx={{ mb: 3 }}>
          <Box sx={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto', pr: 1 }}>
            <Typography variant="h3" sx={{ mb: 2, fontSize: "16px", fontWeight: "600" }}>Upload Files</Typography>
            <Box sx={{ display: "flex", flexDirection: "column", width: "100%" }}>
              {files.map((item, index) => (
                  <Box key={index} sx={{ mb: 2, position: "relative" }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        width:" 100%",
                        fontSize:"14px "
                      }}
                    >
                        <Box
                        sx={{
                            border: "1px dashed transparent",
                            padding:"9px 14px",
                            borderRadius:"5px",
                            maxWidth:"300px",
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
                                fileInputRefs.current[index]?.click();
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
                        </Box>
        
                        {item.file && (
                        <>
                            <IconButton
                            sx={{ ml: 1 ,borderRadius: "4px", }}
                            onClick={() =>
                                setActiveEditorIndex(
                                activeEditorIndex === index ? null : index
                                )
                            }
                            
                            disabled={uploading}
                            >
                            <TbFileDescription size={16} />
                            </IconButton>
        
                            {item.status === "uploading" && (
                            <CircularProgress size={16} sx={{ ml: 1 ,borderRadius: "4px", }} />
                            )}
                            
                            {item.status === "success" && (
                            <IconButton sx={{ ml: 1 ,borderRadius: "4px", }} color="success">
                                <AiOutlineCheckCircle size={16} />
                            </IconButton>
                            )}
        
                            {item.status === "error" && (
                            <IconButton 
                                sx={{ ml: 1,borderRadius: "4px", }} 
                                onClick={() => handleSaveDescription(index)}
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
                                <RiDeleteBin5Line size={16}/>
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
                         {item.error && (
                            <Typography sx={{ color: "red", fontSize: "12px", mt: 0.5 }}>
                                {item.error}
                            </Typography>
                        )}
                      </Box>
                    )}

                    <input
                      ref={(el) => (fileInputRefs.current[index] = el)}
                      type="file"
                      multiple
                      hidden
                      disabled={item.status === "success"}
                      onChange={(e) => {
                        handleFileChange(index, e.target.files);
                      }}
                    />
                  </Box>
              ))}
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 2 }}>
                <CustomButton
                    type="button"
                    label={uploading ? "Uploading..." : "Save All"}
                    onClick={handleBulkUpload}
                    variant="contained"
                    boxSx={{width:"max-content"}}
                    disabled={uploading || files.filter(f => f.file && f.status !== "success").length === 0}
                />
            </Box>
          </Box>
        </Box>
      )}

      {!showAddDocument && currentML && (
        <>
          <Box sx={{ mb: 2 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                px: 2,
                py: 1,
                border: '1px solid var(--greyborderthree)',
                borderRadius: 1.2,
                cursor: 'pointer',
                bgcolor: showEditForm ? 'var(--bgmodel)' : 'transparent'
              }}
              onClick={() => setShowEditForm(!showEditForm)}
            >
              <Typography sx={{ fontSize: 14, fontWeight: 500 }}>Basic Details</Typography>
              <IconButton size="small">
                <IoChevronDown
                  size={16}
                  style={{
                    transform: showEditForm ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s'
                  }}
                />
              </IconButton>
            </Box>

            {showEditForm && (
              <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ p: 2, border: '1px solid var(--greyborderthree)', borderTop: 'none', borderRadius: '0 0 4px 4px' }}>
                <CustomInput
                  placeholder="Microlearning Title..."
                  name="microLearnTitle"
                  register={register}
                  errors={errors}
                  boxSx={inputTitle}
                />

                <Box sx={forminput}>
                  <Typography variant="h3">Category</Typography>
                  <CustomAutocomplete
                    name="category"
                    control={control}
                    options={categoryOptions}
                    errors={errors}
                    boxSx={inputForm}
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
                    disabled={!selectedCategory}
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
                  />
                </Box>

                <Box sx={forminput}>
                  <Typography variant="h3">Short Description</Typography>
                  <CustomInput
                    name="shortDescription"
                    register={register}
                    errors={errors}
                    boxSx={inputForm}
                  />
                </Box>

                <Box sx={{ display: 'flex', gap: 2, mt: 3,justifyContent:'end' }}>
                  {/* {isDirty && ( */}
                    <CustomButton
                      type="button"
                      variant="outlined"
                      label="Reset"
                      boxSx={{width:"max-content"}}
                      disabled={!isDirty}
                      onClick={handleResetForm}
                    />
                  {/* )} */}
                  {/* <CustomButton
                    type="button"
                    variant="outlined"
                    label="Cancel"
                    boxSx={{width:"max-content"}}
                    onClick={() => setShowEditForm(false)}
                  /> */}
                  <CustomButton
                    type="submit"
                    variant="contained"
                    boxSx={{width:"max-content"}}
                    label={isUpdating ? "Updating..." : "Update"}
                    disabled={isUpdating || !isDirty}
                  />
                </Box>
              </Box>
            )}
          </Box>

          {trainingDocs.length > 0 && (
            <Box sx={{ maxHeight: 'calc(100vh - 160px)', overflowY: 'auto', pr: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, py: 1, px: 2, border: "solid 1px var(--greyborderthree)", borderRadius: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Button
                    disabled={currentDocIndex === 0}
                    onClick={() => setCurrentDocIndex(prev => prev - 1)}
                    sx={{ 
                      color: currentDocIndex === 0 ? '#ccc' : '#666',
                      fontSize: 12,
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      background: "#fff !important",
                      textTransform: "capitalize",
                      minWidth: "auto",
                      padding: "4px 8px",
                      '&:hover, &:active': {
                        color: 'var(--primary)',
                      }
                    }}
                  >
                    <ChevronsLeft size={16} />
                    Previous
                  </Button>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, background: "var(--bgmodel)", width: "60%", margin: "auto", textAlign: "center", justifyContent: "center", position: 'relative',borderRadius:"5px" }}>
                  <Typography sx={{ fontSize: 14, color: 'var(--primary)', fontWeight: 500 }}>
                    {currentDocIndex + 1} / {trainingDocs.length}
                  </Typography>
                  <Typography sx={{ fontSize: 14, color: 'var(--primary)', fontWeight: 500 }}>
                    {currentDoc?.filename?.split('_').pop()?.split('.')[0] || 'Document'}
                  </Typography>
                  <IconButton
                    size="small"
                    sx={{ color: 'var(--primary)' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowFileList(!showFileList);
                    }}
                  >
                    <IoChevronDown size={16} />
                  </IconButton>

                  {showFileList && (
                    <Box sx={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      bgcolor: 'white',
                      border: '1px solid var(--greyborderthree)',
                      borderRadius: 1,
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                      zIndex: 1000,
                      maxHeight: '200px',
                      overflowY: 'auto',
                      width: "200px",
                      margin: "auto",
                      p: 1
                    }}>
                      {trainingDocs.map((doc, index) => (
                        <Box
                          key={index}
                          sx={{
                            p: 1.5,
                            cursor: 'pointer',
                            bgcolor: index === currentDocIndex ? 'var(--primary)' : 'transparent',
                            color: index === currentDocIndex ? 'white' : 'var(--textdark)',
                            '&:hover': {
                              bgcolor: index === currentDocIndex ? 'var(--primary)' : '#f5f5f5'
                            },
                            fontSize: 12
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentDocIndex(index);
                            setShowFileList(false);
                          }}
                        >
                          {index + 1}. {doc?.filename?.split('_').pop()?.split('.')[0] || `Document ${index + 1}`}
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }} >
                  <Button
                    disabled={currentDocIndex === trainingDocs.length - 1}
                    onClick={() => setCurrentDocIndex(prev => prev + 1)}
                    sx={{ 
                      color: currentDocIndex === trainingDocs.length - 1 ? '#ccc' : '#666',
                      fontSize: 12,
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      background: "#fff !important",
                      textTransform: "capitalize",
                      minWidth: "auto",
                      padding: "4px 8px",
                      '&:hover, &:active': {
                        color: 'var(--primary)',
                      }
                    }}
                  >
                    Next
                    <ChevronsRight size={16} />
                  </Button>
                </Box>
              </Box>

              <Box sx={{ position: 'relative', mb: 3 }}>
                {/* {trainingDocs.length > 1 && ( */}
                  <IconButton
                    sx={{ position: 'sticky', top: "50%", left: "96%", zIndex: 99,width:"30px",height:"30px",background:"var(--white) !important",color:"red"}}
                    size="small"
                    onClick={() => {
                      if (!currentDoc) return;
                      const docId = (currentDoc as any).id || currentDoc.docId || (currentDoc as any).doc_id || (currentDoc as any).trainingDocsdocId;
                      const docName = currentDoc.filename || 'Document';
                      
                      if (!docId) {
                        showError('Document ID not found');
                        return;
                      }

                      setDocToDelete({ id: docId, name: docName });
                      setShowDocDeleteDialog(true);
                    }}
                    disabled={isDeletingDoc}
                  >
                    <Trash size={12} />
                  </IconButton>
                {/* )} */}
                {renderFilePreview()}
              </Box>

              <Box sx={{ mt: 3 }}>
                <Box sx={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <Typography variant="h3" sx={{ mb: 2, fontSize: "16px" }}>Notes to Trainers</Typography>

                </Box>
                <ReactQuill
                  value={trainerNotes}
                  onChange={(content) => {
                    setTrainerNotes(content);
                    setIsBottomButtonOpened(true);
                  }}
                />
                {isBottomButtonOpened && (
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, gap: 2 }}>
                    <CustomButton
                      type="button"
                      variant="outlined"
                      label="Reset"
                      boxSx={{ width: "max-content" }}
                      onClick={() => {
                        setTrainerNotes(currentDoc?.trainerGuideNotes || "");
                        setIsBottomButtonOpened(false);
                      }}
                      disabled={isUpdating}
                    />
                    <CustomButton
                      type="button"
                      label={isUpdating ? "Updating..." : "Update Notes"}
                      onClick={handleUpdateNotes}
                      variant="contained"
                      disabled={isUpdating}
                      boxSx={{ width: "max-content" }}
                    />
                  </Box>
                )}
              </Box>
            </Box>
          )}
        </>
      )}

      {showDocDeleteDialog && (
        <Box sx={{
          position: 'fixed',
          inset: 0,
          bgcolor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000
        }}>
          <Box sx={{
            bgcolor: 'white',
            borderRadius: 2,
            p: 3,
            minWidth: 300,
            textAlign: 'center'
          }}>
            <Typography sx={{ fontSize: 16, fontWeight: 500, mb: 2 }}>
              Delete Document?
            </Typography>
            <Typography sx={{ fontSize: 14, color: '#666', mb: 3 }}>
              Are you sure you want to delete <br/>
              <strong>{docToDelete?.name}</strong>?
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <CustomButton
                type="button"
                variant="outlined"
                label="Cancel"
                onClick={() => {
                  setShowDocDeleteDialog(false);
                  setDocToDelete(null);
                }}
                disabled={isDeletingDoc}
              />
              <CustomButton
                type="button"
                variant="contained"
                label={isDeletingDoc ? "Deleting..." : "Delete"}
                onClick={async () => {
                  if (!itemId || !docToDelete) return;
                  
                  try {
                    setIsDeletingDoc(true);
                    await dispatch(deleteDocument({ ml_id: itemId, doc_id: docToDelete.id })).unwrap();
                    showSuccess("Document deleted successfully");
                    
                    await dispatch(fetchMLById(itemId));
                    
                    const newLength = trainingDocs.length - 1;
                    if (newLength === 0) {
                      setCurrentDocIndex(0);
                    } else if (currentDocIndex >= newLength) {
                      setCurrentDocIndex(newLength - 1);
                    }
                  } catch (error) {
                    console.error('Delete error:', error);
                    showError("Failed to delete document");
                  } finally {
                    setIsDeletingDoc(false);
                    setShowDocDeleteDialog(false);
                    setDocToDelete(null);
                  }
                }}
                disabled={isDeletingDoc}
                boxSx={{ bgcolor: '#dc2626', '&:hover': { bgcolor: '#b91c1c' } }}
              />
            </Box>
          </Box>
        </Box>
      )}
      {showDeleteDialog && (
        <Box sx={{
          position: 'fixed',
          inset: 0,
          bgcolor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000
        }}>
          <Box sx={{
            bgcolor: 'white',
            borderRadius: 2,
            p: 4,
            width: '800px',
            maxWidth: '90%',
            textAlign: 'center',
            position: 'relative'
          }}>
            <IconButton
              sx={{ position: 'absolute', right: 8, top: 8, color: '#666' }}
              onClick={() => setShowDeleteDialog(false)}
            >
              <IoClose size={20} />
            </IconButton>

            <Typography sx={{ fontSize: 16, fontWeight: 600, mb: 3, textAlign: 'left', display: 'flex', gap: 1 }}>
              <Box component="span" sx={{ color: 'var(--primary)' }}>{currentML?.microLearnId || 'ML001'}</Box>
              <Box component="span" sx={{ color: '#333' }}>: Delete this item?</Box>
            </Typography>

            <Box sx={{
              bgcolor: '#e8f5e9',
              p: 2,
              borderRadius: 1,
              display: 'flex',
              alignItems: 'flex-start',
              gap: 2,
              mb: 4,
              textAlign: 'left'
            }}>
              <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#333', whiteSpace: 'nowrap' }}>
                Note:
              </Typography>
              <Typography sx={{ fontSize: 14, color: '#333', lineHeight: 1.5 }}>
                This item is currently used in multiple modules. Deleting it will remove the item and may affect related data and workflows.
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4, px: 2 }}>
              <Box sx={{ flex: 1, textAlign: 'center' }}>
                <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#333', mb: 2 }}>Chapters</Typography>
                <Box sx={{ color: '#666', fontSize: 12, lineHeight: 1.8 }}>
                  {
                    mappedModules.chapter ? (
                       formatUsageItems(mappedModules.chapter || "-")
                    ) : ("-")
                  }
                </Box>
              </Box>
              <Divider orientation="vertical" flexItem sx={{ mx: 2, bgcolor: '#eee' }} />
              <Box sx={{ flex: 1, textAlign: 'center' }}>
                <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#333', mb: 2 }}>Books</Typography>
                <Box sx={{ color: '#666', fontSize: 12, lineHeight: 1.8 }}>
                  {
                    mappedModules.book ? (
                       formatUsageItems(mappedModules.book || "-")
                    ) : ("-")
                  }
                </Box>
              </Box>
              <Divider orientation="vertical" flexItem sx={{ mx: 2, bgcolor: '#eee' }} />
              <Box sx={{ flex: 1, textAlign: 'center' }}>
                <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#333', mb: 2 }}>Course</Typography>
                <Box sx={{ color: '#666', fontSize: 12, lineHeight: 1.8 }}>
                  {
                    mappedModules.course ? (
                       formatUsageItems(mappedModules.course || "-")
                    ) : ("-")
                  }
                </Box>
              </Box>
              <Divider orientation="vertical" flexItem sx={{ mx: 2, bgcolor: '#eee' }} />
              {/* <Box sx={{ flex: 1, textAlign: 'center' }}>
                <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#333', mb: 2 }}>Batch</Typography>
                <Box sx={{ color: '#666', fontSize: 12, lineHeight: 1.8 }}>
                  {
                    mappedModules.batch ? (
                       formatUsageItems(mappedModules.batch || "-")
                    ) : ("-")
                  }
                </Box>
              </Box> */}
            </Box>

            <Typography sx={{ fontSize: 15, color: '#333', mb: 4, fontWeight: 500 }}>
              Are you sure you want to move this <Box component="span" sx={{ color: 'var(--primary)', fontWeight: 600 }}>{currentML?.microLearnId || 'ML001'}</Box> to Trash? You can restore it later from the Trash if needed.
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <CustomButton
                type="button"
                variant="outlined"
                label="Cancel"
                onClick={() => setShowDeleteDialog(false)}
                disabled={isDeleting}
                boxSx={{ 
                  bgcolor: '#f1f3f4', 
                  color: '#333', 
                  border: 'none',
                  px: 4,
                  width:"max-content",
                  '&:hover': { bgcolor: '#e8eaed', border: 'none' }
                }}
              />
              <CustomButton
                type="button"
                variant="contained"
                label={isDeleting ? "Moving..." : "Move to Trash"}
                onClick={async () => {
                  if (!itemId) return;
                  try {
                    setIsDeleting(true);
                    await dispatch(deleteML([itemId])).unwrap();
                    showSuccess("Micro learning moved to trash");
                    onClose();
                  } catch (error) {
                    showError("Failed to delete micro learning");
                  } finally {
                    setIsDeleting(false);
                    setShowDeleteDialog(false);
                  }
                }}
                disabled={isDeleting}
                boxSx={{ 
                  bgcolor: '#ff7070', 
                  '&:hover': { bgcolor: '#ff5252' },
                  px: 4,
                  width:"max-content",
                }}
              />
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default MicroLearningEditModel;