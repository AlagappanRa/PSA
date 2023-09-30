import React from "react";
import { motion } from "framer-motion";
import { footerVariants } from "../utils/motion";

const Footer = () => {
    const socials = [
        {
            name: "twitter",
            url: "/twitter.svg",
        },
        {
            name: "instagram",
            url: "/instagram.svg",
        },
        {
            name: "facebook",
            url: "/facebook.svg",
        },
    ];

    return (
        <motion.footer
            variants={footerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="pt-20 sm:px-16 px-6 py-8 relative"
        >
            <div className="footer-gradient" />
            <div className="2xl:max-w-[1280px] w-full mx-auto flex flex-col gap-8">
                <div className="flex flex-col">
                    <div className="mb-[50px] h-[2px] bg-white opacity-10" />

                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <h4 className="font-extrabold text-[24px] text-white">
                            PSA
                        </h4>
                        <p className="font-normal text-[14px] text-white opacity-50">
                            Insert copyright statement
                        </p>

                        <div className="flex gap-4">
                            {socials.map((social) => (
                                <img
                                    key={social.name}
                                    src={social.url}
                                    alt="social"
                                    className="w-[24px] h-[24px] object-contain cursor-pointer"
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </motion.footer>
    );
};

export default Footer;
