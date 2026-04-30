import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  ChevronRight,
  Calendar,
  Globe,
  Clock,
  LucideClock,
  Star,
  Lock,
  LucidePlay,
  LucideLock,
  LucideCalendar,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Play,
  Tag,
  X,
} from "lucide-react";
import { batchClient } from "../../../graphql/client";
import { GET_BATCH_BY_ID } from "../../../graphql/queries/batchQueries";
import { paymentApi } from "../../../services/paymentApi";
import { GET_SESSION_BY_BATCH_ID_QUERY } from "../../../graphql/queries/sessionQueries";
import { GET_COURSE_BY_ID } from "../../../graphql/queries/courseQueries";
import { AuthModal } from "../../auth/auth-modal";
import { OnboardingModal } from "../postverify/OnboardingModal";
import { LoadingSpinner } from "../../../components/ui/LoadingSpinner";
import { fetchLearnerBatches } from "../../../features/learnerBatchesSlice";
import { toast } from "react-hot-toast";
import { AuthHeaderControls } from "../../../components/auth/AuthHeaderControls";
import { images } from "../../../assets/image/Images";
import { SidebarContext } from "../ai/AIChatWrapper";
import { HiMiniBars3BottomLeft } from "react-icons/hi2";
import CustomCalendar from "../../../components/custom/CustomCalendar";
import { useAppSelector } from "../../../app/hook";
import { fetchDiscountPrice } from "../../../features/referralcodeSlice";
import { showSuccess } from "../../../components/ui/Toast";
import { getAllBatchThunk } from "../../../features/batchSlice";
 // adjust path as needed

const events = [
  {
    title: "Node.js Basics",
    date: "2025-12-01",
    time: "10:00 AM",
    type: "completed",
  },
  {
    title: "Node.js Basics",
    date: "2025-12-11",
    time: "10:00 AM",
    type: "completed",
  },
  {
    title: "Node.js Basics",
    date: "2025-12-12",
    time: "10:00 AM",
    type: "completed",
  },
  {
    title: "Node.js Basics",
    date: "2025-12-17",
    time: "10:00 AM",
    type: "completed",
  },
  
  {
    title: "Node.js Basics",
    date: "2025-12-19",
    time: "10:00 AM",
    type: "completed",
  },
  {
    title: "Context API Mastery",
    date: "2025-12-23",
    time: "2:00 PM",
    type: "upcoming",
  },
];

export function CoursesDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<any>();
  const sidebarContext = React.useContext(SidebarContext);
  const trainerNameFromState = location.state?.trainerName || "";

  const [activeTab, setActiveTab] = React.useState("modules");
  const [batchData, setBatchData] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [courseData, setCourseData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

 
  // Modal states
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isReferralModalOpen, setIsReferralModalOpen] = useState(false);
  const [discountResult, setDiscountResult] = useState<any>(null);
  const [discount, setDiscount] = useState(false);
  const [isReferreddata,setisReferred] =useState('')
 
  
const [originalPrice] = useState(batchData?.sellingPrice || batchData?.basePrice || 0);
  // Referral states
  const [referralCode, setReferralCode] = useState("");
  const [referralLoading, setReferralLoading] = useState(false);
 const [isPayFullModalOpen, setIsPayFullModalOpen] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState<any>(null);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    new Set(),
  );
 
