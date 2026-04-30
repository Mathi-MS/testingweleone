import {
  Box,
  Typography,
  IconButton,
  Tabs,
  Tab,
} from "@mui/material";
import { HiOutlineChevronDoubleRight } from "react-icons/hi";
import CustomButton from "../../../components/custom/CustomButton";
import { useState, useRef, useEffect, useCallback } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createBatch, updateBatch } from "../../../features/batch/generaldetailsSlice";
import { useDispatch } from "react-redux";
import { useAppSelector } from "../../../app/hook";
import { showError, showSuccess } from "../../../components/ui/Toast";
import { AppDispatch } from "../../../app/store";
import Session from "./Session";
import { getAllBatchThunk, getBatchByIdThunk, clearBatchEdit, clearModules } from "../../../features/batchSlice";
import { CalendarCheck } from "lucide-react";
import { Coursemapping } from "./CourseMapping";
import GeneralDetails from "./GeneralDetails";
import Trainer from "./trainer/Trainer";
import Learner from "./learner/Learner";
import Payment from "./payment/Payment";
import { clearTrainers, deleteTrainer } from "../../../features/trainerSlice";
import ModuleMapping from "./module/ModuleMapping";
import Assessments from "./assessment/Assessments";
import { useSelector } from "react-redux";
import DeleteFileDialog from "./BatchDelete";
import { resetSessions } from "../../../features/sessionSlice";
import { Faquestion } from "./Faq/faquestion";

