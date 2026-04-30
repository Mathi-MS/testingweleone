import { useEffect, useRef, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Chip,
  FormControlLabel,
  Switch,
  MenuItem,
} from "@mui/material";
import { Controller } from "react-hook-form";
import { forminput, inputForm } from "../../../components/custom/CustomStyles";
import { useFormContext } from "react-hook-form";
import { Tooltip } from "@mui/material";
import { AiOutlineCheck, AiOutlineCheckCircle, AiOutlinePlus } from "react-icons/ai";
import { MdClose } from "react-icons/md";
import { RiDeleteBin5Line } from "react-icons/ri";
import { CustomAutocomplete } from "../../../components/custom/CustomAutocomplete";
import { CustomInput } from "../../../components/custom/CustomInput";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useAppSelector } from "../../../app/hook";
import CustomButton from "../../../components/custom/CustomButton";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../app/store";
import { fetchCommunities } from "../../../features/communitySlice";

interface FormValues {
  batchname: string;
  Duration: string;
  startDate: string;
  endDate: string;
  timezone: string;
  enrollmentLimit: string;
  enrollmentStartDate: string;
  enrollmentEndDate: string;
  sessionFrom: string;
  sessionTo: string;
  certificate: File | null;
  banner: File | null;
  bannerWeb: File | null;
  bannerMobile: File | null;
  brochure: File | null;
  batchDays: string[];
  language: string;
  skillsYouGain: string[];
  currentSkillInput: string;
  whatYouLearn: string;
  description: string;
  category: string;
  track: string;
  forWhom: string;
  testBatch: boolean;
  learningCommunity: string;
  isWebsiteEnable: boolean;
  isSkillBridgeProgram:boolean;
}

interface FileItem {
  file: File | null;
  preview: string | null;
  name: string | null;
  status: "idle" | "uploading" | "success" | "error";
}

interface GeneralDetailsProps {
  setCertificateFile: (file: File | null) => void;
  setBannerFile: (file: File | null) => void;
  setBannerWebFile: (file: File | null) => void;
  setBannerMobileFile: (file: File | null) => void;
  setBrochureFile: (file: File | null) => void;
  certificateFile: File | null;
  bannerFile: File | null;
  bannerWebFile: File | null;
  bannerMobileFile: File | null;
  brochureFile: File | null;
  uploadingButton: boolean;
  setIsExistingCommunity: (value: boolean) => void;
  // existing URLs from edit response
  existingBannerUrl?: string;
  existingBannerFileName?: string;
  existingBannerWebUrl?: string;
  existingBannerWebFileName?: string;
  existingBannerMobileUrl?: string;
  existingBannerMobileFileName?: string;
  existingCertificateUrl?: string;
  existingCertificateFileName?: string;
  existingBrochureUrl?: string;
  existingBrochureFileName?: string;
  onRemoveBanner?: (removed: boolean) => void;
  onRemoveBannerWeb?: (removed: boolean) => void;
  onRemoveBannerMobile?: (removed: boolean) => void;
  onRemoveCertificate?: (removed: boolean) => void;
  onRemoveBrochure?: (removed: boolean) => void;
}

const categoryOptions = [
  { label: "Mechanical Engineering", value: "Mechanical_Engineering" },
  {
    label: "Electronics & Communication Engineering",
    value: "Electronics_Communication_Engineering",
  },
  { label: "Civil Engineering", value: "Civil_Engineering" },
  { label: "Mathematics", value: "Mathematics" },
  { label: "Business Management", value: "Business_Management" },
  { label: "Physics", value: "Physics" },
  { label: "Chemistry", value: "Chemistry" },
  { label: "Automobile Engineering", value: "Automobile_Engineering" },
  { label: "Commerce & Accounting", value: "Commerce_Accounting" },
  { label: "Banking & Finance", value: "Banking_Finance" },
  { label: "Graphic Design", value: "Graphic_Design" },
  { label: "AI/ML/Emerging AI", value: "AI_ML_Emerging_AI" },
  { label: "Application Engineer", value: "Application_Engineer" },
  { label: "Digital Infrastructure & QA", value: "Digital_Infrastructure_QA" },
  {
    label: "Interface & Experience Design",
    value: "Interface_Experience_Design",
  },
  { label: "Ai/ML/Data Science", value: "AI_ML_Data_Science" },
  { label: "Product/Project Leadership", value: "Product_Project_Leadership" },
  { label: "Finance", value: "Finance" },
  { label: "Data Analytics", value: "Data_Analytics" },
  { label: "HR", value: "HR" },
  { label: "Leadership & Management", value: "Leadership_Management" },
  { label: "IT Operations", value: "IT_Operations" },
  { label: "Communication/Design", value: "Communication_Design" },
  { label: "Operations/Supply chain", value: "Operations_Supply_Chain" },
  {
    label: "Engineering College Faculty",
    value: "Engineering_College_Faculty",
  },
  { label: "School Teachers", value: "School_Teachers" },
  { label: "Art & science College staff", value: "Art_Science_College_Staff" },
  { label: "Corporate trainers", value: "Corporate_Trainers" },
];

const trackOptions = [
  { label: "Project/Product Leadership", value: "Project_Product_Leadership" },
  { label: "Infra, Security & QA", value: "Infra_Security_QA" },
  { label: "AI / ML / Data Science", value: "AI_ML_Data_Science" },
  {
    label: "Interface & Experience Design",
    value: "Interface_Experience_Design",
  },
  { label: "Application Engineer", value: "Application_Engineer" },
];

const forWhomOptions = [
  { label: "Students", value: "STUDENTS" },
  { label: "Freshers", value: "FRESHERS" },
  { label: "Working Professionals", value: "WORKING_PROFESSIONALS" },
  { label: "Educators", value: "EDUCATORS" },
];

