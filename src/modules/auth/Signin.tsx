import { useEffect, useState } from "react";
import signinimg from "../../assets/image/signinimg.svg";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { useDispatch, useSelector } from "react-redux";
import { RootState,  } from "../../app/store";
import toast from "react-hot-toast";
import CryptoJS from "crypto-js";
import { forgotPassword, loginUser } from "../../features/authSlice";
import { useAppDispatch } from "../../app/hook";

const ExistUser = () => {
  const clientId = import.meta.env.VITE_KEYCLOAK_CLIENT_ID;
  const clientSecret = import.meta.env.VITE_KEYCLOAK_CLIENT_SECRET;
  const SECRET_KEY_B64 = import.meta.env.VITE_APP_ENCRYPTION_KEY;
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  // const { onBoard,loginres ,refreshToken, accessToken, loading, error ,expiresIn } = useSelector((state: RootState) => state.ar);
  const testonBoard = useSelector((state: RootState) => state.ar.onBoard);
  const loginUserss = useSelector((state: RootState) => state.ar);
  console.log(loginUserss,'loginUserss');
  
  console.log(testonBoard, "onBoard test");
  // const { accessToken, expiresIn, loading } = useSelector(
  //   (state: any) => state.ar
  // );

  // const { accessToken, expiresIn } = useSelector((state: any) => state.ar);

  // useEffect(() => {
  //   if (accessToken && expiresIn) {
  //     initializeTokenRefresh();
  //   }
  // }, [accessToken, expiresIn]);
  // Schedule refresh when tokens change
  // useEffect(() => {
  //   if (accessToken && expiresIn && !loading) {
  //     scheduleTokenRefresh(expiresIn);
  //   }
  // }, [accessToken, expiresIn, loading]);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  // ----------------- Encryption Function -----------------
  const encryptPassword = (password: string) => {
    if (!SECRET_KEY_B64) throw new Error("APP_ENCRYPTION_KEY missing");
    const key = CryptoJS.enc.Base64.parse(SECRET_KEY_B64);
    const iv = CryptoJS.lib.WordArray.random(16);

    const encrypted = CryptoJS.AES.encrypt(password, key, {
      iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    const cipherTextB64 = encrypted.ciphertext.toString(CryptoJS.enc.Base64);
    const ivB64 = iv.toString(CryptoJS.enc.Base64);

    return `${cipherTextB64}:${ivB64}`;
  };

  // Validation Handler
  const validateForm = () => {
    let valid = true;
    let newErrors = { email: "", password: "" };

    // Email Validation
    if (!formData.email) {
      newErrors.email = "Email is required";
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
      valid = false;
    }

    // Password Validation
    if (!formData.password) {
      newErrors.password = "Password is required";
      valid = false;
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
      valid = false;
    } else if (!/[A-Za-z]/.test(formData.password)) {
      newErrors.password = "Password must contain at least one letter";
      valid = false;
    } else if (!/[0-9]/.test(formData.password)) {
      newErrors.password = "Password must contain at least one number";
      valid = false;
    } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)) {
      newErrors.password =
        "Password must contain at least one special character";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  // Submit Handler

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const encryptedPassword = encryptPassword(formData.password || "");
      const result = await dispatch(
        loginUser({
          email: formData.email,
          password: encryptedPassword,
          clientId: clientId,
          clientSecret: clientSecret,
        })
      ).unwrap();
      // <-- IMPORTANT

      sessionStorage.setItem("email", formData.email);

      // if (result?.accessToken && result?.expiresIn) {
      //   initializeTokenRefresh(); // <---- ONLY HERE
      // }

      // Check if onBoard is truthy
      if (result?.onBoard === true) {
        toast.success("Login Successful!");
        navigate("/dashboard");
      } else {
         toast.success("Login Successful!");
        navigate("/dashboard");
        // navigate("/postverify");
      }
    } catch (error) {
      console.error("Login Failed:", error);
      toast.error("Invalid email or password ");
      setErrors((prev) => ({
        ...prev,
        api: "Invalid email or password",
      }));
    }
  };

  const handleForgotPassword = async () => {
    let valid = true;
    let newErrors = { email: "", };
    if (!formData.email) {
      newErrors.email = "Email is required";
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
      valid = false;
    }
     if (!valid) {
    setErrors((prev) => ({ ...prev, email: newErrors.email })); // ✅ fix here
    return;
  }
    try {
      const res = await dispatch(
        forgotPassword({ email: formData.email })
      ).unwrap();

      if (res.status === "Success") {
        toast.success(res.message);
        // navigate("/forgotpassword", { state: { email: formData.email } });
      } else {
        toast.error(res.message || "Failed to send reset email");
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  const handleResetPassword = () => {
    let valid = true;
    let newErrors = { email: "" };
    if (!formData.email) {
      newErrors.email = "Email is required";
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
      valid = false;
    }
     if (!valid) {
    setErrors((prev) => ({ ...prev, email: newErrors.email })); // ✅ fix here
    return;
  }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }
    toast.success("Proceed to reset your password.");
    navigate("/resetpassword", { state: { email: formData.email } });
  };

  return (
    <>
      <div className="min-h-[80vh]  flex items-center justify-center px-4 sm:px-6 md:px-14 lg:px-24">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 max-w-[1100px] items-center justify-center">
          {/* Left Image */}
          <div className="col-span-6 flex justify-center">
            <img
              src={signinimg}
              alt="Illustration"
              className="w-[90%] max-w-[561px] h-[561px]"
            />
          </div>

          {/* Right Section */}
          <div className="col-span-6">
            <div className="w-full max-w-[380px] mx-auto mt-6">
              <h2 className="text-[24px] font-bold text-[#343A40] mb-2">
                Welcome Back!
              </h2>

              <p className="text-[#919EAB] mb-4 text-[16px] leading-[22px]">
                Please enter your details.
              </p>

              <div className="flex flex-col space-y-4">
                {/* Email */}
                <label className="text-sm font-medium w-[350px] font-[600]">
                  Email
                </label>

                <input
                  type="email"
                  placeholder="john.doe@gmail.com"
                  autoComplete="email"
                  name="email"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });

                    if (errors.email) {
                      setErrors({ ...errors, email: "" });
                    }
                  }}
                  className={`w-[350px] px-4 py-3 border rounded-lg text-sm focus:ring-2 outline-none
                    ${
                      errors.email
                        ? "border-[#ff0000] focus:ring-0"
                        : "border-gray-300 focus:ring-[#005AFF]"
                    }
                  `}
                />

                {errors.email && (
                  <p className="text-[#ff0000] text-xs">{errors.email}</p>
                )}

                {/* Password */}
                <label className="text-sm font-medium w-[350px] font-[600]">
                  Password
                </label>

                <div className="relative w-[350px]">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    autoComplete="current-password"
                    placeholder="Enter Password"
                    minLength={8}
                    value={formData.password}
                    onChange={(e) => {
                      setFormData({ ...formData, password: e.target.value });

                      if (errors.password) {
                        setErrors({ ...errors, password: "" });
                      }
                    }}
                    className={`w-full px-4 py-3 border rounded-lg text-sm focus:ring-2 outline-none
                      ${
                        errors.password
                          ? "border-[#ff0000] focus:ring-0"
                          : "border-gray-300 focus:ring-[#005AFF]"
                      }
                    `}
                  />

                  {/* Eye Icon */}
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
                <p className="text-gray-500 text-xs mb-[10px] w-[350px] flex items-start gap-2 leading-relaxed">
                  <i className="fi fi-rr-info text-[12px] mt-[2px]"></i>
                  <span>
                    Your password must be 8 characters and include a capital
                    letter, a lowercase letter, a number, and a special
                    character.
                  </span>
                </p>
                {errors.password && (
                  <p className="text-[#ff0000] text-xs">{errors.password}</p>
                )}

                {/* Remember me */}
                <div className="flex w-[350px] justify-between items-center">
                  <label className="flex items-center space-x-2 text-sm text-gray-700">
                    <input type="checkbox" className="w-4 h-4" />
                    <span>Remember me</span>
                  </label>

                  <span
                    onClick={() => {
                      if (!formData.password) handleForgotPassword();
                    }}
                    className={`text-primary text-sm font-medium hover:underline cursor-pointer 
    ${formData.password ? "opacity-40 cursor-not-allowed" : ""}
  `}
                  >
                    Forgot password
                  </span>
                </div>

                {/* Login Button */}
                <Button
                  variant="primary"
                  onClick={handleSubmit}
                  className="bg-primary hover:bg-primary text-white py-3 rounded-xl text-[16px] font-[600] flex justify-center  w-[350px]"
                >
                  Login
                </Button>

                {/* Footer */}
                {/* Footer */}
                <div className="mt-6 space-y-2 text-center">
                  <p className="text-[#919EAB] text-xs">
                    Don’t have an account?{" "}
                    <Link
                      to="/signup"
                      className="text-primary font-medium hover:underline"
                    >
                      Sign up
                    </Link>
                  </p>

                  <p
                    // onClick={ handleResetPassword}
                    onClick={() => {
                      if (!formData.password) {
                        handleResetPassword();
                      }
                    }}
                    className={`text-primary text-[12px] font-medium hover:underline 
    ${formData.password ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
  `}
                  >
                    Reset Password
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ExistUser;