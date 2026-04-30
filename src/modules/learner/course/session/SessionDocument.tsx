import React, { useEffect, useState } from "react";
import { Download, Eye, Trash2, Upload, X, FileText, AlertCircle, AlertTriangle, Pencil } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../../../app/store";
import Box from "@mui/material/Box";
import {
  FormControlLabel,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { CustomInput } from "../../../../components/custom/CustomInput";
import { inputForm } from "../../../../components/custom/CustomStyles";
import { sessiondocument, updateSessionDocument } from "../../../../features/sessionDocumentSlice";
import { useParams } from "react-router-dom";
import { getSessionById } from "../../../../features/sessionSlice";
import { useAppSelector } from "../../../../app/hook";
import { showError, showSuccess } from "../../../../components/ui/Toast";
import { apiClient } from "../../../../services/api";
import { entityApi } from "../../../../services/entityApi";

export const SessionDocument = () => {
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch<AppDispatch>();

  const [formData, setFormData] = useState({
    documentName: "",
    description: "",
    file: null as File | null,
    isStudentVisible: false,
  });

  const { currentSession } = useSelector((state: any) => state.session);

  const [errors, setErrors] = useState<any>({});
  const { sessionId } = useParams<{ sessionId: string }>();
  const { userDetails } = useAppSelector((state) => state.ar);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewFileName, setPreviewFileName] = useState("");

  // Delete confirmation modal state
  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    documentId: string;
    documentName: string;
  }>({ open: false, documentId: "", documentName: "" });
  const [isDeleting, setIsDeleting] = useState(false);

  // ✅ Edit modal state
  const [editModal, setEditModal] = useState<{
    open: boolean;
    documentId: string;
  }>({ open: false, documentId: "" });
  const [editFormData, setEditFormData] = useState({
    documentName: "",
    description: "",
    file: null as File | null,
    isStudentVisible: false,
  });
  const [editErrors, setEditErrors] = useState<any>({});
  const [isUpdating, setIsUpdating] = useState(false);

  // ✅ Correctly maps to API response field: sessionDocuments
  const documents: any[] = currentSession?.sessionDocuments ?? [];
  console.log(documents, "documents");

  const ROLE_TRAINER = userDetails?.roles?.some(
    (role: string) => role.toUpperCase() === "ROLE_TRAINER",
  );

  // ------------------ HANDLERS ------------------

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev: any) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const newErrors: any = {};
    if (!formData.documentName.trim()) {
      newErrors.documentName = "Document name is required";
    }
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }
    if (!formData.file) {
      newErrors.file = "Please upload a document";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      const res: any = await dispatch(
        sessiondocument({
          id: sessionId!,
          file: formData.file!,
          documentName: formData.documentName,
          description: formData.description,
          isStudentVisible: formData.isStudentVisible,
        })
      );

      if (res?.payload?.statusCode === 200) {
        showSuccess(res.payload.statusMessage || "Document uploaded successfully");
        dispatch(getSessionById(sessionId!) as any);
        handleClose();
      } else {
        showError(res?.payload?.statusMessage || "Upload failed");
      }
    } catch (err) {
      showError("Something went wrong");
    }
  };

  const handleClose = () => {
    setFormData({
      documentName: "",
      description: "",
      file: null,
      isStudentVisible: false,
    });
    setErrors({});
    setOpen(false);
  };

  // ------------------ DELETE ------------------

  const handleDeleteClick = (documentId: string, documentName: string) => {
    setDeleteModal({ open: true, documentId, documentName });
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      const res = await entityApi.deleteSessionDocument(
        sessionId!,
        deleteModal.documentId
      );
      if ((res as any)?.statusCode === 200) {
        showSuccess((res as any)?.statusMessage || "Document deleted successfully");
      } else {
        showSuccess("Document deleted successfully");
      }
      dispatch(getSessionById(sessionId!) as any);
    } catch (err) {
      showError("Failed to delete document");
    } finally {
      setIsDeleting(false);
      setDeleteModal({ open: false, documentId: "", documentName: "" });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ open: false, documentId: "", documentName: "" });
  };

  // ------------------ EDIT ------------------

  const handleEditClick = (doc: any) => {
    const docId = doc.id || doc._id || doc.documentId;
    setEditFormData({
      documentName: doc.documentName || "",
      description: doc.documentDescription || "",
      file: null,
      isStudentVisible: doc.isStudentVisble ?? false,
    });
    setEditErrors({});
    setEditModal({ open: true, documentId: docId });
  };

  const handleEditChange = (field: string, value: any) => {
    setEditFormData((prev) => ({ ...prev, [field]: value }));
    setEditErrors((prev: any) => ({ ...prev, [field]: "" }));
  };

  const validateEdit = () => {
    const newErrors: any = {};
    if (!editFormData.documentName.trim()) {
      newErrors.documentName = "Document name is required";
    }
    if (!editFormData.description.trim()) {
      newErrors.description = "Description is required";
    }
    setEditErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEditSubmit = async () => {
    if (!validateEdit()) return;

    setIsUpdating(true);
    try {
      const res: any = await dispatch(
        updateSessionDocument({
          id: sessionId!,
          documentId: editModal.documentId,
          documentName: editFormData.documentName,
          description: editFormData.description,
          isStudentVisible: editFormData.isStudentVisible,
          ...(editFormData.file ? { file: editFormData.file } : {}),
        })
      );

      if ((res as any)?.statusCode === 200) {
        showSuccess((res as any)?.statusMessage || "Document updated successfully");
      } else {
        showSuccess("Document updated successfully");
      }
      dispatch(getSessionById(sessionId!) as any);
      handleEditClose();
    } catch (err) {
      showError("Failed to update document");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEditClose = () => {
    setEditFormData({
      documentName: "",
      description: "",
      file: null,
      isStudentVisible: false,
    });
    setEditErrors({});
    setEditModal({ open: false, documentId: "" });
  };

  // ------------------ VIEW ------------------

  const handleView = (url: string, fileName: string) => {
    setPreviewFileName(fileName);
    const isOfficeFile = /\.(doc|docx|xls|xlsx|ppt|pptx)$/i.test(url);
    const isPreviewable = /\.(pdf|jpg|jpeg|png|gif|txt)$/i.test(url);

    if (isOfficeFile || !isPreviewable) {
      setPreviewUrl(
        `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`
      );
    } else {
      setPreviewUrl(url);
    }
  };

  const handleClosePreview = () => {
    setPreviewUrl(null);
    setPreviewFileName("");
  };

  // ------------------ API ------------------

  useEffect(() => {
    dispatch(getSessionById(sessionId!) as any);
  }, []);

  // ------------------ UI ------------------

  return (
    <>
      <div className="w-full bg-white rounded-xl shadow-sm p-6">
        {/* ---- Header ---- */}
        <div className="flex justify-between items-start mb-5">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Documents</h2>
             {ROLE_TRAINER && (
            <p className="text-sm text-gray-500 mt-0.5">
              You can upload documents for this particular session
            </p>)}
          </div>
          {ROLE_TRAINER && (
            <button
              onClick={() => setOpen(true)}
              className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white text-sm px-4 py-2 rounded-[12px] transition-colors"
            >
              <Upload size={16} />
              Upload Document
            </button>
          )}
        </div>

        {/* ---- Document List ---- */}
        {documents.length > 0 ? (
          <div className="space-y-3">
            {documents.map((doc: any, index: number) => (
              <div
                key={index}
                className="flex items-start justify-between gap-4 p-4 border border-gray-100 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                {/* Left: Icon + Info */}
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
                    <FileText size={18} className="text-red-500" />
                  </div>

                  <div className="min-w-0">
                    <p className="font-semibold text-gray-800 text-sm truncate">
                      {index + 1}. {doc.documentName}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">
                      {doc.documentDescription}
                    </p>
                    <span
                      className={`inline-block mt-1.5 text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        doc.isStudentVisble
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {doc.isStudentVisble ? "● Visible to Students" : "● Hidden from Students"}
                    </span>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleView(doc.documentUrl, doc.documentName)}
                    className="flex items-center gap-1.5 border border-gray-200 bg-white px-3 py-1.5 rounded-lg text-xs text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Eye size={14} /> View
                  </button>
                  {ROLE_TRAINER && (
                    <>
                      <a
                        href={doc.documentUrl}
                        download
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 border border-gray-200 bg-white px-3 py-1.5 rounded-lg text-xs text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Download size={14} /> Download
                      </a>

                      {/* ✅ Edit Button */}
                      <button
                        onClick={() => handleEditClick(doc)}
                        className="p-1.5 border border-blue-100 bg-blue-50 rounded-lg text-blue-500 hover:bg-blue-100 transition-colors"
                        title="Edit document"
                      >
                        <Pencil size={14} />
                      </button>

                      <button
                        onClick={() => handleDeleteClick(doc.id || doc._id || doc.documentId, doc.documentName)}
                        className="p-1.5 border border-red-100 bg-red-50 rounded-lg text-red-500 hover:bg-red-100 transition-colors"
                        title="Delete document"
                      >
                        <Trash2 size={14} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <FileText size={40} className="mb-2 opacity-30" />
            <p className="text-sm">No documents uploaded yet</p>
          </div>
        )}
      </div>

      {/* ---------------- UPLOAD MODAL ---------------- */}
      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-[600px] rounded-xl p-6 relative shadow-lg">
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 transition-colors"
            >
              <X size={18} />
            </button>

            <h2 className="text-lg font-semibold mb-5">Upload Document</h2>

            <Box>
              {/* Document Name */}
              <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                <Typography sx={{ width: "150px", fontWeight: "bold", pt: "6px" }}>
                  Document Name
                </Typography>
                <Box sx={{ flex: 1 }}>
                  <CustomInput
                    name="documentName"
                    placeholder="Enter Document Name"
                    value={formData.documentName}
                    onChange={(e) => handleChange("documentName", e.target.value)}
                    boxSx={{ ...inputForm }}
                  />
                  {errors.documentName && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle size={12} /> {errors.documentName}
                    </p>
                  )}
                </Box>
              </Box>

              {/* Description */}
              <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                <Typography sx={{ width: "150px", fontWeight: "bold", pt: "6px" }}>
                  Description
                </Typography>
                <Box sx={{ flex: 1 }}>
                  <TextField
                    multiline
                    rows={3}
                    fullWidth
                    placeholder="Enter description"
                    value={formData.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    sx={{ ...inputForm, "& textarea": { fontSize: "0.875rem" } }}
                  />
                  {errors.description && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle size={12} /> {errors.description}
                    </p>
                  )}
                </Box>
              </Box>

              {/* Student Visible Toggle */}
              <Box sx={{ display: "flex", gap: 2, mb: 2, alignItems: "center" }}>
                <Typography sx={{ width: "150px", fontWeight: "bold" }}>
                  Student Visible
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isStudentVisible}
                      onChange={(e) => handleChange("isStudentVisible", e.target.checked)}
                      color="success"
                    />
                  }
                  label={
                    <span className="text-sm text-gray-600">
                      {formData.isStudentVisible ? "Visible to students" : "Hidden from students"}
                    </span>
                  }
                />
              </Box>

              {/* File Upload */}
              <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
                <Typography sx={{ width: "150px", fontWeight: "bold", pt: "6px" }}>
                  Upload File
                </Typography>
                <Box sx={{ flex: 1, maxWidth: "350px" }}>
                  <label
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexDirection: "column",
                      gap: "4px",
                      border: "2px dashed #d1d5db",
                      borderRadius: "8px",
                      padding: "16px 10px",
                      textAlign: "center",
                      cursor: "pointer",
                      backgroundColor: formData.file ? "#f0fdf4" : "#fafafa",
                      transition: "background-color 0.2s",
                    }}
                  >
                    <Upload size={20} color={formData.file ? "#22c55e" : "#9ca3af"} />
                    <span
                      title={formData.file?.name}
                      style={{
                        fontSize: "0.8rem",
                        color: formData.file ? "#16a34a" : "#6b7280",
                        maxWidth: "100%",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "block",
                      }}
                    >
                      {formData.file ? formData.file.name : "Click to upload document"}
                    </span>
                    <input
                      type="file"
                      hidden
                      onChange={(e) =>
                        handleChange("file", e.target.files?.[0] ?? null)
                      }
                    />
                  </label>
                  {errors.file && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle size={12} /> {errors.file}
                    </p>
                  )}
                </Box>
              </Box>
            </Box>

            {/* Modal Actions */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={handleClose}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- EDIT MODAL ---------------- */}
      {editModal.open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-[600px] rounded-xl p-6 relative shadow-lg">
            <button
              onClick={handleEditClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 transition-colors"
            >
              <X size={18} />
            </button>

            <h2 className="text-lg font-semibold mb-5">Edit Document</h2>

            <Box>
              {/* Document Name */}
              <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                <Typography sx={{ width: "150px", fontWeight: "bold", pt: "6px" }}>
                  Document Name
                </Typography>
                <Box sx={{ flex: 1 }}>
                  <CustomInput
                    name="documentName"
                    placeholder="Enter Document Name"
                    value={editFormData.documentName}
                    onChange={(e) => handleEditChange("documentName", e.target.value)}
                    boxSx={{ ...inputForm }}
                  />
                  {editErrors.documentName && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle size={12} /> {editErrors.documentName}
                    </p>
                  )}
                </Box>
              </Box>

              {/* Description */}
              <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                <Typography sx={{ width: "150px", fontWeight: "bold", pt: "6px" }}>
                  Description
                </Typography>
                <Box sx={{ flex: 1 }}>
                  <TextField
                    multiline
                    rows={3}
                    fullWidth
                    placeholder="Enter description"
                    value={editFormData.description}
                    onChange={(e) => handleEditChange("description", e.target.value)}
                    sx={{ ...inputForm, "& textarea": { fontSize: "0.875rem" } }}
                  />
                  {editErrors.description && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle size={12} /> {editErrors.description}
                    </p>
                  )}
                </Box>
              </Box>

              {/* Student Visible Toggle */}
              <Box sx={{ display: "flex", gap: 2, mb: 2, alignItems: "center" }}>
                <Typography sx={{ width: "150px", fontWeight: "bold" }}>
                  Student Visible
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={editFormData.isStudentVisible}
                      onChange={(e) => handleEditChange("isStudentVisible", e.target.checked)}
                      color="success"
                    />
                  }
                  label={
                    <span className="text-sm text-gray-600">
                      {editFormData.isStudentVisible ? "Visible to students" : "Hidden from students"}
                    </span>
                  }
                />
              </Box>

              {/* File Upload (optional replacement) */}
              <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
                <Typography sx={{ width: "150px", fontWeight: "bold", pt: "6px" }}>
                  Replace File
                  <span className="block text-[10px] font-normal text-gray-400">(optional)</span>
                </Typography>
                <Box sx={{ flex: 1, maxWidth: "350px" }}>
                  <label
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexDirection: "column",
                      gap: "4px",
                      border: "2px dashed #d1d5db",
                      borderRadius: "8px",
                      padding: "16px 10px",
                      textAlign: "center",
                      cursor: "pointer",
                      backgroundColor: editFormData.file ? "#f0fdf4" : "#fafafa",
                      transition: "background-color 0.2s",
                    }}
                  >
                    <Upload size={20} color={editFormData.file ? "#22c55e" : "#9ca3af"} />
                    <span
                      title={editFormData.file?.name}
                      style={{
                        fontSize: "0.8rem",
                        color: editFormData.file ? "#16a34a" : "#6b7280",
                        maxWidth: "100%",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "block",
                      }}
                    >
                      {editFormData.file
                        ? editFormData.file.name
                        : "Click to replace file (optional)"}
                    </span>
                    <input
                      type="file"
                      hidden
                      onChange={(e) =>
                        handleEditChange("file", e.target.files?.[0] ?? null)
                      }
                    />
                  </label>
                </Box>
              </Box>
            </Box>

            {/* Modal Actions */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={handleEditClose}
                disabled={isUpdating}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSubmit}
                disabled={isUpdating}
 className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors"
              >
                {isUpdating ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8H4z"
                      />
                    </svg>
                    Updating...
                  </>
                ) : (
                  <>
                    Update
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- DELETE CONFIRMATION MODAL ---------------- */}
      {deleteModal.open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-[420px] rounded-xl p-6 relative shadow-lg">
            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
                <AlertTriangle size={28} className="text-red-500" />
              </div>
            </div>

            {/* Text */}
            <h2 className="text-center text-lg font-semibold text-gray-800 mb-1">
              Delete Document
            </h2>
            <p className="text-center text-sm text-gray-500 mb-6">
              Are you sure you want to delete{" "}
              <span className="font-medium text-gray-700">
                "{deleteModal.documentName}"
              </span>
              ? This action cannot be undone.
            </p>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleDeleteCancel}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8H4z"
                      />
                    </svg>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={14} /> Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- PREVIEW MODAL ---------------- */}
      {previewUrl && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
          <div className="bg-white w-[90vw] h-[90vh] rounded-xl p-4 flex flex-col relative">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold text-gray-800 truncate pr-8">
                {previewFileName}
              </h2>
              <button
                onClick={handleClosePreview}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <iframe
              src={previewUrl}
              className="w-full flex-1 rounded-lg border border-gray-100"
              title="Document Preview"
            />
          </div>
        </div>
      )}
    </>
  );
};