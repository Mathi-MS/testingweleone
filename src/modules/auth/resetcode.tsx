import loginimg from "../../assets/image/loginimg.svg";
import signinimg from "../../assets/image/signinimg.svg";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../app/store";
import { useNavigate } from "react-router-dom";

import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { resendOtp, verifyOtp } from "../../features/authSlice";
import { useAppDispatch } from "../../app/hook";

const Resetcode = () => {
  const  { signupMessage ,otpcheck  } = useSelector((state: RootState) => state.ar);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes
  const [isExpired, setIsExpired] = useState(false);
  const [resendError, setResendError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({
  otp: "",
});
 const email =sessionStorage.getItem("email");
  useEffect(() => {
    if (timeLeft <= 0) {
      setIsExpired(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // Format seconds to mm:ss
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  // Resend OTP
 const handleResend = async () => {

  if (!email) {
    toast.error("Email missing");
    return;
  }

  try {
    const res = await dispatch(
      resendOtp({ email })
    ).unwrap();

    if (res.status === "Success") {
      toast.success(res.message || "OTP sent successfully");

      // ✔ START TIMER ONLY AFTER SUCCESS
      setTimeLeft(180);
      setIsExpired(false);
      setResendError("");

    } else {
      setResendError(res.message || "Failed to resend OTP");
    }

  } catch (err) {
    toast.error("Failed to resend OTP");
    console.error("Resend OTP Error:", err);
  }
};




 const handleSubmit = async () => {
   if (!otp) {
  setErrors((prev) => ({ ...prev, otp: "OTP is required" }));
  return;


}
setErrors((prev) => ({ ...prev, otp: "" })); // clear error


  try {
    const res = await dispatch(
      verifyOtp({
        email: email!, 
        otp: otp,
      })
    ).unwrap(); // res contains: { message, status }

    // Show message from API
    // toast.success(res.message);

    if (res.status === "Success") {
      toast.success(res.message);
      console.log("OTP Verified Successfully");
      navigate("/newpassword");
    } else {
      console.log("OTP Failed");
       setResendError(res.message || "Failed to resend OTP");
    }

  } catch (err) {
    toast.error("Verification failed");
    console.error("OTP Error:", err);
  }
};

  return (
    <>
    <div className="min-h-[90vh] flex items-center justify-center px-4">
  <div className=" max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
    {/* Left Image */}
    <div className="flex justify-center md:justify-start">
      <img
        src={signinimg}
        alt="Illustration"
        className="w-full max-w-[380px] md:max-w-[500px] h-auto"
      />
    </div>

    {/* Right Section */}
    <div className="w-full max-w-[380px] mx-auto text-center md:text-left">

      <h2 className="text-3xl font-bold text-[#030303] mb-3">
        Check your inbox
      </h2>

      <p className="text-[#636364] text-[16px] mb-5 leading-relaxed">
        Please enter the code we sent to <b>{email}</b>  
        to finish your sign up.
      </p>

      {/* Input */}
      <div className="flex flex-col space-y-2">
        <div className="relative w-full">
          <input
            type={showPassword ? "text" : "password"}
            maxLength={6}
            placeholder="Enter Code"
            onChange={(e) => {
              setOtp(e.target.value);
              setErrors((prev) => ({ ...prev, otp: "" }));
              setResendError("");
            }}
            className={`w-full bg-white rounded-lg px-4 py-3 pr-10 text-sm outline-none border 
            ${errors.otp || resendError ? "border-[#ff0000]" : "border-gray-300"}`}
          />

          {/* Eye icon */}
          <span
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500"
          >
            {showPassword ? (
              <i className="fi fi-rr-eye-crossed text-[18px]"></i>
            ) : (
              <i className="fi fi-ss-eye text-[18px]"></i>
            )}
          </span>
        </div>

        {/* Error text */}
        {errors.otp && (
          <p className="text-[#ff0000]  text-xs">{errors.otp}</p>
        )}

        {resendError && (
          <p className="text-[#ff0000]  text-xs">{resendError}</p>
        )}
      </div>

      {/* Timer */}
      <p className="text-[#005AFF] text-sm font-medium mt-3">
        {isExpired ? "Your OTP has expired." : `Code expires in ${formatTime(timeLeft)}`}
      </p>

      {/* Continue Button */}
      <button
        disabled={isExpired}
        onClick={handleSubmit}
        className={`w-full mt-4 py-3 rounded-xl text-white font-medium transition-all
          ${isExpired ? "bg-gray-400 cursor-not-allowed" : "bg-primary hover:bg-primary/90"}
        `}
      >
        {isExpired ? "OTP Expired" : "Continue"}
      </button>

      {/* Resend Code */}
      <p className="text-[#636364] text-[12px] mt-3">
        Didn’t receive the code?{" "}
        <button
          disabled={!isExpired}
          onClick={isExpired ? handleResend : undefined}
          className={`text-[#005AFF] hover:underline
          ${!isExpired && "opacity-40 cursor-not-allowed"}`}
        >
          Resend code
        </button>
      </p>

    </div>
  </div>
</div>

    </>
  );
};

export default Resetcode;
