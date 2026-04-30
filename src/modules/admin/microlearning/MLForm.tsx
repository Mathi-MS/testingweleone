// import React, { useState, useEffect, useId } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { useParams, useNavigate, useLocation } from "react-router-dom";
// import {
//   createML,
//   updateML,
//   fetchMLById,
//   updateMLInList,
//   addDocument,
//   deleteDocument,
//   deleteML,
//   updateDocumentNotes,
//   fetchSubCategories,
//   fetchCategories,
// } from "../../../features/microlearning/mlSlice";
// import { RootState, AppDispatch } from "../../../app/store";
// import {
//   ChevronLeft,
//   Upload,
//   Pencil,
//   Trash,
//   RotateCcw,
//   ArrowLeft,
//   X,
//   CheckCircle,
//   AlertCircle,
//   Loader,
// } from "lucide-react";
// import { toast } from "react-toastify";
// import TextField from "@mui/material/TextField";
// import Select from "@mui/material/Select";
// import MenuItem from "@mui/material/MenuItem";
// import FormControl from "@mui/material/FormControl";
// import InputLabel from "@mui/material/InputLabel";
// import FormHelperText from "@mui/material/FormHelperText";
// import ReactQuill from "react-quill";
// import type {
//   MLData,
//   TrainingDoc,
//   FormData,
//   CreatedML,
//   FilePreviewType,
//   PendingDocument,
//   DocumentDeleteTarget,
//   ValidationErrors,
// } from "../../../types/ml";
// import {
//   mapExtensionToFilePreviewType,
//   getExtensionFromUrl,
// } from "../../../utils/utils";
// import VideoPreview from "../../../assets/icon/video-preview.svg";
// import DocPreview from "../../../assets/icon/doc-preview.svg";
// import PDFPreview from "../../../assets/icon/pdf-preview.svg";
// import ImagePreview from "../../../assets/icon/img-preview.svg";
// import "react-quill/dist/quill.snow.css";
// import { BackSVG, DeleteActiveSVG, DeleteSVG } from "../../../assets/svg";
// import { Button } from "../../../components/ui/Button";
// import { Modal } from "../../../components/ui/Modal";

// const toolbarOptions = [
//   ["bold", "italic", "underline"],
//   [{ list: "ordered" }, { list: "bullet" }, { list: "check" }],
//   ["clean"],
// ];
// const quillModules = {
//   toolbar: toolbarOptions,
// };

// const quillFormats = ["bold", "italic", "underline", "list", "bullet"];

// const MAX_DOCUMENT_SIZE = 20 * 1024 * 1024;

// const FileURL = import.meta.env.VITE_REST_ENDPOINT || "";

// const previewIcons: Record<FilePreviewType, string> = {
//   image: ImagePreview,
//   video: VideoPreview,
  
//   pdf: PDFPreview,
//   doc: DocPreview,
// };

// const getFileType = (file: File): FilePreviewType | null => {
//   const mime = file.type.toLowerCase();
//   if (mime.startsWith("image/")) {
//     return "image";
//   }
//   if (mime.startsWith("video/")) {
//     return "video";
//   }
//   if (mime === "application/pdf") {
//     return "pdf";
//   }
//   if (
//     mime === "application/msword" ||
//     mime ===
//       "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
//   ) {
//     return "doc";
//   }
//   const extension = file.name.split(".").pop()?.toLowerCase();
//   if (!extension) {
//     return null;
//   }
//   if (
//     ["png", "jpg", "jpeg", "gif", "bmp", "svg", "webp", "jfif"].includes(
//       extension
//     )
//   ) {
//     return "image";
//   }
//   if (["mp4", "mov", "avi", "mkv", "webm", "m4v"].includes(extension)) {
//     return "video";
//   }
//   if (extension === "pdf") {
//     return "pdf";
//   }
//   if (["doc", "docx"].includes(extension)) {
//     return "doc";
//   }
//   return null;
// };

// const formatFileSize = (size: number) => {
//   if (size >= 1024 * 1024) {
//     return `${(size / (1024 * 1024)).toFixed(2)} MB`;
//   }
//   return `${(size / 1024).toFixed(1)} KB`;
// };

// const getPreviewTypeFromMeta = (
//   docType?: string | null,
//   url?: string | null
// ): FilePreviewType => {
//   const lower = docType?.toLowerCase() || "";

//   const mappedType = mapExtensionToFilePreviewType(lower);
//   if (mappedType) {
//     return mappedType;
//   }

//   if (lower.includes("image")) {
//     return "image";
//   }
//   if (lower.includes("video")) {
//     return "video";
//   }
//   if (lower.includes("pdf")) {
//     return "pdf";
//   }
//   if (lower.includes("doc")) {
//     return "doc";
//   }

//   if (url) {
//     const extension = getExtensionFromUrl(url);
//     const mappedUrlType = mapExtensionToFilePreviewType(extension);
//     if (mappedUrlType) {
//       return mappedUrlType;
//     }
//   }

//   return "doc";
// };

// const getFileNameFromPath = (path?: string | null, fallback = "Document") => {
//   if (!path) {
//     return fallback;
//   }
//   const segments = path.split("?")[0]?.split("/") || [];
//   return segments[segments.length - 1] || fallback;
// };

// const getDocIdentifier = (doc: TrainingDoc | Record<string, any>) =>
//   doc.docId || (doc as any)?.doc_id || (doc as any)?.trainingDocsdocId || "";

// const getCategoryNameFromData = (category: any): string => {
//   if (typeof category === "string") return category;
//   if (category?.categoryName) return category.categoryName;
//   if (category?.id) return category.id;
//   return "";
// };

// const getCategoryIdFromData = (category: any): string => {
//   if (typeof category === "string") return category;
//   if (category?.id) return category.id;
//   return "";
// };

// const getSubCategoryNameFromData = (subCategory: any): string => {
//   if (typeof subCategory === "string") return subCategory;
//   if (subCategory?.subCategoryName) return subCategory.subCategoryName;
//   if (subCategory?.id) return subCategory.id;
//   return "";
// };

// const getSubCategoryIdFromData = (subCategory: any): string => {
//   if (typeof subCategory === "string") return subCategory;
//   if (subCategory?.id) return subCategory.id;
//   return "";
// };

// export default function MLForm() {
//   const { id } = useParams<{ id?: string }>();
//   const { currentML, loading, categories, subCategories } = useSelector(
//     (state: RootState) => state.ml
//   );
//   const navigate = useNavigate();
//   const location = useLocation();
//   const dispatch = useAppDispatch();
//   const isViewMode = location.pathname.includes("/view/");
//   const hasExistingML = Boolean(id);
//   const isEditMode = hasExistingML && !isViewMode;
//   const [isInlineEditEnabled, setIsInlineEditEnabled] = useState(false);
//   const [isDeletingML, setIsDeletingML] = useState(false);
//   const mode =
//     isViewMode && !isInlineEditEnabled
//       ? "view"
//       : isEditMode || (isViewMode && isInlineEditEnabled)
//       ? "edit"
//       : "create";
//   const isFormReadOnly = isViewMode && !isInlineEditEnabled;
//   const documentUploadInputId = useId();
//   const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
//   const [documentDeleteTarget, setDocumentDeleteTarget] =
//     useState<DocumentDeleteTarget | null>(null);
//   useEffect(() => {
//     if ((isEditMode || isViewMode) && id) {
//       dispatch(fetchMLById(id));
//     }
//   }, [isEditMode, isViewMode, id, dispatch]);

