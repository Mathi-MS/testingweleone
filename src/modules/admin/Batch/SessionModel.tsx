import {
  Box,
  Typography,
  IconButton,
  Divider,
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
import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getBatchById } from "../../../features/batchSlice";
import { createSession, getNextAvailableSessionDate, getLearnersFromBatch, } from "../../../features/sessionSlice";
import { getAllTrainer } from "../../../features/trainerSlice";
import {
  forminput,
  inputForm,
} from "../../../components/custom/CustomStyles";
import { showError, showSuccess } from "../../../components/ui/Toast";


const SessionSchema = z.object({
  sessionName: z.string().min(1, "Session Name is required"),
  sessionDescription: z.string().min(1, "Session Description is required"),
  date: z.string().min(1, "Date is required"),
  day: z.string().min(1, "Day is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  trainers: z.array(z.string()).optional(),
  // learners: z.array(z.string()).optional(),
});

type FormValues = z.infer<typeof SessionSchema>;
interface Props {
  open: boolean;
  onClose: () => void;
  batchId: string;
}


const SessionModel = ({ open, onClose, batchId }: Props) => {  
  const [expand, setExpand] = useState(false);
  const [uploading, setUploading] = useState(false);
  const dispatch = useDispatch();
  const { batch, batcheditsession, loading, error } = useSelector(
    (state: any) => state.batch
  );
  const { loading: sessionLoading,nextAvailableStatus, nextAvailableDate, learners } = useSelector(
    (state: any) => state.session
  );  
  const { trainers: trainersList } = useSelector(
    (state: any) => state.trainer
  );
  const width = expand ? "80%" : "50%";
  useEffect(() => { 
    if (batchId && open) {
      dispatch(getBatchById(batchId) as any);
      dispatch(getNextAvailableSessionDate(batchId) as any)
    }
  }, [batchId, open, dispatch]);
  
  useEffect(() => {
    if (batcheditsession?.data?.trainerId && batcheditsession.data.trainerId.length > 0) {
      dispatch(getAllTrainer({ page: 0, size: 100, filter: { trainerIds: batcheditsession.data.trainerId } }) as any);
    }
  }, [batcheditsession, dispatch]);
  
  useEffect(() => {
    if (nextAvailableStatus?.success === 404 && open) {
      showError(nextAvailableStatus.message);
      onClose();
    }
  }, [nextAvailableStatus,open]);
  
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

  const trainers = watch("trainers");
  const selectedDate = watch("date");
  
  useEffect(() => {
   
    if (batch && batch.data?.batchStartDate) {
      setValue("sessionName", ``);
      setValue("startTime", batch.data?.sessionStartTime);
      setValue("endTime", batch.data?.sessionEndTime);
    }
    if (nextAvailableDate) {
      setValue("date", nextAvailableDate);
    }
  }, [batch, nextAvailableDate, setValue, open]);

  useEffect(() => {
    if (selectedDate) {
      const date = new Date(selectedDate);
      const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const dayName = dayNames[date.getDay()];
      setValue("day", dayName);
    }
  }, [selectedDate, setValue]);

  const onSubmit = async (data: FormValues) => { 
    setUploading(true);   
    const result = await dispatch(createSession({
      batchId,
      sessionName: data.sessionName,
      sessionDate: data.date,
      day: data.day.toUpperCase(),
      sessionStartTime: `${data.startTime}`,
      sessionEndTime: `${data.endTime}`,
      trainerId: data.trainers,
      sessionDescription: data.sessionDescription
      //  learnerId: data.learners
    }) as any);
    if (result.payload?.success === 200) {
      onClose();
      reset();
      showSuccess("Session Created Successfully");
      setUploading(false);
    } else {
      showError(result.payload?.message || "Failed to Create session");
      setUploading(false);
    }
  };



  const handleClose = () => {
    reset();
    onClose();
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
      <Box >
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
              Batch / Session / Creation
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
              disabled={uploading}
              label="Save"
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
            disabled
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

    </Box>
  );
};

export default SessionModel;
