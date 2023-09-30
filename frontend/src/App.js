import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";

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

export default App;
