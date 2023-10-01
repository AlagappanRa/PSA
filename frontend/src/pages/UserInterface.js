import DataUpload from "../components/DataUpload";
import DemandForecast from "../components/DemandForecast";
import TrainModel from "../components/TrainModel";

const UserInterface = () => {
    return (
        <div className="min-h-screen bg-primary">
            <DataUpload />
            <TrainModel />
            <DemandForecast />
        </div>
    );
};

export default UserInterface;
