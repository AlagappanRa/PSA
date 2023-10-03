from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.model_selection import train_test_split
from pulp import LpMaximize, LpProblem, LpVariable, lpSum, LpBinary, LpMinimize
import joblib
from pymongo import MongoClient
import gridfs
import os
from dotenv import load_dotenv

app = Flask(__name__)
CORS(app)
# CORS(app, support_credentials=True)
app.config["CORS_HEADERS"] = "Content-Type"

load_dotenv()
uri = os.getenv("MONGO")

# Send a ping to confirm a successful connection
try:
    # Create a new client and connect to the server
    client = MongoClient(uri)
    db = client["modelDB"]  # You can change 'modelDB' to your preferred database name
    fs = gridfs.GridFS(db)
    client.admin.command("ping")
    print("Pinged your deployment. You successfully connected to MongoDB!")
except Exception as e:
    print(e)

# data = pd.read_csv("C:\\Users\\Ian\\Downloads\\berth_capacity,ship_size,cargo_volu.csv")
data = None
feature_importances = None

@app.route("/", methods=["HEAD"])
def default():
    return jsonify({"200": "Server pinged successfully!"})

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"ok": "ok"})


@app.route("/upload", methods=["POST"])
def upload_data():
    """
    Uploads a CSV file containing the dataset for demand forecasting.

    Expected Input:
    A POST request with a CSV file attached. The CSV file should contain the following columns:
    - berth_capacity
    - ship_size
    - cargo_volume
    - equipment_availability
    - worker_availability
    - operational_costs
    - tide_levels
    - ship_arrival_delays
    - demand

    Example CSV content:
    berth_capacity,ship_size,cargo_volume,equipment_availability,worker_availability,operational_costs,tide_levels,ship_arrival_delays,demand
    100,50,1000,10,5,1000,sunny,2.5,10,100
    150,55,1500,15,7,1500,rainy,3.0,15,110
    ... (and so on)

    Output:
    A JSON message indicating the successful upload and processing of the file, along with the data contained in the file.
    """
    if "file" not in request.files:
        return jsonify({"error": "No file part"})

    file = request.files["file"]
    print(file.filename)
    if file.filename == "":
        return jsonify({"error": "No selected file"})

    df = pd.read_csv(file.stream)
    global data
    data = df
    print(data if data is not None else "No data")

    return jsonify(
        {"message": "File uploaded and processed successfully", "data": df.to_dict()}
    )


@app.route("/train", methods=["POST"])
def train_model():
    """
    Trains the demand forecasting model using the provided dataset.

    Expected Input JSON:
    {
        "berth_capacity": [100, 150, 200, 250, 300],
        "ship_size": [50, 55, 60, 65, 70],
        "cargo_volume": [1000, 1500, 2000, 2500, 3000],
        "equipment_availability": [10, 15, 20, 25, 30],
        "worker_availability": [5, 7, 10, 12, 15],
        "operational_costs": [1000, 1500, 2000, 2500, 3000],
        "tide_levels": [2.5, 3.0, 2.8, 3.1, 2.9],
        "ship_arrival_delays": [10, 15, 20, 25, 30],
        "demand": [100, 110, 120, 130, 140]
    }

    Output:
    A JSON message indicating the successful training and storage of the model in MongoDB.
    """
    global data, feature_importances
    df = data.dropna()
    
    # Preparing features and target variable
    x = df.drop(columns="demand")
    y = df["demand"]
    
    x_train, x_test, y_train, y_test = train_test_split(x, y, train_size=0.7, test_size=0.3, random_state=10)

    models = [
        LinearRegression(),
        RandomForestRegressor(),
        GradientBoostingRegressor()
    ]

    best_model = max(models, key=lambda model: model.fit(x_train, y_train).score(x_test, y_test))

    if isinstance(best_model, LinearRegression):
    # If the best model is linear regression, calculate feature importance from coefficients
        coefs = best_model.coef_
        feature_importances = abs(coefs) / sum(abs(coefs))
    else:
        # For tree-based models, extract feature importances directly
        feature_importances = best_model.feature_importances_.tolist()


    if hasattr(best_model, "feature_importances_"):
        feature_importances = best_model.feature_importances_.tolist()

    # Save the model to a file
    with open("model.pkl", "wb") as f:
        joblib.dump(best_model, f)

    # Read the model from the file and save it to MongoDB
    with open("model.pkl", "rb") as f:
        fs.put(f, filename="model.pkl")

    os.remove("model.pkl")  # Remove the model file after saving it to MongoDB

    return jsonify({"message": "Model trained and stored in MongoDB successfully"})

