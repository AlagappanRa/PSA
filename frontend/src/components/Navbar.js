import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { navVariants } from "../utils/motion";

const Navbar = () => {
    const [toggle, setToggle] = useState(false);

    return (
        <motion.nav
            variants={navVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="w-full flex justify-between items-center bg-primary sm:px-8 px-4 py-4"
        >
            {/* Logo */}
            <div className="md:flex-[0.5] flex-initial justify-center items-center text-white font-bold text-2xl">
                <Link
                    to="/"
                    className="text-white hover:text-gray-300 transition duration-300"
                >
                    <h1>Nautical Traders</h1>
                </Link>
            </div>

            {/* Navigation Links for Desktop */}
            <div className="relative z-20 text-white md:flex hidden list-none flex-row justify-between items-center flex-initial text-l">
                <Link
                    to="/demand-forecast"
                    className="mx-6 hover:text-gray-300 transition duration-300"
                >
                    Forecast Demand
                </Link>
                <Link
                    to="/optimize-ship" // Add this new Link
                    className="mx-6 hover:text-gray-300 transition duration-300"
                >
                    Optimize Ship Supply Allocation
                </Link>
            </div>
        </motion.nav>
    );
};

export default Navbar;
