// utils/toast.js
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Success notification
export const showSuccess = (message, onClose = null) => {
  toast.success(message, {
    position: "top-right",
    autoClose: 2000,
    onClose: onClose,
  });
};

// Error notification
export const showError = (message) => {
  toast.error(message, {
    position: "top-right",
    autoClose: 2000,
  });
};

// Info notification (optional)
export const showInfo = (message) => {
  toast.info(message, {
    position: "top-right",
    autoClose: 2000,
  });
};