"""
Forecasts future demand based on the provided current conditions.

Expected Input JSON:
{
    "berth_capacity": 200,
    "ship_size": 60,
    "cargo_volume": 2000,
    "equipment_availability": 20,
    "worker_availability": 10,
    "operational_costs": 2000,
    "tide_levels": 2.8,
    "ship_arrival_delays": 20,
    "demand": 120
}

Expected Output JSON:
{
    "future_demand": [125],
    "historical_demand": [100, 110, 120, 130, 140],
    "comparison": {
        "increase_in_demand": [5],
        "percentage_increase": [4.17]
    },
    "feature_importances": [0.2, 0.3, 0.1, 0.15, 0.25]  # Example feature importances
}

The output includes the forecasted future demand, historical demand data, a comparison of the increase in demand and percentage increase,
and the feature importances from the trained model (if available).
"""
@app.route("/forecast", methods=["POST"])
def forecast_demand():
    global feature_importances

    input_data = request.json
    if not input_data:
        return jsonify({"error": "No data provided"})

    df = pd.DataFrame(input_data, index=[0])

    model_file = fs.find_one({"filename": "model.pkl"})
    if model_file is None:
        return jsonify({"error": "Model not found"})

    with open("model.pkl", "wb") as f:
        f.write(model_file.read())

    model = joblib.load("model.pkl")
    future_demand = model.predict(df.drop(columns=["demand"]))

    historical_demand = df["demand"].tolist()
    increase_in_demand = [float(future) - float(historical) for future, historical in zip(future_demand, historical_demand)]
    percentage_increase = [(increase / float(historical)) * 100 for increase, historical in zip(increase_in_demand, historical_demand)]

    # Mapping feature names to their importances
    features = [
        "berth_capacity", "ship_size", "cargo_volume", 
        "equipment_availability", "worker_availability", 
        "operational_costs", "tide_levels", "ship_arrival_delays"
    ]

    feature_importances_dict = dict(zip(features, feature_importances)) if feature_importances else "Not available"

    output = {
        "future_demand": future_demand.tolist(),
        "historical_demand": historical_demand,
        "comparison": {
            "increase_in_demand": increase_in_demand,
            "percentage_increase": percentage_increase
        },
        "feature_importances": feature_importances_dict  # Updated this line
    }

    os.remove("model.pkl")

    # Delete the model from MongoDB
    fs.delete(model_file._id)

    # Clear the model from memory
    del model
    print("\n\n\n\n")
    print(output)
    return jsonify(output)