//   useEffect(() => {
//     dispatch(fetchCategories());
//   }, [dispatch]);

//   useEffect(() => {
//     setIsInlineEditEnabled(false);
//   }, [isViewMode, id]);

//   useEffect(() => {
//     setPendingDocuments([]);
//     setUploadedDocuments([]);
//     setUploadedDocumentNotes({});
//     setPreviewFile(null);
//     setDocumentDeleteTarget(null);
//     setUploadStatus({});
//     setFailedDocuments(new Set());
//     setDeletedDocIds(new Set());
//   }, [id]);

//   useEffect(() => {
//     return () => {
//       setPendingDocuments([]);
//       setUploadedDocuments([]);
//       setUploadedDocumentNotes({});
//       setPreviewFile(null);
//       setDocumentDeleteTarget(null);
//       setValidationErrors({});
//       setUploadStatus({});
//       setFailedDocuments(new Set());
//       setFormData({
//         title: "",
//         category: { id: "", categoryName: "" },
//         subCategory: { id: "", subCategoryName: "" },
//         shortDescription: "",
//         duration: 0,
//       });
//       setStep(1);
//     };
//   }, []);

//   const [formData, setFormData] = useState<FormData>({
//     title: "",
//     category: { id: "", categoryName: "" },
//     subCategory: { id: "", subCategoryName: "" },
//     shortDescription: "",
//     duration: 0,
//   });
//   const [initialFormData, setInitialFormData] = useState<FormData | null>(null);

//   const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
//     {}
//   );
//   const [step, setStep] = useState(1);
//   const [createdML, setCreatedML] = useState<CreatedML | null>(null);
//   const [pendingDocuments, setPendingDocuments] = useState<PendingDocument[]>(
//     []
//   );
//   const [uploadedDocuments, setUploadedDocuments] = useState<TrainingDoc[]>([]);
//   const [uploadedDocumentNotes, setUploadedDocumentNotes] = useState<
//     Record<string, string>
//   >({});
//   const [deletingDocId, setDeletingDocId] = useState<string | null>(null);
//   const [documentsLoading, setDocumentsLoading] = useState(false);
//   const [previewFile, setPreviewFile] = useState<{
//     id: string;
//     url: string;
//     type: FilePreviewType;
//     name: string;
//     isLocal: boolean;
//   } | null>(null);
//   const [uploadStatus, setUploadStatus] = useState<
//     Record<string, "pending" | "uploading" | "success" | "error">
//   >({});
//   const [failedDocuments, setFailedDocuments] = useState<Set<string>>(
//     new Set()
//   );
//   const [isIframeLoading, setIsIframeLoading] = useState(true);
//   const isDocumentStep = step === 2;
//   const [localUploadedDocIds, setLocalUploadedDocIds] = useState<Set<string>>(
//     new Set()
//   );
//   const [deletedDocIds, setDeletedDocIds] = useState<Set<string>>(new Set());

//   const documentDeleteInProgress =
//     documentDeleteTarget?.type === "uploaded" &&
//     deletingDocId === getDocIdentifier(documentDeleteTarget.doc);
//   const documentDeleteName =
//     documentDeleteTarget?.type === "pending"
//       ? documentDeleteTarget.doc.file.name
//       : documentDeleteTarget?.type === "uploaded"
//       ? getFileNameFromPath(
//           documentDeleteTarget.doc.docUrl ||
//             (documentDeleteTarget.doc as any)?.trainingDocsdocUrl,
//           documentDeleteTarget.doc.docType || "Document"
//         )
//       : "";

//   useEffect(() => {
//     if ((isEditMode || isViewMode) && currentML) {
//       const categoryData =
//         typeof currentML.category === "object"
//           ? currentML.category
//           : { id: currentML.category || "", categoryName: "" };

//       const subCategoryData = currentML.subCategory;
//       const subCategoryObj =
//         typeof subCategoryData === "object" && subCategoryData
//           ? subCategoryData
//           : subCategoryData
//           ? { id: subCategoryData, subCategoryName: "" }
//           : { id: "", subCategoryName: "" };

//       const hydratedData: FormData = {
//         title: currentML.microLearnTitle || "",
//         category: categoryData,
//         subCategory: subCategoryObj,
//         shortDescription: currentML.shortDescrpition || "",
//         duration: currentML.Duration || 0,
//       };
//       setFormData(hydratedData);
//       setInitialFormData(hydratedData);
//       if (isEditMode) {
//         setCreatedML(currentML as CreatedML);
//       }

//       // Fetch subcategories for the current category when editing
//       if (categoryData.id) {
//         dispatch(fetchSubCategories(categoryData.id));
//       }
//     }
//   }, [isEditMode, isViewMode, currentML, dispatch]);

//   // Update subcategory name when subcategories are loaded
//   useEffect(() => {
//     if (subCategories.length > 0 && formData.subCategory?.id) {
//       const matchingSubCategory = subCategories.find(
//         (subCat) => subCat.id === formData.subCategory.id
//       );
//       if (matchingSubCategory && !formData.subCategory.subCategoryName) {
//         setFormData((prev) => ({
//           ...prev,
//           subCategory: {
//             id: matchingSubCategory.id,
//             subCategoryName: matchingSubCategory.subCategoryName,
//           },
//         }));
//       }
//     }
//   }, [subCategories, formData.subCategory?.id]);

//   useEffect(() => {
//     const docsSource = (currentML?.trainingDocs ||
//       (currentML as any)?.training_docs ||
//       []) as Array<TrainingDoc | null | undefined | Record<string, any>>;
//     if (Array.isArray(docsSource) && docsSource.length) {
//       const normalized = docsSource
//         .filter((doc): doc is TrainingDoc | Record<string, any> => Boolean(doc))
//         .filter((doc) => {
//           const docId =
//             doc.docId ||
//             (doc as any)?.doc_id ||
//             (doc as any)?.trainingDocsdocId ||
//             "";
//           return !deletedDocIds.has(docId);
//         })
//         .map((doc) => ({
//           ...doc,
//           docId:
//             doc.docId ||
//             (doc as any)?.doc_id ||
//             (doc as any)?.trainingDocsdocId ||
//             "",
//           docUrl:
//             doc.docUrl ||
//             (doc as any)?.doc_url ||
//             (doc as any)?.trainingDocsdocUrl ||
//             "",
//           docType: doc.docType || (doc as any)?.doc_type || "",
//           trainerGuideNotes:
//             doc.trainerGuideNotes || (doc as any)?.trainer_guide_notes || "",
//         })) as TrainingDoc[];

