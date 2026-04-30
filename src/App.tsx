import { ToastContainer } from "react-toastify";
import { ThemeProvider } from "@mui/material";
import muiTheme from "./theme/muiTheme";
import "./styles/global.css";
import React, { useEffect, useState } from "react";
import { Provider, useDispatch, useSelector } from "react-redux";
import { store } from "./app/store";
import { userClient, } from "./graphql/client";
import Router from "./routes/Router";
import ErrorBoundary from "./utils/errorBoundary";
import { ApolloProvider } from "@apollo/client/react";
import CustomToast from "./components/ui/Toast";
import { refreshTokenAsync, logout } from "./features/authSlice";
import { LoadingSpinner } from "./components/ui";
import { requestForToken, onMessageListener } from "./utils/firebase";
import { registerNotificationToken, unsubscribeNotificationToken } from "./services/notificationService";
import NewToast from "./components/ui/newToast";
import { AuthModal } from "./modules/auth/auth-modal";
import AspireSignIn from "./modules/auth/aspireSignIn";
import { isAspireDomain } from "./utils/domain";

// injectStore(store, refreshTokenAsync, logout);

function AuthInitializer() {
  const dispatch = useDispatch();
  const accessToken = useSelector((state: any) => state.ar.accessToken);

  useEffect(() => {
    if (!accessToken) {
      // @ts-ignore
      dispatch(refreshTokenAsync());
    }
  }, [dispatch, accessToken]);

  return null;
}

function NotificationHandler() {
  const userDetails = useSelector((state: any) => state.ar.userDetails);
  const [lastRegisteredToken, setLastRegisteredToken] = React.useState<string | null>(null);

  useEffect(() => {
    const setupNotifications = async () => {
      if (userDetails?.id) {
        const token = await requestForToken();
        if (token) {
          try {
            await registerNotificationToken(userDetails.id, token);
            setLastRegisteredToken(token);
            console.log("Successfully registered FCM token for user:", userDetails.id);
          } catch (err) {
            console.error("Failed to register FCM token:", err);
          }
        }
      } else if (!userDetails?.id && lastRegisteredToken) {
        // User logged out, unsubscribe the token
        try {
          await unsubscribeNotificationToken(lastRegisteredToken);
          setLastRegisteredToken(null);
          console.log("Successfully unsubscribed FCM token on logout");
        } catch (err) {
          console.error("Failed to unsubscribe FCM token:", err);
        }
      }
    };

    setupNotifications();

    // Listen for foreground messages
    onMessageListener().then((payload) => {
      console.log("Message handled in foreground:", payload);
      // You can trigger a toast or update local state here if needed
    }).catch(err => console.log('failed: ', err));
  }, [userDetails?.id]);

  return null;
}

function InnerApp() {
  const isInitialized = useSelector((state: any) => state.ar.isInitialized);
  // show login modal until user gets logged in (remove this to get old method)
  const accessToken = useSelector((state: any) => state.ar.accessToken);
  // const [showAuthModal, setShowAuthModal] = useState(false);

  // useEffect(() => {
  //   if (isInitialized && !accessToken) {
  //     setShowAuthModal(true);
  //   }
  // }, [isInitialized, accessToken]);

  // const handleAuthSuccess = () => {
  //   setShowAuthModal(false);
  // };
  // ************************************

  if (!isInitialized) {
    return <LoadingSpinner className="h-screen w-full" size="lg" />;
  }

  return (
    <ApolloProvider client={userClient}>
      <ErrorBoundary>
        <NotificationHandler />
        <CustomToast />
        <ToastContainer />
        <NewToast />
        <Router />
        {/* show login modal until user gets logged in (remove this to get old method) */}
        {isInitialized && !accessToken && !isAspireDomain() && (
          <AuthModal initialTab="signin" />
        )}
        {isInitialized && !accessToken && isAspireDomain() && (
          <AspireSignIn />
        )}
        {/* ********************************** */}
      </ErrorBoundary>
    </ApolloProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider theme={muiTheme}>
      <Provider store={store}>
        <AuthInitializer />
        <InnerApp />
      </Provider>
    </ThemeProvider>
  );
}