@app.route("/optimize", methods=["POST"])
def optimize_resources():
    """
    This method optimizes the allocation of ships to berths to maximize the total ratio of cargo handled to time taken,
    based on the input data provided in a CSV file.

    ### Expected CSV format:
    ships,berth_capacity,berth_availability
    10000,5000,1
    15000,6000,1
    20000,7000,1
    25000,8000,1
    12000,5500,0
    13000,6500,1
    18000,7500,1
    19000,8500,1
    11000,5200,0
    16000,7200,1

    ### Columns:
    - ships: A list of cargo volumes of ships.
    - berth_capacity: A list of capacities of berths.
    - berth_availability: A list of availability of berths (1 for available, 0 for not available).

    ### Output JSON:
    {
        "average_ratio": 6758.430418839712,
        "optimized_assignments": "[{(0, 0): 0, (0, 1): 0, (0, 2): 0, (0, 3): 0, (0, 5): 0, (0, 6): 0, (0, 7): 0, (0, 9): 0, (1, 0): 0, (1, 1): 0, (1, 2): 0, (1, 3): 0, (1, 5): 0, (1, 6): 1, (1, 7): 0, (1, 9): 0, (2, 0): 0, (2, 1): 0, (2, 2): 0, (2, 3): 0, (2, 5): 0, (2, 6): 0, (2, 7): 0, (2, 9): 1, (3, 0): 0, (3, 1): 1, (3, 2): 0, (3, 3): 0, (3, 5): 0, (3, 6): 0, (3, 7): 0, (3, 9): 0, (4, 0): 0, (4, 1): 0, (4, 2): 0, (4, 3): 0, (4, 5): 1, (4, 6): 0, (4, 7): 0, (4, 9): 0, (5, 0): 0, (5, 1): 0, (5, 2): 1, (5, 3): 0, (5, 5): 0, (5, 6): 0, (5, 7): 0, (5, 9): 0, (6, 0): 0, (6, 1): 0, (6, 2): 0, (6, 3): 0, (6, 5): 0, (6, 6): 0, (6, 7): 1, (6, 9): 0, (7, 0): 1, (7, 1): 0, (7, 2): 0, (7, 3): 0, (7, 5): 0, (7, 6): 0, (7, 7): 0, (7, 9): 0, (8, 0): 0, (8, 1): 0, (8, 2): 0, (8, 3): 0, (8, 5): 0, (8, 6): 0, (8, 7): 0, (8, 9): 0, (9, 0): 0, (9, 1): 0, (9, 2): 0, (9, 3): 1, (9, 5): 0, (9, 6): 0, (9, 7): 0, (9, 9): 0}, {(0, 0): 0, (0, 1): 1, (0, 2): 0, (0, 3): 0, (0, 5): 0, (0, 6): 0, (0, 7): 0, (0, 9): 0, (1, 0): 0, (1, 1): 0, (1, 2): 0, (1, 3): 0, (1, 5): 0, (1, 6): 0, (1, 7): 1, (1, 9): 0}]",
        "total_cargo_assigned": 159000,
        "total_time_taken": 23.526172520290167
    }

    ### Notes:
    - The keys in the "optimized_assignment" dictionary are tuples where the first element is the index of the ship and the second element is the index of the berth.
    - The values in the "optimized_assignment" dictionary are binary, where 1 indicates that the ship is assigned to the berth, and 0 indicates otherwise.
    - The file should be uploaded with the POST request under the 'file' key.
    """
    """
    csv_data = request.data.decode('utf-8')
    
    if not csv_data:
        return jsonify({"error": "No data provided"})

    data = StringIO(csv_data)
    df = pd.read_csv(data)
    
    if df is None or df.empty:
        return jsonify({"error": "Could not read the data"})
    """
    
    if 'file' not in request.files:
        return jsonify({"error": "No file provided"})

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No file selected"})

    df = pd.read_csv(file)
    
    if df is None:
        return jsonify({"error": "Could not read the file"})

    ships = df['ships'].tolist()
    berth_capacity = df['berth_capacity'].tolist()
    berth_availability = df['berth_availability'].tolist()

    original_ships = ships.copy()
    assignments = []
    total_cargo_assigned = 0
    total_time_taken = 0

    while ships:
        model = LpProblem(name="ship-berth-allocation", sense=LpMaximize)

        x = {(i, j): LpVariable(name=f"x_{i}_{j}", cat=LpBinary) for i in range(len(ships)) for j in range(len(berth_capacity))}

        model += lpSum(ships[i] * x[i, j] for i in range(len(ships)) for j in range(len(berth_capacity)) if berth_availability[j] == 1), "Total_Cargo"

        for i in range(len(ships)):
            model += lpSum(x[i, j] for j in range(len(berth_capacity)) if berth_availability[j] == 1) <= 1

        for j in range(len(berth_capacity)):
            if berth_availability[j] == 1:
                model += lpSum(x[i, j] for i in range(len(ships))) <= 1

        model.solve()

        assignment = {(i, j): int(x[i, j].value()) for i in range(len(ships)) for j in range(len(berth_capacity)) if berth_availability[j] == 1}
        assignments.append(assignment)

        assigned_ship_indices = [i for i, j in assignment.keys() if assignment[(i, j)] == 1]
        
        total_cargo_assigned += sum(original_ships[i] * int(x[i, j].value()) for i, j in assignment.keys() if assignment[(i, j)] == 1)
        total_time_taken += sum((original_ships[i] / berth_capacity[j]) * int(x[i, j].value()) for i, j in assignment.keys() if assignment[(i, j)] == 1)
        
        ships = [s for i, s in enumerate(ships) if i not in assigned_ship_indices]
        original_ships = ships.copy()

        if not ships or all(a == 0 for a in berth_availability):
            break

    average_ratio = total_cargo_assigned / total_time_taken if total_time_taken != 0 else 0

    response_assignments = {}
    for assignment in assignments:
        for (i, j), value in assignment.items():
            # Convert tuple (i, j) to a string format "i,j"
            key = f"{i},{j}"
            response_assignments[key] = value

    # Calculate the Worst Case Time
    worst_case_time = calculateWorstCaseTime(ships, berth_capacity, berth_availability)
    print("Worst Case Time:", worst_case_time)

    # Calculate the Utilization Rate
    utilized_berths = sum(1 for value in response_assignments.values() if value == 1)
    total_berths = len(berth_capacity)
    utilization_rate = (utilized_berths / total_berths) * 100 if total_berths > 0 else 0

    # Calculate Average Waiting Time (you may need more data for a more accurate calculation)
    average_waiting_time = total_time_taken / len(ships) if ships else 0

    # Calculate Efficiency Gain (here it's shown as a reduction in time, can also be calculated other ways)
    efficiency_gain = ((worst_case_time - total_time_taken) / worst_case_time) * 100 if worst_case_time > 0 else 0

    # Calculate Cargo-to-Time Ratio
    cargo_to_time_ratio = total_cargo_assigned / total_time_taken if total_time_taken > 0 else 0

    response = {
        "optimized_assignment": response_assignments, 
        "total_cargo_assigned": total_cargo_assigned,
        "total_time_taken": total_time_taken,
        "average_ratio": average_ratio,
        "worst_case_time": worst_case_time,
        "utilization_rate": utilization_rate,
        "average_waiting_time": average_waiting_time,
        "efficiency_gain": efficiency_gain,
        "cargo_to_time_ratio": cargo_to_time_ratio
    }

    return jsonify(response)

