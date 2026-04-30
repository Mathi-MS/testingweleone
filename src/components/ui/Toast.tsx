import { CircleCheckBig, Info } from "lucide-react";
import React, { useEffect } from "react";
import { Box } from "@mui/material";
import {
  Toaster,
  ToastBar,
  toast,
  type ToastOptions,
  useToasterStore,
} from "react-hot-toast";

const MAX_VISIBLE = 2;

const CustomToast: React.FC = () => {
  const { toasts } = useToasterStore();

  useEffect(() => {
    const visibleToasts = toasts.filter((t) => t.visible);
    if (visibleToasts.length > MAX_VISIBLE) {
      const toDismiss = visibleToasts.slice(
        0,
        visibleToasts.length - MAX_VISIBLE
      );
      toDismiss.forEach((t) => toast.dismiss(t.id));
    }
  }, [toasts]);

  return (
    <Toaster
      position="bottom-center"
      containerStyle={{
        zIndex: 99999999999999999999999999999999999999999,
      }}
      toastOptions={{
        duration: 3000,
        style: {
          fontSize: "14px",
          padding: "18px 14px",
          background: "#ffffff",
          color: "#111827",
          minWidth: 300,
          fontWeight: 900,
        },
        success: {
          style: {
            background: "#e4f9ecff",
            color: "#48B16E",
          },
        },
        error: {
          style: {
            background: "#f5dbd9ff",
            color: "#D93025",
          },
        },
      }}
    >
      {(t) => (
        <ToastBar toast={t}>
          {({ icon, message }) => (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%" }}>
              {icon}
              <Box component="span" sx={{ "& div": { margin: "0px !important" } }}>
                {message}
              </Box>
            </div>
          )}
        </ToastBar>
      )}
    </Toaster>
  );
};

export default CustomToast;

// Helpers
export const showSuccess = (message: string, options?: ToastOptions) =>
  toast.success(message, {
    icon: <CircleCheckBig />, 
    ...options,
  });
export const showError = (message: string, options?: ToastOptions) =>
  toast.error(message, {
    icon: <Info />, 
    ...options,
  });

export const showInfo = (message: string, options?: ToastOptions) =>
  toast(message, {
    icon: <Info />,
    style: {
      background: "#fcf0d5ff",
      color: "#FFAA00",
      fontWeight: 900,
      minWidth: 300,
    },
    ...options,
  });

export const showPromise = <T,>(
  promise: Promise<T>,
  messages: { loading: string; success: string; error: string },
  options?: ToastOptions
) => toast.promise(promise, messages, options);


//  showSuccess("Mail Sent Successfully");
//     showError("Mail Failed to Send");
//     showInfo("Any Info");