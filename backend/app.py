from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
from sklearn.linear_model import LinearRegression
from pulp import LpMaximize, LpProblem, LpVariable, lpSum
from pmdarima import auto_arima

app = Flask(__name__)
CORS(app)

@app.route('/upload', methods=['POST'])
def upload_data():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'})

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'})

    # For simplicity, let's assume it's a CSV file and load it into a pandas DataFrame
    df = pd.read_csv(file)
    
    # Here, you can add data preprocessing, cleaning, and validation as needed
    
    return jsonify({'message': 'File uploaded and processed successfully', 'data': df.to_dict()})

@app.route('/forecast', methods=['POST'])
def forecast_demand():
    data = request.json
    if not data:
        return jsonify({'error': 'No data provided'})

    df = pd.DataFrame(data)
    demand_data = df['demand']

    model = auto_arima(demand_data, seasonal=False, trace=True, suppress_warnings=True)
    model.fit(demand_data)
    future_demand, conf_int = model.predict(n_periods=1, return_conf_int=True)

    return jsonify({
        'future_demand': future_demand.tolist(),
        'confidence_interval': conf_int.tolist(),
        'model_summary': str(model.summary())
    })


@app.route('/optimize', methods=['POST'])
def optimize_resources():
    data = request.json
    if not data:
        return jsonify({'error': 'No data provided'})

    # We'll use linear programming for resource allocation optimization as an example
    model = LpProblem(name="resource-allocation", sense=LpMaximize)

    # Create decision variables
    x = {i: LpVariable(name=f"x{i}", lowBound=0) for i in range(len(data['resources']))}

    # Objective function
    model += lpSum(data['profits'][i] * x[i] for i in range(len(data['resources']))), "Profit"

    # Constraints
    for i in range(len(data['resources'])):
        model += (x[i] <= data['resources'][i])

    # Solve the optimization problem
    model.solve()

    # Get the optimized resource allocation
    allocation = [x[i].value() for i in range(len(data['resources']))]

    return jsonify({'optimized_allocation': allocation})

@app.route('/realtime', methods=['GET'])
def get_realtime_data():
    # In a real scenario, this endpoint would connect to a real-time data source or database
    # For this example, we'll return a sample real-time data
    
    realtime_data = {
        'ships_in_port': 5,
        'available_berths': 2,
        'ongoing_operations': 3,
        'available_equipment': 10
    }

    return jsonify({'realtime_data': realtime_data})

if __name__ == '__main__':
    app.run(debug=True, port=5000)