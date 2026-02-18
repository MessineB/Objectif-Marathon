"use client";

import { motion } from "framer-motion";

export function JournalPage({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

export function JournalSection({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, filter: "blur(2px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.45, ease: "easeOut", delay }}
    >
      {children}
    </motion.div>
  );
}

export function JournalCover({
  src,
  alt,
}: {
  src: string;
  alt: string;
}) {
  return (
    <motion.img
      src={src}
      alt={alt}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      whileHover={{ scale: 1.01 }}
      style={{
        width: "100%",
        maxHeight: 440,
        objectFit: "cover",
        borderRadius: 16,
        border: "1px solid rgba(255,255,255,0.10)",
        filter: "contrast(1.02) saturate(1.05)",
        display: "block",
      }}
    />
  );
}

export function JournalThumb({
  src,
  alt,
  i,
}: {
  src: string;
  alt: string;
  i: number;
}) {
  return (
    <motion.img
      src={src}
      alt={alt}
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.35, ease: "easeOut", delay: i * 0.05 }}
      whileHover={{ scale: 1.02 }}
      style={{
        width: "100%",
        height: 150,
        objectFit: "cover",
        borderRadius: 14,
        border: "1px solid rgba(255,255,255,0.10)",
        opacity: 0.95,
        display: "block",
      }}
    />
  );
}
