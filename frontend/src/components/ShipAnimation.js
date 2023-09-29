import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import lottie from "lottie-web";

const CargoShipAnimation = () => {
    const container = useRef(null);

    useEffect(() => {
        const animation = lottie.loadAnimation({
            container: container.current,
            renderer: "svg",
            loop: true,
            autoplay: true,
            animationData: require("../assets/animation2.json"),
        });

        return () => {
            animation.destroy();
        };
    }, []);

    return (
        <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            transition={{ duration: 2 }}
        >
            <div ref={container}></div>
        </motion.div>
    );
};

export default CargoShipAnimation;
