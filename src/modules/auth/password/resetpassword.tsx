import toast from "react-hot-toast";
import signinimg from "../../../assets/image/signinimg.svg";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { AppDispatch } from "../../../app/store";
// import { ResetUserPassword } from "../authSlice";
import CryptoJS from "crypto-js";
import { encryptPassword } from "../../../utils/encryption";
import { ResetUserPassword } from "../../../features/authSlice";
import { disableClipboard } from "../../../utils/disableClipboard";
import { useAppDispatch } from "../../../app/hook";
// <-- NEW ACTION

const ResetPassword = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const location = useLocation();
  const email = location.state?.email || ""; // <-- GET EMAIL HERE
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword1, setShowNewPassword1] = useState(false);
  const [showNewPassword2, setShowNewPassword2] = useState(false);

  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // ---------------------------
  // PASSWORD RULES
  // ---------------------------
  const passwordRules = [
    {
      test: (v: string) => v.length >= 8,
      message: "At least 8 characters required",
    },
    {
      test: (v: string) => /[A-Za-z]/.test(v),
      message: "Must include a letter",
    },
    { test: (v: string) => /[0-9]/.test(v), message: "Must include a number" },
    {
      test: (v: string) => /[!@#$%^&*(),.?\":{}|<>]/.test(v),
      message: "Must include a special character",
    },
  ];

  const validatePassword = (value: string) => {
    for (const rule of passwordRules) {
      if (!rule.test(value)) return rule.message;
    }
    return "";
  };
  const blockClipboard = (e:any) => {
  e.preventDefault();
};


  const validateForm = () => {
    let newErrors = { oldPassword: "", newPassword: "", confirmPassword: "" };
    let valid = true;

    if (!formData.oldPassword) {
      newErrors.oldPassword = "Enter your old password";
      valid = false;
    }

    const oldPassErr = validatePassword(formData.oldPassword);
    if (oldPassErr) {
      newErrors.oldPassword = oldPassErr;
      valid = false;
    }

    const newPassErr = validatePassword(formData.newPassword);
    if (newPassErr) {
      newErrors.newPassword = newPassErr;
      valid = false;
    }

    const confirmErr = validatePassword(formData.confirmPassword);
    if (confirmErr) {
      newErrors.confirmPassword = confirmErr;
      valid = false;
    }

    if (
      !newPassErr &&
      !confirmErr &&
      formData.newPassword !== formData.confirmPassword
    ) {
      newErrors.confirmPassword =
        "New Password and Confirm Password must match.";
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
      const oldEncrypted = encryptPassword(formData.oldPassword);
      const newEncrypted = encryptPassword(formData.newPassword);
      const response = await dispatch(
        ResetUserPassword({
          input: {
            email: email,
            oldPassword: oldEncrypted,
            newPassword: newEncrypted,
            confirmPassword: newEncrypted,
          },
        })
      ).unwrap();

      if (response?.status === "Success") {
        toast.success(response.message || "Password updated successfully");
        navigate("/login");
      } else {
        toast.error(response?.message || "Request failed");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Something went wrong!";
      toast.error(errorMessage);
    }
  };

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
            Reset Password
          </h2>

          <p className="text-[#636364] text-[16px] mb-6">
            Please enter your current password and set a new one
          </p>

          <div className="space-y-5">
            {/* OLD PASSWORD */}
            <div className="relative w-full">
              <label className="text-sm font-semibold mb-1 block">
                Old Password
              </label>
              <input
                type={showOldPassword ? "text" : "password"}
                placeholder="Enter old password"
                value={formData.oldPassword}
                minLength={8}
                onChange={(e) =>
                  setFormData({ ...formData, oldPassword: e.target.value })
                }
                {...disableClipboard}
                className={`w-full bg-white rounded-md px-4 py-3 pr-10 text-sm outline-none border ${
                  errors.oldPassword
                    ? "border-[#ff0000] -500"
                    : "border-gray-300"
                }`}
              />
              {errors.oldPassword && (
                <p className="text-[#ff0000] -500 text-xs mt-1">
                  {errors.oldPassword}
                </p>
              )}
              <p className="text-gray-500 text-xs mb-[10px] w-[350px] flex items-start gap-2 leading-relaxed">
                <i className="fi fi-rr-info text-[12px] mt-[4px]"></i>
                <span>
                  Your password must be 8 characters and include a capital
                  letter, a lowercase letter, a number, and a special character.
                </span>
              </p>
              <span
                onClick={() => setShowOldPassword(!showOldPassword)}
                className="absolute right-3 top-12 -translate-y-1/2 cursor-pointer text-gray-500"
              >
                {showOldPassword ? (
                  <i className="fi fi-rr-eye-crossed text-[18px]"></i>
                ) : (
                  <i className="fi fi-ss-eye text-[18px]"></i>
                )}
              </span>
            </div>

            {/* NEW PASSWORD */}
            <div className="relative w-full">
              <label className="text-sm font-semibold mb-1 block">
                New Password
              </label>
              <input
                type={showNewPassword1 ? "text" : "password"}
                placeholder="Enter new password"
                minLength={8}
                value={formData.newPassword}
                {...disableClipboard}
                onChange={(e) =>
                  setFormData({ ...formData, newPassword: e.target.value })
                }
                className={`w-full bg-white rounded-md px-4 py-3 pr-10 text-sm outline-none border ${
                  errors.newPassword
                    ? "border-[#ff0000] -500"
                    : "border-gray-300"
                }`}
              />
              {errors.newPassword && (
                <p className="text-[#ff0000]  text-xs mt-1">
                  {errors.newPassword}
                </p>
              )}
              <span
                onClick={() => setShowNewPassword1(!showNewPassword1)}
                className="absolute right-3 top-12 -translate-y-1/2 cursor-pointer text-gray-500"
              >
                {showNewPassword1 ? (
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
                type={showNewPassword2 ? "text" : "password"}
                placeholder="Re-enter password"
                minLength={8}
                value={formData.confirmPassword}
                {...disableClipboard}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                className={`w-full bg-white rounded-md px-4 py-3 pr-10 text-sm outline-none border ${
                  errors.confirmPassword
                    ? "border-[#ff0000] -500"
                    : "border-gray-300"
                }`}
              />
              {errors.confirmPassword && (
                <p className="text-[#ff0000]  text-xs mt-1">
                  {errors.confirmPassword}
                </p>
              )}
              <span
                onClick={() => setShowNewPassword2(!showNewPassword2)}
                className="absolute right-3 top-12 -translate-y-1/2 cursor-pointer text-gray-500"
              >
                {showNewPassword2 ? (
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
              Reset Password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
