import {
  Box,
  Typography,
  IconButton,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from "@mui/material";
import { HiOutlineChevronDoubleRight } from "react-icons/hi";
import { RiCollapseDiagonal2Line, RiDeleteBin5Line } from "react-icons/ri";
import { CgArrowsExpandLeft } from "react-icons/cg";
import { AiOutlinePlus } from "react-icons/ai";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import CustomButton from "../../../components/custom/CustomButton";
import { CustomInput } from "../../../components/custom/CustomInput";
import { CustomAutocomplete } from "../../../components/custom/CustomAutocomplete";
import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import {  getSessionById, updateSession } from "../../../features/sessionSlice";
import { showSuccess, showError } from "../../../components/ui/Toast";
import {
  forminput,
  inputForm,
} from "../../../components/custom/CustomStyles";
import { useSelector } from "react-redux";
import { getAllTrainer } from "../../../features/trainerSlice";
import { getBatchByIdThunk } from "../../../features/batchSlice";

const SessionSchema = z.object({
  sessionName: z.string().min(1, "Session Name is required"),
  sessionDescription: z.string().min(1, "Session Description is required"),
  date: z.string().min(1, "Date is required"),
  day: z.string().min(1, "Day is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  trainers:z.array(z.string()).optional(),
  // learners: z.array(z.string()).optional(),
}).refine((data) => {
  if (data.startTime && data.endTime) {
    return data.endTime > data.startTime;
  }
  return true;
}, {
  message: "End time must be after start time",
  path: ["endTime"]
});

type FormValues = z.infer<typeof SessionSchema>;

interface Props {
  open: boolean;
  onClose: () => void;
  sessionData?: any;
}

const SessionEditModel = ({ open, onClose, sessionData, }: Props) => {  
  const [expand, setExpand] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, message: '', formData: null as any });
  const dispatch = useDispatch();
  const width = expand ? "80%" : "50%";
  
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(SessionSchema),
    defaultValues: {
      sessionName: "",
      sessionDescription : "",
      date: "",
      day: "",
      startTime: "",
      endTime: "",
      trainers: [""],
      // learners: [],
    },
  });
  const { learners,  currentSession } = useSelector(
    (state: any) => state.session
  );
    const { batchedit} = useSelector(
    (state: any) => state.batch
  );

  const { batch, loading, error } = useSelector(
      (state: any) => state.batch
  );
  const { trainers: trainersList } = useSelector(
      (state: any) => state.trainer
  );
  const trainers = watch("trainers");
  const startTime = watch("startTime");
  const selectedDate = watch("date");
  
  useEffect(() => {
    if (selectedDate) {
      const date = new Date(selectedDate);
      const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const dayName = dayNames[date.getDay()];
      setValue("day", dayName);
    }
  }, [selectedDate, setValue]);
   useEffect(() => {
  if (batchedit?.trainerId && batchedit.trainerId.length > 0) {
    dispatch(getAllTrainer({ page: 0, size: 100, filter: { trainerIds: batchedit.trainerId } }) as any);
  }
}, [batchedit, dispatch]);
  useEffect(() => {
    
    if (sessionData && open) {
    
      
      reset({
        sessionName: sessionData.sessionName || "",
        date:sessionData.isRescheduled == true ? sessionData.rescheduleDate : sessionData.sessionDate || "",
        day:sessionData.isRescheduled == true ? sessionData.rescheduleDay : sessionData.day || "",
        startTime: sessionData.isRescheduled == true ? sessionData.rescheduleStartTime : sessionData.sessionStartTime || "",
        endTime: sessionData.isRescheduled == true ? sessionData.rescheduleEndTime : sessionData.sessionEndTime || "",
        trainers: sessionData.trainerId || [],
        sessionDescription: sessionData.sessionDescription || "",
        // learners: sessionData.learnerId || [],
      });
    }
  }, [sessionData, open, reset]);
      useEffect(() => {
      if (sessionData?.id && open) {
        dispatch(getSessionById(sessionData?.id) as any);
      }
    }, [sessionData?.id, open, dispatch]);
    
  const onSubmit = async (data: FormValues) => {    
    const updateData = {
      batchId: sessionData?.batchId,
      sessionName: data?.sessionName,
      sessionDate: data.date,
      day: data.day.toUpperCase(),
      sessionStartTime: data.startTime,
      sessionEndTime: data.endTime,
      trainerId: data.trainers,
      sessionDescription: data.sessionDescription
      // learnerId: data.learners
    };
    
    const result = await dispatch(updateSession({
      id: sessionData?.id,
      input: updateData,
      reschedule: false
    }) as any);
    
    if (result.payload?.success === 200) {
      showSuccess("Session updated successfully");
      onClose();
    } else if (result.payload?.success === 409) {
      setConfirmDialog({
        open: true,
        message: result.payload.message,
        formData: data
      });
    } else {
      showError(result.payload?.message || "Failed to update session");
    }
  };

  const handleConfirmReschedule = async () => {
    const updateData = {
      batchId: sessionData?.batchId,
      sessionName: confirmDialog.formData.sessionName,
      sessionDate: confirmDialog.formData.date,
      day: confirmDialog.formData.day.toUpperCase(),
      sessionStartTime: confirmDialog.formData.startTime,
      sessionEndTime: confirmDialog.formData.endTime,
      trainerId: confirmDialog.formData.trainers,
      sessionDescription: confirmDialog.formData.sessionDescription
    };
    
    const result = await dispatch(updateSession({
      id: sessionData?.id,
      input: updateData,
      reschedule: true
    }) as any);
    
    if (result.payload?.success === 200) {
      showSuccess("Session rescheduled successfully");
      setConfirmDialog({ open: false, message: '', formData: null });
      onClose();
    } else {
      showError(result.payload?.message || "Failed to reschedule session");
    }
  };

  const handleCancelReschedule = () => {
    setConfirmDialog({ open: false, message: '', formData: null });
  };


  const handleClose = () => {
    reset();
    onClose();
  };
    useEffect(() => {
      if (sessionData && open) {
        dispatch(getBatchByIdThunk({ batchId: sessionData?.batchId }) as any);
        // dispatch(getLearnersFromBatch({ batchId: sessionData?.batchId, page: 0, size: 100 }) as any);
        // dispatch(getTrainerFromBatch({ batchId: sessionData?.batchId, page: 0, size: 100 }) as any);
      }
    }, [sessionData, open, dispatch]);
    
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
              Batch / Session / {sessionData?.sessionName || "Edit"}
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
              label="Update"
              boxSx={{whiteSpace:"nowrap",px:"30px "}}
              onClick={handleSubmit(onSubmit)}
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
        <Box sx={forminput}>
          <Typography variant="h3">Session Name</Typography>
          <CustomInput
            name="sessionName"
            type="text"
            register={register}
            errors={errors}
            boxSx={inputForm}
          />
        </Box>
        <Box sx={forminput}>
          <Typography variant="h3">Date</Typography>
          <CustomInput
            name="date"
            type="date"
            register={register}
            errors={errors}
            boxSx={inputForm}
            minDate={currentSession?.batchStartDate}
            maxDate={currentSession?.batchEndDate}
          />
        </Box>

        <Box sx={forminput}>
          <Typography variant="h3">Day</Typography>
          <CustomAutocomplete
            name="day"
            control={control}
            options={["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]}
            errors={errors}
            boxSx={inputForm}
            placeholder="Select day..."
            disabled
          />
        </Box>

        <Box sx={forminput}>
          <Typography variant="h3">Start Time</Typography>
          <CustomInput
            name="startTime"
            type="time"
            register={register}
            errors={errors}
            boxSx={inputForm}
          />
        </Box>

        <Box sx={forminput}>
          <Typography variant="h3">End Time</Typography>
          <CustomInput
            name="endTime"
            type="time"
            register={register}
            errors={errors}
            boxSx={inputForm}
          />
        </Box>

        <Box sx={forminput}>
          <Typography variant="h3">Trainers</Typography>
          <CustomAutocomplete
            name="trainers"
            control={control}
            options={trainersList?.map((trainer: any) => ({
              label: trainer.trainerName,
              value: trainer.id
            })) || []}
            multiple
            errors={errors}
            boxSx={inputForm}
            limitTags={2}
            placeholder="Select trainers..."
          />
        </Box>
        <Box sx={forminput}>
                  <Typography variant="h3">Session Description</Typography>
                  <CustomInput
                    name="sessionDescription"
                    type="text"
                    register={register}
                    errors={errors}
                    boxSx={inputForm}
                  />
        </Box>
        {/* <Box sx={forminput}>
          <Typography variant="h3">Learners</Typography>
          <CustomAutocomplete
            name="learners"
            control={control}
            options={learners?.map((learner: any) => ({
              label: learner.learnerName,
              value: learner.id
            })) || []}
            multiple
            errors={errors}
            limitTags={2}
            boxSx={inputForm}
            placeholder="Select learners..."
          />
        </Box> */}
      </Box>
      
      <Dialog 
        open={confirmDialog.open} 
        onClose={handleCancelReschedule}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            overflow: 'visible'
          }
        }}
        sx={{ zIndex: 9999 }}
      >
        <DialogTitle sx={{
          textAlign: 'start',
          fontSize: '16px',
          fontWeight: 600,
          color: 'var(--textPrimary)',
          pb: 1,
          borderBottom: '1px solid #e0e0e0'
        }}>
          Confirm Session Reschedule
        </DialogTitle>
        <DialogContent sx={{ pt: 3, pb: 2, mt: 2 }}>
          <Alert severity="warning" sx={{ borderRadius: 2 }}>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {confirmDialog.message}
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions sx={{ 
          justifyContent: 'end', 
          gap: 2, 
          pb: 3, 
          px: 3 
        }}>
          <CustomButton 
            onClick={handleCancelReschedule}
            variant="outlined"
            label="Cancel"
            type="button"
            boxSx={{width:"max-content",minWidth:"100px"}}
          />
          <CustomButton 
            onClick={handleConfirmReschedule} 
            variant="contained"
            label="Proceed"
            type="button"
            boxSx={{width:"max-content",minWidth:"100px"}}
          />
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SessionEditModel;