import { motion } from "framer-motion"

export default function Container({ children, maxWidth }: { children: React.ReactNode, maxWidth?: string }) {
    return (
        <div className="container text-center py-2" style={{ maxWidth: maxWidth }}>
            <motion.div
                whileHover={{ scale: 1.03, boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.2)" }}
                transition={{ type: "spring", stiffness: 500, mass: 0.3, damping: 10 }}
                className="card rounded-3"
                style={{ overflow: "scroll" }}>
                {children}
            </motion.div>
        </div>
    );
}