export default function GeneralDetails({
  setCertificateFile,
  setBannerFile,
  setBannerWebFile,
  setBannerMobileFile,
  setBrochureFile,
  certificateFile,
  bannerFile,
  bannerWebFile,
  bannerMobileFile,
  brochureFile,
  uploadingButton,
  setIsExistingCommunity,
  existingBannerUrl,
  existingBannerFileName,
  existingBannerWebUrl,
  existingBannerWebFileName,
  existingBannerMobileUrl,
  existingBannerMobileFileName,
  existingCertificateUrl,
  existingCertificateFileName,
  existingBrochureUrl,
  existingBrochureFileName,
  onRemoveBanner,
  onRemoveBannerWeb,
  onRemoveBannerMobile,
  onRemoveCertificate,
  onRemoveBrochure,
}: GeneralDetailsProps) {
  const {
    register,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useFormContext<FormValues>();

  const certificateInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const dispatch = useDispatch();

  const dayOptions = [
    { label: "Sun", value: "SUNDAY" },
    { label: "Mon", value: "MONDAY" },
    { label: "Tue", value: "TUESDAY" },
    { label: "Wed", value: "WEDNESDAY" },
    { label: "Thu", value: "THURSDAY" },
    { label: "Fri", value: "FRIDAY" },
    { label: "Sat", value: "SATURDAY" },
  ];

  const languageOptions = [
    { label: "Tamil", value: "Tamil" },
    { label: "English", value: "English" },
  ];

  const { communities, loading } = useSelector(
    (state: RootState) => state.community,
  );

  const communityOptions =
    communities?.map((c: any) => ({
      label: c.name,
      value: String(c.id),
    })) || [];

  const batchDays = watch("batchDays") || [];
  const startDate = watch("startDate");
  const endDate = watch("endDate");
  const enrollmentStartDate = watch("enrollmentStartDate");
  const enrollmentEndDate = watch("enrollmentEndDate");
  const learningCommunity = watch("learningCommunity");

  const [uploading, setUploading] = useState(false);
  const [selectedDays, setSelectedDays] = useState<string[]>(batchDays);
  const [certificatePreview, setCertificatePreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [certificateError, setCertificateError] = useState<string>("");
  const [bannerError, setBannerError] = useState<string>("");
  const [bannerWebError, setBannerWebError] = useState<string>("");
  const [bannerMobileError, setBannerMobileError] = useState<string>("");
  const [brochureError, setBrochureError] = useState<string>("");
  const { batchedit } = useAppSelector((state) => state.batch);
  const [mode, setMode] = useState<"Add" | "edit" | "update">("Add");
  const [isCreatingCommunity, setIsCreatingCommunity] = useState(false);
  const [communityCreateValue, setCommunityCreateValue] = useState("");
  const [isAdded, setIsAdded] = useState(false);
 // Add this helper
const suppressNativeValidation = (e: React.FormEvent<HTMLInputElement>) => {
  e.preventDefault();
};
  // FILES STATE — 5 slots: 0=certificate, 1=banner, 2=brochure, 3=bannerWeb, 4=bannerMobile
  const [files, setFiles] = useState<FileItem[]>([
    {
      file: certificateFile,
      preview: certificateFile ? certificatePreview : existingCertificateUrl || null,
      name: certificateFile?.name || existingCertificateFileName || null,
      status: "idle",
    },
    {
      file: bannerFile,
      preview: bannerFile ? bannerPreview : existingBannerUrl || null,
      name: bannerFile?.name || existingBannerFileName || null,
      status: "idle",
    },
    {
      file: brochureFile,
      preview: null,
      name: brochureFile?.name || existingBrochureFileName || null,
      status: "idle",
    },
    {
      file: bannerWebFile,
      preview: bannerWebFile ? URL.createObjectURL(bannerWebFile) : existingBannerWebUrl || null,
      name: bannerWebFile?.name || existingBannerWebFileName || null,
      status: "idle",
    },
    {
      file: bannerMobileFile,
      preview: bannerMobileFile ? URL.createObjectURL(bannerMobileFile) : existingBannerMobileUrl || null,
      name: bannerMobileFile?.name || existingBannerMobileFileName || null,
      status: "idle",
    },
  ]);

  const labelStyle = {
    flex: "0 0 130px",
    fontWeight: 500,
    mt: 0.5,
    fontSize: "0.875rem",
  };

  const skillsYouGain = watch("skillsYouGain") || [];
  const currentSkillInput = watch("currentSkillInput");

  const addSkill = () => {
    if (currentSkillInput && currentSkillInput.trim()) {
      setValue("skillsYouGain", [...skillsYouGain, currentSkillInput.trim()]);
      setValue("currentSkillInput", "");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setValue(
      "skillsYouGain",
      skillsYouGain.filter((skill) => skill !== skillToRemove),
    );
  };

  useEffect(() => {
    dispatch(fetchCommunities() as any);
  }, [dispatch]);

  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = end.getTime() - start.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays >= 0) {
        setValue("Duration", diffDays.toString(), { shouldValidate: true });
      }
    }
  }, [startDate, endDate, setValue]);

  const handleFileChange = (index: number, selectedFiles: FileList | null) => {
    const file = selectedFiles?.[0];

    // Clear errors
    if (index === 0) setCertificateError("");
    else if (index === 1) setBannerError("");
    else if (index === 2) setBrochureError("");
    else if (index === 3) setBannerWebError("");
    else setBannerMobileError("");

    if (!file) return;

    // ── Brochure: PDF only ──
    if (index === 2) {
      if (file.type !== "application/pdf") {
        setBrochureError("Please upload a valid PDF file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setBrochureError("File size should not exceed 5MB");
        return;
      }
      const newFiles = [...files];
      newFiles[2] = { file, preview: null, name: file.name, status: "uploading" };
      setFiles(newFiles);
      setBrochureFile(file);
      setValue("brochure", file);
      return;
    }

    // ── Certificate, Banner, BannerWeb, BannerMobile: image or PDF ──
    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "application/pdf",
    ];
    if (!validTypes.includes(file.type)) {
      const errorMsg = "Please upload a valid file (JPEG, PNG, or PDF)";
      if (index === 0) setCertificateError(errorMsg);
      else if (index === 1) setBannerError(errorMsg);
      else if (index === 3) setBannerWebError(errorMsg);
      else setBannerMobileError(errorMsg);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      const errorMsg = "File size should not exceed 5MB";
      if (index === 0) setCertificateError(errorMsg);
      else if (index === 1) setBannerError(errorMsg);
      else if (index === 3) setBannerWebError(errorMsg);
      else setBannerMobileError(errorMsg);
      return;
    }

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newFiles = [...files];
        newFiles[index] = {
          file,
          preview: reader.result as string,
          name: file.name,
          status: "uploading",
        };
        setFiles(newFiles);
      };
      reader.readAsDataURL(file);
    } else {
      const newFiles = [...files];
      newFiles[index] = { file, preview: null, name: file.name, status: "uploading" };
      setFiles(newFiles);
    }

    if (index === 0) {
      setCertificateFile(file);
      setValue("certificate", file);
    } else if (index === 1) {
      setBannerFile(file);
      setValue("banner", file);
    } else if (index === 3) {
      setBannerWebFile(file);
      setValue("bannerWeb", file);
    } else if (index === 4) {
      setBannerMobileFile(file);
      setValue("bannerMobile", file);
    }
  };

  const handleDeleteFile = (index: number) => {
    const newFiles = [...files];
    newFiles[index] = { file: null, preview: null, name: null, status: "idle" };
    setFiles(newFiles);
    if (index === 0) {
      setCertificateFile(null);
      setValue("certificate", null);
      setCertificateError("");
      onRemoveCertificate?.(true);
    } else if (index === 1) {
      setBannerFile(null);
      setValue("banner", null);
      setBannerError("");
      onRemoveBanner?.(true);
    } else if (index === 2) {
      setBrochureFile(null);
      setValue("brochure", null);
      setBrochureError("");
      onRemoveBrochure?.(true);
    } else if (index === 3) {
      setBannerWebFile(null);
      setValue("bannerWeb", null);
      setBannerWebError("");
      onRemoveBannerWeb?.(true);
    } else {
      setBannerMobileFile(null);
      setValue("bannerMobile", null);
      setBannerMobileError("");
      onRemoveBannerMobile?.(true);
    }
  };

  const getTodayDate = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today.toISOString().split("T")[0];
  };

  const getMaxEndDate = () => {
    const baseDate = startDate ? new Date(startDate) : new Date();
    baseDate.setMonth(baseDate.getMonth() + 4);
    return baseDate.toISOString().split("T")[0];
  };

  const getMinBatchStartDate = () => {
    if (enrollmentEndDate) {
      return enrollmentEndDate;
    }
    return getTodayDate();
  };

  const getMaxBatchEndDate = () => {
    if (enrollmentEndDate) {
      const enrollEnd = new Date(enrollmentEndDate);
      enrollEnd.setMonth(enrollEnd.getMonth() + 4);
      return enrollEnd.toISOString().split("T")[0];
    }
    return getMaxEndDate();
  };

  const toggleDay = (day: string) => {
    const updatedDays = selectedDays.includes(day)
      ? selectedDays.filter((d) => d !== day)
      : [...selectedDays, day];
    setSelectedDays(updatedDays);
    setValue("batchDays", updatedDays, { shouldValidate: true });
  };

  useEffect(() => {
    setSelectedDays(batchDays);
  }, [batchDays]);

  // Helper: extract filename from a URL
  const extractFileName = (url?: string) => {
    if (!url) return null;
    try {
      return decodeURIComponent(url.split("/").pop() || "");
    } catch {
      return url.split("/").pop() || null;
    }
  };

  // Sync files state when props change (handles edit mode)
  useEffect(() => {
    setFiles([
      {
        file: certificateFile || null,
        preview: certificateFile
          ? URL.createObjectURL(certificateFile)
          : existingCertificateUrl || null,
        name: certificateFile?.name || existingCertificateFileName || extractFileName(existingCertificateUrl) || null,
        status: "idle",
      },
      {
        file: bannerFile || null,
        preview: bannerFile
          ? URL.createObjectURL(bannerFile)
          : existingBannerUrl || null,
        name: bannerFile?.name || existingBannerFileName || extractFileName(existingBannerUrl) || null,
        status: "idle",
      },
      {
        file: brochureFile || null,
        preview: brochureFile ? null : existingBrochureUrl || null,
        name:
          brochureFile?.name ||
          existingBrochureFileName ||
          extractFileName(existingBrochureUrl) ||
          null,
        status: "idle",
      },
      {
        file: bannerWebFile || null,
        preview: bannerWebFile
          ? URL.createObjectURL(bannerWebFile)
          : existingBannerWebUrl || null,
        name: bannerWebFile?.name || existingBannerWebFileName || extractFileName(existingBannerWebUrl) || null,
        status: "idle",
      },
      {
        file: bannerMobileFile || null,
        preview: bannerMobileFile
          ? URL.createObjectURL(bannerMobileFile)
          : existingBannerMobileUrl || null,
        name: bannerMobileFile?.name || existingBannerMobileFileName || extractFileName(existingBannerMobileUrl) || null,
        status: "idle",
      },
    ]);
  }, [
    certificateFile,
    bannerFile,
    brochureFile,
    bannerWebFile,
    bannerMobileFile,
    existingBannerUrl,
    existingBannerFileName,
    existingBannerWebUrl,
    existingBannerWebFileName,
    existingBannerMobileUrl,
    existingBannerMobileFileName,
    existingCertificateUrl,
    existingCertificateFileName,
    existingBrochureUrl,
    existingBrochureFileName,
  ]);

  // Helper to get label for each file slot
  const getFileLabel = (index: number) => {
    if (index === 0) return "Certificate :";
    if (index === 1) return "Banner :";
    if (index === 2) return "Brochure :";
    if (index === 3) return "Banner Web :";
    return "Banner Mobile :";
  };

  // Helper to get upload placeholder text
  const getUploadPlaceholder = (index: number) => {
    if (index === 0) return "+ Upload Certificate";
    if (index === 1) return "+ Upload Banner";
    if (index === 2) return "+ Upload Brochure";
    if (index === 3) return "+ Upload Banner Web";
    return "+ Upload Banner Mobile";
  };

  // Helper to get hint text
  const getHintText = (index: number) => {
    if (index === 2) return "PDF only • Max 5MB";
    return "PDF, JPEG, PNG • Max 5MB each";
  };

  // Helper to get accept attribute
  const getAcceptTypes = (index: number) => {
    if (index === 2) return ".pdf";
    return ".pdf,.jpeg,.jpg,.png";
  };

  // Helper to get current error for index
  const getError = (index: number) => {
    if (index === 0) return certificateError;
    if (index === 1) return bannerError;
    if (index === 2) return brochureError;
    if (index === 3) return bannerWebError;
    return bannerMobileError;
 };

  return (
    <Box
      sx={{
        maxHeight: "66vh",
        overflowY: "auto",
        px: 1,
        pointerEvents: uploadingButton ? "none" : "auto",
        opacity: uploadingButton ? 0.8 : 1,
      }}
    >
      <Typography
        sx={{ fontSize: { xs: "16px", md: "18px" }, fontWeight: 700, mb: 2 }}
      >
        General Details:
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
          gap: 2,
        }}
      >
        {/* Batch Name */}
        <Box sx={{ ...forminput, display: "flex", gap: 1, alignItems: "flex-start" }}>
          <Typography sx={{ flex: "0 0 100px", fontWeight: 500, mt: 0.5, fontSize: "0.875rem", mr: 2 }}>
            Batch Name <span style={{ color: "red" }}>*</span>
          </Typography>
          <Box sx={{ flex: 1 }}>
            <TextField
              {...register("batchname")}
              placeholder="Enter Batch Name"
              size="small"
              fullWidth
              error={!!errors.batchname}
              helperText={errors.batchname?.message}
              sx={{ ...inputForm, "& .MuiInputBase-root": { height: 36, fontSize: "0.875rem" } }}
            />
          </Box>
        </Box>

        {/* Duration */}
        <Box sx={{ ...forminput, display: "flex", gap: 7, alignItems: "flex-start" }}>
          <Typography sx={{ flex: "0 0 110px", fontWeight: 500, mt: 0.5, fontSize: "0.875rem" }}>
            Duration <span style={{ color: "red" }}>*</span>
          </Typography>
          <Box sx={{ flex: 1 }}>
            <TextField
              {...register("Duration")}
              placeholder="Auto-calculated"
              size="small"
              fullWidth
              disabled={!!(startDate && endDate)}
              error={!!errors.Duration}
              helperText={errors.Duration?.message}
              sx={{ ...inputForm, "& .MuiInputBase-root": { height: 36, fontSize: "0.875rem" } }}
              InputProps={{ readOnly: true }}
            />
          </Box>
        </Box>

        {/* Enrollment Start Date */}
        <Box sx={{ ...forminput, display: "flex", gap: 1, alignItems: "flex-start" }}>
          <Typography sx={{ flex: "0 0 120px", fontWeight: 500, mt: 0.5, fontSize: "0.875rem" }}>
            Enroll Start <span style={{ color: "red" }}>*</span>
          </Typography>
          <Box sx={{ flex: 1 }}>
            <TextField
              {...register("enrollmentStartDate")}
              type="date"
              size="small"
              fullWidth
              error={!!errors.enrollmentStartDate}
              helperText={errors.enrollmentStartDate?.message}
              // InputProps={{ inputProps: { min: getTodayDate() } }}
              sx={{ ...inputForm, "& .MuiInputBase-root": { height: 36, fontSize: "0.875rem" } }}
            />
          </Box>
        </Box>

        {/* Enrollment End Date */}
        <Box sx={{ ...forminput, display: "flex", gap: 7, alignItems: "flex-start" }}>
          <Typography sx={{ flex: "0 0 110px", fontWeight: 500, mt: 0.5, fontSize: "0.875rem" }}>
            Enroll End <span style={{ color: "red" }}>*</span>
          </Typography>
          <Box sx={{ flex: 1 }}>
            <TextField
              {...register("enrollmentEndDate")}
              type="date"
              size="small"
              fullWidth
              error={!!errors.enrollmentEndDate}
              helperText={errors.enrollmentEndDate?.message}
              // InputProps={{ inputProps: { min: enrollmentStartDate || getTodayDate() } }}
              sx={{ ...inputForm, "& .MuiInputBase-root": { height: 36, fontSize: "0.875rem" } }}
            />
          </Box>
        </Box>

        {/* Batch Start Date */}
        <Box sx={{ ...forminput, display: "flex", gap: 1, alignItems: "flex-start" }}>
          <Typography sx={{ flex: "0 0 100px", fontWeight: 500, mt: 0.5, fontSize: "0.875rem" }}>
            Start Date <span style={{ color: "red" }}>*</span>
          </Typography>
          <Box sx={{ flex: 1 }}>
            <TextField
              {...register("startDate")}
              type="date"
              size="small"
              fullWidth
              disabled={!enrollmentEndDate}
              error={!!errors.startDate}
              helperText={
                errors.startDate?.message ||
                (!enrollmentEndDate ? "Please select enrollment end date first" : "")
              }
              // InputProps={{ inputProps: { min: getMinBatchStartDate() } }}
              sx={{ ...inputForm, "& .MuiInputBase-root": { height: 36, fontSize: "0.875rem" } }}
            />
          </Box>
        </Box>

        {/* Batch End Date */}
        <Box sx={{ ...forminput, display: "flex", gap: 7, alignItems: "flex-start" }}>
          <Typography sx={{ flex: "0 0 110px", fontWeight: 500, mt: 0.5, fontSize: "0.875rem" }}>
            End Date <span style={{ color: "red" }}>*</span>
          </Typography>
          <Box sx={{ flex: 1 }}>
            <TextField
              {...register("endDate")}
              type="date"
              size="small"
              fullWidth
              disabled={!startDate}
              error={!!errors.endDate}
              helperText={
                errors.endDate?.message ||
                (!startDate ? "Please select batch start date first" : "")
              }
              InputProps={{
                inputProps: { min: startDate || getMinBatchStartDate(), max: getMaxBatchEndDate() },
              }}
              sx={{ ...inputForm, "& .MuiInputBase-root": { height: 36, fontSize: "0.875rem" } }}
            />
          </Box>
        </Box>

        {/* Time Zone */}
        <Box sx={{ ...forminput, display: "flex", gap: 1, alignItems: "flex-start" }}>
          <Typography sx={{ flex: "0 0 100px", fontWeight: 500, mt: 0.5, fontSize: "0.875rem" }}>
            Time Zone <span style={{ color: "red" }}>*</span>
          </Typography>
          <Box sx={{ flex: 1 }}>
            <TextField
              {...register("timezone")}
              placeholder="Select Time Zone"
              size="small"
              fullWidth
              error={!!errors.timezone}
              helperText={errors.timezone?.message}
              sx={{ ...inputForm, "& .MuiInputBase-root": { height: 36, fontSize: "0.875rem" } }}
            />
          </Box>
        </Box>

        {/* Maximum Enrollment */}
        <Box sx={{ ...forminput, display: "flex", gap: 3, alignItems: "flex-start" }}>
          <Typography sx={{ flex: "0 0 110px", fontWeight: 500, mt: 2, fontSize: "0.875rem", lineHeight: 1.2, whiteSpace: "nowrap" }}>
            Maximum Enrollment <span style={{ color: "red" }}>*</span>
          </Typography>
          <Box sx={{ flex: 1 }}>
            <TextField
              {...register("enrollmentLimit")}
              placeholder="Enter Maximum"
              type="number"
              size="small"
              fullWidth
              error={!!errors.enrollmentLimit}
              helperText={errors.enrollmentLimit?.message}
              sx={{ ...inputForm, "& .MuiInputBase-root": { height: 36, fontSize: "0.875rem" } }}
            />
          </Box>
        </Box>

        {/* Session Time */}
        <Box sx={{ ...forminput, display: "flex", gap: 7, alignItems: "flex-start" }}>
          <Typography sx={{ flex: "0 0 100px", fontWeight: 500, mt: 0.5, fontSize: "0.875rem" }}>
            Session Time <span style={{ color: "red" }}>*</span>
          </Typography>
          <Box sx={{ flex: 1, display: "flex", gap: 4 }}>
            <Box sx={{ display: "flex", flexDirection: "row", minWidth: 140 }}>
              <Typography sx={{ mt: 1, fontWeight: 500, fontSize: "0.8125rem" }}>From</Typography>
              <Controller
                name="sessionFrom"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="time"
                    size="small"
                    inputProps={{ step: 900 }}
                    error={!!errors.sessionFrom}
                    helperText={errors.sessionFrom?.message}
                    sx={{
                      width: 140, height: 36,
                      "& .MuiInputBase-root": { height: 36, padding: "0 8px", fontSize: "0.80rem", ml: 1 },
                      "& input": { padding: 0 },
                    }}
                  />
                )}
              />
            </Box>
            <Box sx={{ display: "flex", flexDirection: "row", minWidth: 140 }}>
              <Typography sx={{ mt: 1, fontWeight: 500, fontSize: "0.8125rem" }}>To</Typography>
              <Controller
                name="sessionTo"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="time"
                    size="small"
                    inputProps={{ step: 900 }}
                    error={!!errors.sessionTo}
                    helperText={errors.sessionTo?.message}
                    sx={{
                      width: 140, height: 36,
                      "& .MuiInputBase-root": { height: 36, padding: "0 8px", fontSize: "0.80rem", ml: 1 },
                      "& input": { padding: 0 },
                    }}
                  />
                )}
              />
            </Box>
          </Box>
        </Box>

        {/* Language */}
        <Box sx={{ ...forminput, gap: 7, display: "flex", alignItems: "flex-start" }}>
          <Typography sx={{ flex: "0 0 120px", fontWeight: 500, mt: 0.5, fontSize: "0.875rem" }}>
            Language
          </Typography>
          <CustomAutocomplete
            name="language"
            placeholder="Select Language"
            control={control}
            options={languageOptions}
            errors={errors}
            boxSx={{ ...inputForm, width: "100%" }}
          />
        </Box>

        {/* Skills You Gain */}
        <Box sx={{ ...forminput }}>
          <Typography sx={{ flex: "0 0 100px", fontWeight: 500, mt: 0.5, fontSize: "0.875rem" }}>
            Skills you gain
          </Typography>
          <Box sx={{ ...inputForm }}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <CustomInput
                name="currentSkillInput"
                register={register}
                placeholder="Type a skill and press enter..."
                disabled={uploading}
                boxSx={{
                  flexGrow: 1,
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "transparent",
                    border: "none",
                    "& fieldset": { border: "none" },
                  },
                }}
                onKeyDown={(e: any) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSkill();
                  }
                }}
              />
              <IconButton onClick={addSkill} sx={{ width: "30px", height: "30px", padding: "0px" }}>
                <AiOutlinePlus size={16} />
              </IconButton>
            </Box>
            {errors.skillsYouGain && (
              <Typography color="error" variant="caption" sx={{ mt: 0.5 }}>
                {errors.skillsYouGain.message}
              </Typography>
            )}
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: skillsYouGain.length > 0 ? 1.5 : 0 }}>
              {skillsYouGain.map((skill, idx) => (
                <Chip
                  key={idx}
                  label={skill}
                  onDelete={() => removeSkill(skill)}
                  deleteIcon={<MdClose style={{ fontSize: "16px" }} />}
                  sx={{
                    backgroundColor: "var(--primary)",
                    color: "var(--white)",
                    fontWeight: 500,
                    "& .MuiChip-deleteIcon": { color: "primary.contrastText" },
                  }}
                />
              ))}
            </Box>
          </Box>
        </Box>

        {/* For Whom */}
        <Box sx={{ ...forminput, gap: 3 }}>
          <Typography sx={{ flex: "0 0 150px", fontWeight: 500, mt: 0.5, fontSize: "0.875rem" }}>
            ForWhom <span style={{ color: "red" }}>*</span>
          </Typography>
          <Box sx={{ flex: 1 }}>
            <Controller
              name="forWhom"
              control={control}
              render={({ field }) => (
                <CustomAutocomplete
                  {...field}
                  control={control}
                  placeholder="Select for whom"
                  options={forWhomOptions}
                  value={forWhomOptions.find((opt) => opt.value === field.value) || null}
                  onChange={(_: any, newValue: any) => field.onChange(newValue ? newValue.value : "")}
                  errors={errors}
                  boxSx={{ ...inputForm }}
                />
              )}
            />
          </Box>
        </Box>

        {/* Category */}
        <Box sx={{ ...forminput, gap: 3 }}>
          <Typography sx={{ flex: "0 0 100px", fontWeight: 500, mt: 0.5, fontSize: "0.875rem" }}>
            Category <span style={{ color: "red" }}>*</span>
          </Typography>
          <Box sx={{ flex: 1 }}>
            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <CustomAutocomplete
                  {...field}
                  control={control}
                  placeholder="Select Category"
                  options={categoryOptions}
                  value={categoryOptions.find((opt) => opt.value === field.value) || null}
                  onChange={(_: any, newValue: any) => field.onChange(newValue ? newValue.value : "")}
                  errors={errors}
                  boxSx={{ ...inputForm }}
                />
              )}
            />
          </Box>
        </Box>

        {/* Track */}
        <Box sx={{ ...forminput, gap: 3 }}>
          <Typography sx={{ flex: "0 0 150px", fontWeight: 500, mt: 0.5, fontSize: "0.875rem" }}>
            Track <span style={{ color: "red" }}>*</span>
          </Typography>
          <Box sx={{ flex: 1 }}>
            <Controller
              name="track"
              control={control}
              render={({ field }) => (
                <CustomAutocomplete
                  {...field}
                  control={control}
                  placeholder="Select Track"
                  options={trackOptions}
                  value={trackOptions.find((opt) => opt.value === field.value) || null}
                  onChange={(_: any, newValue: any) => field.onChange(newValue ? newValue.value : "")}
                  errors={errors}
                  boxSx={{ ...inputForm }}
                />
              )}
            />
          </Box>
        </Box>

        {/* What You Learn + Description */}
        <Box
          sx={{
            gridColumn: "1 / -1",
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 2,
            mt: 2,
          }}
        >
          <Box sx={{ ...forminput, alignItems: "start" }}>
            <Typography sx={{ flex: "0 0 100px", fontWeight: 500, mt: 0.5, fontSize: "0.875rem" }}>
              What you learn
            </Typography>
            <Box sx={{ ...inputForm }}>
              <ReactQuill
                theme="snow"
                value={watch("whatYouLearn")}
                onChange={(content) => setValue("whatYouLearn", content)}
                readOnly={uploading}
              />
              {errors.whatYouLearn && (
                <Typography color="error" variant="caption">
                  {errors.whatYouLearn.message}
                </Typography>
              )}
            </Box>
          </Box>

          <Box sx={{ ...forminput, alignItems: "start" }}>
            <Typography sx={{ flex: "0 0 160px", fontWeight: 500, mt: 0.5, fontSize: "0.875rem", ml: 1 }}>
              Description
            </Typography>
            <TextField
              {...register("description")}
              multiline
              rows={5}
              placeholder="Enter Description..."
              error={!!errors.description}
              helperText={errors.description?.message}
              fullWidth
              disabled={uploading}
              sx={{
                ...inputForm,
                "& .MuiOutlinedInput-root": { padding: 0 },
                "& textarea": { padding: "6px 8px", fontSize: "0.875rem", lineHeight: 1.4 },
              }}
            />
          </Box>
        </Box>

        {/* Test Batch Toggle */}
        <Box sx={{ display: "flex", alignItems: "center", mt: 3, ml: 3 }}>
          <Typography sx={{ flex: "0 0 120px", fontWeight: 500, fontSize: "0.875rem" }}>
            Test Batch
          </Typography>
          <Controller
            name="testBatch"
            control={control}
            defaultValue={false}
            render={({ field }) => (
              <FormControlLabel
                control={
                  <Switch
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                    sx={{
                      "& .MuiSwitch-switchBase.Mui-checked": { color: "var(--primary)" },
                      "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { backgroundColor: "var(--primary)" },
                    }}
                  />
                }
                label={field.value ? "Yes" : "No"}
              />
            )}
          />
        </Box>

        {/* isWebsiteEnable Toggle */}
        <Box sx={{ display: "flex", alignItems: "center", mt: 3, ml: 3 }}>
          <Typography sx={{ flex: "0 0 210px", fontWeight: 500, fontSize: "0.875rem" }}>
            isWebsiteEnable
          </Typography>
          <Controller
            name="isWebsiteEnable"
            control={control}
            defaultValue={false}
            render={({ field }) => (
              <FormControlLabel
                control={
                  <Switch
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                    sx={{
                      "& .MuiSwitch-switchBase.Mui-checked": { color: "var(--primary)" },
                      "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { backgroundColor: "var(--primary)" },
                    }}
                  />
                }
                label={field.value ? "Yes" : "No"}
              />
            )}
          />
        </Box>

        {/* Learning Community */}
        <Box
          sx={{
            ...forminput,
            gap: 3,
            display: "flex",
            alignItems: "flex-start",
            mt: 1,
            maxWidth: "100%",
            overflow: "hidden",
          }}
        >
          <Typography sx={{ flex: "0 0 100px", fontWeight: 500, mt: 0.5, fontSize: "0.875rem" }}>
            Learning Community
          </Typography>

          <Box sx={{ flex: 1 }}>
            {isCreatingCommunity ? (
              <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                <TextField
                  size="small"
                  autoFocus
                  placeholder="Enter new community name..."
                  value={communityCreateValue}
                  disabled={mode === "edit"}
                  onChange={(e) => {
                    const newName = e.target.value;
                    setCommunityCreateValue(newName);
                    setValue("learningCommunity", newName);
                    setIsExistingCommunity(false);
                  }}
                  error={!!errors.learningCommunity}
                  helperText={errors.learningCommunity?.message}
                  sx={{
                    ...inputForm,
                    width: "280px",
                    minWidth: "280px",
                    maxWidth: "280px",
                    "& .MuiInputBase-root": { height: 36, fontSize: "0.875rem" },
                  }}
                />

                <Tooltip
                  title={
                    mode === "Add"
                      ? "Create community"
                      : mode === "edit"
                      ? "Edit community"
                      : "Update community"
                  }
                >
                  <Box>
                    <CustomButton
                      type="button"
                      variant="outlined"
                      label={mode === "Add" ? "Add" : mode === "edit" ? "Edit" : "Update"}
                      disabled={!communityCreateValue && mode === "Add"}
                      onClick={() => {
                        if (mode === "Add") setMode("edit");
                        else if (mode === "edit") setMode("update");
                        else if (mode === "update") setMode("edit");
                      }}
                      sx={{ height: 36, minWidth: 60, fontSize: "11px", textTransform: "none" }}
                    />
                  </Box>
                </Tooltip>

                <Tooltip title="Back to select">
                  <IconButton
                    size="small"
                    onClick={() => {
                      setIsCreatingCommunity(false);
                      setCommunityCreateValue("");
                      setValue("learningCommunity", "");
                      setIsExistingCommunity(false);
                      setMode("Add");
                    }}
                    sx={{
                      color: "error.main",
                      border: "1px solid",
                      borderColor: "error.light",
                      borderRadius: 1,
                      p: "4px",
                    }}
                  >
                    <MdClose size={26} />
                  </IconButton>
                </Tooltip>
              </Box>
            ) : (
              <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                <TextField
                  select
                  size="small"
                  value={learningCommunity || ""}
                  onChange={(e) => {
                    const selectedId = e.target.value;
                    setValue("learningCommunity", selectedId);
                    setIsExistingCommunity(!!selectedId);
                  }}
                  error={!!errors.learningCommunity}
                  helperText={errors.learningCommunity?.message}
                  sx={{
                    ...inputForm,
                    width: "280px",
                    minWidth: "280px",
                    maxWidth: "280px",
                    "& .MuiInputBase-root": { height: 36, fontSize: "0.875rem", width: "280px" },
                    "& .MuiSelect-select": {
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      paddingRight: "32px",
                    },
                  }}
                  InputProps={{
                    endAdornment: learningCommunity ? (
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          setValue("learningCommunity", "");
                          setIsExistingCommunity(false);
                        }}
                        sx={{ mr: 3 }}
                      >
                        <MdClose size={16} />
                      </IconButton>
                    ) : null,
                  }}
                  SelectProps={{
                    displayEmpty: true,
                    autoWidth: false,
                    renderValue: (selected) => {
                      const selectedStr = selected as string;
                      if (!selectedStr || selectedStr === "") {
                        return (
                          <span style={{ color: "#aaa" }}>
                            {loading ? "Loading..." : "Select a community"}
                          </span>
                        );
                      }
                      const found = communityOptions.find((opt) => opt.value === selectedStr);
                      const label = found ? found.label : selectedStr;
                      return (
                        <Tooltip title={label} arrow>
                          <span
                            style={{
                              display: "block",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              maxWidth: "200px",
                            }}
                          >
                            {label}
                          </span>
                        </Tooltip>
                      );
                    },
                    MenuProps: {
                      disablePortal: true,
                      PaperProps: {
                        sx: { zIndex: 2000, maxHeight: 220, overflowY: "auto", width: 300 },
                      },
                    },
                  }}
                >
                  <MenuItem value="" disabled>
                    {loading ? "Loading..." : "Select a community"}
                  </MenuItem>
                  {communityOptions.map((opt) => (
                    <MenuItem
                      key={opt.value}
                      value={opt.value}
                      title={opt.label}
                      sx={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "100%" }}
                    >
                      {opt.label.length > 50 ? `${opt.label.slice(0, 50)}...` : opt.label}
                    </MenuItem>
                  ))}
                </TextField>

                {!learningCommunity && (
                  <Tooltip title="Create new community">
                    <IconButton
                      size="small"
                      onClick={() => {
                        setIsCreatingCommunity(true);
                        setCommunityCreateValue("");
                        setValue("learningCommunity", "");
                        setIsExistingCommunity(false);
                      }}
                      sx={{
                        color: "var(--primary)",
                        border: "1px solid",
                        borderColor: "var(--primary)",
                        borderRadius: 1,
                        p: "4px",
                        flexShrink: 0,
                      }}
                    >
                      <AiOutlinePlus size={24} />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            )}

            {errors.learningCommunity && !isCreatingCommunity && (
              <Typography variant="caption" sx={{ color: "#d32f2f", mt: 0.5, display: "block" }}>
                {errors.learningCommunity.message}
              </Typography>
            )}

            <Typography sx={{ fontSize: "11px", mt: 0.5, color: "#777" }}>
              {isCreatingCommunity
                ? "Type a new community name — it will be created on submit"
                : learningCommunity
                ? "Community selected"
                : "Select existing or click + to create a new community"}
            </Typography>
          </Box>
        </Box>
  <Box sx={{ display: "flex", alignItems: "center", mt: 3, ml: 3 }}>
          <Typography sx={{ flex: "0 0 210px", fontWeight: 500, fontSize: "0.875rem" }}>
            isSkillBridgeProgram
          </Typography>
          <Controller
            name="isSkillBridgeProgram"
            control={control}
            defaultValue={false}
            render={({ field }) => (
              <FormControlLabel
                control={
                  <Switch
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                    sx={{
                      "& .MuiSwitch-switchBase.Mui-checked": { color: "var(--primary)" },
                      "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { backgroundColor: "var(--primary)" },
                    }}
                  />
                }
                label={field.value ? "Yes" : "No"}
              />
            )}
          />
        </Box>
        {/* ── FILE UPLOADS: Certificate, Banner, Brochure ── */}
        <Box sx={{ gridColumn: "1 / -1", mt: 2 }}>
          <Box sx={{ display: "flex", flexDirection: "column", width: "100%" }}>
            {files?.map((item, index) => (
              <Box key={index} sx={{ mb: 2, position: "relative" }}>
                <Typography variant="body1" sx={{ fontWeight: 600, fontSize: "18px", mb: 1 }}>
                  {getFileLabel(index)}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", width: "100%", fontSize: "13px" }}>
                  <Box
                    sx={{
                      border: `1.5px dashed ${getError(index) ? "#d32f2f" : "#B5B5B5"}`,
                      padding: "10px 14px",
                      borderRadius: "5px",
                      maxWidth: "300px",
                      position: "relative",
                      cursor: item.status === "success" || uploading ? "default" : "pointer",
                      flexGrow: 1,
                      opacity: item.status === "success" || uploading ? 0.7 : 1,
                      backgroundColor: item.file || item.preview || item.name ? "#E8F0FE" : "white",
                      "&:hover": !(item.status === "success" || uploading)
                        ? { backgroundColor: "#F5F5F5", border: "1.5px dashed #1A73E8" }
                        : undefined,
                    }}
                    onClick={() => {
                      if (item.status !== "success" && !uploading)
                        document.getElementById(`file-${index}`)?.click();
                    }}
                  >
                    {/* CASE 1: new File selected */}
                    {item.file ? (
                      <>
                        {item.file.type.startsWith("image/") && item.preview && (
                          <img
                            src={item.preview}
                            alt="preview"
                            style={{ width: 30, height: 30, borderRadius: 4, marginBottom: 4 }}
                          />
                        )}
                        {item.file.type === "application/pdf" && (
                          <Box
                            sx={{
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              width: 30,
                              height: 30,
                              borderRadius: 1,
                              backgroundColor: "#f44336",
                              mb: 0.5,
                            }}
                          >
                            <Typography sx={{ color: "#fff", fontSize: "9px", fontWeight: 700 }}>
                              PDF
                            </Typography>
                          </Box>
                        )}
                        <Tooltip title={item.file.name}>
                          <span style={{ display: "block", fontSize: "0.875rem" }}>
                            {item.file.name.length > 30
                              ? `${item.file.name.slice(0, 30)}...`
                              : item.file.name}
                          </span>
                        </Tooltip>
                        <Typography variant="caption" sx={{ color: "#666", display: "block" }}>
                          {(item.file.size / 1024 / 1024).toFixed(2)} MB
                        </Typography>
                      </>
                    ) : item.preview || item.name ? (
                      /* CASE 2: existing URL / filename from edit response */
                      <>
                        {/* index 2 = brochure → always show PDF badge (it's a PDF URL, not an image) */}
                        {index === 2 ? (
                          <Box
                            sx={{
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              width: 30,
                              height: 30,
                              borderRadius: 1,
                              backgroundColor: "#f44336",
                              mb: 0.5,
                            }}
                          >
                            <Typography sx={{ color: "#fff", fontSize: "9px", fontWeight: 700 }}>
                              PDF
                            </Typography>
                          </Box>
                        ) : item.preview ? (
                          /* Certificate / Banner — show image preview */
                          <img
                            src={item.preview}
                            alt="existing preview"
                            style={{ width: 30, height: 30, borderRadius: 4, marginBottom: 4 }}
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = "none";
                            }}
                          />
                        ) : null}
                        <Tooltip title={item.name || "Existing file"}>
                          <span style={{ display: "block", fontSize: "0.875rem" }}>
                            {(item.name || "Existing file").length > 30
                              ? `${(item.name || "Existing file").slice(0, 30)}...`
                              : item.name || "Existing file"}
                          </span>
                        </Tooltip>
                        <Typography variant="caption" sx={{ color: "#4caf50", display: "block" }}>
                          Uploaded ✓
                        </Typography>
                      </>
                    ) : (
                      /* CASE 3: nothing uploaded yet */
                      <span style={{ color: "#666" }}>{getUploadPlaceholder(index)}</span>
                    )}
                  </Box>

                  {/* Delete button — show if there is a file OR existing name */}
                  {(item.file || item.preview || item.name) && (
                    <>
                      {item.status === "success" && (
                        <IconButton sx={{ ml: 1 }} color="success" size="small">
                          <AiOutlineCheckCircle size={16} />
                        </IconButton>
                      )}
                      <IconButton
                        sx={{ ml: 1 }}
                        onClick={() => handleDeleteFile(index)}
                        color="error"
                        size="small"
                      >
                        <RiDeleteBin5Line size={16} />
                      </IconButton>
                    </>
                  )}
                </Box>

                <input
                  id={`file-${index}`}
                  type="file"
                  accept={getAcceptTypes(index)}
                  hidden
                  onChange={(e) => handleFileChange(index, e.target.files || null)}
                />

                {/* Error message */}
                {getError(index) && (
                  <Typography sx={{ fontSize: "12px", mt: 0.5, color: "#d32f2f" }}>
                    {getError(index)}
                  </Typography>
                )}
                {/* Hint text */}
                {!getError(index) && (
                  <Typography sx={{ fontSize: "11px", mt: 0.5, color: "#777" }}>
                    {getHintText(index)}
                  </Typography>
                )}
              </Box>
            ))}

            {errors?.certificate && (
              <Typography color="error" variant="caption" sx={{ mb: 1 }}>
                {errors.certificate.message}
              </Typography>
            )}
            {errors?.banner && (
              <Typography color="error" variant="caption" sx={{ mb: 1 }}>
                {errors.banner.message}
              </Typography>
            )}
            {errors?.brochure && (
              <Typography color="error" variant="caption" sx={{ mb: 1 }}>
                {errors.brochure.message}
              </Typography>
            )}
          </Box>
        </Box>

        {/* Batch Days */}
        <Box sx={{ gridColumn: "1 / -1", mt: 2 }}>
          <Typography sx={{ fontWeight: 700, mb: 1 }}>Batch Days:</Typography>
          <Typography sx={{ fontSize: "13px", mb: 1, color: "#888" }}>Select Days</Typography>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            {dayOptions.map(({ label, value }) => (
              <Box
                key={value}
                onClick={() => toggleDay(value)}
                sx={{
                  padding: "8px 20px",
                  borderRadius: "8px",
                  border: selectedDays.includes(value)
                    ? "2px solid var(--primary)"
                    : "1px solid #D0D0D0",
                  background: selectedDays.includes(value) ? "var(--primary)" : "white",
                  cursor: "pointer",
                  transition: "all 0.3s",
                  fontWeight: selectedDays.includes(value) ? 600 : 400,
                  color: selectedDays.includes(value) ? "#FFFFFF" : "#000000",
                  "&:hover": {
                    borderColor: "var(--primary)",
                    backgroundColor: selectedDays.includes(value) ? "var(--primary)" : "#F5F5F5",
                  },
                }}
              >
                {label}
              </Box>
            ))}
          </Box>
          {errors.batchDays && (
            <Typography sx={{ color: "#b31b1b", fontSize: "12px", mt: 0.5 }}>
              {errors.batchDays.message}
            </Typography>
          )}
        </Box>
      </Box>

      {/* Submit */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2, px: 1 }}>
        <CustomButton
          type="submit"
          variant="contained"
          label="Submit"
          disabled={uploadingButton}
          boxSx={{ whiteSpace: "nowrap", px: "30px", width: "100px", mt: "10px", mb: "10px" }}
        />
      </Box>
    </Box>
  );
}