def calculateWorstCaseTime(ships, berth_capacity, berth_availability):
    if not ships or all(a == 0 for a in berth_availability):
        return 0

    model = LpProblem(name="worst-case-ship-berth-allocation", sense=LpMinimize) 

    x = {(i, j): LpVariable(name=f"x_{i}_{j}", cat=LpBinary) 
         for i in range(len(ships)) 
         for j in range(len(berth_capacity))}

    model += lpSum(ships[i] / berth_capacity[j] * x[i, j] 
                   for i in range(len(ships)) 
                   for j in range(len(berth_capacity)) 
                   if berth_availability[j] == 1), "Total_Cargo_to_Time_Ratio"

    print("Objective Function before solving:", model.objective)  # New print statement

    for i in range(len(ships)):
        model += lpSum(x[i, j] for j in range(len(berth_capacity)) if berth_availability[j] == 1) <= 1

    for j in range(len(berth_capacity)):
        if berth_availability[j] == 1:
            model += lpSum(x[i, j] for i in range(len(ships))) <= 1

    model.solve()

    worst_case_time = sum((ships[i] / berth_capacity[j]) * int(x[i, j].value()) 
                          for i in range(len(ships)) 
                          for j in range(len(berth_capacity)) 
                          if berth_availability[j] == 1 and x[i, j].value() is not None)

    print("Worst Case Time after solving:", worst_case_time)  # New print statement

    return worst_case_time


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
