import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Box, Typography } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../../app/store";
import { updatePayment, PaymentInput } from "../../../../features/batch/paymentSlice";
import { CustomInput } from "../../../../components/custom/CustomInput";
import { CustomAutocomplete } from "../../../../components/custom/CustomAutocomplete";
import { forminput, inputForm } from "../../../../components/custom/CustomStyles";
import * as z from "zod";
import CustomButton from "../../../../components/custom/CustomButton";
import { useEffect, useMemo, useState } from "react";
import { showError, showSuccess } from "../../../../components/ui/Toast";
import { getBatchById } from "../../../../features/batchSlice";

/* -------------------- UTILS -------------------- */
const getNowLocalDateTime = () => {
  const now = new Date();
  now.setSeconds(0, 0);
  return now.toISOString().slice(0, 16);
};

/* -------------------- ZOD SCHEMA -------------------- */
const PaymentSchema = z
  .object({
    basePrice: z.string().min(1, "Base price is required"),
    sellingPrice: z.string(),
    discountType: z.string().min(1, "Discount type is required"),
    discountValue: z.string(),
    discountStartDateTime: z.string().min(1, "Start date & time is required"),
    discountEndDateTime: z.string().min(1, "End date & time is required"),

    enableUpi: z.boolean(),
    enableCardPayment: z.boolean(),
    enableNetBanking: z.boolean(),
    enableWallet: z.boolean(),
    // enableEmi: z.boolean(),
  })
  .superRefine((data, ctx) => {
    const base = Number(data.basePrice);
    const discount = Number(data.discountValue);

    const now = new Date();
    const start = new Date(data.discountStartDateTime);
    const end = new Date(data.discountEndDateTime);

    /* ---- Date validations ---- */
    if (start < now) {
      ctx.addIssue({
        path: ["discountStartDateTime"],
        message: "Start date & time cannot be in the past",
        code: z.ZodIssueCode.custom,
      });
    }

    if (end <= start) {
      ctx.addIssue({
        path: ["discountEndDateTime"],
        message: "End date & time must be after start date & time",
        code: z.ZodIssueCode.custom,
      });
    }

    /* ---- Discount validations ---- */
    if (data.discountType !== "NONE") {
      if (!data.discountValue) {
        ctx.addIssue({
          path: ["discountValue"],
          message: "Discount value is required",
          code: z.ZodIssueCode.custom,
        });
      }

      if (data.discountType === "PERCENTAGE" && discount > 100) {
        ctx.addIssue({
          path: ["discountValue"],
          message: "Percentage discount cannot exceed 100",
          code: z.ZodIssueCode.custom,
        });
      }

      if (data.discountType === "FLAT" && discount >= base) {
        ctx.addIssue({
          path: ["discountValue"],
          message: "Flat discount must be less than base price",
          code: z.ZodIssueCode.custom,
        });
      }
    }

    /* ---- Payment validation ---- */
    const paymentSelected =
      data.enableUpi ||
      data.enableCardPayment ||
      data.enableNetBanking ||
      data.enableWallet 
      // data.enableEmi;

      
    if (!paymentSelected) {
      ctx.addIssue({
        path: ["enableUpi"],
        message: "Select at least one payment method",
        code: z.ZodIssueCode.custom,
      });
    }
  });

/* -------------------- TYPES -------------------- */
interface FormValues {
  basePrice: string;
  sellingPrice: string;
  discountType: string;
  discountValue: string;
  discountStartDateTime: string;
  discountEndDateTime: string;

  enableUpi: boolean;
  enableCardPayment: boolean;
  enableNetBanking: boolean;
  enableWallet: boolean;
  // enableEmi: boolean;
}

/* -------------------- COMPONENT -------------------- */
const Payment = ({batchId}: {batchId:string | any}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error, response } = useSelector((state: RootState) => state.payment);
  const [courseType, setCourseType] = useState<"FREE" | "PAID" | "">("");
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(PaymentSchema),
    defaultValues: {
      basePrice: "",
      sellingPrice: "",
      discountType: "",
      discountValue: "",
      discountStartDateTime: "",
      discountEndDateTime: "",

      enableUpi: false,
      enableCardPayment: false,
      enableNetBanking: false,
      enableWallet: false,
      // enableEmi: false,
    },
  });

  /* -------------------- WATCHERS -------------------- */
  const basePrice = watch("basePrice");
  const discountType = watch("discountType");
  const discountValue = watch("discountValue");
  const startDateTime = watch("discountStartDateTime");

  const nowMin = useMemo(() => getNowLocalDateTime(), []);
  const endMin = startDateTime || nowMin;

  /* -------------------- RESET DISCOUNT -------------------- */
  useEffect(() => {
    if (!basePrice || !discountType || discountType === "NONE") {
      setValue("discountValue", "");
      setValue("sellingPrice", basePrice || "");
    } else {
      setValue("discountValue", "");
    }
  }, [basePrice, discountType, setValue]);