//       const getDocTimestamp = (doc: any): number => {
//         if (!doc) return 0;
//         const candidates = [
//           "createdAt",
//           "created_at",
//           "uploadedAt",
//           "uploaded_at",
//           "timestamp",
//         ];
//         for (const key of candidates) {
//           const v = doc[key];
//           if (!v) continue;
//           const n = typeof v === "number" ? v : Date.parse(String(v));
//           if (!isNaN(n)) return n;
//         }
//         return 0;
//       };

//       // Partition docs: locally-added ids first, then the rest
//       const localIds = localUploadedDocIds || new Set<string>();
//       const localDocs: TrainingDoc[] = [];
//       const otherDocs: TrainingDoc[] = [];

//       normalized.forEach((doc) => {
//         const id = getDocIdentifier(doc);
//         if (id && localIds.has(id)) {
//           localDocs.push(doc);
//         } else {
//           otherDocs.push(doc);
//         }
//       });

//       // sort localDocs by timestamp desc if available (keeps newest-first)
//       const sortDescByTimestamp = (a: TrainingDoc, b: TrainingDoc) =>
//         getDocTimestamp(b) - getDocTimestamp(a);

//       const hasTimestampInOthers = otherDocs.some(
//         (d) => getDocTimestamp(d) > 0
//       );
//       const sortedOtherDocs = hasTimestampInOthers
//         ? otherDocs.sort(sortDescByTimestamp)
//         : [...otherDocs].reverse(); // fallback: reverse to show newest-if-server-return-oldest-first

//       const hasTimestampInLocal = localDocs.some((d) => getDocTimestamp(d) > 0);
//       const sortedLocalDocs = hasTimestampInLocal
//         ? localDocs.sort(sortDescByTimestamp)
//         : localDocs; // keep insertion order for local docs

//       setUploadedDocuments([...sortedLocalDocs, ...sortedOtherDocs]);
//     } else {
//       setUploadedDocuments([]);
//     }
//   }, [currentML, localUploadedDocIds, deletedDocIds]);

//   useEffect(() => {
//     if (
//       previewFile &&
//       (previewFile.type === "pdf" || previewFile.type === "doc")
//     ) {
//       setIsIframeLoading(true);
//     }
//     return () => {
//       if (previewFile?.isLocal && previewFile.url) {
//         URL.revokeObjectURL(previewFile.url);
//       }
//     };
//   }, [previewFile]);

//   const validateForm = (): boolean => {
//     const errors: ValidationErrors = {};

//     if (!formData.title.trim()) {
//       errors.title = "Title is required";
//     }

//     const hasCategory =
//       typeof formData.category === "object"
//         ? formData.category?.id
//         : formData.category;
//     if (!hasCategory) {
//       errors.category = "Category is required";
//     }

//     const hasSubCategory =
//       typeof formData.subCategory === "object"
//         ? formData.subCategory?.id
//         : formData.subCategory;
//     if (!hasSubCategory) {
//       errors.subCategory = "Sub Category is required";
//     }

//     if (!formData.shortDescription.trim()) {
//       errors.shortDescription = "Short description is required";
//     }

//     if (!formData.duration || formData.duration <= 0) {
//       errors.duration = "Duration must be greater than 0";
//     }

//     setValidationErrors(errors);
//     return Object.keys(errors).length === 0;
//   };

//   const handleInputChange = (field: keyof FormData, value: any) => {
//     setFormData((prev) => ({ ...prev, [field]: value }));
//     if (validationErrors[field]) {
//       setValidationErrors((prev) => {
//         const updated = { ...prev };
//         delete (updated as any)[field];
//         return updated;
//       });
//     }
//   };

//   const handleDetailsSubmit = async () => {
//     if (!validateForm()) {
//       return;
//     }

//     const mlData = {
//       microLearnTitle: formData.title,
//       Duration: parseInt(formData.duration.toString()) || 0,
//       category: {
//         id: formData.category.id,
//         categoryName: formData.category.categoryName,
//       },
//       subCategory: {
//         id: formData.subCategory.id,
//         subCategoryName: formData.subCategory.subCategoryName,
//       },
//       shortDescrpition: formData.shortDescription,
//     };

//     if (id) {
//       const hasChanges = initialFormData
//         ? JSON.stringify(initialFormData) !== JSON.stringify(formData)
//         : true;
//       if (!hasChanges) {
//         // Navigate to MLDetails page instead of document step
//         navigate(`/admin/microlearning/details/${id}`, {
//           state: { mlData: currentML }
//         });
//         return;
//       }
//       try {
//         dispatch(updateMLInList({ id, data: mlData }));
//         const updatedML = await dispatch(updateML({ microLearnId: id, data: mlData })).unwrap();
//         toast.success("Micro learning updated successfully");
//         setInitialFormData({ ...formData });
//         // Navigate to MLDetails page instead of document step
//         navigate(`/admin/microlearning/details/${id}`, {
//           state: { mlData: updatedML }
//         });
//       } catch (error) {
//         toast.error("Failed to update micro learning");
//       }
//       return;
//     }

//     try {
//       const res = await dispatch(createML(mlData)).unwrap();
//       setCreatedML(res as CreatedML);
//       toast.success("Micro learning step one completed");
//       setInitialFormData({ ...formData });
//       // Navigate to MLDetails page instead of document step
//       navigate(`/admin/microlearning/details/${res.id}`, {
//         state: { mlData: res }
//       });
//     } catch (error) {
//       toast.error("Failed to create micro learning");
//     }
//   };

//   const resolveMlId = () => createdML?.id || id;

//   const handleDocumentFileUpload = (
//     event: React.ChangeEvent<HTMLInputElement>
//   ) => {
//     if (!event.target.files) {
//       return;
//     }
//     const files = Array.from(event.target.files);
//     const validFiles: PendingDocument[] = [];
//     let hasTypeError = false;
//     let hasSizeError = false;

//     files.forEach((file) => {
//       const fileType = getFileType(file);
//       if (!fileType) {
//         hasTypeError = true;
//         return;
//       }
//       if (file.size > MAX_DOCUMENT_SIZE) {
//         hasSizeError = true;
//         return;
//       }
//       validFiles.push({
//         id: `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
//         file,
//         notes: "",
//         type: fileType,
//       });
//     });

//     if (hasTypeError) {
//       toast.error("Only images, videos, PDF, and DOC files are allowed");
//     }

//     if (hasSizeError) {
//       toast.error("Each file must be 20MB or less");
//     }

//     if (validFiles.length) {
//       setPendingDocuments((prev) => [...validFiles, ...prev]);
//     }

//     event.target.value = "";
//   };

//   const handleDocumentNoteChange = (docId: string, value: string) => {
//     setPendingDocuments((prev) =>
//       prev.map((doc) => (doc.id === docId ? { ...doc, notes: value } : doc))
//     );
//   };

