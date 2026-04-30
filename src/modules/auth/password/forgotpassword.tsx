import toast from "react-hot-toast";
import signinimg from "../../../assets/image/signinimg.svg";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../app/store";
// import { createPassword, forgotPassword, validateResetToken } from "../authSlice";
import CryptoJS from "crypto-js";
import { encryptPassword } from "../../../utils/encryption";
import {
  createPassword,
  validateResetToken,
} from "../../../features/authSlice";
import { disableClipboard } from "../../../utils/disableClipboard";
import { useAppDispatch } from "../../../app/hook";

const ForgotPassword = () => {
  const effectRan = useRef(false);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get("token");
  const { message } = useSelector((state: RootState) => state.ar);
  const [showPassword1, setShowPassword1] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);

  const [formData, setFormData] = useState({
    createpassword: "",
    confirmpassword: "",
  });

  const [errors, setErrors] = useState({
    createpassword: "",
    confirmpassword: "",
  });
  const SECRET_KEY_B64 = import.meta.env.VITE_APP_ENCRYPTION_KEY;

  // ----------------- AES ENCRYPTION -----------------
  // const encryptPassword = (password: string) => {
  //   if (!SECRET_KEY_B64) throw new Error("APP_ENCRYPTION_KEY missing");
  //   const key = CryptoJS.enc.Base64.parse(SECRET_KEY_B64);
  //   const iv = CryptoJS.lib.WordArray.random(16);

  //   const encrypted = CryptoJS.AES.encrypt(password, key, {
  //     iv,
  //     mode: CryptoJS.mode.CBC,
  //     padding: CryptoJS.pad.Pkcs7,
  //   });

  //   const cipherTextB64 = encrypted.ciphertext.toString(CryptoJS.enc.Base64);
  //   const ivB64 = iv.toString(CryptoJS.enc.Base64);

  //   return `${cipherTextB64}:${ivB64}`;
  // };

  // ---------------------------
  // PASSWORD VALIDATION RULES
  // ---------------------------
  const passwordRules = [
    {
      test: (v: string) => v.length >= 8,
      message: "Password must be at least 8 characters",
    },
    {
      test: (v: string) => /[A-Za-z]/.test(v),
      message: "Must contain at least one letter",
    },
    {
      test: (v: string) => /[0-9]/.test(v),
      message: "Must contain at least one number",
    },
    {
      test: (v: string) => /[!@#$%^&*(),.?\":{}|<>]/.test(v),
      message: "Must contain one special character",
    },
  ];

  const validatePassword = (value: string) => {
    for (const rule of passwordRules) {
      if (!rule.test(value)) return rule.message;
    }
    return "";
  };

  const validateForm = () => {
    let newErrors = { createpassword: "", confirmpassword: "" };
    let valid = true;

    const createError = validatePassword(formData.createpassword);
    if (createError) {
      newErrors.createpassword = createError;
      valid = false;
    }

    const confirmError = validatePassword(formData.confirmpassword);
    if (confirmError) {
      newErrors.confirmpassword = confirmError;
      valid = false;
    }

    if (
      !createError &&
      !confirmError &&
      formData.createpassword !== formData.confirmpassword
    ) {
      newErrors.confirmpassword = "Passwords do not match";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  // ---------------------------
  // SUBMIT HANDLER
  // ---------------------------
  const handleSubmit = async () => {
    if (!validateForm()) return;
    try {
      const newEncrypted = encryptPassword(formData.confirmpassword);
      const res = await dispatch(
        createPassword({
          email: message!,
          password: newEncrypted,
          confirmPassword: newEncrypted,
        })
      ).unwrap();

      if (res.status === "Success") {
        toast.success(res.message);
        navigate("/login");
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      toast.error("Something went wrong!");
    }
  };

  useEffect(() => {
    if (effectRan.current) return; // stop second run
    effectRan.current = true;

    if (token) {
      dispatch(validateResetToken(token))
        .unwrap()
        .then((res) => {
          3;
          console.log(res.status, "res.status");

          if (res.status === "Success") {
            console.log("Token is valid. You can reset your password.");
          } else {
            toast.error(res.message || "Invalid or expired token");
            navigate("/login");
          }
        })
        .catch(() => {
          toast.error("Something went wrong with token validation");
          navigate("/login");
        });
    } else {
      toast.error("No token found");
      navigate("/login");
    }
  }, [token, dispatch, navigate]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-8 md:px-16 lg:px-28">
      <div className="max-w-[1100px] grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        <div className="flex justify-center">
          <img
            src={signinimg}
            alt="Illustration"
            className="w-full max-w-[500px] h-auto"
          />
        </div>

        <div className="w-full max-w-[380px] mx-auto text-center md:text-left">
          <h2 className="text-3xl font-bold text-[#030303] mb-3">
            Create New Password
          </h2>

          <p className="text-[#636364] text-[16px] mb-6">
            Please create your new password below to complete the password reset
            process
          </p>

          <div className="space-y-5">
            {/* CREATE PASSWORD */}
            <div className="relative w-full">
              <label className="text-sm font-semibold mb-1 block">
                CreatePassword
              </label>

              <input
                type={showPassword1 ? "text" : "password"}
                value={formData.createpassword}
                minLength={8}
                placeholder="Enter new password"
                {...disableClipboard}
                onChange={(e) => {
                  setFormData({ ...formData, createpassword: e.target.value });
                  setErrors({ ...errors, createpassword: "" });
                }}
                className={`w-full bg-white rounded-md px-4 py-3 pr-10 text-sm outline-none border
                ${
                  errors.createpassword ? "border-[#ff0000]" : "border-gray-300"
                }`}
              />

              {errors.createpassword && (
                <p className="text-[#ff0000] text-xs mt-1">
                  {errors.createpassword}
                </p>
              )}
              <p className="text-gray-500 text-xs mt-[10px] w-[350px] flex items-start gap-2 leading-relaxed">
                <i className="fi fi-rr-info text-[12px] mt-[4px]"></i>
                <span>
                  Your password must be 8 characters and include a capital
                  letter, a lowercase letter, a number, and a special character.
                </span>
              </p>
              <span
                onClick={() => setShowPassword1(!showPassword1)}
                className="absolute right-3 top-12 -translate-y-1/2 cursor-pointer text-gray-500"
              >
                {showPassword1 ? (
                  <i className="fi fi-rr-eye-crossed text-[18px]"></i>
                ) : (
                  <i className="fi fi-ss-eye text-[18px]"></i>
                )}
              </span>
            </div>

            {/* CONFIRM PASSWORD */}
            <div className="relative w-full">
              <label className="text-sm font-semibold mb-1 block">
                Confirm Password
              </label>

              <input
                type={showPassword2 ? "text" : "password"}
                placeholder="Re-enter password"
                minLength={8}
                value={formData.confirmpassword}
                {...disableClipboard}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    confirmpassword: e.target.value,
                  });
                  setErrors({ ...errors, confirmpassword: "" });
                }}
                className={`w-full bg-white rounded-md px-4 py-3 pr-10 text-sm outline-none border
                ${
                  errors.confirmpassword
                    ? "border-[#ff0000]"
                    : "border-gray-300"
                }`}
              />

              {errors.confirmpassword && (
                <p className="text-[#ff0000] text-xs mt-1">
                  {errors.confirmpassword}
                </p>
              )}

              <span
                onClick={() => setShowPassword2(!showPassword2)}
                className="absolute right-3 top-12 -translate-y-1/2 cursor-pointer text-gray-500"
              >
                {showPassword2 ? (
                  <i className="fi fi-rr-eye-crossed text-[18px]"></i>
                ) : (
                  <i className="fi fi-ss-eye text-[18px]"></i>
                )}
              </span>
            </div>

            <button
              className="w-full bg-primary text-white py-3 rounded-xl font-medium shadow hover:bg-primary/90"
              onClick={handleSubmit}
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
