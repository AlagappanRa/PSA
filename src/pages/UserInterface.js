import DataUpload from "../components/DataUpload";
import DemandForecast from "../components/DemandForecast";
import TrainModel from "../components/TrainModel";
import OptimizeResources from "../components/OptimizeResources";
import "../styles/UserInterface.css"
import Optimise from "../components/Optimise";
import Train from "../components/Train"
import Footer from "../components/Footer";

const UserInterface = () => {
    return (
        <>
            <div>
                <h1 className="header">What would you like to do today?</h1>
            </div>
            <>
                <div className="dataUpload">
                    <div>
                        <DataUpload />
                    </div>
                    <div>
                        <Optimise />
                    </div>
                    <Train />
                </div>
            </>
        </>
    );
};

export default UserInterface;
