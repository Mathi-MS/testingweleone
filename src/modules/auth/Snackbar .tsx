import { useEffect } from "react";
const Snackbar = ({ message, onClose }:any) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-5 right-5 z-[9999] animate-slide-in w-[500px]
">
      <div className="bg-[#2E7D32] text-white px-5 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[350px] max-w-[420px]">
        
        {/* Check icon */}
        <i className="fi fi-ss-check-circle text-[20px]"></i>

        {/* Message */}
        <span className="text-sm font-medium flex-1">{message}</span>

        {/* Close icon */}
        <button onClick={onClose}>
          <i className="fi fi-rr-cross-small text-[20px] hover:text-gray-200"></i>
        </button>
      </div>
    </div>
  );
};

export default Snackbar;
