from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from pulp import LpMaximize, LpProblem, LpVariable, lpSum
import joblib
from pymongo import MongoClient
import gridfs
import os

app = Flask(__name__)
CORS(app)
# CORS(app, support_credentials=True)
app.config["CORS_HEADERS"] = "Content-Type"

uri = "mongodb+srv://hoegpt:yJzfbBiMhZywyLRE@cluster0.fenmosq.mongodb.net/?retryWrites=true&w=majority&tlsAllowInvalidCertificates=true"

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

#data = pd.read_csv("C:\\Users\\Ian\\Downloads\\berth_capacity,ship_size,cargo_volu.csv")

@app.route("/upload", methods=["POST"])
def upload_data():
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
    global data
    df = data
    print(df)
    df.dropna(inplace=True)

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

    joblib.dump(best_model, "model.pkl")

    with open("model.pkl", "rb") as f:
        fs.put(f, filename="model.pkl")

    os.remove("model.pkl")

    return jsonify({"message": "Model trained and stored in MongoDB successfully"})


@app.route("/forecast", methods=["POST"])
def forecast_demand():
    data = request.json
    if not data:
        return jsonify({"error": "No data provided"})

    # Convert the received JSON data to a DataFrame
    df = pd.DataFrame(data)

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

    final_answer = jsonify({"future_demand": future_demand.tolist()})
    print(final_answer)
    return final_answer


@app.route("/optimize", methods=["POST"])
def optimize_resources():
    data = request.json
    if not data:
        return jsonify({"error": "No data provided"})

    model = LpProblem(name="resource-allocation", sense=LpMaximize)

    x = {i: LpVariable(name=f"x{i}", lowBound=0) for i in range(len(data["resources"]))}

    model += (
        lpSum(data["profits"][i] * x[i] for i in range(len(data["resources"]))),
        "Profit",
    )

    for i in range(len(data["resources"])):
        model += x[i] <= data["resources"][i]

    model.solve()

    allocation = [x[i].value() for i in range(len(data["resources"]))]

    return jsonify({"optimized_allocation": allocation})


if __name__ == "__main__":
    app.run(debug=True, port=5000)