const onSubmitFree = async () => {
  const payload: any = {
    paymentType: "FREE",
  };

  try {
    const res = await dispatch(updatePayment({ batchId, input: payload })).unwrap();

    if (res.success === 200) {
      showSuccess("Course marked as FREE");
    } else {
      showError(res.message || "Something went wrong");
    }
  } catch (error) {
    console.error(error);
  }
};
  /* -------------------- SELLING PRICE -------------------- */
  useEffect(() => {
    if (!basePrice) return;

    const base = Number(basePrice);
    let selling = base;

    if (discountType === "PERCENTAGE" && discountValue) {
      selling = base - (base * Number(discountValue)) / 100;
    }

    if (discountType === "FLAT" && discountValue) {
      selling = base - Number(discountValue);
    }

    setValue("sellingPrice", selling.toFixed(2));
  }, [basePrice, discountType, discountValue, setValue]);

  useEffect(() => {
  if (courseType === "FREE") {
    setValue("basePrice", "");
    setValue("sellingPrice", "");
    setValue("discountType", "");
    setValue("discountValue", "");
    setValue("discountStartDateTime", "");
    setValue("discountEndDateTime", "");

    setValue("enableUpi", false);
    setValue("enableCardPayment", false);
    setValue("enableNetBanking", false);
    setValue("enableWallet", false);
    // setValue("enableEmi", false);
  }
  }, [courseType, setValue]);



  /* -------------------- OPTIONS -------------------- */
  const discountTypeOptions = [
    { label: "Percentage", value: "PERCENTAGE" },
    { label: "Flat", value: "FLAT" },
    { label: "None", value: "NONE" },
  ];

  /* -------------------- SUBMIT -------------------- */
  const onSubmit = async (data: FormValues) => {
    const payload: PaymentInput = {
      basePrice: Number(data.basePrice),
      sellingPrice: Math.round(Number(data.sellingPrice)),
      discountType: data.discountType as "PERCENTAGE" | "FLAT" | "NONE",
      discountValue:
        data.discountType === "NONE" ? 0 : Number(data.discountValue),
      discountStartDateTime: data.discountStartDateTime + ":00",
      discountEndDateTime: data.discountEndDateTime + ":00",
      enableUpi: data.enableUpi,
      enableCardPayment: data.enableCardPayment,
      enableNetBanking: data.enableNetBanking,
      enableWallet: data.enableWallet,
      paymentType:"PAID"
      // enableEmi: data.enableEmi,
    };

    try {
      const res = await dispatch(updatePayment({ batchId, input: payload })).unwrap();
      if(res.success === 200){
        showSuccess(res.message || "Payment updated successfully");
      }
      else if(res.success === 500){
        showError(res.message || "Server error occurred");
      }
      else {
        showError(res.message || "Something went wrong");
      }
    } catch (error) {
      console.error("Failed to update payment:", error);
    }
  };

  /* -------------------- UI -------------------- */
  useEffect(() => {
    if (batchId) {
      dispatch(getBatchById(batchId) as any)
        .then((result: any) => {
          const data = result?.payload?.data;
          if (data) {
            // Set course type based on basePrice
            setCourseType(data.basePrice > 0 ? "PAID" : "FREE");
            
            // Populate form fields
            setValue("basePrice", data.basePrice?.toString() || "");
            setValue("sellingPrice", data.sellingPrice?.toString() || "");
            setValue("discountType", data.discountType || "");
            setValue("discountValue", data.discountValue?.toString() || "");
            setValue("discountStartDateTime", data.discountStartDateTime?.slice(0, 16) || "");
            setValue("discountEndDateTime", data.discountEndDateTime?.slice(0, 16) || "");
            
            // Payment methods
            setValue("enableUpi", data.enableUpi || false);
            setValue("enableCardPayment", data.enableCardPayment || false);
            setValue("enableNetBanking", data.enableNetBanking || false);
            setValue("enableWallet", data.enableWallet || false);
            // setValue("enableEmi", data.enableEmi || false);
          }
        })
        .catch((error: any) => {
          showError("Something Went Wrong");
        });
    }
  }, [batchId, dispatch, setValue]);
  return (
    <>
      <Box sx={{ display: "flex", gap: "20px", marginBottom: "10px" }}>
  <label>
    <input
      type="radio"
      name="courseType"
      checked={courseType === "FREE"}
      onChange={() => setCourseType("FREE")}
    />{" "}
    Free Course
  </label>

  <label>
    <input
      type="radio"
      name="courseType"
      checked={courseType === "PAID"}
      onChange={() => setCourseType("PAID")}
    />{" "}
    Paid Course
  </label>
</Box>
{courseType === "PAID" && (

     <>
      <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{position:"relative",height:"50vh",overflow:"auto"}}>
        {/* Base Price */}
        <Box sx={{...forminput,padding:"5px 0px"}}>
          <Typography variant="h3">Base Price</Typography>
          <CustomInput
            name="basePrice"
            register={register}
            errors={errors}
            boxSx={inputForm}
            type="number"
          />
        </Box>

        {/* Discount Type */}
        <Box sx={{...forminput,padding:"5px 0px"}}>
          <Typography variant="h3">Discount Type</Typography>
          <CustomAutocomplete
            name="discountType"
            control={control}
            options={discountTypeOptions}
            errors={errors}
            boxSx={inputForm}
          />
        </Box>

        {/* Discount Value */}
        <Box sx={{...forminput,padding:"5px 0px"}}>
          <Typography variant="h3">Discount Value</Typography>
          <CustomInput
            name="discountValue"
            register={register}
            errors={errors}
            boxSx={inputForm}
            type="number"
            disabled={!basePrice || !discountType || discountType === "NONE"}
          />
        </Box>

        {/* Start Date */}
        <Box sx={{...forminput,padding:"5px 0px"}}>
          <Typography variant="h3">Discount Start Date & Time</Typography>
          <CustomInput
            name="discountStartDateTime"
            register={register}
            errors={errors}
            boxSx={inputForm}
            type="datetime-local"
            minDate={nowMin}
          />
        </Box>

        {/* End Date */}
        <Box sx={{...forminput,padding:"5px 0px"}}>
          <Typography variant="h3">Discount End Date & Time</Typography>
          <CustomInput
            name="discountEndDateTime"
            register={register}
            errors={errors}
            boxSx={inputForm}
            type="datetime-local"
            disabled={!startDateTime}
            minDate={endMin}
          />
        </Box>

        {/* Payment Methods */}
        <Box sx={{...forminput,padding:"10px 0px"}}>
          <Typography variant="h3">Payment Methods</Typography>

          <Box sx={{display:"flex",flexDirection:"column"}}>
            <Box sx={{display:"flex",alignItems:"center",gap:"10px"}}>
             <label>
            <input type="checkbox" {...register("enableUpi")} /> UPI
          </label>
          <label>
            <input type="checkbox" {...register("enableCardPayment")} /> Card
            Payment
          </label>
          <label>
            <input type="checkbox" {...register("enableNetBanking")} /> Net
            Banking
          </label>
          <label>
            <input type="checkbox" {...register("enableWallet")} /> Wallet
          </label>
          {/* <label>
            <input type="checkbox" {...register("enableEmi")} /> EMI
          </label> */}
          </Box>

          {errors.enableUpi && (
            <Typography color="error" variant="body2">
              {errors.enableUpi.message}
            </Typography>
          )}
          </Box>
        </Box>

        {/* Selling Price */}
        <Box sx={{...forminput,padding:"5px 0px"}}>
          <Typography variant="h3">Selling Price</Typography>
          <CustomInput
            name="sellingPrice"
            register={register}
            errors={errors}
            boxSx={inputForm}
            type="number"
            disabled
          />
        </Box>
      </Box>

      <CustomButton
        type="button"
        variant="contained"
        label={loading ? "Updating..." : "Submit"}
        onClick={handleSubmit(onSubmit)}
        disabled={loading}
        boxSx={{ marginTop: "20px", width: "max-content" }}
      />
     </>
      )}
       {courseType === "FREE" && (
  <>
    <Box
      sx={{
        p: 3,
      }}
    >
      <Typography variant="h6" sx={{ mb: 1 }}>
        This course will be available for free.
      </Typography>

      <Typography variant="body2" color="text.secondary">
        Users can enroll and access this course without making any payment.
      </Typography>
    </Box>
<Box
  sx={{
    display: "flex",
    justifyContent: "flex-end",
    mt: 2,
    width: "100%",
  }}
>
    <CustomButton
      type="button"
      variant="contained"
      label={loading ? "Saving..." : "Confirm Free Course"}
      onClick={onSubmitFree}
      disabled={loading}
      boxSx={{ marginTop: "1px", width: "max-content",ml:60 }}
    />
    </Box>
  </>
)}
      {/* {error && (
        <Typography color="error" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}
      
      {response?.success && (
        <Typography color="success.main" sx={{ mt: 2 }}>
          {response.message}
        </Typography>
      )} */}
    </>
  );
};

export default Payment;
