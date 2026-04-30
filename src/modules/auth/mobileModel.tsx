import { useState } from "react"
import { Loader2 } from "lucide-react"
import { useSelector } from "react-redux"
import { updateUserMobile, updateUserMobileOtp, verifyMobileOtp, resendMobileOtp } from "../../features/authSlice"
import { useAppDispatch } from "../../app/hook"
import { showNewSuccess } from "../../components/ui/newToast"
import { RootState } from "../../app/store"

export function MobileModal({ onClose, onTryAnotherWay }: { onClose: () => void; onTryAnotherWay?: () => void }) {
  const dispatch = useAppDispatch()
  const userDetails = useSelector((state: RootState) => state.ar.userDetails)

  const [name, setName] = useState(userDetails?.name || "")
  const [mobile, setMobile] = useState("")
  const [otp, setOtp] = useState("")
  const [mobileError, setMobileError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showOtp, setShowOtp] = useState(false)
  const [countdown, setCountdown] = useState(0)

  const startCountdown = () => {
    setCountdown(30)
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1
      })
    }, 1000)
  }

  const handleSendOtp = async () => {
    if (!mobile || mobile.length < 10) { setMobileError("Please enter a valid 10-digit mobile number"); return; }
    setIsLoading(true)
    setError("")
    try {
      await dispatch(updateUserMobile({ userId: userDetails?.id || "", mobile })).unwrap()
      setShowOtp(true)
      startCountdown()
    } catch (err: any) {
      setError(err || "Failed to send OTP. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerify = async () => {
    if (!otp || otp.length !== 4) { setError("Please enter a valid 4-digit OTP"); return; }
    setIsLoading(true)
    setError("")
    try {
      const result = await dispatch(updateUserMobileOtp({
        userId: userDetails?.id || "",
        fullName: name ,
        mobile,
        otp
      })).unwrap()
      if (result) {
        showNewSuccess("Let’s get you started on your journey with us.")
        onClose()
      }
    } catch (err: any) {
      setError(err || "Verification failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[1000]">
      <div className="bg-white rounded-3xl w-full max-w-md p-8 relative shadow-2xl">
        <div className="flex justify-center mb-6">
          <img src="logo.svg" alt="" />
        </div>
        <h1 className="text-2xl font-medium text-center mb-2 text-gray-900">Add your mobile number</h1>
        <p className="text-gray-500 text-sm text-center mb-6">Please add your mobile number to complete your profile</p>

        {error && (
          <div className="bg-[#ff000017] border border-[#ffd2d2] text-[#ff6666] px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        {!showOtp ? (
          <>
            <div className="mb-4">
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full py-4 px-4 rounded-xl border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-[#00BF53] focus:ring-1 focus:ring-[#00BF53] outline-none"
              />
            </div>
            <div className="mb-4">
              <input
                type="tel"
                placeholder="Mobile Number"
                value={mobile}
                onChange={(e) => { setMobile(e.target.value.replace(/\D/g, "")); setMobileError("") }}
                maxLength={10}
                className={`w-full py-4 px-4 rounded-xl border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-[#00BF53] focus:ring-1 focus:ring-[#00BF53] outline-none ${mobileError ? "border-red-300 focus:border-red-500 focus:ring-red-500" : ""}`}
              />
              {mobileError && <p className="text-red-500 text-sm mt-1">{mobileError}</p>}
            </div>
            <button
              onClick={handleSendOtp}
              disabled={!mobile || mobile.length < 10 || isLoading}
              className="w-full bg-[#00BF53] py-2 hover:bg-green-600 disabled:bg-gray-400 text-white rounded-xl font-medium flex items-center justify-center gap-2"
            >
              {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" />Sending...</> : "Send OTP"}
            </button>
          </>
        ) : (
          <>
            <div className="flex flex-col mx-auto mb-6">
              <h2 className="text-gray-600 text-xl text-center">We've sent an OTP on</h2>
              <div className="flex items-center gap-2 justify-center">
                <span className="text-gray-600">+91 {mobile}</span>
                <button onClick={() => { setShowOtp(false); setOtp("") }} className="text-blue-500 hover:text-blue-600 text-sm font-medium">Edit</button>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex justify-center gap-3">
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
                        const nextInput = e.target.parentElement?.children[index + 1] as HTMLInputElement
                        nextInput?.focus()
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Backspace" && !otp[index] && index > 0) {
                        const prevInput = e.currentTarget.parentElement?.children[index - 1] as HTMLInputElement
                        prevInput?.focus()
                      }
                    }}
                    className="w-14 h-14 text-center text-xl font-medium border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-50"
                  />
                ))}
              </div>
            </div>

            <div className="text-center mb-6">
              <span className="text-gray-600 text-sm">Didn't receive OTP? </span>
              {countdown > 0 ? (
                <span className="text-gray-500 text-sm font-medium">Resend in {countdown} sec</span>
              ) : (
                <button
                  onClick={async () => {
                    setIsLoading(true)
                    try { await dispatch(resendMobileOtp(mobile)).unwrap(); startCountdown() }
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
              onClick={handleVerify}
              disabled={!otp || otp.length !== 4 || isLoading}
              className="w-full bg-[#00BF53] py-2 hover:bg-green-600 disabled:bg-gray-400 text-white rounded-xl font-medium flex items-center justify-center gap-2"
            >
              {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" />Verifying...</> : "Verify & Continue"}
            </button>
          </>
        )}

        <div className="text-center mt-4">
          <button onClick={onTryAnotherWay} className="text-gray-400 text-sm hover:text-gray-600">
            Try Another way ?
          </button>
        </div>
      </div>
    </div>
  )
}
