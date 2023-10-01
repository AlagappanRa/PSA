import { motion } from "framer-motion";
import CargoShipAnimation from "../components/ShipAnimation";
import { textVariant } from "../utils/motion";

const HomePage = () => {
    return (
        <main className="relative">
            <section className="py-16 bg-transparent text-white">
                <motion.div className="w-full flex flex-col items-center">
                    <motion.h1
                        variants={textVariant(1.1)}
                        initial="hidden"
                        animate="show"
                        className="z-20 font-bold text-[80px] leading-[74.4px] uppercase"
                    >
                        Predictive Analysis Tool
                    </motion.h1>
                </motion.div>
            </section>
            <CargoShipAnimation />
        </main>
    );
};

export default HomePage;
