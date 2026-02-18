"use client";

import { motion } from "framer-motion";

export default function CornerRune() {
  return (
    <motion.div
      initial={{ rotate: 10, scale: 1, opacity: 0.6 }}
      animate={{
        rotate: [10, 370],
        scale: [1, 1.08, 1],
        opacity: [0.6, 0.95, 0.6],
        boxShadow: [
          "0 0 0px rgba(255,255,255,0.2)",
          "0 0 10px rgba(255,255,255,0.4)",
          "0 0 0px rgba(255,255,255,0.2)",
        ],
      }}
      transition={{
        rotate: {
          duration: 24,
          repeat: Infinity,
          ease: "linear",
        },
        scale: {
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        },
        opacity: {
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        },
        boxShadow: {
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        },
      }}
      style={{
        position: "absolute",
        top: 14,
        left: 14,
        width: 14,
        height: 14,
        borderRadius: 4,
        border: "1px solid rgba(255,255,255,0.18)",
        backdropFilter: "blur(2px)",
      }}
    />
  );
}
