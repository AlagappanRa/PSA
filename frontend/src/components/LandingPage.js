import React from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { textVariant, slideIn } from "../utils/motion";

const LandingPage = () => {
    const { ref, inView } = useInView({
        triggerOnce: true,
        threshold: 0.1,
    });

    return (
        <motion.div initial="hidden" animate={inView ? "show" : "hidden"}>
            <motion.h1 variants={textVariant(0.5)}>
                Welcome to Port Optimization System
            </motion.h1>
            <motion.p ref={ref} variants={textVariant(1)}>
                Innovative solutions for efficient port management
            </motion.p>
            <motion.div variants={slideIn("up", "spring", 1.5, 0.8)}>
                <button>Explore</button>
            </motion.div>
        </motion.div>
    );
};

export default LandingPage;