//   const handleUploadedDocumentNoteChange = (docId: string, value: string) => {
//     setUploadedDocumentNotes((prev) => ({ ...prev, [docId]: value }));
//   };

//   const handleOpenPreview = (doc: PendingDocument) => {
//     if (documentsLoading) {
//       return;
//     }
//     setPreviewFile({
//       id: doc.id,
//       url: URL.createObjectURL(doc.file),
//       type: doc.type,
//       name: doc.file.name,
//       isLocal: true,
//     });
//   };

//   const handleOpenUploadedDocumentPreview = (doc: TrainingDoc) => {
//     if (documentsLoading) {
//       return;
//     }
//     const docUrl = doc.docUrl;
//     // const docUrl = FileURL + '/files/download/' + doc.filename
//     if (!docUrl) {
//       toast.error("Preview not available for this file");
//       return;
//     }
//     const docIdentifier =
//       doc.docId ||
//       (doc as any)?.doc_id ||
//       (doc as any)?.trainingDocsdocId ||
//       docUrl;
//     const previewType = getPreviewTypeFromMeta(doc.docType, docUrl);
//     const docName = getFileNameFromPath(docUrl, doc.docType || "Document");
//     setPreviewFile({
//       id: docIdentifier,
//       url: docUrl,
//       type: previewType,
//       name: docName,
//       isLocal: false,
//     });
//   };

//   const handleClosePreview = () => {
//     setPreviewFile(null);
//   };

//   const handleRemoveDocument = (docId: string) => {
//     setPendingDocuments((prev) => prev.filter((doc) => doc.id !== docId));
//     setPreviewFile((prev) => (prev?.id === docId ? null : prev));
//   };

//   const handleDeleteUploadedDocument = async (doc: TrainingDoc) => {
//     const mlId = resolveMlId();
//     if (!mlId) {
//       toast.error("Submit the details first");
//       return;
//     }

//     const docId = getDocIdentifier(doc);
//     if (!docId) {
//       toast.error("Document identifier missing");
//       return;
//     }

//     try {
//       setDeletingDocId(docId);
//       const result = await dispatch(
//         deleteDocument({ ml_id: mlId, doc_id: docId })
//       ).unwrap();

//       // Track deleted document to prevent re-adding
//       setDeletedDocIds((prev) => new Set(prev).add(docId));

//       // Update local state immediately for better UX
//       setUploadedDocuments((prev) =>
//         prev.filter((item) => getDocIdentifier(item) !== docId)
//       );
//       setLocalUploadedDocIds((prev) => {
//         const next = new Set(prev);
//         next.delete(docId);
//         return next;
//       });

//       toast.success("Document deleted successfully");
//     } catch (error) {
//       console.error("Delete document error:", error);
//       toast.error("Failed to delete document");
//     } finally {
//       setDeletingDocId(null);
//     }
//   };

//   const handleCloseDocumentDeleteModal = () => {
//     if (documentDeleteInProgress) {
//       return;
//     }
//     setDocumentDeleteTarget(null);
//   };

//   const handleConfirmDocumentDelete = async () => {
//     if (!documentDeleteTarget) {
//       return;
//     }
//     if (documentDeleteTarget.type === "pending") {
//       handleRemoveDocument(documentDeleteTarget.doc.id);
//       setDocumentDeleteTarget(null);
//       return;
//     }
//     try {
//       await handleDeleteUploadedDocument(documentDeleteTarget.doc);
//     } finally {
//       setDocumentDeleteTarget(null);
//     }
//   };

//   const handleDocumentSubmit = async () => {
//     const mlId = resolveMlId();

//     if (!mlId) {
//       toast.error("Submit the details first");
//       return;
//     }

//     const hasUpdatedNotes = Object.keys(uploadedDocumentNotes).length > 0;
//     const hasNoChanges = !pendingDocuments.length && !hasUpdatedNotes;

//     if (hasNoChanges) {
//       toast.error("Make changes to save");
//       return;
//     }

//     try {
//       setDocumentsLoading(true);
//       const initialStatus: Record<
//         string,
//         "pending" | "uploading" | "success" | "error"
//       > = {};
//       pendingDocuments.forEach((doc) => {
//         initialStatus[doc.id] = failedDocuments.has(doc.id)
//           ? "pending"
//           : "pending";
//       });
//       setUploadStatus(initialStatus);

//       for (const docId of Object.keys(uploadedDocumentNotes)) {
//         const updatedNotes = uploadedDocumentNotes[docId];
//         const originalDoc = uploadedDocuments.find(
//           (doc) => getDocIdentifier(doc) === docId
//         );

//         if (
//           originalDoc &&
//           updatedNotes !== (originalDoc.trainerGuideNotes || "")
//         ) {
//           try {
//             await dispatch(
//               updateDocumentNotes({
//                 ml_id: mlId,
//                 doc_id: docId,
//                 trainingnotes: updatedNotes,
//               })
//             ).unwrap();

//             setUploadedDocuments((prev) =>
//               prev.map((doc) =>
//                 getDocIdentifier(doc) === docId
//                   ? { ...doc, trainerGuideNotes: updatedNotes }
//                   : doc
//               )
//             );
//           } catch (error) {
//             console.error(
//               `Failed to update notes for document ${docId}`,
//               error
//             );
//             toast.error("Failed to update document notes");
//             return;
//           }
//         }
//       }

//       const newDocs: TrainingDoc[] = [];
//       const uploadResults: Record<string, "success" | "error"> = {};

//       for (const doc of pendingDocuments) {
//         setUploadStatus((prev) => ({ ...prev, [doc.id]: "uploading" }));
//         try {
//           const uploaded = await dispatch(
//             addDocument({
//               ml_id: mlId,
//               file: doc.file,
//               trainingnotes: doc.notes,
//             })
//           ).unwrap();

//           uploadResults[doc.id] = "success";
//           setUploadStatus((prev) => ({ ...prev, [doc.id]: "success" }));
//           setFailedDocuments((prev) => {
//             const updated = new Set(prev);
//             updated.delete(doc.id);
//             return updated;
//           });

//           if (uploaded?.document) {
//             newDocs.push(uploaded.document);
//           }
//         } catch (error) {
//           console.error(`Failed to upload document ${doc.id}`, error);
//           uploadResults[doc.id] = "error";
//           setUploadStatus((prev) => ({ ...prev, [doc.id]: "error" }));
//           setFailedDocuments((prev) => new Set(prev).add(doc.id));
//         }
//       }

//       if (newDocs.length) {
//         setUploadedDocuments((prev) => [...newDocs, ...prev]);

//         setLocalUploadedDocIds((prev) => {
//           const next = new Set(prev);
//           newDocs.forEach((d) => next.add(getDocIdentifier(d)));
//           return next;
//         });
//       }

//       const failedCount = Object.values(uploadResults).filter(
//         (status) => status === "error"
//       ).length;
//       if (failedCount > 0) {
//         toast.error(`${failedCount} file(s) failed to upload. Please retry.`);
//         return;
//       }

