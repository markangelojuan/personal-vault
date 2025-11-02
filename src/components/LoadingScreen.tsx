import { motion } from 'framer-motion';
import Lottie from 'lottie-react';
import runningManAnimation from "../assets/animations/running-man.json";

interface LoadingScreenProps {
    isVisible: boolean
}

const LoadingScreen = ({ isVisible } : LoadingScreenProps) => {
  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: isVisible ? 0 : '-100%' }}
      transition={{ duration: 0.6, ease: 'easeInOut' }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100vh',
        backgroundColor: '#fff',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <Lottie 
        animationData={runningManAnimation}
        loop={true}
        style={{ width: 200, height: 200 }}
      />
    </motion.div>
  );
}

export default LoadingScreen