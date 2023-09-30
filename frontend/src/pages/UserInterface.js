import DataUpload from "../components/DataUpload";
import DemandForecast from "../components/DemandForecast";
import TrainModel from "../components/TrainModel";
import OptimizeResources from "../components/OptimizeResources";

const UserInterface = () => {
    return (
        <div className="min-h-screen bg-primary">
            <DataUpload />
            <TrainModel />
            <OptimizeResources />
        </div>
    );
};

export default UserInterface;