interface Props {
  open: boolean;
  onClose: () => void;
  itemId: string | null;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const GeneralDetailsSchema = z.object({
  batchname: z.string().min(1, "Batch name is required"),
  Duration: z
    .string()
    .min(1, "Duration is required")
    .regex(/^[0-9]+(\.[0-9]+)?$/, "Only numbers allowed (e.g., 2.5)"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  timezone: z.string().min(1, "Time zone is required"),
  enrollmentLimit: z
    .string()
    .min(1, "Please enter the maximum enrollment")
    .regex(/^\d{1,3}$/, "Enter up to 3 digits only"),
  enrollmentStartDate: z.string().min(1, "Enrollment start date required"),
  enrollmentEndDate: z.string().min(1, "Enrollment end date required"),
  sessionFrom: z.string().min(1, "Session start time required"),
  sessionTo: z.string().min(1, "Session end time required"),
  batchDays: z.array(z.string()).min(1, "Select at least one day"),
  language: z.string().min(1, "Language is required"),
  skillsYouGain: z.array(z.string()).min(1, "At least one skill is required"),
  currentSkillInput: z.string().optional(),
  whatYouLearn: z.string().min(1, "What you learn is required"),
  category: z.string().min(1, "Category is required"),
  track: z.string().min(1, "Track is required"),
  forWhom: z.string().min(1, "Is whom is required"),
  description: z
    .string()
    .min(10, "Short description must be at least 10 characters")
    .max(200, "Short description must not exceed 200 characters"),
  testBatch: z.boolean(),
  learningCommunity: z.string().optional(),
  isWebsiteEnable: z.boolean(),
  isSkillBridgeProgram: z.boolean(),
});

type FormValues = z.infer<typeof GeneralDetailsSchema>;

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

const batchModel = ({ open, onClose, itemId }: Props) => {
  const [value, setValue] = useState(0);
  const dispatch = useDispatch<AppDispatch>();
  const [certificateFile, setCertificateFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerWebFile, setBannerWebFile] = useState<File | null>(null);
  const [bannerMobileFile, setBannerMobileFile] = useState<File | null>(null);
  const [brochureFile, setBrochureFile] = useState<File | null>(null);
  const [removeBanner, setRemoveBanner] = useState(false);
  const [removeBannerWeb, setRemoveBannerWeb] = useState(false);
  const [removeBannerMobile, setRemoveBannerMobile] = useState(false);
  const [removeCertificate, setRemoveCertificate] = useState(false);
  const [removeBrochure, setRemoveBrochure] = useState(false);
  const { batch } = useAppSelector((state) => state.generaldetails);
  const { batchedit } = useAppSelector((state: any) => state.batch);
  const [mainTab, setMainTab] = useState(0);
  const [uploading, setUploading] = useState(false);
  const batchId = itemId;
  const initialFormValues = useRef<FormValues | null>(null);
  const [hasFormChanged, setHasFormChanged] = useState(false);

  // ✅ Track last submitted snapshot to detect "no changes" re-submit
  const lastSubmittedValuesRef = useRef<string | null>(null);

  // ✅ FIX: Track the resolved batch ID (itemId OR newly created id) as a ref
  // so onSubmit always reads the latest value without stale closure issues
  const resolvedBatchIdRef = useRef<string | null>(itemId);

  const [batchid, setBatchid] = useState<string | null>(null);
  const [trainerIds, setTrainerIds] = useState<string[]>([]);
  const [isExistingCommunity, setIsExistingCommunity] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const effectiveBatchId = batchId || batchid;
  const { trainers, loading, pagination } = useSelector((state: any) => state.trainer);
  
  
  // Default values
  const defaultValues: FormValues = {
    batchname: "",
    Duration: "",
    startDate: "",
    endDate: "",
    timezone: "",
    enrollmentLimit: "",
    enrollmentStartDate: "",
    enrollmentEndDate: "",
    sessionFrom: "",
    sessionTo: "",
    batchDays: [],
    language: "",
    skillsYouGain: [],
    currentSkillInput: "",
    whatYouLearn: "",
    description: "",
    category: "",
    track: "",
    forWhom: "",
    testBatch: false,
    learningCommunity: "",
    isWebsiteEnable: false,
    isSkillBridgeProgram:false,
  };

  const methods = useForm<FormValues>({
    resolver: zodResolver(GeneralDetailsSchema),
    mode: "onChange",
    defaultValues: defaultValues,
  });

  const watchedValues = methods.watch();

  useEffect(() => {
    if (!initialFormValues.current) {
      initialFormValues.current = methods.getValues();
    }

    const currentValues = methods.getValues();
    const changed =
      JSON.stringify(currentValues) !== JSON.stringify(initialFormValues.current) ||
      certificateFile !== null ||
      bannerFile !== null ||
      bannerWebFile !== null ||
      bannerMobileFile !== null ||
      brochureFile !== null;

    setHasFormChanged(changed);
  }, [watchedValues, certificateFile, bannerFile, bannerWebFile, bannerMobileFile, brochureFile, methods]);

  useEffect(() => {
    if (open && batchId) {
      dispatch(getBatchByIdThunk({ batchId }));
      resolvedBatchIdRef.current = batchId; // ✅ sync ref for edit mode
    }
  }, [open, batchId, dispatch]);

  useEffect(() => {
    if (batchedit && open && itemId) {
      const formData = {
        batchname: batchedit?.batchName || "",
        Duration: batchedit?.duration ? String(batchedit.duration) : "",
        startDate: batchedit?.batchStartDate || "",
        endDate: batchedit?.batchEndDate || "",
        timezone: batchedit?.timeZone || "",
        enrollmentLimit: batchedit?.minimumMaximumEnrollment
          ? String(batchedit?.minimumMaximumEnrollment)
          : "",
        enrollmentStartDate: batchedit?.enrollmentStartDate || "",
        enrollmentEndDate: batchedit?.enrollmentEndDate || "",
        sessionFrom: batchedit?.sessionStartTime
          ? batchedit?.sessionStartTime.slice(0, 5)
          : "",
        sessionTo: batchedit?.sessionEndTime
          ? batchedit?.sessionEndTime.slice(0, 5)
          : "",
        batchDays: batchedit?.batchDays || [],
        language: batchedit?.language || "",
        skillsYouGain: batchedit?.skillsYouGain || [],
        category: batchedit?.category?.[0] || "",
        track: Array.isArray(batchedit?.track) ? batchedit.track[0] : batchedit?.track || "",
        forWhom: batchedit?.forWhom?.[0] || "",
        currentSkillInput: "",
        whatYouLearn: batchedit?.whatYouLearn || "",
        description: batchedit?.batchDescription || "",
        testBatch: batchedit?.testBatch || false,
        learningCommunity: batchedit?.learningCommunityId || batchedit?.learningCommunity || "",
        isWebsiteEnable: batchedit?.isWebsiteEnable || false,
        isSkillBridgeProgram:batchedit?.isSkillBridgeProgram ?? false,
      };

      methods.reset(formData);
      initialFormValues.current = formData;
      setHasFormChanged(false);
      // ✅ FIX: Reset refs when edit data loads
      lastSubmittedValuesRef.current = null;
      resolvedBatchIdRef.current = itemId; // ✅ point to the existing batch being edited
    }
  }, [batchedit, open, itemId, methods]);


  const onSubmit = async (values: FormValues) => {
    // ✅ FIX: Always use the ref — it holds itemId OR the id from a previous create
    const activeBatchId = resolvedBatchIdRef.current;

    // ✅ FIX: Prevent re-submit if nothing changed since last successful submission
    const currentSnapshot = JSON.stringify({
      values,
      certificateFile: certificateFile?.name ?? null,
      bannerFile: bannerFile?.name ?? null,
      bannerWebFile: bannerWebFile?.name ?? null,
      bannerMobileFile: bannerMobileFile?.name ?? null,
      brochureFile: brochureFile?.name ?? null,
    });

    if (lastSubmittedValuesRef.current === currentSnapshot) {
      showError("No changes detected. Please modify the form before submitting again.");
      return;
    }

    // ✅ FIX: Prevent concurrent submissions (double-click)
    if (uploading) return;

    setUploading(true);

    let maxEnrollment: number;
    if (values.enrollmentLimit.includes("/")) {
      const [min, max] = values.enrollmentLimit.split("/").map((s) => parseInt(s.trim()));
      maxEnrollment = max;
    } else {
      maxEnrollment = parseInt(values.enrollmentLimit.trim());
    }

    const categoryArray = Array.isArray(values.category) ? values.category : [values.category];
    const forWhomArray = Array.isArray(values.forWhom) ? values.forWhom : [values.forWhom];
    const batchDaysArray = Array.isArray(values.batchDays) ? values.batchDays : [values.batchDays];
    const skillsArray = Array.isArray(values.skillsYouGain) ? values.skillsYouGain : [values.skillsYouGain];

    let learningCommunity = "";
    let learningHub = false;

    if (values.learningCommunity && typeof values.learningCommunity === "string") {
      learningCommunity = values.learningCommunity.trim();
      learningHub = !isExistingCommunity;
    }

    const batchJson: any = {
      batchName: values.batchname,
      batchType: "ONLINE",
      batchStartDate: values.startDate,
      batchEndDate: values.endDate,
      enrollmentStartDate: values.enrollmentStartDate,
      enrollmentEndDate: values.enrollmentEndDate,
      minimumMaximumEnrollment: maxEnrollment,
      duration: parseFloat(values.Duration),
      timeZone: values.timezone,
      sessionStartTime: values.sessionFrom + ":00",
      sessionEndTime: values.sessionTo + ":00",
      batchDays: batchDaysArray,
      language: values.language,
      category: categoryArray,
      forWhom: forWhomArray,
      skillsYouGain: skillsArray,
      whatYouLearn: values.whatYouLearn,
      batchDescription: values.description,
      track: values.track,
      isMasterClass: mainTab == 0 ? false : true,
      testBatch: values.testBatch,
      learningCommunity: learningCommunity,
      isWebsiteEnable: values.isWebsiteEnable,
      isSkillBridgeProgram:values.isSkillBridgeProgram,
      removeBanner: removeBanner,
      removeBannerWeb: removeBannerWeb,
      removeBannerMobile: removeBannerMobile,
      removeCertificate: removeCertificate,
      removeBrochure: removeBrochure,
    };

    const formData = new FormData();
    formData.append("data", JSON.stringify(batchJson));

    if (certificateFile) {
      formData.append("certificate", certificateFile);
    }
    if (bannerFile) {
      formData.append("banner", bannerFile);
    }
    if (bannerWebFile) {
      formData.append("bannerWeb", bannerWebFile);
    }
    if (bannerMobileFile) {
      formData.append("bannerMobile", bannerMobileFile);
    }
    if (brochureFile) {
      formData.append("brochure", brochureFile);
    }
    if (activeBatchId && typeof activeBatchId === "string") {
      formData.append("reschedule", "false");
    }
    formData.append("learningHub", learningHub ? "true" : "false");

    try {
      let resp;

      if (activeBatchId && typeof activeBatchId === "string") {
        console.log("UPDATING batch ID:", activeBatchId);
        resp = await dispatch(
          updateBatch({
            id: activeBatchId,
            formData,
          })
        ).unwrap();
      } else {
        resp = await dispatch(createBatch(formData)).unwrap();
      }

      dispatch(getAllBatchThunk({ page: 0, size: 20 }));

      if (resp?.success === 200) {
        showSuccess(activeBatchId ? "Batch updated successfully" : "Batch created successfully");

        const currentFormData = methods.getValues();
        initialFormValues.current = currentFormData;
        setHasFormChanged(false);

        // ✅ FIX: Mark API called

        // ✅ FIX: After a CREATE, store the new id so all future submits hit UPDATE
        if (!activeBatchId && resp?.data?.id) {
          resolvedBatchIdRef.current = resp.data.id;
        }

        // ✅ FIX: Save snapshot so re-submit with same data is blocked
        lastSubmittedValuesRef.current = JSON.stringify({
          values: currentFormData,
          certificateFile: certificateFile?.name ?? null,
          bannerFile: bannerFile?.name ?? null,
          bannerWebFile: bannerWebFile?.name ?? null,
          bannerMobileFile: bannerMobileFile?.name ?? null,
          brochureFile: brochureFile?.name ?? null,
        });

        setBatchid(resp?.data?.id);
        setTrainerIds(resp?.data?.trainerId || []);
      } else {
        showError(resp?.message || "Failed to process request");
      }
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.data?.message ||
        err?.message ||
        "Failed to process batch";
      showError(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleChange = async (event: React.SyntheticEvent, newValue: number) => {
    if (newValue === 1) {
      const isValid = await methods.trigger([
        "batchname",
        "Duration",
        "startDate",
        "endDate",
        "timezone",
        "enrollmentLimit",
        "enrollmentStartDate",
        "enrollmentEndDate",
        "sessionFrom",
        "sessionTo",
        "batchDays",
        "language",
        "whatYouLearn",
        "description",
        "track",
        "skillsYouGain",
        "category",
      ]);

      if (!isValid) {
        console.log("Validation errors:", methods.formState.errors);
        showError("Please complete all required fields before proceeding.");
        return;
      }

      // ✅ Only call API if form has changed since last successful submit.
      // onSubmit's snapshot guard handles the "same data" dedup case internally.
      // resolvedBatchIdRef ensures it calls UPDATE (not create) after first submit.
      if (hasFormChanged) {
        const values = methods.getValues();
        await onSubmit(values);
      }
    }
    setValue(newValue);
  };

  const getTabName = () => {
    const tabNames = [
      "General Details",
      "Session",
      "Courses Mapping",
      "Learners",
      "Trainers",
      "Payment Details",
      "Modules",
      "Assessments",
      "FAQ"
    ];
    return tabNames[value];
  };

  const handleClose = useCallback(() => {
    methods.reset(defaultValues);

    setCertificateFile(null);
    setBannerFile(null);
    setBannerWebFile(null);
    setBannerMobileFile(null);
    setBrochureFile(null);

    initialFormValues.current = defaultValues;
    setHasFormChanged(false);

    // ✅ FIX: Reset all refs on close
    lastSubmittedValuesRef.current = null;
    resolvedBatchIdRef.current = null;

    dispatch(clearTrainers());
    dispatch(clearModules());
    dispatch(resetSessions());
    setValue(0);
    setMainTab(0);

    setBatchid(null);
    setTrainerIds([]);

    onClose();
    trainers[null as any];
    setIsExistingCommunity(false);
  }, [methods, onClose, dispatch]);

  const handleSaveDraft = () => {
    // Implement draft logic
  };

  const handleDelete = async () => {
    if (!batchId) return;

    try {
      const result = await dispatch(
        deleteTrainer({ id: batchId, confirmation: false }) as any
      );

      if (result.payload?.success === 200) {
        showSuccess("Batch deleted successfully");
        dispatch(getAllBatchThunk({ page: 0, size: 20 }));
        handleClose();
      } else {
        showError(result.payload?.message || "Delete failed");
      }
    } catch (error: any) {
      showError(error?.message || "Something went wrong");
    }
  };

  useEffect(() => {
    if (open && !itemId) {
      dispatch(clearBatchEdit());
      methods.reset(defaultValues);
      setCertificateFile(null);
      setBannerFile(null);
      setBannerWebFile(null);
      setBannerMobileFile(null);
      setBrochureFile(null);
      initialFormValues.current = defaultValues;
      setHasFormChanged(false);

      // ✅ FIX: Reset all refs for fresh creation
      lastSubmittedValuesRef.current = null;
      resolvedBatchIdRef.current = null;

      setValue(0);
      setMainTab(0);
      setTrainerIds([]);
    }
  }, [open, itemId, methods, dispatch]);

  const confirmDelete = async () => {
    setShowDeleteDialog(false);
    await handleDelete();
  };

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        right: open ? 0 : "-100%",
        width: "81%",
        height: "100vh",
        background: "#fff",
        transition: "0.4s",
        boxShadow: "-4px 0px 15px rgba(0,0,0,0.15)",
        p: 2,
        zIndex: 9999,
        "& .ql-editor": { minHeight: "max-content" },
      }}
    >
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <IconButton onClick={handleClose}>
                  <HiOutlineChevronDoubleRight size={16} />
                </IconButton>
                <Typography sx={{ fontSize: 14, ml: 1 }}>
                  Batch / {getTabName()} / {batchId ? "Edit" : "Creation"}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", gap: 1 }}>
                <CustomButton
                  type="button"
                  variant="outlined"
                  label="Cancel"
                  onClick={handleClose}
                />
                {batchId && (
                  <CustomButton
                    type="button"
                    variant="outlined"
                    label="Delete"
                    onClick={() => setShowDeleteDialog(true)}
                  />
                )}
              </Box>
            </Box>
          </Box>

          {batchId && (
            <Typography
              sx={{ display: "flex", alignItems: "center", gap: 1, ml: 2, fontWeight: "600", mt: 2 }}
            >
              <CalendarCheck size={16} />
              {batchedit?.batchId}
            </Typography>
          )}

          <Box sx={{ width: "100%" }}>
            <Box sx={{ margin: "20px 0px 10px 0px" }}>
              <Tabs
                value={mainTab}
                onChange={(e, newValue) => setMainTab(newValue)}
                aria-label="main tabs"
                sx={{
                  "& button": {
                    textTransform: "capitalize",
                    borderRadius: "4px",
                    minHeight: "max-content",
                    padding: "10px 12px",
                    fontWeight: "400 !important",
                  },
                  "& .Mui-selected": {
                    color: "var(--white) !important",
                    fontFamily: "DM-Bold !important",
                    background: "var(--primary)",
                  },
                  "& .MuiTabs-indicator": {
                    display: "none",
                  },
                }}
              >
                <Tab label="Batch" />
                <Tab label="Master Class" />
              </Tabs>
            </Box>

            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <Tabs
                value={value}
                onChange={handleChange}
                aria-label="sub tabs"
                sx={{
                  "& button": { textTransform: "capitalize" },
                  "& .Mui-selected": {
                    color: "var(--black) !important",
                    fontFamily: "DM-Bold !important",
                  },
                  "& .MuiTabs-indicator": { backgroundColor: "var(--primary)" },
                }}
              >
                <Tab label="General Details" {...a11yProps(0)} />
                <Tab label="Session" {...a11yProps(1)} />
                {mainTab === 0 && <Tab label="Courses Mapping" {...a11yProps(2)} />}
                <Tab label="Learners" {...a11yProps(3)} />
                <Tab label="Trainers" {...a11yProps(4)} />
                <Tab label="Payment Details" {...a11yProps(5)} />
                <Tab label="Modules" {...a11yProps(6)} />
                <Tab label="Assessments" {...a11yProps(7)} />
                <Tab label="FAQ" {...a11yProps(8)} />
              </Tabs>
            </Box>

            <CustomTabPanel value={value} index={0}>
              <GeneralDetails
                setCertificateFile={setCertificateFile}
                setBannerFile={setBannerFile}
                setBannerWebFile={setBannerWebFile}
                setBannerMobileFile={setBannerMobileFile}
                setBrochureFile={setBrochureFile}
                certificateFile={certificateFile}
                bannerFile={bannerFile}
                bannerWebFile={bannerWebFile}
                bannerMobileFile={bannerMobileFile}
                brochureFile={brochureFile}
                uploadingButton={uploading}
                setIsExistingCommunity={setIsExistingCommunity}
                existingBannerUrl={batchedit?.bannerUrl}
                existingBannerFileName={batchedit?.bannerFileName}
                existingBannerWebUrl={batchedit?.bannerWebUrl}
                existingBannerWebFileName={batchedit?.bannerWebFileName}
                existingBannerMobileUrl={batchedit?.bannerMobileUrl}
                existingBannerMobileFileName={batchedit?.bannerMobileFileName}
                existingCertificateUrl={batchedit?.certificateUrl}
                existingCertificateFileName={batchedit?.certificateFileName}
                existingBrochureUrl={batchedit?.brochureUrl}
                existingBrochureFileName={batchedit?.brochureFileName || (batchedit?.brochureUrl ? (() => { try { return decodeURIComponent(batchedit.brochureUrl.split("/").pop() || "Brochure.pdf"); } catch { return batchedit.brochureUrl.split("/").pop() || "Brochure.pdf"; } })() : undefined)}
                onRemoveBanner={setRemoveBanner}
                onRemoveBannerWeb={setRemoveBannerWeb}
                onRemoveBannerMobile={setRemoveBannerMobile}
                onRemoveCertificate={setRemoveCertificate}
                onRemoveBrochure={setRemoveBrochure}
              />
            </CustomTabPanel>
            <CustomTabPanel value={value} index={1}>
              <Box sx={{ p: 2 }}>
                <Session batchId={effectiveBatchId} />
              </Box>
            </CustomTabPanel>
            {mainTab === 0 && (
              <CustomTabPanel value={value} index={2}>
                <Box sx={{ p: 1 }}>
                  <Coursemapping batchId={batchId} />
                </Box>
              </CustomTabPanel>
            )}
            <CustomTabPanel value={value} index={mainTab === 0 ? 3 : 2}>
              <Learner batchId={effectiveBatchId} />
            </CustomTabPanel>
            <CustomTabPanel value={value} index={mainTab === 0 ? 4 : 3}>
              <Box sx={{ p: 2 }}>
                <Trainer batchId={effectiveBatchId} />
              </Box>
            </CustomTabPanel>
            <CustomTabPanel value={value} index={mainTab === 0 ? 5 : 4}>
              <Box sx={{ p: 2 }}>
                <Payment batchId={effectiveBatchId} />
              </Box>
            </CustomTabPanel>
            <CustomTabPanel value={value} index={mainTab === 0 ? 6 : 5}>
              <Box sx={{ p: 2 }}>
                <ModuleMapping batchId={effectiveBatchId} />
              </Box>
            </CustomTabPanel>
            <CustomTabPanel value={value} index={mainTab === 0 ? 7 : 6}>
              <Box sx={{ p: 2 }}>
                <Assessments batchId={effectiveBatchId} />
              </Box>
            </CustomTabPanel>
            <CustomTabPanel value={value} index={mainTab === 0 ? 8 : 7}>
              <Box sx={{ p: 2 }}>
                <Faquestion batchId={effectiveBatchId} />
              </Box>
            </CustomTabPanel>
          </Box>
        </form>
      </FormProvider>
      <DeleteFileDialog
        open={showDeleteDialog}
        batchId={batchedit?.batchId}
        batchName={batchedit?.batchName}
        status={batchedit?.status}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={confirmDelete}
      />
    </Box>
  );
};

export default batchModel;