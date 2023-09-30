import { motion } from "framer-motion";
import { useLottie } from "lottie-react";
import animationData from "../assets/animation2.json";
import { slideIn } from "../utils/motion";

const CargoShipAnimation = () => {
    const options = {
        animationData,
        loop: true,
        autoplay: true,
    };

    const { View } = useLottie(options);

    return (
        <motion.div
            variants={slideIn("right", "spring", 0.2, 2)}
            initial="hidden"
            animate="show"
            className="z-10 animation-wrapper"
        >
            <div className="z-10 ship-animation-container">{View}</div>
        </motion.div>
    );
};

export default CargoShipAnimation;
