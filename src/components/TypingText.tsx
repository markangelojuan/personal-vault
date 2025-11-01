import { motion, type Variants } from "framer-motion";
import { useState } from "react";

interface TypingTextProps {
  text: string;
  speed?: number;
  loop?: boolean;
  loopDelay?: number;
}

const TypingText: React.FC<TypingTextProps> = ({
  text,
  speed = 0.05,
  loop = true,
  loopDelay = 2000,
}) => {
  const [key, setKey] = useState(0);
  const letters = text.split("");

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: speed,
      },
    },
  };

  const letterVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0 },
    },
  };

  const handleAnimationComplete = () => {
    if (loop) {
      setTimeout(() => {
        setKey((prev) => prev + 1);
      }, loopDelay);
    }
  };

  return (
    <motion.span
      key={key}
      className="text-4xl font-bold text-white font-mono md:text-7xl whitespace-nowrap inline-flex items-center"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      onAnimationComplete={handleAnimationComplete}
    >
      {letters.map((char, index) => (
        <motion.span
          key={index}
          variants={letterVariants}
          className="inline-block"
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
      <motion.span
        variants={letterVariants}
        className="inline-block w-1 h-[1em] bg-white ml-1 animate-pulse"
      />
    </motion.span>
  );
};

export default TypingText;
