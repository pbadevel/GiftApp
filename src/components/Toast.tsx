import { motion } from 'framer-motion';
import styles from "@/styles/Toast.module.css"


interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}

export const Toast = ({ message, type, onClose }: ToastProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`${styles.toast} ${styles[type]}`} // Использование стилей
    >
      <div className={styles.toastContent}>
        <span>{message}</span>
        <button onClick={onClose} className={styles.closeButton}>
          &times;
        </button>
      </div>
    </motion.div>
  );
};