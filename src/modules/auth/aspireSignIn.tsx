import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../app/hook";
import { loginWithGoogle, generateOtp, verifyLoginMobileOtp, resendMobileOtp } from "../../features/authSlice";
import { GoogleLogin } from "@react-oauth/google";
import { Loader2 } from "lucide-react";
import { showNewSuccess } from "../../components/ui/newToast";
import { images } from "../../assets/image/Images";


// ── Main component ────────────────────────────────────────────────────────────
const AspireSignIn = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");
  const [showOtpField, setShowOtpField] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  
  const resetState = () => { setShowOtpField(false); setOtp(""); setMobile(""); setError(""); };

  const googleButtonWrapperRef = useRef<HTMLDivElement>(null);
  const [googleButtonWidth, setGoogleButtonWidth] = useState<string>();

  useEffect(() => {
    const updateWidth = () => {
      if (googleButtonWrapperRef.current) {
        const width = googleButtonWrapperRef.current.offsetWidth;
        setGoogleButtonWidth(width ? (width > 400 ? "400" : String(width)) : undefined);
      }
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
    const timer = setTimeout(updateWidth, 100);
    return () => { window.removeEventListener("resize", updateWidth); clearTimeout(timer); };
  }, [activeTab, showOtpField]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (countdown > 0) timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleGoogleSuccess = async (response: any) => {
    try {
      setIsLoading(true);
      const token = response.credential;
      if (!token) { setError("No credential received from Google"); return; }
      const result = await dispatch(loginWithGoogle({ token, entity: "aspire" })).unwrap();
      if (result?.isMobile) {
        showNewSuccess("We're glad to see you again. Let's continue where you left off.");
      }
      navigate("/dashboard");
    } catch {
      setError("Google login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!mobile || mobile.length < 10) { setError("Please enter a valid 10-digit mobile number"); return; }
    setIsLoading(true);
    setError("");
    try {
      await dispatch(generateOtp(mobile)).unwrap();
      setShowOtpField(true);
      setCountdown(30);
    } catch (err: any) {
      setError(err || "Failed to send OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!otp || otp.length !== 4) { setError("Please enter a valid 4-digit OTP"); return; }
    setIsLoading(true);
    setError("");
    try {
      const result = await dispatch(verifyLoginMobileOtp({ emailOrMobile: mobile, otp, entity: "aspire" })).unwrap();
      if (result) {
        showNewSuccess("We're glad to see you again. Let's continue where you left off.");
        navigate("/dashboard");
      }
    } catch (err: any) {
      setError(err || "Authentication failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col" style={{ backgroundColor: "#F0E8DC" }}>
      <div className="flex flex-col flex-1 max-w-[1300px] mx-auto w-full px-4 sm:px-8 lg:px-12">
      {/* Top-left logo */}
      <div className="pt-4 sm:pt-6">
        <img src={images.aspirelogo} alt="WeLe" className="h-9 sm:h-12 mb-1" />
      </div>

      {/* Main content */}
      <div className="flex flex-1 items-center justify-center lg:justify-between py-4 sm:py-6 gap-8 w-full flex-col lg:flex-row">
        {/* ── Left panel — hidden on mobile, shown md+ ── */}
        <div className="hidden lg:flex flex-1 max-w-[560px] flex-col">
          {/* Heading row with rocket on the right */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-[32px] font-bold text-[#1a1a1a]">
                Sign In to <span className="text-[#E87722] font-bold">Aspire</span>
              </h1>
              <p className="text-[#555] text-sm mt-2 max-w-[300px] leading-relaxed">
                We move 10x faster than our peers and stay consistent. While they're bogged down with design
                debt, we're releasing new features. Our speed isn't just strategy — it's our standard.
              </p>
            </div>
            <img src={images.aspirelogo1} alt="Rocket" className="h-[250px] -mt-4 flex-shrink-0" />
          </div>

          {/* Triangle with labels */}
          <div className="relative mt-4">
            <img src={images.aspirelogo2} alt="Aspire Triangle" className="w-full max-w-[420px]" />
          </div>
        </div>

        {/* ── Right card ── */}
        <div className="w-full max-w-[420px] bg-white rounded-2xl shadow-lg p-6 sm:p-8 flex-shrink-0">
          {/* Card header */}
          <div className="flex justify-center mb-6">
            <img src={images.aspirelogo} alt="Aspire" className="h-10" />
          </div>

          {/* Tabs */}
          <div className="flex gap-3 mb-6 p-1 bg-gray-50 text-gray-600 rounded-xl">
            <button
              onClick={() => { setActiveTab("signin"); resetState(); }}
              className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-colors ${activeTab === "signin" ? "bg-white text-gray-900 shadow-sm" : ""}`}
            >
              Sign in
            </button>
            <button
              onClick={() => { setActiveTab("signup"); resetState(); }}
              className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-colors ${activeTab === "signup" ? "bg-white text-gray-900 shadow-sm" : ""}`}
            >
              Create account
            </button>
          </div>

          {error && (
            <div className="bg-[#ff000017] border border-[#ffd2d2] text-[#ff6666] px-4 py-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          {/* Google SSO */}
          {!showOtpField && (
            <div ref={googleButtonWrapperRef} className="w-full mb-4 flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError("Google Login failed")}
                theme="filled_black"
                shape="rectangular"
                size="large"
                width={googleButtonWidth}
                text="continue_with"
              />
            </div>
          )}

          {/* OR divider + mobile OTP — signin only */}
          {activeTab === "signin" && !showOtpField && (
            <>
              <div className="flex items-center gap-4 my-4">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400">OR</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              <div className="flex flex-col gap-4 mb-4">
                <input
                  type="tel"
                  placeholder="Mobile Number"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                  maxLength={10}
                  className="w-full py-4 px-4 rounded-xl border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-[#E87722] focus:ring-1 focus:ring-[#E87722] outline-none"
                />
                <button
                  onClick={handleSendOtp}
                  disabled={!mobile || mobile.length < 10 || isLoading}
                  className="w-full py-3.5 flex items-center justify-center gap-2 bg-[#E87722] hover:bg-[#d66a1a] text-white rounded-xl font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : "Send OTP"}
                </button>
              </div>
            </>
          )}

          {/* OTP step — signin only */}
          {activeTab === "signin" && showOtpField && (
            <>
              <div className="flex flex-col items-center mb-6">
                <h2 className="text-xl font-medium text-gray-900 mb-3">We've sent an OTP on</h2>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">+91 {mobile}</span>
                  <button
                    onClick={() => { setShowOtpField(false); setOtp(""); }}
                    className="text-[#E87722] hover:text-[#d66a1a] text-sm font-medium"
                  >
                    Edit
                  </button>
                </div>
              </div>

              <div className="flex justify-center gap-3 mb-6">
                {[0, 1, 2, 3].map((index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength={1}
                    value={otp[index] || ""}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      const newOtp = otp.split("");
                      newOtp[index] = value;
                      setOtp(newOtp.join("").slice(0, 4));
                      if (value && index < 3) {
                        (e.target.parentElement?.children[index + 1] as HTMLInputElement)?.focus();
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Backspace" && !otp[index] && index > 0) {
                        (e.currentTarget.parentElement?.children[index - 1] as HTMLInputElement)?.focus();
                      }
                    }}
                    className="w-14 h-14 text-center text-xl font-medium border border-gray-300 rounded-lg focus:border-[#E87722] focus:outline-none focus:ring-1 focus:ring-[#E87722] bg-gray-50"
                  />
                ))}
              </div>

              <div className="text-center mb-6">
                <span className="text-gray-600 text-sm">Didn't receive OTP? </span>
                {countdown > 0 ? (
                  <span className="text-gray-500 text-sm font-medium">Resend in {countdown} sec</span>
                ) : (
                  <button
                    onClick={async () => {
                      setIsLoading(true);
                      try { await dispatch(resendMobileOtp(mobile)).unwrap(); setCountdown(30); }
                      catch { setError("Failed to resend OTP"); }
                      finally { setIsLoading(false); }
                    }}
                    disabled={isLoading}
                    className="text-[#E87722] hover:text-[#d66a1a] text-sm font-medium disabled:text-gray-400"
                  >
                    {isLoading ? "Sending..." : "Resend OTP"}
                  </button>
                )}
              </div>

              <button
                onClick={handleSubmit}
                disabled={!otp || otp.length !== 4 || isLoading}
                className="w-full bg-[#E87722] py-3.5 hover:bg-[#d66a1a] disabled:bg-gray-400 text-white rounded-xl font-semibold flex items-center justify-center gap-2"
              >
                {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</> : "Sign in"}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="pb-4 sm:pb-5 flex items-center gap-2">
        <span className="text-xs text-[#888]">Powered by</span>
        <img src={images.logo} alt="WeLe" className="h-5" />
      </div>
      </div>
    </div>
  );
};

export default AspireSignIn;
