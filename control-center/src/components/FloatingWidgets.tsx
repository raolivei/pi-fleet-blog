import { motion } from "framer-motion";

const WIDGETS = [
  { label: "CPU", value: "12%" },
  { label: "RAM", value: "4.3GB" },
  { label: "Pods", value: "47" },
  { label: "Services", value: "18" },
  { label: "Ingresses", value: "12" },
  { label: "Volumes", value: "9" },
];

export function FloatingWidgets() {
  return (
    <div className="floating-widgets">
      {WIDGETS.map((w, i) => (
        <motion.div
          key={w.label}
          className="float-widget"
          animate={{ y: [0, -6, 0] }}
          transition={{
            repeat: Infinity,
            duration: 2.8,
            delay: i * 0.15,
            ease: "easeInOut",
          }}
        >
          <span className="float-label">{w.label}</span>
          <span className="float-value">{w.value}</span>
        </motion.div>
      ))}
    </div>
  );
}
