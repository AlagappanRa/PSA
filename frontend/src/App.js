import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import DataUpload from "./components/DataUpload";
import DemandForecast from "./components/DemandForecast";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import CargoShipAnimation from "./components/ShipAnimation";
import "./App.css";
import { motion } from "framer-motion";
import { navVariants } from "./utils/motion";

function App() {
    return (
        <>
            <header>
                <Navbar className="w-full mb-0" />
            </header>
            <main className="w-full  mt-0">
                <CargoShipAnimation />
            </main>

            <Footer />
        </>
    );
}

export default App;