//       const allSuccess =
//         pendingDocuments.length === 0 ||
//         Object.values(uploadResults).every((status) => status === "success");
//       if (allSuccess) {
//         if (pendingDocuments.length || hasUpdatedNotes) {
//           toast.success("Changes saved successfully");
//         }
//         clearFormState();
//         navigate("/admin/microlearning");
//       }
//     } catch (error) {
//       toast.error("Failed to save changes");
//     } finally {
//       setDocumentsLoading(false);
//     }
//   };

//   const handleRetryUpload = async (doc: PendingDocument) => {
//     const mlId = resolveMlId();
//     if (!mlId) {
//       toast.error("Submit the details first");
//       return;
//     }

//     setUploadStatus((prev) => ({ ...prev, [doc.id]: "uploading" }));
//     try {
//       const uploaded = await dispatch(
//         addDocument({
//           ml_id: mlId,
//           file: doc.file,
//           trainingnotes: doc.notes,
//         })
//       ).unwrap();

//       setUploadStatus((prev) => ({ ...prev, [doc.id]: "success" }));
//       setFailedDocuments((prev) => {
//         const updated = new Set(prev);
//         updated.delete(doc.id);
//         return updated;
//       });

//       if (uploaded?.document) {
//         setUploadedDocuments((prev) => [uploaded.document, ...prev]);
//         setPendingDocuments((prev) => prev.filter((d) => d.id !== doc.id));
//         setLocalUploadedDocIds((prev) => {
//           const next = new Set(prev);
//           next.add(getDocIdentifier(uploaded.document));
//           return next;
//         });
//       }

//       toast.success("File uploaded successfully");
//     } catch (error) {
//       console.error(`Failed to upload document ${doc.id}`, error);
//       setUploadStatus((prev) => ({ ...prev, [doc.id]: "error" }));
//       setFailedDocuments((prev) => new Set(prev).add(doc.id));
//       toast.error("Failed to upload file");
//     }
//   };

//   const handleEnableEdit = () => {
//     if (!id || !isFormReadOnly) {
//       return;
//     }
//     setIsInlineEditEnabled(true);
//     setStep(1);
//   };

//   const handleDeleteML = async () => {
//     if (!id || isDeletingML) {
//       return;
//     }
//     setIsDeleteModalOpen(true);
//   };

//   const handleResetInlineEdit = () => {
//     if (!isInlineEditEnabled) {
//       return;
//     }
//     if (initialFormData) {
//       setFormData(initialFormData);
//     }
//     setValidationErrors({});
//     setIsInlineEditEnabled(false);
//     setStep(1);
//   };

//   const confirmDelete = async () => {
//     try {
//       setIsDeletingML(true);
//       await dispatch(deleteML([id!])).unwrap();
//       toast.success("Micro learning deleted successfully");
//       clearFormState();
//       navigate("/admin/microlearning");
//     } catch (error) {
//       toast.error("Failed to delete micro learning");
//     } finally {
//       setIsDeletingML(false);
//     }
//   };

//   const handleStepBack = () => {
//     if (isDocumentStep) {
//       setStep(1);
//       return;
//     }
//     clearFormState();
//     navigate("/admin/microlearning");
//   };

//   const handleBack = () => {
//     clearFormState();
//     navigate("/admin/microlearning");
//   };

//   const clearFormState = () => {
//     setPendingDocuments([]);
//     setUploadedDocuments([]);
//     setUploadedDocumentNotes({});
//     setPreviewFile(null);
//     setDocumentDeleteTarget(null);
//     setValidationErrors({});
//     setUploadStatus({});
//     setFailedDocuments(new Set());
//     setFormData({
//       title: "",
//       category: { id: "", categoryName: "" },
//       subCategory: { id: "", subCategoryName: "" },
//       shortDescription: "",
//       duration: 0,
//     });
//     setStep(1);
//   };

//   if (isEditMode && loading && !currentML) {
//     return (
//       <div className="p-6 min-h-screen flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
//           <p className="mt-4 text-gray-600">Loading...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="p-4">
//       <div className="py-6">
//         <div className="flex items-center justify-between">
//           <div className="flex items-center gap-4">
//             <h1 className="text-[20px] gap-2 flex items-center font-semibold text-gray-900">
//               <button 
//                 onClick={handleStepBack} 
//                 className="cursor-pointer bg-transparent border-none p-0 flex items-center"
//                 aria-label="Back"
//                 type="button"
//               >
//                 <ArrowLeft />
//               </button>
//               {mode === "view" ? "View" : mode === "edit" && "Edit"} Micro
//               Learning {mode === "create" && "Creation"}
//             </h1>
//           </div>
//           {hasExistingML && (
//             <div className="flex">
//               <Button
//                 className={`gap-2 flex items-center justify-center rounded-lg font-medium border border-r-0 rounded-r-none bg-form-btn text-black-30 border-black-30 hover:text-primary ${
//                   isInlineEditEnabled ? "text-primary" : ""
//                 }`}
//                 size="md"
//                 variant="custom"
//                 disabled={!hasExistingML || !isFormReadOnly}
//                 onClick={handleEnableEdit}
//               >
//                 <Pencil size={16} />
//                 Edit
//               </Button>
//               <Button
//                 size="md"
//                 variant="custom"
//                 className={`gap-2 flex items-center justify-center rounded-lg font-medium border border-l-0 rounded-l-none bg-form-btn text-black-30 border-black-30 hover:text-primary`}
//                 disabled={!hasExistingML || isDeletingML}
//                 onClick={handleDeleteML}
//               >
//                 {isDeletingML ? (
//                   "Deleting..."
//                 ) : (
//                   <>
//                     <Trash size={16} />
//                     Delete
//                   </>
//                 )}
//               </Button>
//               {isInlineEditEnabled && (
//                 <Button
//                   className="mx-2 flex text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//                   size="md"
//                   variant="custom"
//                   onClick={handleResetInlineEdit}
//                 >
//                   Reset Edit
//                 </Button>
//               )}
//             </div>
//           )}
//         </div>
//       </div>

//       <div className="bg-white flex flex-col justify-between p-6 rounded-[10px] h-[calc(100vh-200px)] overflow-y-auto">
//         <div>
//           {!isDocumentStep && (
//             <>
//               <div className="grid grid-cols-3 gap-x-12 gap-y-8">
//                 <div className="mb-12">
//                   <TextField
//                     fullWidth
//                     label="Title"
//                     value={formData.title}
//                     onChange={(e) => handleInputChange("title", e.target.value)}
//                     disabled={isFormReadOnly}
//                     error={!!validationErrors.title}
//                     helperText={validationErrors.title}
//                     variant="standard"
//                     placeholder="Enter Micro Learning Title..."
//                     InputProps={{
//                       sx: {
//                         fontSize: "30px",
//                         fontWeight: "600",
//                         borderStyle: "solid",
//                         "& .MuiInputBase-input.Mui-disabled": {
//                           color: "black !important",
//                           WebkitTextFillColor: "black !important",
//                         },
//                         "&:before": {
//                           borderBottom: "1px solid black !important",
//                         },
//                         "&.Mui-disabled:before": {
//                           borderBottom: "1px solid black !important",
//                         },
//                         "&:after": {
//                           borderBottom: "1px solid black !important",
//                         },
//                       },
//                     }}
//                   />
//                 </div>
//               </div>

