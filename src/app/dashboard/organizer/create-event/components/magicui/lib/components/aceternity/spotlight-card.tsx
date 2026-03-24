"use client"

import { motion } from "framer-motion"

export default function SpotlightCard({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      transition={{ type: "spring", stiffness: 300 }}
      className="relative overflow-hidden rounded-2xl border border-white/10 bg-black p-6 shadow-xl"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-transparent to-transparent opacity-50" />
      <div className="relative z-10">{children}</div>
    </motion.div>
  )
}