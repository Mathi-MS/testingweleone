import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { LucideBell, Zap } from "lucide-react";
import { RootState } from "../../app/store";
import { logout } from "../../features/authSlice";
import { AuthModal } from "../../modules/auth/auth-modal";
import { NotificationBell } from "../common/NotificationBell";
import { MobileModal } from "../../modules/auth/mobileModel";
import { useLocation } from "react-router-dom";

export function AuthHeaderControls() {
    const dispatch = useDispatch();
    const { userDetails, accessToken } = useSelector((state: RootState) => state.ar);
    const [showMobileModal, setShowMobileModal] = useState(false);
    const isAuthenticated = !!accessToken;
    const location = useLocation();
    const isAspire =
      window.location.hostname === "aspire.wele.in" ||
      location.pathname === "/aspire";

    const [showAuthModal, setShowAuthModal] = useState(false);
    const [authModalTab, setAuthModalTab] = useState<"signin" | "signup">("signin");

    const handleAuthSuccess = () => {
        setShowAuthModal(false);
    };

    const handleSignOut = () => {
        dispatch(logout());
    };
    useEffect(() => {
        if (userDetails && userDetails.isMobile === false) {
            setShowMobileModal(true);
        }
    }, [userDetails]);

    if (isAspire) return null;

    return (
        <>
            {!isAuthenticated && (
                <div className="flex gap-2">
                    <button
                        onClick={() => {
                            setAuthModalTab("signin");
                            setShowAuthModal(true);
                        }}
                        className="bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-full text-sm font-medium transition-colors border border-gray-200 whitespace-nowrap"
                    >
                        Sign in
                    </button>
                    <button
                        onClick={() => {
                            setAuthModalTab("signup");
                            setShowAuthModal(true);
                        }}
                        className="bg-[#00BF53] hover:bg-green-600 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap"
                    >
                        Sign up
                    </button>
                </div>
            )}
            {isAuthenticated && (
                <div className="flex items-center space-x-2 py-2 px-4">
                    <NotificationBell />
                </div>
            )}

            {showAuthModal && (
                <AuthModal
                    onClose={() => setShowAuthModal(false)}
                    onSuccess={handleAuthSuccess}
                    initialTab={authModalTab}
                />
            )}
            {showMobileModal && (
                <MobileModal
                    onClose={() => setShowMobileModal(false)}
                    onTryAnotherWay={() => {
                        dispatch(logout());
                        setShowMobileModal(false);
                        setAuthModalTab("signup");
                        setShowAuthModal(true);
                    }}
                />
            )}
        </>
    );
}
