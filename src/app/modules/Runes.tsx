"use client";

import { motion } from "framer-motion";

export default function Runes() {
  return (
    <motion.div
      initial={{ scale: 1, opacity: 0.7 }}
      animate={{
        scale: [1, 1.1, 1],
        opacity: [0.7, 1, 0.7],
        textShadow: [
          "0 0 0px rgba(255,255,255,0.3)",
          "0 0 8px rgba(255,255,255,0.6)",
          "0 0 0px rgba(255,255,255,0.3)",
        ],
        filter: [
          "blur(0px)",
          "blur(0.3px)",
          "blur(0px)",
        ],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      style={{
        fontSize: 12,
        letterSpacing: 6,
        display: "inline-block",
      }}
    >
      ✦ ✦ ✦
    </motion.div>
  );
}
