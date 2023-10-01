from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.preprocessing import OneHotEncoder
from pulp import LpMaximize, LpProblem, LpVariable, lpSum, LpBinary
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
    - weather_conditions
    - tide_levels
    - ship_arrival_delays
    - demand

    Example CSV content:
    berth_capacity,ship_size,cargo_volume,equipment_availability,worker_availability,operational_costs,weather_conditions,tide_levels,ship_arrival_delays,demand
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
    print(data)

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
        "weather_conditions": ["sunny", "rainy", "cloudy", "sunny", "rainy"],
        "tide_levels": [2.5, 3.0, 2.8, 3.1, 2.9],
        "ship_arrival_delays": [10, 15, 20, 25, 30],
        "demand": [100, 110, 120, 130, 140]
    }

    Output:
    A JSON message indicating the successful training and storage of the model in MongoDB.
    """
    global data, feature_importances  # Added feature_importances as a global variable
    df = data
    print(df)
    df.dropna(inplace=True)

    # Handle categorical data
    encoder = OneHotEncoder(sparse=False, handle_unknown="ignore")
    weather_encoded = encoder.fit_transform(df[["weather_conditions"]])
    weather_df = pd.DataFrame(
        weather_encoded, columns=encoder.get_feature_names_out(["weather_conditions"])
    )

    # Drop the original 'weather_conditions' column and concatenate the encoded DataFrame
    df.drop(columns="weather_conditions", inplace=True)
    df = pd.concat([df, weather_df], axis=1)

    x = df.drop(columns="demand")
    print(x)
    scaler = StandardScaler().fit(x)
    x = scaler.transform(x)
    y = df["demand"]

    x_train, x_test, y_train, y_test = train_test_split(
        x, y, train_size=0.7, test_size=0.3, random_state=10
    )
    print("test")
    lr_model = LinearRegression().fit(x_train, y_train)
    rf_model = RandomForestRegressor().fit(x_train, y_train)
    gb_model = GradientBoostingRegressor().fit(x_train, y_train)

    l = lr_model.score(x_test, y_test)
    r = rf_model.score(x_test, y_test)
    g = gb_model.score(x_test, y_test)

    print(l, r, g)

    best_model = max(
        (lr_model, rf_model, gb_model), key=lambda x: x.score(x_test, y_test)
    )

    print(best_model.score(x_test, y_test))

    # Save feature importances if the model is tree-based
    if hasattr(best_model, "feature_importances_"):
        feature_importances = best_model.feature_importances_.tolist()

    joblib.dump(best_model, "model.pkl")

    with open("model.pkl", "rb") as f:
        fs.put(f, filename="model.pkl")

    os.remove("model.pkl")

    return jsonify({"message": "Model trained and stored in MongoDB successfully"})


@app.route("/forecast", methods=["POST"])
def forecast_demand():
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
        "weather_conditions": "sunny",
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
    global data, feature_importances
    data = request.json
    if not data:
        return jsonify({"error": "No data provided"})

    # Convert the received JSON data to a DataFrame
    df = pd.DataFrame(data, index=[0])

    # Handle categorical data
    encoder = OneHotEncoder(
        sparse=False, handle_unknown="ignore"
    )  # handle_unknown='ignore' is crucial here for unseen labels
    weather_encoded = encoder.fit_transform(df[["weather_conditions"]])
    weather_df = pd.DataFrame(
        weather_encoded, columns=encoder.get_feature_names_out(["weather_conditions"])
    )

    # Drop the original 'weather_conditions' column and concatenate the encoded DataFrame
    df.drop(columns="weather_conditions", inplace=True)
    df = pd.concat([df, weather_df], axis=1)

    # Retrieve the model from MongoDB
    model_file = fs.find_one({"filename": "model.pkl"})
    if model_file is None:
        return jsonify({"error": "Model not found"})

    # Save the model to a temporary file
    with open("model.pkl", "wb") as f:
        f.write(model_file.read())

    # Load the model
    model = joblib.load("model.pkl")

    # Remove the temporary file
    os.remove("model.pkl")

    # Use the model for predictions
    future_demand = model.predict(df.drop(columns=["demand"]))

    # Calculate the increase in demand and the percentage increase
    historical_demand = df["demand"].tolist()
    increase_in_demand = [
        future - historical
        for future, historical in zip(future_demand, historical_demand)
    ]
    percentage_increase = [
        (increase / historical) * 100 if historical != 0 else 0
        for increase, historical in zip(increase_in_demand, historical_demand)
    ]

    # Prepare the output JSON
    output = {
        "future_demand": future_demand.tolist(),
        "historical_demand": data[
            "demand"
        ].tolist(),  # Accessing the global data variable for historical demand
        "comparison": {
            "increase_in_demand": increase_in_demand,
            "percentage_increase": percentage_increase,
        },
        "feature_importances": feature_importances
        if feature_importances
        else "Not available",  # Add feature importances to the output
    }

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

    response = {
        "optimized_assignment": response_assignments, # Changed the key from optimized_assignments to optimized_assignment
        "total_cargo_assigned": total_cargo_assigned,
        "total_time_taken": total_time_taken,
        "average_ratio": average_ratio
    }

    return jsonify(response)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
