import { Mail } from "lucide-react";
import signinimg from "../../assets/image/signinimg.svg";
import { Button } from "../../components/ui/Button";
import { useNavigate } from "react-router-dom";
import { useRef, useState } from "react";

import { AppDispatch } from "../../app/store";
// import { loginWithGoogle, signUser } from "./authSlice";
import toast from "react-hot-toast";
import { GoogleLogin } from "@react-oauth/google";
import { loginWithGoogle, signUser } from "../../features/authSlice";
import { useAppDispatch } from "../../app/hook";

const AuthPage = () => {
  const googleBtnRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [isSuggestion, setIsSuggestion] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
  });

  const [errors, setErrors] = useState({
    fullName: "",
    email: "",
  });

  const validate = () => {
    let temp = { fullName: "", email: "" };
    let isValid = true;

    if (!form.fullName.trim()) {
      temp.fullName = "Full Name is required";
      isValid = false;
    }

    if (!form.email.trim()) {
      temp.email = "Email is required";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      temp.email = "Enter a valid email";
      isValid = false;
    }

    setErrors(temp);
    return isValid;
  };

  // const handleGoogleSuccess = async (response) => {
  //   console.log("Google Raw Response:", response); // should show { code: "4/0Af..." }

  //   const token = response.credential; // 👈 Google ID Token
  //       const result = await  dispatch(loginWithGoogle(token))

  // };
  const handleGoogleSuccess = async (response: any) => {
    try {
      console.log("Google Raw Response:", response);
      const token = response.credential; // ✔ correct for auth-code flow
      const result = await dispatch(loginWithGoogle(token)).unwrap();
      // result = { accessToken, refreshToken, onBoard, ... }
      sessionStorage.setItem("email", result.email);
      sessionStorage.setItem("accessToken", result.accessToken);
      if (result.onBoard === false) {
        toast.success("Login Successful!");
        navigate("/dashboard");
      } else {
        // navigate("/postverify");
        navigate("/dashboard");
      }
      //  sessionStorage.removeItem("email");
    } catch (err) {
      console.error("Google login failed:", err);
      toast.error("Google login failed");
    }
  };

  const handleSubmit = async () => {
    
    if (!validate()) return;
    try {
      const result = await dispatch(
        signUser({
          userName: form.fullName,
          email: form.email,
          suggestion: isSuggestion,
        })
      ).unwrap();
      sessionStorage.setItem("email", result.email);
      const status = result?.status;
      if (status === "Success") {
        toast.success("OTP generated and sent to your email");
        navigate("/resetcode");
      } else if (status === "Failure") {
        // Show backend message from GraphQL response
        toast.error(result?.message || "Signup failed");
        setErrors((prev) => ({
          ...prev,
          api: result?.message || "Signup failed",
        }));
      }
    } catch (error) {
      console.error("Signup Failed:", error);
      toast.error("Signup Failed!");
      setErrors((prev) => ({
        ...prev,
        api: "Invalid username or password",
      }));
    }
  };

  const Guestlogin = () => {
    // sessionStorage.setItem("guest", "true");
    navigate("/guestdashboard");
  };

  return (
  <div className="min-h-screen bg-[#F7F9FC] flex items-center justify-center px-4">
  <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-0 items-center ">
        {/* LEFT IMAGE */}
        <div className="lg:col-span-7 flex justify-center items-center  lg:mb-60 mt-[15px]">
          <img
            src={signinimg}
            alt="Illustration"
            className="w-[90%] sm:w-[80%] md:w-[70%] lg:w-[60%] max-w-3xl h-auto pt-[20px]"
          />
        </div>

        {/* RIGHT SIDE FORM */}
        <div className="lg:col-span-5 flex justify-center order-1 lg:order-2">
          <div className="w-full max-w-md mx-auto">
            {/* Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-bold text-center text-[#1F1F1F] mr-[25px] mb-6 ">
              Sign up with email
            </h1>
            {/* INPUTS */}
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Full Name"
                value={form.fullName}
                onChange={(e) => {
                  setForm({ ...form, fullName: e.target.value });
                  if (errors.fullName) {
                    setErrors({ ...errors, fullName: "" });
                  }
                }}
                className={`w-[80%] ml-6  px-4 py-3 bg-white border border-[#E5E7EB] rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-primary outline-none                ${
                  errors.fullName
                    ? "border-[#ff0000] focus:ring-0"
                    : "border-gray-300 focus:ring-[#005AFF]"
                }
                  `}
              />
              {errors.fullName && (
                <p className="text-[#ff0000] text-xs  ml-[22px]">
                  {errors.fullName}
                </p>
              )}
              <input
                type="text"
                autoComplete="email"
                name="email"
                placeholder="john.doe@gmail.com"
                value={form.email}
                onChange={(e) => {
                  setForm({ ...form, email: e.target.value });
                  if (errors.email) {
                    setErrors({ ...errors, email: "" });
                  }
                }}
                className={`w-[80%] ml-6  px-4 py-3 bg-white border border-[#E5E7EB] rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-primary outline-none
                    ${
                      errors.email
                        ? "border-[#ff0000] focus:ring-0"
                        : "border-gray-300 focus:ring-[#005AFF]"
                    }
                  `}
              />
              {errors.email && (
                <p className="text-[#ff0000] text-xs ml-[22px]">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Checkbox */}
            <div className="flex items-start gap-3 mt-4 w-[80%] ml-6 ">
              <input
                type="checkbox"
                className="mt-1"
                checked={isSuggestion}
                onChange={(e) => setIsSuggestion(e.target.checked)}
              />
              <p className="text-xs sm:text-sm text-[#4B5563] leading-4">
                Keep me updated with exclusive offers, tailored suggestions, and
                helpful learning insights
              </p>
            </div>

            {/* Continue with Email */}
            <Button
              className="w-[80%] ml-6 mt-6 px-4 py-3 bg-primary text-white  hover:bg-primary rounded-xl flex items-center justify-center gap-2 text-sm sm:text-base hover:bg-accent transition"
              onClick={handleSubmit}
            >
              <Mail className="w-5 h-5" />
              Continue with email
            </Button>

            {/* Divider */}
            <div className=" w-[80%] ml-6 flex items-center my-7">
              <div className="flex-1 border-t border-[#E5E7EB]"></div>
              <span className="px-4 text-xs sm:text-sm text-[#6B7280] font-medium">
                Other sign in options
              </span>
              <div className="flex-1 border-t border-[#E5E7EB]"></div>
            </div>

            {/* Social icons */}
           <div className="w-[80%] ml-6 flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => {
                  console.log("Login Failed");
                  toast.error("Google login failed");
                }}
              />
            </div>

            {/* Guest Check Divider */}
            <div className="flex items-center my-7 w-[80%] ml-6 ">
              <div className="flex-1 border-t border-[#E5E7EB]"></div>
              <span className="px-4 text-xs sm:text-sm text-[#6B7280] font-medium">
                Guest Check
              </span>
              <div className="flex-1 border-t border-[#E5E7EB]"></div>
            </div>

            {/* Guest button */}
            <button
              className="w-[80%] ml-6 px-4 py-3 bg-white text-primary border border-primary rounded-xl hover:bg-[#F3F6FF] transition text-sm sm:text-base"
              onClick={Guestlogin}
            >
              Continue as Guest
            </button>
            {/* Terms */}
            <p className="w-[90%] ml-6 text-[9px] sm:text-[13px] text-[#6B7280] mt-5 text-center leading-4">
              By signing up, you agree to our{" "}
              <a href="#" className="text-primary">
                Terms of Use
              </a>{" "}
              and{" "}
              <a href="#" className="text-primary">
                Privacy Policy
              </a>
            </p>

            {/* Login */}
            <p className="text-center w-[80%] ml-6 mt-6 py-3 bg-[#EDF3FD] text-xs sm:text-sm text-[#4B5563] rounded-xl">
              Already have an Account?{" "}
              <a href="/login" className="text-primary font-medium">
                Log in
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AuthPage;
