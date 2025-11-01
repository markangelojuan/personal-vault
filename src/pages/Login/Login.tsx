import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { motion } from "framer-motion";
import Lottie from "lottie-react";
import TypingText from "../../components/TypingText";
import toast from "react-hot-toast";
import { useEffect } from "react";
import lockUnlockKey from "../../assets/animations/lock-unlock-key.json";
import googleLogo from "../../assets/animations/google-logo.json";
import arrowDown from "../../assets/animations/arrow-down.json";

const Login = () => {
  const navigate = useNavigate();
  const { loginWithGoogle, loading, user } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard");
    }
  }, [loading, user, navigate]);

  const handleLogin = async () => {
    try {
      await loginWithGoogle();
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      const error = err instanceof Error ? err : { message: String(err) };
      if (error.message.toLowerCase().includes("unauthorized")) {
        toast.error("This account is not special.");
      } else {
        toast.error("Something went wrong. Haha.");
      }
    }
  };

  return (
    <main className="min-h-screen max-h-screen flex flex-col md:flex-row bg-linear-to-r from-blue-100 via-blue-50 to-white relative overflow-hidden">
      {/* absolute background shapes */}
      <motion.div
        className="absolute top-20 -left-20 w-72 h-72 bg-blue-500/30 rounded-full blur-3xl"
        animate={{
          x: [0, 100, 0],
          y: [0, -50, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-20 -right-20 w-96 h-96 bg-yellow-700/20 rounded-full blur-3xl"
        animate={{
          x: [0, -80, 0],
          y: [0, 80, 0],
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 w-64 h-64 bg-black/20 rounded-full blur-3xl"
        animate={{
          rotate: [0, 360],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      <motion.div
        className="absolute top-1/3 right-1/4 w-48 h-48 bg-gray-700/25 rounded-full blur-2xl"
        animate={{
          x: [0, 60, 0],
          y: [0, -40, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <section className="flex items-center h-[60vh] flex-col md:h-screen md:w-[60vw] md:gap-28 justify-center relative z-10">
        <div className="w-fit border-double border border-white bg-gray-900/70 m-4 px-4 py-8 rounded-2xl flex items-center flex-col md:py-12 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-center px-4"
          >
            <TypingText text="M's Vault" speed={0.1} loopDelay={3500} />

            <p className="bg-linear-to-r from-yellow-400 via-orange-400 to-red-300 bg-clip-text text-transparent text-md mt-5 md:text-xl">
              One passphrase to remember, one vault to trust — your secrets stay
              safe, as they always must.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            className="flex items-center justify-center w-fit mt-5 md:mt-8"
          >
            <Lottie
              animationData={lockUnlockKey}
              loop={true}
              className="w-[220px] h-[220px] md:w-[350px] md:h-[350px]"
            />
          </motion.div>
        </div>
      </section>

      <section className="flex flex-1 flex-col items-center justify-center border-dotted border-t md:border-l relative z-10">
        <span>
          <Lottie
            animationData={arrowDown}
            loop={true}
            className="w-24 h-24 md:w-36 md:h-38"
          />
        </span>
        <motion.button
          className="flex items-center justify-around gap-2 border border-blue-400 rounded-md p-2 bg-white/90 w-64 md:w-72 text-xl cursor-pointer mb-10"
          onClick={handleLogin}
          whileHover={{
            scale: 1.05,
            boxShadow: "0 10px 30px rgba(59, 130, 246, 0.3)",
          }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Lottie
            animationData={googleLogo}
            loop={true}
            className="w-24 h-24 md:w-32 md:h-32"
          />
        </motion.button>
      </section>
    </main>
  );
};

export default Login;