const [discountedPrice, setDiscountedPrice] = useState<number | null>(null);

  const { userDetails, onBoard, accessToken } = useSelector(
    (state: any) => state.ar,
  );
  const { batches: learnerBatches } = useSelector(
    (state: any) => state.learnerBatches,
  );
 const {discountPrice}= useSelector(
    (state: any) => state.referral,
  );

  console.log(learnerBatches,'krishnn');
  

  // Pull isReferred from allBatches slice
  const { batches } = useAppSelector((state) => state.allBatches);
  const currentBatch :any = batches.find((b: any) => b.id === id);
  const isReferred = !!currentBatch?.isReffered; // preserving typo from slice
 
  const userId = userDetails?.id;
  const isEnrolled = learnerBatches.some((batch: any) => batch.id === id);
  const ROLE_TRAINER = userDetails?.roles?.some(
    (role: string) => role.toUpperCase() === "ROLE_TRAINER",
  );
  const isEnrollmentEnded = batchData?.enrollmentEndDate
    ? new Date(batchData.enrollmentEndDate).setHours(23, 59, 59, 999) <
      new Date().getTime()
    : false;

  useEffect(() => {
    if (ROLE_TRAINER || isEnrolled) {
      setActiveTab("sessions");
    }
  }, [isEnrolled, ROLE_TRAINER]);

  useEffect(() => {
    if (userId) {
      dispatch(fetchLearnerBatches({ learnerId: userId, page: 0, size: 100 }));
    }
  }, [userId, dispatch]);

  useEffect(() => {
    const fetchBatchDetails = async () => {
      if (!id) return;

      try {
        setLoading(true);

        const [batchResponse, sessionsResponse] = await Promise.all([
          batchClient.query({
            query: GET_BATCH_BY_ID,
            variables: { id },
            fetchPolicy: "network-only",
          }),
          batchClient.query({
            query: GET_SESSION_BY_BATCH_ID_QUERY,
            variables: { batchId: id, page: 0, size: 50 },
            fetchPolicy: "network-only",
          }),
        ]);

        const batchData: any = batchResponse.data;
        const sessionsData: any = sessionsResponse.data;

        if (batchData?.getBatchById?.data) {
          setBatchData(batchData.getBatchById.data);

          if (batchData.getBatchById.data.isMasterClass !== undefined) {
            sessionStorage.setItem(
              `course_${id}_isMasterClass`,
              String(batchData.getBatchById.data.isMasterClass),
            );
          }

          let courseData = null;
          if (batchData.getBatchById.data.courseId) {
            const courseRes = await batchClient.query({
              query: GET_COURSE_BY_ID,
              variables: { id: batchData.getBatchById.data.courseId },
              fetchPolicy: "cache-first",
            });
            const courseResponse: any = courseRes.data;
            if (courseResponse?.getCourseById?.data) {
              courseData = courseResponse.getCourseById.data;
              setCourseData(courseData);
            }
          }
        }

        if (sessionsData?.getSessionByBatchId?.data) {
          setSessions(sessionsData.getSessionByBatchId.data);
        }
      } catch (error) {
        console.error("Error fetching batch:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBatchDetails();
  }, [id]);

  // ─── Razorpay (extracted & shared) ────────────────────────────────────────
  const openRazorpay = async (refCode?: string) => {
    
    try {
     const refCode = discountPrice?.referralCode || "";

const [config, order] = await Promise.all([
  paymentApi.getConfig(accessToken),
  paymentApi.initiatePayment(id!, userId, refCode, accessToken),
]);

      const options = {
        key: config.data.keyId,
        amount: order.data.amount,
        currency: order.data.currency,
        name: "WeLe Learning",
        description: batchData?.batchName,
        order_id: order.data.orderId,
        method: {
          upi: true,
          netbanking: true,
          card: true,
          wallet: true,
          emi: true,
        },
        handler: async (response: any) => {
          try {
            const result = await paymentApi.verifyPayment(response, accessToken);
            if (result.status === "SUCCESS" || result.status === "PENDING") {
              await dispatch(
                fetchLearnerBatches({ learnerId: userId, page: 0, size: 100 }),
              );
              toast.success("Enrollment successful!", {
                position: "top-center",
              });
              setPaymentSuccess(result);
            }
          } catch (error) {
            console.error("Verification failed:", error);
            toast.error("Enrollment failed. Please try again.", {
              position: "top-center",
            });
          }
        },
        prefill: {
          name: userDetails?.name,
          email: userDetails?.email,
          contact: userDetails?.phone,
        },
        theme: { color: "#10b981" },
        modal: {
          ondismiss: () => console.log("Payment cancelled"),
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", (response: any) => {
        console.error("Payment failed:", response.error);
        toast.error("Payment failed. Please try again.", {
          position: "top-center",
        });
      });
      rzp.open();
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Enrollment failed. Please try again.", {
        position: "top-center",
      });
    }
  };

  // ─── Enroll Now ────────────────────────────────────────────────────────────
  const handleEnrollNow = async () => {
    if (!userId) {
      setIsAuthModalOpen(true);
      return;
    }

    if (!onBoard) {
      setIsOnboardingModalOpen(true);
      return;
    }

    if (batchData?.paymentType === "FREE") {
      // FREE → Confirm Modal
      setIsConfirmModalOpen(true);
    } else {
      // PAID → check referral
      if (batchData?.isReffered) {
        setIsReferralModalOpen(true); // show referral popup first
      } else {
        await openRazorpay(); // direct Razorpay
      }
    }
  };

  // ─── Free Course Confirm ───────────────────────────────────────────────────
  const handleConfirmEnroll = async () => {
  setIsConfirmModalOpen(false);
  
  try {
    const [config, order] = await Promise.all([
      paymentApi.getConfig(accessToken),
      paymentApi.initiatePayment(id!, userId, "", accessToken),
    ]);

    // ✅ HANDLE ERROR RESPONSE FIRST
    if (order?.success !== 200) {
      toast.error(order?.message || "Something went wrong", {
        position: "top-center",
      });
      return;
    }

    // ✅ FREE ENROLLMENT
    if (!order.data || order.data.amount === 0) {
      await dispatch(
        fetchLearnerBatches({ learnerId: userId, page: 0, size: 100 }),
      );
      toast.success("Enrollment successful!", { position: "top-center" });
      return;
    }

    // ✅ CONTINUE PAYMENT
    await openRazorpay();

  } catch (error) {
    console.error("Payment error:", error);
    toast.error("Enrollment failed. Please try again.", {
      position: "top-center",
    });
  }
};

  // ─── Referral Submit ───────────────────────────────────────────────────────
// const handleReferralSubmit = async () => {
//   if (!referralCode.trim()) return;
//   setReferralLoading(true);

//   try {
//     const result = await dispatch(
//       fetchDiscountPrice({ batchId: id!, referralCode })
//     ).unwrap();

//     // result = { success, message, data: { ...ReferralObject } }
//     // Ask your backend which field holds the discounted price
//     // e.g. result.data.discountedPrice or result.data.sellingPrice
//     console.log("Discount result:", result); // inspect this first
//     showSuccess("Referral applied successfully! Discounted price: ₹" + result.data.sellingPrice)
//     setIsReferralModalOpen(false);
//     setReferralCode("");
//     await openRazorpay(referralCode);
//   } catch (error) {
//     console.error("Referral error:", error);
//     toast.error("Invalid Coupon code. Please try again.", {
//       position: "top-center",
//     });
//   } finally {
//     setReferralLoading(false);
//   }
// };
const handleReferralSubmit = async () => {
  if (!referralCode.trim()) return;
  setReferralLoading(true);

  try {
    const result = await dispatch(
      fetchDiscountPrice({ batchId: id!, referralCode })
    ).unwrap();

    // Check success field from API response
    if (result.success === 200) {
      setDiscountResult(result.data);

    } else {
      console.log(result.message ,'result.message result.message result.message ');
      
      // e.g. success: 404 → "ReferralCode not found"
      toast.error(result.message || "Invalid Coupon code. Please try again.", {
       
      });
    }
  } catch (error) {
    toast.error("Something went wrong. Please try again.", {
     
    });
  } finally {
    setReferralLoading(false);
  }
};
const handleProceedToPay = async () => {
  setIsReferralModalOpen(false);
  setDiscountResult(null);
  setReferralCode("");
  await openRazorpay(referralCode);
};


  // const handleSkipReferral = async () => {
  //   setIsReferralModalOpen(false);
  //   setReferralCode("");
  //   await openRazorpay();
  // };
//   const handleSkipReferral = async () => {
//   setIsReferralModalOpen(false);
//   setReferralCode("");
//   setDiscountResult(null);
//   await openRazorpay();
// };
const handleSkipReferral = async () => {
  setIsReferralModalOpen(false);
  setReferralCode("");
  setDiscountResult(null);
  setIsPayFullModalOpen(true);
};

// Add a separate close handler for the X button on the referral modal
const handleCloseReferralModal = () => {
  setIsReferralModalOpen(false);
  setReferralCode("");
  setDiscountResult(null);
  // No further modal — just close everything
};
  useEffect(() => {
    if (onBoard && isOnboardingModalOpen) {
      setIsOnboardingModalOpen(false);
    }
  }, [onBoard, isOnboardingModalOpen]);

  const stripHtml = (html: string) => html.replace(/<\/?[^>]+(>|$)/g, "");

  useEffect(()=>{
    dispatch(getAllBatchThunk({ page: 0, size: 20 }));
  },[])
  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-30 border-b bg-white p-2 sm:p-4 flex justify-between items-center">
        <div className="flex items-center text-xs sm:text-sm text-gray-600">
          {!sidebarContext?.sidebarOpen && (
            <button
              onClick={sidebarContext?.toggleSidebar}
              className={`${
                userDetails?.roles?.some(
                  (role: string) => role.toUpperCase() === "ROLE_ADMIN",
                )
                  ? ""
                  : "md:hidden"
              } flex items-center justify-center p-1 mr-2`}
            >
              <HiMiniBars3BottomLeft
                style={{ color: "#000", fontSize: "22px" }}
              />
            </button>
          )}
          {batchData?.isMasterClass ? (
            <Link to="/masterclass" className="hover:text-green-600">
              Master Class
            </Link>
          ) : (
            <Link to="/CourseLearner" className="hover:text-green-600">
              Courses
            </Link>
          )}
          <ChevronRight size={16} className="mx-2" />
          <span className="text-gray-900 truncate max-w-[150px] sm:max-w-none">
            {batchData?.batchName}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <AuthHeaderControls />
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="mx-2 sm:mx-4 xl:mx-28 px-2 sm:px-4 lg:px-6 py-4 sm:py-8 pb-[5rem]">
          {/* Main + Sidebar */}
          <div className="flex flex-col lg:flex-row items-start justify-between mb-8 gap-6">
            {/* Main Content */}
            <div className="flex-1 w-full">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">
                {batchData?.batchName || "Course Name"}
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                {batchData?.batchDescription || "Course description"}
              </p>

              <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 font-medium bg-green-100 border-green-200 text-green-700 text-sm rounded-full capitalize">
                    {batchData?.forWhom
                      ? Array.isArray(batchData.forWhom)
                        ? batchData.forWhom[0]?.toLowerCase()
                        : batchData.forWhom.toLowerCase()
                      : "everyone"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900">
                    Category :
                  </span>
                  <span>
                    {Array.isArray(batchData?.category)
                      ? batchData.category
                          .map((c: string) => c.replace(/_/g, " "))
                          .join(", ")
                      : batchData?.category?.replace(/_/g, " ")}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar size={16} />
                  <span>
                    Course start date & end date :{" "}
                    {batchData?.batchStartDate
                      ? new Date(batchData.batchStartDate).toLocaleDateString(
                          "en-GB",
                          { day: "2-digit", month: "long", year: "numeric" },
                        )
                      : "TBD"}{" "}
                    -{" "}
                    {batchData?.batchEndDate
                      ? new Date(batchData.batchEndDate).toLocaleDateString(
                          "en-GB",
                          { day: "2-digit", month: "long", year: "numeric" },
                        )
                      : "TBD"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Globe size={16} />
                  <span>{batchData?.language || "English"}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Clock size={16} />
                  <span>{sessions?.length || 0} Sessions</span>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="w-full lg:w-80 lg:ml-8">
              <div
                className="bg-gray-100 p-3 rounded-xl mb-4"
                style={
                  batchData?.bannerUrl
                    ? {
                        backgroundImage: `url(${batchData.bannerUrl})`,
                        backgroundSize: "cover",
                        backgroundRepeat: "no-repeat",
                        minHeight: "150px",
                      }
                    : {}
                }
              >
                <div className="flex items-center justify-center gap-3 p-4">
                  {!batchData?.bannerUrl && (
                    <>
                      <div className="w-16 h-16 bg-yellow-400 rounded-lg flex items-center justify-center">
                        <span className="text-2xl font-bold">
                          {batchData?.batchName
                            ?.substring(0, 2)
                            .toUpperCase() || "BC"}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold">
                        {batchData?.courseName || "Course"}
                      </h3>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-gray-600">Trainer Name :</span>
                  <span className="font-semibold">
                    {trainerNameFromState ||
                      (batchData?.trainerList &&
                      batchData.trainerList.length > 0
                        ? batchData.trainerList[0]?.trainerName
                        : "") ||
                      "TBD"}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-green-600 flex-wrap">
                  <Calendar size={16} />
                  <span className="font-medium">
                    Enrollment End Date:{" "}
                    {batchData?.enrollmentEndDate
                      ? new Date(
                          batchData.enrollmentEndDate,
                        ).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })
                      : "TBD"}
                  </span>
                </div>
   {batchData?.brochureUrl && (
  <a
    href={batchData.brochureUrl}
    target="_blank"
    rel="noopener noreferrer"
    className="block mt-2 text-sm text-green-600 hover:underline text-center"
  >
    Download Brochure
  </a>
 )}
                <button
                  onClick={handleEnrollNow}
                  disabled={isEnrolled || isEnrollmentEnded}
                  className={`mt-4 px-4 py-3 rounded-lg ${
                    isEnrolled || isEnrollmentEnded
                      ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                      : "bg-green-500 hover:bg-green-600 text-white"
                  }`}
                  style={{ width: "100%" }}
                >
                  {isEnrolled
                    ? "Enrolled"
                    : isEnrollmentEnded
                      ? "Enrollment Closed"
                      : "Enroll Now"}
                </button>
       
              </div>
            </div>
          </div>

          {/* ── Auth Modal ─────────────────────────────────────────────────── */}
          {isAuthModalOpen && (
            <AuthModal
              onClose={() => setIsAuthModalOpen(false)}
              onSuccess={(result: any) => {
                setIsAuthModalOpen(false);
                if (!result?.onBoard) {
                  setIsOnboardingModalOpen(true);
                } else {
                  handleEnrollNow();
                }
              }}
            />
          )}

          {/* ── Onboarding Modal ───────────────────────────────────────────── */}
          <OnboardingModal
            isOpen={isOnboardingModalOpen}
            onClose={() => setIsOnboardingModalOpen(false)}
            onComplete={() => {
              setIsOnboardingModalOpen(false);
              handleEnrollNow();
            }}
          />

          {/* ── FREE: Confirm Enrollment Modal ────────────────────────────── */}
          {isConfirmModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <h3 className="text-lg font-semibold mb-4">
                  Confirm Enrollment
                </h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to enroll in {batchData?.batchName}?
                </p>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setIsConfirmModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmEnroll}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── PAID + isReferred: Coupon code Modal ────────────────────── */}
       {isReferralModalOpen && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <Tag size={16} className="text-green-600" />
          </div>
          <h3 className="text-base font-semibold text-gray-900">
            Have a Coupon code?
          </h3>
        </div>
        <button
          onClick={handleSkipReferral}
          className="text-gray-400 hover:text-gray-600"
        >
          <X size={18} />
        </button>
      </div>

     <p className="text-sm mb-5 ml-10 transition-all duration-300">
  {discountResult ? (
    <span className="text-green-600 font-medium flex items-center gap-1">
      ✅ Coupon code confirmed. You're all set to proceed!
    </span>
  ) : (
    <span className="text-gray-500">
      Have a Coupon code? Enter it below. Apply it now to unlock your discount.
    </span>
  )}
</p>

      {/* Input — hide after discount applied */}
      {!discountResult && (
        <input
          type="text"
          value={referralCode}
          onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
          placeholder="Enter code e.g. FRIEND20"
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-green-400 tracking-widest font-mono"
        />
      )}

      {/* ── Price Breakdown (shown after successful API response) ── */}
      {discountResult && (
        <div className="mb-4 rounded-xl border border-green-200 bg-green-50 p-4 space-y-3">
          {/* Referral code badge */}
          <div className="flex items-center gap-2">
            <Tag size={14} className="text-green-600" />
            <span className="text-xs font-semibold text-green-700 tracking-widest uppercase">
              {referralCode}
            </span>
            <span className="ml-auto text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
              Applied ✓
            </span>
          </div>

          <div className="border-t border-green-200" />

          {/* Original price */}
          <div className="flex justify-between text-sm text-gray-500">
            <span>Original Price</span>
            <span className="line-through">
              ₹{(batchData?.sellingPrice || batchData?.basePrice || 0).toLocaleString()}
            </span>
          </div>

          {/* Discount amount */}
          {/* <div className="flex justify-between text-sm text-green-600 font-medium">
            <span>Discount</span>
            <span>
              - ₹{(
                (batchData?.sellingPrice || batchData?.basePrice || 0) -
                (discountResult?.discountAmount ?? discountResult?.sellingPrice ?? 0)
              ).toLocaleString()}
            </span>
          </div> */}

          <div className="border-t border-green-200" />

          {/* Final payable amount */}
          <div className="flex justify-between items-center">
            <span className="text-sm font-bold text-gray-800">You Pay Only</span>
            <span className="text-xl font-extrabold text-green-600">
              ₹{(discountResult?.discountAmount ?? discountResult?.sellingPrice ?? 0).toLocaleString()}
            </span>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleSkipReferral}
          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Skip
        </button>

        {!discountResult ? (
          // Step 1: Apply code
          <button
            onClick={handleReferralSubmit}
            disabled={!referralCode.trim() || referralLoading}
            className="flex-1 px-4 py-2.5 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {referralLoading ? "Applying..." : "Apply Code"}
          </button>
        ) : (
          // Step 2: Proceed to pay
          <button
            onClick={handleProceedToPay}
            className="flex-1 px-4 py-2.5 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
          >
            Proceed to Pay
          </button>
        )}
      </div>
    </div>
  </div>
)}

          {/* ── Payment Success Modal ──────────────────────────────────────── */}
          {paymentSuccess && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-3xl w-full max-w-md mx-4 overflow-hidden shadow-2xl">
                <div className="bg-gradient-to-br from-green-500 to-green-600 p-8 text-center">
                  <div className="w-20 h-20 bg-white rounded-full mx-auto flex items-center justify-center mb-4">
                    <svg
                      className="w-12 h-12 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="3"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Payment Successful!
                  </h2>
                  <p className="text-green-100 text-sm">
                    Your course has been unlocked
                  </p>
                </div>
                <div className="p-6 space-y-4">
                  <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-gray-500 uppercase">
                        Transaction ID
                      </span>
                      <span className="text-sm font-mono font-bold text-gray-900">
                        {paymentSuccess.paymentId}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-gray-500 uppercase">
                        Amount Paid
                      </span>
                      <span className="text-lg font-bold text-gray-900">
                        {paymentSuccess.currency}{" "}
                        {(paymentSuccess.amount / 100).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={async () => {
                      setPaymentSuccess(null);
                      toast.success("Enrollment successful!", {
                        position: "top-center",
                      });
                    }}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition"
                  >
                    Continue Learning
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Skills You Gain ───────────────────────────────────────────── */}
          {batchData?.skillsYouGain && batchData.skillsYouGain.length > 0 && (
            <>
              <h2 className="text-sm sm:text-md font-bold mb-3 sm:mb-4">
                Skills you gain
              </h2>
              <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8 flex-wrap">
                {batchData.skillsYouGain.map(
                  (skill: string, index: number) => (
                    <span
                      key={index}
                      className="px-2 sm:px-3 py-1 bg-gray-100 text-xs sm:text-sm rounded-full"
                    >
                      {skill}
                    </span>
                  ),
                )}
              </div>
            </>
          )}

          {/* ── What You'll Learn ─────────────────────────────────────────── */}
          {batchData?.whatYouLearn && (
            <div className="mb-6 sm:mb-8">
              <h2 className="text-sm sm:text-md font-bold mb-3 sm:mb-4">
                What you'll learn
              </h2>
              <ul className="space-y-2 text-xs sm:text-sm text-gray-700">
                {batchData.whatYouLearn
                  .split(/<\/li>|<\/p>/)
                  .map((item: string) => stripHtml(item.trim()))
                  .filter((item: string) => item)
                  .map((item: string, index: number) => (
                    <li key={index} className="flex gap-2 sm:gap-3">
                      <span className="text-gray-900 flex-shrink-0">•</span>
                      <span className="flex-1">{item}</span>
                    </li>
                  ))}
              </ul>
            </div>
          )}

          {/* ── Tabs ──────────────────────────────────────────────────────── */}
          <div className="mb-10">
            <div className="flex border-b overflow-x-auto">
              {(ROLE_TRAINER || isEnrolled) && (
                <button
                  onClick={() => setActiveTab("sessions")}
                  className={`px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === "sessions"
                      ? "border-green-500 text-green-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Course Sessions
                </button>
              )}

              <button
                onClick={() => setActiveTab("modules")}
                className={`px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === "modules"
                    ? "border-green-500 text-green-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Modules
              </button>
            </div>

            <div className="p-2 sm:p-4">
              {/* Modules Tab */}
              {activeTab === "modules" && (
                <div className="">
                  {batchData?.batchModules &&
                  batchData.batchModules.length > 0 ? (
                    batchData.batchModules.flatMap(
                      (week: any) =>
                        week.moduleDetails?.map(
                          (module: any, moduleIndex: number) => {
                            const moduleKey = `${week.id}-${moduleIndex}`;
                            return (
                              <div key={moduleKey} className="border-b">
                                <button
                                  onClick={() => {
                                    const newExpanded = new Set(expandedModules);
                                    if (newExpanded.has(moduleKey)) {
                                      newExpanded.delete(moduleKey);
                                    } else {
                                      newExpanded.add(moduleKey);
                                    }
                                    setExpandedModules(newExpanded);
                                  }}
                                  className="w-full flex items-center justify-between rounded-lg p-3 sm:p-4 hover:bg-gray-50 transition-colors"
                                >
                                  <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                                    <BookOpen
                                      size={18}
                                      className="text-gray-600 flex-shrink-0"
                                    />
                                    <span className="text-xs sm:text-sm font-medium text-gray-700 truncate">
                                      {module.moduleName}
                                    </span>
                                  </div>
                                  {expandedModules.has(moduleKey) ? (
                                    <ChevronUp
                                      size={18}
                                      className="text-gray-400 flex-shrink-0"
                                    />
                                  ) : (
                                    <ChevronDown
                                      size={18}
                                      className="text-gray-400 flex-shrink-0"
                                    />
                                  )}
                                </button>
                                {expandedModules.has(moduleKey) && (
                                  <div className="px-3 sm:px-4 pb-3 sm:pb-4">
                                    <div
                                      className="text-xs sm:text-sm text-gray-600 pl-6 sm:pl-8"
                                      dangerouslySetInnerHTML={{
                                        __html: module.moduleDescription,
                                      }}
                                    />
                                  </div>
                                )}
                              </div>
                            );
                          },
                        ) || [],
                    )
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No modules available
                    </div>
                  )}
                </div>
              )}

              {/* Sessions Tab */}
              {(ROLE_TRAINER || isEnrolled) && activeTab === "sessions" && (
                <div className="divide-y">
                  {sessions.length > 0 ? (
                    sessions.map((session) => {
                      const sessionDate = session.isRescheduled
                        ? session.rescheduleDate
                        : session.sessionDate;
                      const isPast = sessionDate
                        ? new Date(sessionDate) < new Date()
                        : false;
                      const status = isPast ? "completed" : "active";

                      return (
                        <div
                          key={session.id}
                          onClick={() => {
                            if (!userId) {
                              setIsAuthModalOpen(true);
                              return;
                            }
                            if (!onBoard) {
                              setIsOnboardingModalOpen(true);
                              return;
                            }
                            navigate(`/session/${session.id}`);
                          }}
                          className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-2 hover:bg-gray-50 cursor-pointer gap-3"
                        >
                          <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                                status === "completed"
                                  ? "bg-green-100 text-green-600"
                                  : "bg-gray-100 text-gray-400"
                              }`}
                            >
                              {status === "completed" ? (
                                <Play size={16} className="text-green-600" />
                              ) : (
                                <Lock size={16} className="text-gray-400" />
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-xs sm:text-sm text-gray-900">
                                {session.sessionName ||
                                  `Session ${session.day}`}
                              </h3>
                              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm text-gray-600 mt-1">
                                <span className="flex items-center gap-1">
                                  <LucideCalendar
                                    size={12}
                                    className="text-gray-500 mr-1"
                                  />
                                  {sessionDate
                                    ? new Date(sessionDate).toLocaleDateString(
                                        "en-GB",
                                        {
                                          day: "2-digit",
                                          month: "long",
                                          year: "numeric",
                                        },
                                      )
                                    : "TBD"}
                                </span>
                                <span className="flex items-center gap-1">
                                  <LucideClock
                                    size={12}
                                    className="text-gray-500 mr-1"
                                  />
                                  {session.sessionStartTime || "TBD"} -{" "}
                                  {session.sessionEndTime || "TBD"}
                                </span>
                              </div>
                            </div>
                          </div>

                          <button className="font-medium text-xs bg-green-100 text-green-600 px-3 py-2 sm:p-3 rounded-lg whitespace-nowrap w-full sm:w-auto">
                            View Recordings
                          </button>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No sessions available
                    </div>
                  )}
                </div>
              )}
            </div>
            {isPayFullModalOpen && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
            <Tag size={16} className="text-gray-600" />
          </div>
          <h3 className="text-base font-semibold text-gray-900">
            Pay Full Amount
          </h3>
        </div>
        <button
          onClick={() => setIsPayFullModalOpen(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          <X size={18} />
        </button>
      </div>

      <p className="text-sm text-gray-500 mb-5 ml-10">
        You're about to pay the full price without a referral discount.
      </p>

      {/* Price Box */}
      <div className="mb-5 rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-2">
        <div className="flex justify-between text-sm text-gray-500">
          <span>Course</span>
          <span className="font-medium text-gray-800 text-right max-w-[60%] truncate">
            {batchData?.batchName}
          </span>
        </div>
        <div className="border-t border-gray-200" />
        <div className="flex justify-between items-center">
          <span className="text-sm font-bold text-gray-800">Total Payable</span>
          <span className="text-xl font-extrabold text-gray-900">
            ₹{(batchData?.sellingPrice || batchData?.basePrice || 0).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => {
       setIsPayFullModalOpen(false);
  setIsReferralModalOpen(true);  // close Pay Full modal
   // ← go back to referral modal
          }}
          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={async () => {
            setIsPayFullModalOpen(false);
            await openRazorpay(); // ← pay without referral
          }}
          className="flex-1 px-4 py-2.5 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
        >
          Pay ₹{(batchData?.sellingPrice || batchData?.basePrice || 0).toLocaleString()}
        </button>
      </div>
    </div>
  </div>
)}
          </div>
        </div>
      )}
    </div>
  );
}