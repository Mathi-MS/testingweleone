import { useRef, useState, useEffect } from "react"
import { X, Loader2 } from "lucide-react"
import { loginWithGoogle, generateOtp, verifyLoginMobileOtp, resendMobileOtp } from "../../features/authSlice"
import { GoogleLogin } from "@react-oauth/google"
import { useAppDispatch } from "../../app/hook"
import { showNewSuccess } from "../../components/ui/newToast"

export function AuthModal({ onClose, onSuccess, initialTab = "signin" }: { onClose?: () => void; onSuccess?: (user: any) => void; initialTab?: "signin" | "signup" }) {
  const [activeTab, setActiveTab] = useState<"signin" | "signup">(initialTab)
  const [showOtpField, setShowOtpField] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [countdown, setCountdown] = useState(0)
  const [mobile, setMobile] = useState("")
  const [otp, setOtp] = useState("")

  const dispatch = useAppDispatch()
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (countdown > 0) timer = setTimeout(() => setCountdown(countdown - 1), 1000)
    return () => clearTimeout(timer)
  }, [countdown])

  const googleButtonWrapperRef = useRef<HTMLDivElement>(null)
  const [googleButtonWidth, setGoogleButtonWidth] = useState<string>()

  useEffect(() => {
    const updateWidth = () => {
      if (googleButtonWrapperRef.current) {
        const width = googleButtonWrapperRef.current.offsetWidth
        setGoogleButtonWidth(width ? (width > 400 ? "400" : String(width)) : undefined)
      }
    }
    updateWidth()
    window.addEventListener("resize", updateWidth)
    const timer = setTimeout(updateWidth, 100)
    return () => { window.removeEventListener("resize", updateWidth); clearTimeout(timer) }
  }, [activeTab, showOtpField])

  const handleGoogleSuccess = async (response: any) => {
    try {
      setIsLoading(true)
      const token = response.credential
      if (!token) { setError("No credential received from Google"); return }
      const result = await dispatch(loginWithGoogle({token, entity: "wele"})).unwrap()
      if (result && result?.isMobile === true) {
        showNewSuccess("We're glad to see you again. Let's continue where you left off.")
        onSuccess?.(result)
        onClose?.()
      } else {
        onSuccess?.(result)
        onClose?.()
      }
    } catch {
      setError("Google login failed")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendOtp = async () => {
    if (!mobile || mobile.length < 10) { setError("Please enter a valid 10-digit mobile number"); return }
    setIsLoading(true)
    setError("")
    try {
      await dispatch(generateOtp(mobile)).unwrap()
      setShowOtpField(true)
      setCountdown(30)
    } catch (err: any) {
      setError(err || "Failed to send OTP. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!otp || otp.length !== 4) { setError("Please enter a valid 4-digit OTP"); return }
    setIsLoading(true)
    setError("")
    try {
      const result = await dispatch(verifyLoginMobileOtp({ emailOrMobile: mobile, otp,entity: "wele"  })).unwrap()
      if (result) {
        showNewSuccess("We're glad to see you again. Let's continue where you left off.")
        onSuccess?.(result)
        onClose?.()
      }
    } catch (err: any) {
      setError(err || "Authentication failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const resetState = () => {
    setShowOtpField(false)
    setOtp("")
    setMobile("")
    setError("")
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[999]">
      <div className="bg-white rounded-3xl w-full max-w-md p-8 relative shadow-2xl">
        {/* Close button - only show if onClose is provided */}
        {onClose && (
        <button onClick={onClose} className="absolute right-6 top-6 text-gray-400 hover:text-gray-600 transition-colors">
          <X className="w-6 h-6" />
        </button>
         )}

        <div className="flex justify-center mb-6">
          <img src="logo.svg" alt="" />
        </div>

        <h1 className="text-2xl font-medium text-center mb-4 text-gray-900">
          {activeTab === "signin" ? "Welcome back" : "Create Account"}
        </h1>

        {error && (
          <div className="bg-[#ff000017] border border-[#ffd2d2] text-[#ff6666] px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-3 mb-6 p-1 bg-gray-50 text-gray-600 rounded-xl">
          <button
            onClick={() => { setActiveTab("signin"); resetState() }}
            className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-colors ${activeTab === "signin" ? "bg-white text-gray-900 shadow-sm" : ""}`}
          >
            Sign in
          </button>
          <button
            onClick={() => { setActiveTab("signup"); resetState() }}
            className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-colors ${activeTab === "signup" ? "bg-white text-gray-900 shadow-sm" : ""}`}
          >
            Create account
          </button>
        </div>

        {/* Google SSO — shown on both tabs (not during OTP step) */}
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
                className="w-full py-4 px-4 rounded-xl border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-[#00BF53] focus:ring-1 focus:ring-[#00BF53] outline-none"
              />
              <button
                onClick={handleSendOtp}
                disabled={!mobile || mobile.length < 10 || isLoading}
                className="w-full py-2 flex items-center justify-center gap-2 bg-[#00BF53] hover:bg-green-600 text-white rounded-xl font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
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
                  onClick={() => { setShowOtpField(false); setOtp("") }}
                  className="text-blue-500 hover:text-blue-600 text-sm font-medium"
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
                    const value = e.target.value.replace(/\D/g, "")
                    const newOtp = otp.split("")
                    newOtp[index] = value
                    setOtp(newOtp.join("").slice(0, 4))
                    if (value && index < 3) {
                      (e.target.parentElement?.children[index + 1] as HTMLInputElement)?.focus()
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Backspace" && !otp[index] && index > 0) {
                      (e.currentTarget.parentElement?.children[index - 1] as HTMLInputElement)?.focus()
                    }
                  }}
                  className="w-14 h-14 text-center text-xl font-medium border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-50"
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
                    setIsLoading(true)
                    try { await dispatch(resendMobileOtp(mobile)).unwrap(); setCountdown(30) }
                    catch { setError("Failed to resend OTP") }
                    finally { setIsLoading(false) }
                  }}
                  disabled={isLoading}
                  className="text-blue-500 hover:text-blue-600 text-sm font-medium disabled:text-gray-400"
                >
                  {isLoading ? "Sending..." : "Resend OTP"}
                </button>
              )}
            </div>

            <button
              onClick={handleSubmit}
              disabled={!otp || otp.length !== 4 || isLoading}
              className="w-full bg-[#00BF53] py-2 hover:bg-green-600 disabled:bg-gray-400 text-white rounded-xl font-medium flex items-center justify-center gap-2"
            >
              {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</> : "Sign in"}
            </button>
          </>
        )}
      </div>
    </div>
  )
}