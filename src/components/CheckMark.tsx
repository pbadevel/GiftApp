import { motion } from 'framer-motion';

import styles from '@/styles/main-page.module.css'

const Checkmark = () => {
  return (<div className={styles.checkmarkContainer}>

    <motion.svg
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.5 }}
      width="80"
      height="80"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#34D399"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <motion.path
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{
          duration: 1,
          delay: 0.5,
          type: "spring",
          stiffness: 50
        }}
        d="M20 6L9 17l-5-5"
      />
    </motion.svg>
  </div>
  );
}

export default Checkmark;