//               <div className="grid grid-cols-3 gap-x-12 gap-y-8">
//                 <div>
//                   <FormControl
//                     fullWidth
//                     disabled={isFormReadOnly}
//                     error={!!validationErrors.category}
//                     size="small"
//                   >
//                     <InputLabel id="category-label">Select category</InputLabel>
//                     <Select
//                       labelId="category-label"
//                       value={
//                         typeof formData.category === "string"
//                           ? formData.category
//                           : formData.category?.id || ""
//                       }
//                       label="Select category"
//                       onChange={(e) => {
//                         const selectedCategory = categories.find(
//                           (cat) => cat.id === e.target.value
//                         );
//                         handleInputChange("category", selectedCategory || "");
//                         // Reset subcategory when category changes
//                         handleInputChange("subCategory", {
//                           id: "",
//                           subCategoryName: "",
//                         });
//                         // Fetch subcategories for selected category
//                         if (selectedCategory?.id) {
//                           dispatch(fetchSubCategories(selectedCategory.id));
//                         }
//                       }}
//                       sx={{
//                         "& .MuiSelect-select.Mui-disabled": {
//                           color: "black",
//                           WebkitTextFillColor: "black",
//                         },

//                         "& .MuiSvgIcon-root": {
//                           color: "black !important",
//                         },
//                       }}
//                     >
//                       <MenuItem value="" disabled>
//                         <em>None</em>
//                       </MenuItem>
//                       {categories.map((category) => (
//                         <MenuItem key={category.id} value={category.id}>
//                           {category.categoryName}
//                         </MenuItem>
//                       ))}
//                     </Select>
//                     {validationErrors.category && (
//                       <FormHelperText>
//                         {validationErrors.category}
//                       </FormHelperText>
//                     )}
//                   </FormControl>
//                 </div>

//                 <div>
//                   <FormControl
//                     fullWidth
//                     disabled={isFormReadOnly}
//                     error={!!validationErrors.subCategory}
//                     size="small"
//                   >
//                     <InputLabel id="subcategory-label">
//                       Select sub category
//                     </InputLabel>
//                     <Select
//                       labelId="subcategory-label"
//                       value={
//                         typeof formData.subCategory === "string"
//                           ? formData.subCategory
//                           : formData.subCategory?.id || ""
//                       }
//                       label="Select sub category"
//                       onChange={(e) => {
//                         const selectedSubCategory = subCategories.find(
//                           (subCat) => subCat.id === e.target.value
//                         );
//                         handleInputChange(
//                           "subCategory",
//                           selectedSubCategory
//                             ? {
//                                 id: selectedSubCategory.id,
//                                 subCategoryName:
//                                   selectedSubCategory.subCategoryName,
//                               }
//                             : { id: "", subCategoryName: "" }
//                         );
//                       }}
//                       sx={{
//                         "& .MuiSelect-select.Mui-disabled": {
//                           color: "black",
//                           WebkitTextFillColor: "black",
//                         },

//                         "& .MuiSvgIcon-root": {
//                           color: "black !important",
//                         },
//                       }}
//                     >
//                       <MenuItem value="" disabled>
//                         <em>None</em>
//                       </MenuItem>
//                       {subCategories.map((subCat) => (
//                         <MenuItem key={subCat.id} value={subCat.id}>
//                           {subCat.subCategoryName}
//                         </MenuItem>
//                       ))}
//                     </Select>
//                     {validationErrors.subCategory && (
//                       <FormHelperText>
//                         {validationErrors.subCategory}
//                       </FormHelperText>
//                     )}
//                   </FormControl>
//                 </div>

//                 <div>
//                   <TextField
//                     fullWidth
//                     label="Duration"
//                     type="number"
//                     value={formData.duration === 0 ? "" : formData.duration}
//                     onChange={(e) =>
//                       handleInputChange(
//                         "duration",
//                         e.target.value === "" ? 0 : parseInt(e.target.value)
//                       )
//                     }
//                     disabled={isFormReadOnly}
//                     error={!!validationErrors.duration}
//                     helperText={validationErrors.duration}
//                     variant="outlined"
//                     size="small"
//                     InputProps={{
//                       sx: {
//                         "& .MuiInputBase-input.Mui-disabled": {
//                           color: "black !important",
//                           WebkitTextFillColor: "black !important",
//                         },
//                       },
//                     }}
//                   />
//                 </div>

//                 <div>
//                   <TextField
//                     fullWidth
//                     label="Short Description"
//                     multiline
//                     rows={3}
//                     value={formData.shortDescription}
//                     onChange={(e) =>
//                       handleInputChange("shortDescription", e.target.value)
//                     }
//                     disabled={isFormReadOnly}
//                     error={!!validationErrors.shortDescription}
//                     helperText={validationErrors.shortDescription}
//                     variant="outlined"
//                     size="small"
//                     InputProps={{
//                       sx: {
//                         "& .MuiInputBase-input.Mui-disabled": {
//                           color: "black !important",
//                           WebkitTextFillColor: "black !important",
//                         },
//                       },
//                     }}
//                   />
//                 </div>
//               </div>
              
//               <div className="mt-8">
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Full Description
//                 </label>
//                 <div data-testid="quill-editor">
//                   <ReactQuill
//                     theme="snow"
//                     value={currentML?.fullDescription || ""}
//                     onChange={() => {}} // Read-only for now
//                     readOnly={true}
//                     placeholder="Full description will be generated..."
//                     modules={quillModules}
//                     formats={quillFormats}
//                   />
//                 </div>
//               </div>
//             </>
//           )}

