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
    df = pd.DataFrame(data)

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
    Optimize the allocation of ships to berths to maximize the total ratio of cargo handled to time taken.

    ### Expected Input JSON:
    {
        "ships": [5000, 6000, 7000],  # List of cargo volumes of ships
        "berth_capacity": [1000, 2000, 3000],  # List of capacities of berths
        "berth_availability": [1, 0, 1]  # List of availability of berths (1 for available, 0 for not available)
    }

    ### Expected Output JSON:
    {
        "optimized_assignment": "{(0, 0): 1, (1, 2): 1}",  # JSON string of dictionary representing the optimized assignment of ships to berths
        "total_cargo_assigned": 12000,  # Total cargo volume assigned to available berths
        "total_time_taken": 12,  # Total time taken to handle the assigned cargo
        "average_ratio": 1000,  # Average ratio of cargo handled to time taken
        "optimized_by_percentage": 20  # Improvement percentage compared to a baseline allocation
    }

    ### Note:
    - The keys in the "optimized_assignment" dictionary are tuples where the first element is the index of the ship and the second element is the index of the berth.
    - The values in the "optimized_assignment" dictionary are binary, where 1 indicates that the ship is assigned to the berth, and 0 indicates otherwise.
    """
    data = request.json
    if not data:
        return jsonify({"error": "No data provided"})

    ships = data["ships"]  # List of cargo volumes of ships
    berth_capacity = data["berth_capacity"]  # List of capacities of berths
    berth_availability = data[
        "berth_availability"
    ]  # List of availability of berths (1 for available, 0 for not available)

    model = LpProblem(name="ship-berth-allocation", sense=LpMaximize)

    # Create binary decision variables
    x = {
        (i, j): LpVariable(name=f"x_{i}_{j}", cat=LpBinary)
        for i in range(len(ships))
        for j in range(len(berth_capacity))
    }

    # Objective function: maximize the total ratio of cargo handled to time taken
    model += (
        lpSum(
            ships[i] / (ships[i] / berth_capacity[j]) * x[i, j]
            for i in range(len(ships))
            for j in range(len(berth_capacity))
            if berth_availability[j] == 1
        ),
        "Total_Ratio",
    )

    # Each ship is assigned to exactly one available berth
    for i in range(len(ships)):
        model += (
            lpSum(
                x[i, j]
                for j in range(len(berth_capacity))
                if berth_availability[j] == 1
            )
            == 1
        )

    # Each available berth can handle at most one ship
    for j in range(len(berth_capacity)):
        if berth_availability[j] == 1:
            model += lpSum(x[i, j] for i in range(len(ships))) <= 1

    model.solve()

    # Get the optimal assignment of ships to berths
    assignment = {
        (i, j): int(x[i, j].value())
        for i in range(len(ships))
        for j in range(len(berth_capacity))
        if berth_availability[j] == 1
    }

    return jsonify({"optimized_assignment": assignment})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
