import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import DataUpload from './components/DataUpload';
import DemandForecast from './components/DemandForecast';
import TrainModel from './components/TrainModel'; // Import the TrainModel component
import OptimizeResources from './components/OptimizeResources'; // Import the OptimizeResources component

function App() {
    return (
        <div className="max-h-screen overflow-hidden">
            <header>
                <Navbar className="z-1000 w-full bg-primary" />
            </header>

            <Routes>
                <Route path="/" element={<HomePage />} />
                {/* Add more Routes as needed */}
            </Routes>

            <Footer />
        </div>
    );
}