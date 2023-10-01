import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import UserInterface from "./pages/UserInterface";
import OptimiseInterface from "./pages/OptimiseInterface";

function App() {
    return (
        <div>
            <header>
                <Navbar className="z-1000 w-full bg-primary" />
            </header>

            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/demand-forecast" element={<UserInterface />} />
                <Route path="/optimize-ship" element={<OptimiseInterface />} />
            </Routes>

            <Footer />
        </div>
    );
}

export default App;
