import React from "react";
import { ToastContainer, toast, type ToastOptions } from "react-toastify";
import { X } from "lucide-react";
import { images } from "../../assets/image/Images";
import "react-toastify/dist/ReactToastify.css";

let backdropElement: HTMLDivElement | null = null;

const showBackdrop = () => {
  if (!backdropElement) {
    backdropElement = document.createElement('div');
    backdropElement.style.cssText = 'position: fixed; inset: 0; background-color: rgba(0, 0, 0, 0.5); z-index: 99998;';
    document.body.appendChild(backdropElement);
  }
};

const hideBackdrop = () => {
  if (backdropElement) {
    backdropElement.remove();
    backdropElement = null;
  }
};

const CustomToast = ({ type, message, closeToast }: { type: string; message: string; closeToast?: () => void }) => (
  <div  style={{ display: "flex", alignItems: "start", justifyContent: "space-between", gap: "16px", width: "100%" }}>
    <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
      <div style={{ flexShrink: 0 }}>
        <img src={images.favicon} alt="" />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: "18px", color: type === "success" ? "#10B981" : type === "error" ? "#EF4444" : "#3B82F6", marginBottom: "4px" }}>
          {type === "success" && "Login Successful 👻"}
          {type === "error" && "Error"}
          {type === "info" && "Info"}
        </div>
        <div style={{ fontSize: "14px", color: "#6B7280", textAlign: "left" }} className="toast-message">{message}</div>
      </div>
    </div>
    <button
      onClick={closeToast}
      style={{ background: "transparent", border: "none", cursor: "pointer", padding: "4px", display: "flex", alignItems: "center", color: "#9CA3AF" }}
    >
      <X size={20} />
    </button>
  </div>
);

const NewToast: React.FC = () => (
  <ToastContainer
    position="bottom-center"
    autoClose={2000}
    hideProgressBar
    closeButton={false}
    icon={false}
    limit={2}
    style={{ zIndex: 99999 }}
    toastClassName="custom-toast"
  />
);

export default NewToast;

export const showNewSuccess = (message: string, options?: ToastOptions) => {
  showBackdrop();
  return toast.success(<CustomToast type="success" message={message} />, { ...options, onClose: () => { hideBackdrop(); options?.onClose?.(); } });
};

export const showNewError = (message: string, options?: ToastOptions) => {
  showBackdrop();
  return toast.error(<CustomToast type="error" message={message} />, { ...options, onClose: () => { hideBackdrop(); options?.onClose?.(); } });
};

export const showNewInfo = (message: string, options?: ToastOptions) => {
  showBackdrop();
  return toast.info(<CustomToast type="info" message={message} />, { ...options, onClose: () => { hideBackdrop(); options?.onClose?.(); } });
};
