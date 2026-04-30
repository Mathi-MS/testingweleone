import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "../../../components/ui/Button";
import {
  ArrowLeft,
  CheckCircle,
  X,
  Loader,
  Upload,
  Pencil,
  Trash,
  AlertCircle,
  RotateCcw,
} from "lucide-react";
import { toast } from "react-toastify";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import {
  fetchMLById,
  updateML,
  addDocument,
  clearCurrentML,
  setCurrentML,
  updateDocumentNotes,
  deleteDocument,
} from "../../../features/microlearning/mlSlice";
import { RootState, AppDispatch } from "../../../app/store";
import {
  NextSVG,
  PrevSVG,
  DeleteSVG,
  DeleteActiveSVG,
  EditSVG,
  EditActiveSVG,
} from "../../../assets/svg";
import { Modal } from "../../../components/ui/Modal";
import { FilePreviewType } from "../../../types";
import VideoPreview from "../../../assets/icon/video-preview.svg";
import DocPreview from "../../../assets/icon/doc-preview.svg";
import PDFPreview from "../../../assets/icon/pdf-preview.svg";
import ImagePreview from "../../../assets/icon/img-preview.svg";
import { useAppDispatch } from "../../../app/hook";

const quillModules = {
  toolbar: [
    ["bold", "italic", "underline"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["clean"],
  ],
};

const quillFormats = ["bold", "italic", "underline", "list", "bullet"];

const previewIcons: Record<FilePreviewType, string> = {
  image: ImagePreview,
  video: VideoPreview,
  pdf: PDFPreview,
  doc: DocPreview,
};

const getFileType = (file: File): FilePreviewType | null => {
  const mime = file.type.toLowerCase();
  if (mime.startsWith("image/")) {
    return "image";
  }
  if (mime.startsWith("video/")) {
    return "video";
  }
  if (mime === "application/pdf") {
    return "pdf";
  }
  if (
    mime === "application/msword" ||
    mime ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return "doc";
  }
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (!extension) {
    return null;
  }
  if (
    ["png", "jpg", "jpeg", "gif", "bmp", "svg", "webp", "jfif"].includes(
      extension
    )
  ) {
    return "image";
  }
  if (["mp4", "mov", "avi", "mkv", "webm", "m4v"].includes(extension)) {
    return "video";
  }
  if (extension === "pdf") {
    return "pdf";
  }
  if (["doc", "docx"].includes(extension)) {
    return "doc";
  }
  return null;
};

export default function MLDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { currentML, loading } = useSelector((state: RootState) => state.ml);
  const [currentDocumentIndex, setCurrentDocumentIndex] = useState<number>(0);
  const [showAddDocument, setShowAddDocument] = useState<boolean>(false);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [previewFile, setPreviewFile] = useState<{
    url: string;
    type: string;
    name: string;
  } | null>(null);
  const [pendingDocuments, setPendingDocuments] = useState<any[]>([]);
  const [uploadStatus, setUploadStatus] = useState<Record<string, string>>({});
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [editedNotes, setEditedNotes] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingDocId, setDeletingDocId] = useState<string | null>(null);
  const [iframeLoading, setIframeLoading] = useState<boolean>(false);

  useEffect(() => {
    if (id) {
      // Always fetch fresh data from API, ignore cached state
      dispatch(fetchMLById(id));
    }
    return () => {
      dispatch(clearCurrentML());
    };
  }, [dispatch, id]);

  const [basicDetails, setBasicDetails] = useState({
    microLearnId: "",
    microLearnNumber: "",
    microLearnTitle: "",
    recomendedCourses: [{ courseId: "", comments: "" }],
  });

  useEffect(() => {
    if (currentML) {
      setBasicDetails({
        microLearnId: currentML.microLearnId || "",
        microLearnNumber: "",
        microLearnTitle: currentML.microLearnTitle || "",
        recomendedCourses: (currentML.recomendedCourses || []).map(
          (course) => ({
            courseId: course.courseId || "",
            comments: course.comments || "",
          })
        ),
      });
      // Reset document index when ML changes
      setCurrentDocumentIndex(0);
    }
  }, [currentML]);

  const handleInputChange = (field: string, value: string) => {
    setBasicDetails((prev) => ({ ...prev, [field]: value }));
  };

  const handleCourseChange = (index: number, field: string, value: string) => {
    setBasicDetails((prev) => ({
      ...prev,
      recomendedCourses: prev.recomendedCourses.map((course, i) =>
        i === index ? { ...course, [field]: value } : course
      ),
    }));
  };

  const addCourse = () => {
    setBasicDetails((prev) => ({
      ...prev,
      recomendedCourses: [
        ...prev.recomendedCourses,
        { courseId: "", comments: "" },
      ],
    }));
  };

  const removeCourse = (index: number) => {
    if (basicDetails.recomendedCourses.length > 1) {
      setBasicDetails((prev) => ({
        ...prev,
        recomendedCourses: prev.recomendedCourses.filter((_, i) => i !== index),
      }));
    }
  };

  const handleSaveDetails = async () => {
    if (!id) return;
    try {
      await dispatch(
        updateML({ microLearnId: id, data: basicDetails })
      ).unwrap();
    } catch (error) {
      console.error("Failed to update ML:", error);
    }
  };

  const handleAddDocument = () => {
    setShowAddDocument(true);
  };

  const documents = currentML?.trainingDocs || currentML?.training_docs || [];
  const currentDocument = documents[currentDocumentIndex];

  const getFileType = (docType?: string | null, url?: string | null): string => {
    const lower = docType?.toLowerCase() || "";

    // Check URL extension first for more reliable detection
    if (/\.(jpg|jpeg|png|gif|bmp|svg|webp|jfif)$/i.test(url || "")) {
      return "image";
    }
    if (/\.(mp4|mov|avi|mkv|webm|m4v)$/i.test(url || "")) {
      return "video";
    }
    if (/\.pdf$/i.test(url || "")) {
      return "pdf";
    }
    if (/\.(doc|docx)$/i.test(url || "")) {
      return "doc";
    }

    // Fallback to docType if URL extension check fails
    if (
      lower.startsWith("image/") ||
      lower === "jpg" ||
      lower === "jpeg" ||
      lower === "png"
    ) {
      return "image";
    }
    if (lower.startsWith("video/")) {
      return "video";
    }
    if (lower === "application/pdf" || lower === "pdf") {
      return "pdf";
    }
    if (
      lower === "application/msword" ||
      lower ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      lower === "doc" ||
      lower === "docx"
    ) {
      return "doc";
    }

    return "doc";
  };

  const getFileName = (url?: string | null, docType?: string | null): string => {
    if (!url) return docType || "Document";
    const segments = url.split("/");
    return segments[segments.length - 1] || docType || "Document";
  };

  const handlePrevious = () => {
    if (currentDocumentIndex > 0) {
      const newIndex = currentDocumentIndex - 1;
      const doc = documents[newIndex];
      const fileType = getFileType(doc?.docType, doc?.docUrl ?? undefined);
      
      if (fileType === 'pdf' || fileType === 'doc') {
        setIframeLoading(true);
      }
      
      setCurrentDocumentIndex(newIndex);
    }
  };

  const handleNext = () => {
    if (currentDocumentIndex < documents.length - 1) {
      const newIndex = currentDocumentIndex + 1;
      const doc = documents[newIndex];
      const fileType = getFileType(doc?.docType, doc?.docUrl ?? undefined);
      
      if (fileType === 'pdf' || fileType === 'doc') {
        setIframeLoading(true);
      }
      
      setCurrentDocumentIndex(newIndex);
    }
  };

  const handleDocumentSelect = (index: number) => {
    console.log("Selecting document at index:", index);
    setCurrentDocumentIndex(index);
    setShowDropdown(false);

    // Force preview update immediately
    const selectedDoc = documents[index];
    console.log("Selected document:", selectedDoc);

    if (selectedDoc) {
      const docUrl = selectedDoc.docUrl;
      console.log("Document URL:", docUrl);

      if (docUrl) {
        const fileType = getFileType(selectedDoc.docType, docUrl);
        const newPreviewFile = {
          url: docUrl,
          type: fileType,
          name: getFileName(docUrl, selectedDoc.docType),
        };
        console.log("Setting preview file:", newPreviewFile);
        
        // Set loading state for documents that need iframe
        if (fileType === 'pdf' || fileType === 'doc') {
          setIframeLoading(true);
        }
        
        setPreviewFile(newPreviewFile);
      } else {
        console.log("No URL found, clearing preview");
        setPreviewFile(null);
      }
    } else {
      console.log("No document found, clearing preview");
      setPreviewFile(null);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const newDocs = files.map((file) => ({
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      file,
      notes: "",
      type: getFileType(file.type, file.name),
    }));
    setPendingDocuments((prev) => [...prev, ...newDocs]);
    event.target.value = "";
  };

  const handleDocumentNoteChange = (docId: string, value: string) => {
    setPendingDocuments((prev) =>
      prev.map((doc) => (doc.id === docId ? { ...doc, notes: value } : doc))
    );
  };

  const handleRemoveDocument = (docId: string) => {
    setPendingDocuments((prev) => prev.filter((doc) => doc.id !== docId));
  };

  const handleSubmitDocuments = async () => {
    if (!id || pendingDocuments.length === 0) return;

    setDocumentsLoading(true);
    setShowProgressModal(true);
    let successCount = 0;

    for (const doc of pendingDocuments) {
      setUploadStatus((prev) => ({ ...prev, [doc.id]: "uploading" }));
      try {
        await dispatch(
          addDocument({
            ml_id: id,
            file: doc.file,
            trainingnotes: doc.notes,
          })
        ).unwrap();
        setUploadStatus((prev) => ({ ...prev, [doc.id]: "success" }));
        successCount++;
      } catch (error) {
        setUploadStatus((prev) => ({ ...prev, [doc.id]: "error" }));
      }
    }

    setDocumentsLoading(false);

    if (successCount === pendingDocuments.length) {
      setTimeout(() => {
        setShowProgressModal(false);
        setPendingDocuments([]);
        setUploadStatus({});
        setShowAddDocument(false);
        if (id) dispatch(fetchMLById(id));
        toast.success(`${successCount} document(s) uploaded successfully`);
      }, 1500);
    }
  };

  const handleRetryUpload = async (docId: string) => {
    if (!id) return;

    const doc = pendingDocuments.find((d) => d.id === docId);
    if (!doc) return;

    setUploadStatus((prev) => ({ ...prev, [docId]: "uploading" }));
    try {
      await dispatch(
        addDocument({
          ml_id: id,
          file: doc.file,
          trainingnotes: doc.notes,
        })
      ).unwrap();
      setUploadStatus((prev) => ({ ...prev, [docId]: "success" }));
    } catch (error) {
      setUploadStatus((prev) => ({ ...prev, [docId]: "error" }));
    }
  };

  const isUploadDisabled = () => {
    return documentsLoading || pendingDocuments.some(doc => !doc.notes.trim());
  };

  const handleEditNotes = () => {
    const currentNotes =
      currentDocument?.trainerGuideNotes ||
      "";
    setEditedNotes(currentNotes);
    setIsEditingNotes(true);
    // Scroll to notes section
    setTimeout(() => {
      document
        .getElementById("notes-section")
        ?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleCancelEdit = () => {
    setIsEditingNotes(false);
    setEditedNotes("");
  };

  const handleSaveNotes = async () => {
    if (!id || !currentDocument) return;

    const docId = currentDocument.docId;
    if (!docId) {
      toast.error("Document ID not found");
      return;
    }

    try {
      setDocumentsLoading(true);
      await dispatch(
        updateDocumentNotes({
          ml_id: id,
          doc_id: docId,
          trainingnotes: editedNotes,
        })
      ).unwrap();

      toast.success("Notes updated successfully");
      setIsEditingNotes(false);
      setEditedNotes("");
      if (id) dispatch(fetchMLById(id));
    } catch (error) {
      toast.error("Failed to update notes");
    } finally {
      setDocumentsLoading(false);
    }
  };

  const handleDeleteDocument = () => {
    if (!currentDocument) return;
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteDocument = async () => {
    if (!id || !currentDocument) return;

    const docId = currentDocument.docId;
    if (!docId) {
      toast.error("Document ID not found");
      return;
    }

    try {
      setDeletingDocId(docId);
      await dispatch(
        deleteDocument({
          ml_id: id,
          doc_id: docId,
        })
      ).unwrap();

      toast.success("Document deleted successfully");
      setIsDeleteModalOpen(false);

      // Reset to first document if current was deleted
      if (currentDocumentIndex >= documents.length - 1) {
        setCurrentDocumentIndex(Math.max(0, documents.length - 2));
      }

      if (id) dispatch(fetchMLById(id));
    } catch (error) {
      toast.error("Failed to delete document");
    } finally {
      setDeletingDocId(null);
    }
  };

  useEffect(() => {
    if (currentDocument) {
      const docUrl = currentDocument.docUrl;
      if (docUrl) {
        const fileType = getFileType(currentDocument.docType, docUrl);
        setPreviewFile({
          url: docUrl,
          type: fileType,
          name: getFileName(docUrl, currentDocument.docType),
        });
        // Set loading state for documents that need iframe
        if (fileType === 'pdf' || fileType === 'doc') {
          setIframeLoading(true);
        }
      } else {
        setPreviewFile(null);
      }
    } else {
      setPreviewFile(null);
    }
  }, [currentDocument, currentDocumentIndex]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showDropdown && !target.closest('.relative')) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDropdown]);

  // Reset editing state when document changes
  useEffect(() => {
    setIsEditingNotes(false);
    setEditedNotes("");
  }, [currentDocumentIndex]);

  return (
    <div className="p-6 min-h-screen">
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-text-gray">Loading...</div>
        </div>
      ) : !currentML ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-text-gray">ML not found</div>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-[20px] font-semibold text-dark-gray">
              {currentML.microLearnId} - Files
            </h1>
          </div>

          {/* <div className="grid grid-cols-12 gap-6"> */}
          {/* <div className="col-span-3">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-medium text-dark-gray mb-4">Basic Details</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-dark-gray mb-1">Micro Learn ID</label>
                    <input
                      type="text"
                      value={basicDetails.microLearnId}
                      onChange={(e) => handleInputChange('microLearnId', e.target.value)}
                      placeholder="Enter"
                      className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                      disabled
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark-gray mb-1">Micro Learn Number</label>
                    <input
                      type="text"
                      value={basicDetails.microLearnNumber}
                      onChange={(e) => handleInputChange('microLearnNumber', e.target.value)}
                      placeholder="Enter"
                      className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                      disabled
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark-gray mb-1">Micro Learn Title</label>
                    <input
                      type="text"
                      value={basicDetails.microLearnTitle}
                      onChange={(e) => handleInputChange('microLearnTitle', e.target.value)}
                      placeholder="Enter"
                      className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                      disabled
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="col-span-9"> */}
          <div className="rounded-lg shadow-sm">
            {/* Document Header */}
            <div className="grid grid-cols-12 items-center w-full justify-between mb-3">
              <div className="col-span-10 flex justify-between items-center gap-4 px-4 py-2 bg-white rounded-lg">
                <button
                  onClick={handlePrevious}
                  disabled={
                    currentDocumentIndex === 0 || documents.length === 0
                  }
                  className="text-text-gray hover:text-dark-gray flex disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <PrevSVG />
                  Previous
                </button>

                <div className="relative flex items-center gap-2 w-full max-w-[600px] bg-lite-gray-bg p-2 rounded-md justify-between">
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center justify-center w-full"
                  >
                    <div>
                      <span className="text-sm font-medium text-primary mr-2">
                        {documents.length > 0
                          ? `${currentDocumentIndex + 1} / ${documents.length}`
                          : "0 / 0"}
                      </span>
                      <span className="text-sm text-primary" title={currentDocument?.filename}>
                        {currentDocument
                          ? currentDocument.filename.length > 20
                            ? `${currentDocument.filename.substring(0, 60)}...`
                            : currentDocument.filename
                          : "No document"}
                      </span>
                    </div>
                    <svg
                      className={`w-4 h-4 text-text-gray transition-transform ${
                        showDropdown ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {showDropdown && documents.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 max-h-48 overflow-y-auto">
                      {documents.map((doc, index) => (
                        <button
                          key={index}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDocumentSelect(index);
                          }}
                          className={`w-full text-left px-3 py-2 hover:bg-gray-50 text-sm ${
                            index === currentDocumentIndex
                              ? "bg-blue-50 text-blue-600"
                              : "text-gray-700"
                          }`}
                        >
                          {doc.filename}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={handleNext}
                  disabled={
                    currentDocumentIndex >= documents.length - 1 ||
                    documents.length === 0
                  }
                  className="text-text-gray hover:text-dark-gray flex disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <NextSVG />
                </button>
              </div>

              <Button
                onClick={handleAddDocument}
                className="col-span-2 bg-primary text-white flex justify-center ml-2 whitespace-nowrap"
              >
                + Add Document
              </Button>
            </div>

            {/* Document Content */}
            <div className="p-8 bg-white mb-2 rounded-lg">
              <div className="mb-8">
                {currentDocument && (
                  <div className="flex justify-end mb-2">
                    <button
                      onClick={handleEditNotes}
                      className="group px-4 py-2 text-base gap-2 flex items-center justify-center rounded-lg font-medium border border-r-0 rounded-r-none bg-form-btn text-black-30 border-black-30 hover:text-primary transition-colors"
                      title="Edit Notes"
                    >
                      <span className="group-hover:hidden">
                        <EditSVG />
                      </span>
                      <span className="hidden group-hover:inline">
                        <EditActiveSVG />
                      </span>
                      Edit
                    </button>
                    <button
                      onClick={handleDeleteDocument}
                      className="group px-4 py-2 text-base gap-2 flex items-center justify-center rounded-lg font-medium border border-l-0 rounded-l-none bg-form-btn text-black-30 border-black-30 hover:text-delete transition-colors"
                      title="Delete Document"
                      disabled={deletingDocId !== null}
                    >
                      {deletingDocId ? (
                        <Loader
                          size={16}
                          className="animate-spin text-gray-600"
                        />
                      ) : (
                        <>
                          <span className="group-hover:hidden">
                            <DeleteSVG />
                          </span>
                          <span className="hidden group-hover:inline">
                            <DeleteActiveSVG />
                          </span>
                          Delete
                        </>
                      )}
                    </button>
                  </div>
                )}
                {/* Document preview or no data state */}
                {documents.length > 0 ? (
                  <div
                    key={`preview-${currentDocumentIndex}-${previewFile?.url}`}
                    className="w-full h-96 bg-background rounded-lg overflow-hidden"
                  >
                    {previewFile ? (
                      <div className="h-full flex items-center justify-center bg-gray-50">
                        {previewFile.type === "image" ? (
                          <img
                            src={previewFile.url}
                            alt={previewFile.name}
                            className="max-w-full max-h-full object-contain rounded"
                            onLoad={() =>
                              console.log(
                                "Image loaded successfully:",
                                previewFile.url
                              )
                            }
                            onError={(e) => {
                              console.error(
                                "Image failed to load:",
                                previewFile.url
                              );
                              e.currentTarget.src =
                                "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTkgMTJINm0tNiA0aDZtMiA1SDdhMiAyIDAgMDEtMi0yVjVhMiAyIDAgMDEyLTJoNS41ODZhMSAxIDAgMDEuNzA3LjI5M2w1LjQxNCA1LjQxNGExIDEgMCAwMS4yOTMuNzA3VjE5YTIgMiAwIDAxLTIgMnoiIHN0cm9rZT0iIzk5OTk5OSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+";
                            }}
                          />
                        ) : previewFile.type === "video" ? (
                          <video
                            controls
                            className="max-w-full max-h-full rounded"
                            src={previewFile.url}
                            onError={(e) => {
                              console.error(
                                "Video failed to load:",
                                previewFile.url
                              );
                            }}
                          >
                            Your browser does not support the video tag.
                          </video>
                        ) : (
                          <div className="relative w-full h-full">
                            {iframeLoading && (
                              <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
                                <div className="text-center">
                                  <Loader size={32} className="animate-spin text-primary mx-auto mb-2" />
                                  <p className="text-sm text-gray-600">Loading document...</p>
                                </div>
                              </div>
                            )}
                            <iframe
                              key={previewFile.url}
                              src={`https://docs.google.com/gview?url=${encodeURIComponent(
                                previewFile.url
                              )}&embedded=true`}
                              className="w-full h-full border-0 rounded"
                              title={previewFile.name}
                              onLoad={() => setIframeLoading(false)}
                              onError={(e) => {
                                setIframeLoading(false);
                                console.error(
                                  "Document failed to load:",
                                  previewFile.url
                                );
                              }}
                            />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full text-text-gray">
                        <div className="text-center">
                          <svg
                            className="w-16 h-16 mx-auto mb-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                          <p>Loading preview...</p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-full h-64 rounded-lg flex flex-col items-center justify-center">
                    <div className="text-text-gray mb-6">
                      <svg
                        className="w-16 h-16 mx-auto mb-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <p className="text-lg mb-2">No Documents Available</p>
                      <p className="text-sm text-gray-500">
                        Add documents to get started
                      </p>
                    </div>
                    {/* <Button
                      onClick={handleAddDocument}
                      className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      + Add Document
                    </Button> */}
                  </div>
                )}
              </div>

              {/* Notes Section */}
              <div className="p-6 mb-2 rounded-lg" id="notes-section">
                <div className="mb-4">
                  <h3 className="text-lg font-medium text-dark-gray">Notes</h3>
                </div>
                <div className="space-y-4">
                  {isEditingNotes ? (
                    <div className="space-y-4">
                      <ReactQuill
                        theme="snow"
                        value={editedNotes}
                        onChange={setEditedNotes}
                        placeholder="Enter trainer notes..."
                        modules={quillModules}
                        formats={quillFormats}
                      />
                      <div className="flex justify-end gap-3">
                        <Button
                          variant="outline"
                          onClick={handleCancelEdit}
                          className="text-gray-600 border-gray-300 hover:bg-gray-50"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleSaveNotes}
                          className="bg-primary text-white hover:bg-blue-700"
                          disabled={documentsLoading}
                        >
                          {documentsLoading ? "Saving..." : "Save"}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {currentDocument &&
                      currentDocument.trainerGuideNotes ? (
                        <div
                          className="text-sm text-text-gray text-left leading-relaxed"
                          dangerouslySetInnerHTML={{
                            __html:
                              currentDocument.trainerGuideNotes,
                          }}
                        />
                      ) : (
                        <p className="text-sm text-text-gray">
                          No notes available for this document
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Feedback Section */}
            {/* <div className="p-6 border-t bg-white rounded-lg">
                  <h3 className="text-lg font-medium text-dark-gray mb-4">Feedback</h3>
                  <div className="space-y-4">
                    {currentML.trainers_feedback?.length > 0 ? (
                      currentML.trainers_feedback.map((feedback, idx) => (
                        <div key={idx} className="flex gap-3">
                          <div className="w-8 h-8 bg-border rounded-full flex-shrink-0"></div>
                          <div>
                            <p className="font-medium text-sm text-dark-gray">Trainer {feedback.trainer_id}</p>
                            <p className="text-sm text-text-gray mt-1">{feedback.feedback_comment}</p>
                            <p className="text-xs text-text-gray mt-1">
                              {new Date(feedback.feedback_datetime).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-text-gray">No feedback available</p>
                    )}
                  </div>
                </div> */}
          </div>
          {/* </div> */}
          {/* </div> */}
        </>
      )}

      {/* Add Document Modal */}
      {showAddDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[800px] max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-medium text-dark-gray mb-4">
              Add Documents
            </h3>

            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center mb-4">
              <input
                type="file"
                onChange={handleFileUpload}
                className="hidden"
                id="document-upload"
                accept="image/*,video/*,.pdf,.doc,.docx"
                multiple
              />
              <label
                htmlFor="document-upload"
                className="cursor-pointer text-primary hover:text-accent flex flex-col items-center"
              >
                <Upload className="w-8 h-8 mb-2" />
                Click to upload documents
              </label>
              <p className="text-sm text-text-gray mt-2">
                Images, Videos, PDF, DOC files supported
              </p>
            </div>

            {pendingDocuments.length > 0 && (
              <div className="space-y-4 mb-4">
                <h4 className="font-medium text-dark-gray">
                  Selected Documents:
                </h4>
                {pendingDocuments.map((doc) => {
                  const status = uploadStatus[doc.id] || "pending";
                  return (
                    <div
                      key={doc.id}
                      className="relative border border-gray-200 rounded-lg pl-4"
                    >
                      <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-3 flex items-center">
                          <div className="relative gap-1 items-center border mx-auto p-2 flex flex-col border-default rounded-md w-full">
                            <div className="w-12 h-12 rounded flex items-center justify-center">
                              <img
                                src={previewIcons[doc.type as FilePreviewType]}
                                alt={`${doc.type} preview`}
                              />
                            </div>
                            <p
                              className="text-sm font-medium truncate max-w-[120px]"
                              title={doc.file.name}
                            >
                              {doc.file.name}
                            </p>
                          </div>
                        </div>

                        <div className="col-span-9 pending-upload">
                          <ReactQuill
                            theme="snow"
                            value={doc.notes}
                            onChange={(value) =>
                              handleDocumentNoteChange(doc.id, value)
                            }
                            readOnly={
                              status === "uploading" || status === "success"
                            }
                            placeholder="Enter trainer notes..."
                            modules={quillModules}
                            formats={quillFormats}
                          />
                        </div>

                        {status === "pending" && (
                          <button
                            onClick={() => handleRemoveDocument(doc.id)}
                            className="text-white bg-delete absolute top-[-13px] right-[-13px] p-[5px] rounded-full"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddDocument(false);
                  setPendingDocuments([]);
                  setUploadStatus({});
                }}
                disabled={documentsLoading}
              >
                Cancel
              </Button>
              {pendingDocuments.length > 0 && (
                <Button
                  onClick={handleSubmitDocuments}
                  disabled={isUploadDisabled()}
                  className="bg-primary text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {documentsLoading
                    ? "Uploading..."
                    : `Upload ${pendingDocuments.length} Document(s)`}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Upload Progress Modal */}
      {showProgressModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[500px] max-h-[70vh] overflow-y-auto">
            <h3 className="text-lg font-medium text-dark-gray mb-4">
              Upload Progress
            </h3>

            <div className="space-y-3">
              {pendingDocuments.map((doc) => {
                const status = uploadStatus[doc.id] || "pending";
                return (
                  <div
                    key={doc.id}
                    className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg"
                  >
                    <div className="w-10 h-10 flex items-center justify-center">
                      <img
                        src={previewIcons[doc.type as FilePreviewType]}
                        alt={`${doc.type} icon`}
                        className="w-8 h-8"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p
                        className="text-sm font-medium text-dark-gray truncate"
                        title={doc.file.name}
                      >
                        {doc.file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(doc.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {status === "uploading" && (
                        <Loader
                          size={20}
                          className="animate-spin text-blue-500"
                        />
                      )}
                      {status === "success" && (
                        <CheckCircle size={20} className="text-green-500" />
                      )}
                      {status === "error" && (
                        <>
                          <AlertCircle size={20} className="text-red" />
                          <button
                            onClick={() => handleRetryUpload(doc.id)}
                            className="p-1 hover:bg-gray-100 rounded"
                            title="Retry upload"
                          >
                            <RotateCcw size={16} className="text-gray-600" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              {!documentsLoading && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowProgressModal(false);
                    const hasSuccess = Object.values(uploadStatus).some(
                      (status) => status === "success"
                    );
                    if (hasSuccess) {
                      setPendingDocuments([]);
                      setUploadStatus({});
                      setShowAddDocument(false);
                      if (id) dispatch(fetchMLById(id));
                    }
                  }}
                >
                  Close
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Document"
        size="md"
      >
        <div className="p-4">
          <p className="text-dark-gray mb-6 break-words font-semibold">
            Are you sure you want to delete this document? <br />
            This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              className="text-primary border-0 hover:border-primary bg-background"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={deletingDocId !== null}
            >
              Cancel
            </Button>
            <Button
              variant="custom"
              className="bg-btn-danger hover:bg-red-700 text-white rounded-[6px]"
              onClick={confirmDeleteDocument}
              disabled={deletingDocId !== null}
            >
              {deletingDocId ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