//           {/* Document Section - Always show when there are documents or in edit mode with documents */}
//           {(uploadedDocuments.length > 0 || (isEditMode && currentML?.trainingDocs?.length)) && (
//             <div className="mt-8">
//               <div className="mb-6">
//                 <h2 className="text-[18px] font-regular text-black-80 mb-4">
//                   Document Notes:
//                 </h2>
//               </div>
//               <div className="space-y-4">
//                 {uploadedDocuments.map((doc, index) => {
//                   const docUrl =
//                     doc.docUrl || (doc as any)?.trainingDocsdocUrl || "";
//                   const docKey =
//                     doc.docId ||
//                     (doc as any)?.doc_id ||
//                     docUrl ||
//                     (doc as any)?.trainingDocsdocId ||
//                     `uploaded-${index}`;
//                   const previewType = getPreviewTypeFromMeta(
//                     doc.docType,
//                     docUrl
//                   );
//                   const docName = getFileNameFromPath(
//                     docUrl,
//                     `Document ${index + 1}`
//                   );
//                   const docIdentifier = getDocIdentifier(doc);
//                   const isDeleting = docIdentifier
//                     ? deletingDocId === docIdentifier
//                     : false;
//                   return (
//                     <div
//                       key={docKey}
//                       className="border border-default rounded-lg p-4"
//                     >
//                       <div className="grid grid-cols-12 gap-10">
//                         <div className="col-span-2 flex items-center gap-2">
//                           <div className="gap-1 items-center border mx-auto p-2 flex flex-col border-default rounded-md w-full">
//                             <button
//                               type="button"
//                               onClick={() =>
//                                 handleOpenUploadedDocumentPreview(doc)
//                               }
//                               disabled={
//                                 !docUrl || documentsLoading || isDeleting
//                               }
//                             >
//                               <img
//                                 src={previewIcons[previewType]}
//                                 alt={`${previewType} preview`}
//                               />
//                             </button>
//                             <div>
//                               <p
//                                 className="text-[16px] font-medium text-file-name whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]"
//                                 title={docName}
//                               >
//                                 {docName}
//                               </p>
//                             </div>
//                           </div>
//                         </div>
//                         <div className="flex-1 col-span-9 max-h-[170px] overflow-y-auto doc-notes">
//                           {doc.trainerGuideNotes ? (
//                             <div
//                               className="text-sm text-gray-600 leading-6 break-words pr-2"
//                               dangerouslySetInnerHTML={{
//                                 __html: doc.trainerGuideNotes,
//                               }}
//                             />
//                           ) : (
//                             <p className="text-sm text-gray-500">
//                               No notes added
//                             </p>
//                           )}
//                         </div>
//                         <div className="col-span-1 flex justify-center self-center">
//                           <button
//                             type="button"
//                             onClick={() =>
//                               setDocumentDeleteTarget({
//                                 type: "uploaded",
//                                 doc,
//                               })
//                             }
//                             className="group self-start bg-icon-lite hover:bg-delete-lite rounded-[6px] p-[8px] disabled:cursor-not-allowed relative"
//                             disabled={documentsLoading || isDeleting}
//                           >
//                             {isDeleting ? (
//                               "Deleting..."
//                             ) : (
//                               <>
//                                 <span className="group-hover:hidden">
//                                   <DeleteSVG />
//                                 </span>

//                                 <span className="hidden group-hover:inline">
//                                   <DeleteActiveSVG />
//                                 </span>
//                               </>
//                             )}
//                           </button>
//                         </div>
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>
//             </div>
//           )}

//           {isDocumentStep && (
//             <>
//               <div className="mb-12">
//                 <h2 className="text-[18px] font-regular text-black-80 mb-4">
//                   Learning material:
//                 </h2>
//               </div>
//               <div className="space-y-6">
//                 <div className="max-w-sm w-full relative">
//                   <label
//                     htmlFor={documentUploadInputId}
//                     className={`flex items-center gap-3 rounded-lg border border-dashed px-4 py-3 text-sm w-full transition-colors ${
//                       documentsLoading
//                         ? "cursor-not-allowed bg-gray-50 border-gray-200 text-gray-400"
//                         : "cursor-pointer border-gray-200 text-gray-600 hover:border-blue-400"
//                     }`}
//                   >
//                     <p className="text-[16px] font-medium text-black-50 ml-2 px-1 absolute left-0 top-[-10px] bg-white">
//                       Files
//                     </p>
//                     <span className="flex w-full items-center justify-center gap-2 text-[16px] text-black-30">
//                       <Upload className="h-4 w-4" />
//                       Upload the files
//                     </span>
//                   </label>
//                   <input
//                     id={documentUploadInputId}
//                     hidden
//                     multiple
//                     type="file"
//                     accept="image/*,video/*,.pdf,.doc,.docx"
//                     onChange={handleDocumentFileUpload}
//                     disabled={documentsLoading}
//                   />
//                 </div>
//                 {pendingDocuments.length > 0 ||
//                   (uploadedDocuments.length > 0 && (
//                     <p className="text-[16px] font-medium text-black-80">
//                       Uploaded Files
//                     </p>
//                   ))}
                
//                 {uploadedDocuments.length > 0 && (
//                   <div className="space-y-4">
//                     {uploadedDocuments.map((doc, index) => {
//                       const docUrl =
//                         doc.docUrl || (doc as any)?.trainingDocsdocUrl || "";
//                       const docKey =
//                         doc.docId ||
//                         (doc as any)?.doc_id ||
//                         docUrl ||
//                         (doc as any)?.trainingDocsdocId ||
//                         `uploaded-${index}`;
//                       const previewType = getPreviewTypeFromMeta(
//                         doc.docType,
//                         docUrl
//                       );
//                       const docName = getFileNameFromPath(
//                         docUrl,
//                         `Document ${index + 1}`
//                       );
//                       const docIdentifier = getDocIdentifier(doc);
//                       const isDeleting = docIdentifier
//                         ? deletingDocId === docIdentifier
//                         : false;
//                       return (
//                         <div
//                           key={docKey}
//                           className="border border-default rounded-lg p-4"
//                         >
//                           <div className="grid grid-cols-12 gap-10">
//                             <div className="col-span-2 flex items-center gap-2">
//                               <div className="gap-1 items-center border mx-auto p-2 flex flex-col border-default rounded-md w-full">
//                                 <button
//                                   type="button"
//                                   onClick={() =>
//                                     handleOpenUploadedDocumentPreview(doc)
//                                   }
//                                   disabled={
//                                     !docUrl || documentsLoading || isDeleting
//                                   }
//                                 >
//                                   <img
//                                     src={previewIcons[previewType]}
//                                     alt={`${previewType} preview`}
//                                   />
//                                 </button>
//                                 <div>
//                                   <p
//                                     className="text-[16px] font-medium text-file-name whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]"
//                                     title={docName}
//                                   >
//                                     {docName}
//                                   </p>
//                                 </div>
//                               </div>
//                             </div>
//                             <div className="flex-1 col-span-9 max-h-[170px] overflow-y-auto doc-notes">
//                               {mode === "edit" && isDocumentStep ? (
//                                 <div className="h-full">
//                                   <div data-testid="quill-editor">
//                                     <ReactQuill
//                                       theme="snow"
//                                       value={
//                                         uploadedDocumentNotes[docIdentifier] !==
//                                         undefined
//                                           ? uploadedDocumentNotes[docIdentifier]
//                                           : doc.trainerGuideNotes || ""
//                                       }
//                                       onChange={(value) =>
//                                         handleUploadedDocumentNoteChange(
//                                           docIdentifier,
//                                           value
//                                         )
//                                       }
//                                       readOnly={documentsLoading}
//                                       placeholder="Enter trainer notes"
//                                       modules={quillModules}
//                                       formats={quillFormats}
//                                     />
//                                   </div>
//                                 </div>
//                               ) : (
//                                 <>
//                                   {doc.trainerGuideNotes ? (
//                                     <div
//                                       className="text-sm text-gray-600 leading-6 break-words pr-2"
//                                       dangerouslySetInnerHTML={{
//                                         __html: doc.trainerGuideNotes,
//                                       }}
//                                     />
//                                   ) : (
//                                     <p className="text-sm text-gray-500">
//                                       No notes added
//                                     </p>
//                                   )}
//                                 </>
//                               )}
//                             </div>
//                             <div className="col-span-1 flex justify-center self-center">
//                               <button
//                                 type="button"
//                                 onClick={() =>
//                                   setDocumentDeleteTarget({
//                                     type: "uploaded",
//                                     doc,
//                                   })
//                                 }
//                                 className="group self-start bg-icon-lite hover:bg-delete-lite rounded-[6px] p-[8px] disabled:cursor-not-allowed relative"
//                                 disabled={documentsLoading || isDeleting}
//                               >
//                                 {isDeleting ? (
//                                   "Deleting..."
//                                 ) : (
//                                   <>
//                                     <span className="group-hover:hidden">
//                                       <DeleteSVG />
//                                     </span>

