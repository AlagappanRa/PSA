from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
from sklearn.linear_model import LinearRegression
from pulp import LpMaximize, LpProblem, LpVariable, lpSum
from pmdarima import auto_arima
import joblib
from pymongo import MongoClient
import gridfs
import os

app = Flask(__name__)
CORS(app)

uri = "mongodb+srv://hoegpt:yJzfbBiMhZywyLRE@cluster0.fenmosq.mongodb.net/?retryWrites=true&w=majority&tlsAllowInvalidCertificates=true"

# Create a new client and connect to the server
client = MongoClient(uri)

db = client['modelDB']  # You can change 'modelDB' to your preferred database name
fs = gridfs.GridFS(db)

# Send a ping to confirm a successful connection
try:
    client.admin.command('ping')
    print("Pinged your deployment. You successfully connected to MongoDB!")
except Exception as e:
    print(e)

@app.route('/upload', methods=['POST'])
def upload_data():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'})

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'})

    df = pd.read_csv(file)
    
    return jsonify({'message': 'File uploaded and processed successfully', 'data': df.to_dict()})

@app.route('/train', methods=['POST'])
def train_model():
    data = request.json
    df = pd.DataFrame(data)
    X = df.drop(columns=['demand'])
    y = df['demand']

    model = LinearRegression()
    model.fit(X, y)

    joblib.dump(model, 'model.pkl')

    with open('model.pkl', 'rb') as f:
        fs.put(f, filename="model.pkl")

    os.remove('model.pkl')

    return jsonify({'message': 'Model trained and stored in MongoDB successfully'})

@app.route('/forecast', methods=['POST'])
def forecast_demand():
    data = request.json
    if not data:
        return jsonify({'error': 'No data provided'})

    # Convert the received JSON data to a DataFrame
    df = pd.DataFrame(data)

    # Assume we are using a Random Forest model for this example
    model = RandomForestRegressor()
    model.fit(df.drop(columns=['demand']), df['demand'])

    future_demand = model.predict(df.drop(columns=['demand']))

    return jsonify({'future_demand': future_demand.tolist()})

@app.route('/optimize', methods=['POST'])
def optimize_resources():
    data = request.json
    if not data:
        return jsonify({'error': 'No data provided'})

    model = LpProblem(name="resource-allocation", sense=LpMaximize)

    x = {i: LpVariable(name=f"x{i}", lowBound=0) for i in range(len(data['resources']))}

    model += lpSum(data['profits'][i] * x[i] for i in range(len(data['resources']))), "Profit"

    for i in range(len(data['resources'])):
        model += (x[i] <= data['resources'][i])

    model.solve()

    allocation = [x[i].value() for i in range(len(data['resources']))]

    return jsonify({'optimized_allocation': allocation})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