//                                     <span className="hidden group-hover:inline">
//                                       <DeleteActiveSVG />
//                                     </span>
//                                   </>
//                                 )}
//                               </button>
//                             </div>
//                           </div>
//                         </div>
//                       );
//                     })}
//                   </div>
//                 )}
//               </div>
//             </>
//           )}
//         </div>

//         <div className="flex justify-end mt-6 gap-3">
//           {isDocumentStep && (
//             <button
//               onClick={handleBack}
//               disabled={loading || documentsLoading}
//               className="px-6 py-2.5 min-w-[150px] text-[14px] text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               {mode == "view" ? "Back" : "Cancel"}
//             </button>
//           )}
//           {!isDocumentStep && (
//             <button
//               onClick={handleDetailsSubmit}
//               disabled={loading}
//               className="px-6 py-2.5 min-w-[150px] text-[14px] text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               {loading ? "Saving..." : "Continue"}
//             </button>
//           )}
//           {isDocumentStep && (
//             <button
//               onClick={handleDocumentSubmit}
//               disabled={
//                 documentsLoading ||
//                 (pendingDocuments.length === 0 &&
//                   uploadedDocumentNotes &&
//                   Object.keys(uploadedDocumentNotes).length === 0)
//               }
//               className="px-6 py-2.5 min-w-[150px] text-[14px] bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               {documentsLoading ? "Saving..." : "Save"}
//             </button>
//           )}
//         </div>
//       </div>

//       {previewFile && (
//         <div
//           className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
//           onClick={handleClosePreview}
//         >
//           <div
//             className="w-full max-w-3xl rounded-lg bg-white shadow-xl"
//             onClick={(event) => event.stopPropagation()}
//           >
//             <div className="flex items-center justify-between border-b px-6 py-4">
//               <p className="text-sm font-medium text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis max-w-[600px]">
//                 {previewFile.name}
//               </p>
//               <button
//                 type="button"
//                 onClick={handleClosePreview}
//                 className="text-sm text-gray-500 hover:text-gray-900"
//               >
//                 <X />
//               </button>
//             </div>
//             <div className="px-6 py-6">
//               {previewFile.type === "image" && (
//                 <img
//                   src={previewFile.url}
//                   alt={previewFile.name}
//                   className="max-h-[70vh] w-full object-contain"
//                 />
//               )}
//               {previewFile.type === "video" && (
//                 <video
//                   controls
//                   className="w-full max-h-[70vh]"
//                   src={previewFile.url}
//                 />
//               )}
//               {(previewFile.type === "pdf" || previewFile.type === "doc") && (
//                 <div className="relative h-[70vh]">
//                   {isIframeLoading && (
//                     <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
//                       <div className="text-center">
//                         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
//                         <p className="mt-4 text-gray-600">
//                           Loading document...
//                         </p>
//                       </div>
//                     </div>
//                   )}
//                   <iframe
//                     title={previewFile.name}
//                     src={`https://docs.google.com/gview?url=${encodeURIComponent(
//                       previewFile.url
//                     )}&embedded=true`}
//                     className="h-full w-full border-0"
//                     onLoad={() => setIsIframeLoading(false)}
//                   />
//                 </div>
//               )}
//               {/* {previewFile.type === 'doc' && (
//                 <div className="flex flex-col items-center gap-4 py-10">
//                   <img src={DocPreview} alt="Doc preview" className="h-20 w-20" />
//                   <p className="text-sm text-gray-600">Download the file to view the document</p>
//                   <a
//                     href={previewFile.url}
//                     download={previewFile.name}
//                     className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
//                   >
//                     Download
//                   </a>
//                 </div>
//               )} */}
//             </div>
//           </div>
//         </div>
//       )}

//       <Modal
//         isOpen={!!documentDeleteTarget}
//         onClose={handleCloseDocumentDeleteModal}
//         title={
//           documentDeleteTarget
//             ? documentDeleteTarget.type === "pending"
//               ? "Remove File"
//               : "Delete Uploaded File"
//             : "Delete File"
//         }
//         size="md"
//       >
//         <div className="p-4">
//           <p className="text-dark-gray mb-6 break-words font-semibold">
//             Are you sure you want to delete {documentDeleteName || "this file"}?{" "}
//             <br />
//             This action cannot be undone.
//           </p>
//           <div className="flex justify-end gap-3">
//             <Button
//               variant="outline"
//               className="text-primary border-0 hover:border-primary bg-background"
//               onClick={handleCloseDocumentDeleteModal}
//               disabled={documentDeleteInProgress}
//             >
//               Cancel
//             </Button>
//             <Button
//               variant="custom"
//               className="bg-btn-danger hover:bg-red-700 text-white rounded-[6px]"
//               onClick={handleConfirmDocumentDelete}
//               disabled={documentDeleteInProgress}
//             >
//               {documentDeleteInProgress ? "Deleting..." : "Delete"}
//             </Button>
//           </div>
//         </div>
//       </Modal>

//       <Modal
//         isOpen={isDeleteModalOpen}
//         onClose={() => setIsDeleteModalOpen(false)}
//         size="md"
//       >
//         <div className="p-12 pt-6">
//           <p className="text-dark-gray mb-6 font-semibold">
//             Are you sure! do you want to delete this Micro Learning?
//           </p>
//           <div className="flex justify-center gap-3">
//             <Button
//               variant="outline"
//               className="text-primary border-0 hover:border-primary bg-background"
//               onClick={() => setIsDeleteModalOpen(false)}
//             >
//               Cancel
//             </Button>
//             <Button
//               variant="custom"
//               className="bg-btn-danger hover:bg-red-700 text-white rounded-[6px]"
//               onClick={confirmDelete}
//             >
//               Delete
//             </Button>
//           </div>
//         </div>
//       </Modal>
//     </div>
//   );
// }
