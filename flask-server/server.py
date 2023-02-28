from flask import Flask, jsonify, request
import pickle
import csv
import os
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

pipeline = pickle.load(open("../model/pipeline.pkl", "rb"))

#prediction = pipeline.predict(
#    [['operations', 0, 0.57, 3, 'low', 5, 0.62, 0, 180]])

@app.route("/predict", methods = ['POST'])
def getEmployeeTurnOver():
    print(request.form)
    department = request.form['department']
    promoted = int(request.form['promoted'])
    review = float(request.form['review'])
    projects = int(request.form['projects'])
    salary = request.form['salary']
    tenure = float(request.form['tenure'])
    satisfaction = float(request.form['satisfaction'])
    bonus = int(request.form['bonus'])
    avg_hrs_month = float(request.form['avg_hrs_month'])
    prediction = pipeline.predict([[department,promoted, review, projects, salary, tenure, satisfaction, bonus, avg_hrs_month]])
    data = {
        "prediction" : int(prediction[0])
    }
    return jsonify(data)

@app.route("/predictions", methods = ['POST'])
def getEmployeesTurnOver():
    uploaded_file = request.files['employees'] # This line uses the same variable and worked fine
    filePath = os.path.join("./uploads", uploaded_file.filename)
    uploaded_file.save(filePath)
    res = []
    predictionInputs = []
    with open(filePath) as file:
        csv_file = csv.reader(file)
        index = 0
        for row in csv_file:
            if index == 0 :
                index += 1
                continue
            result = {}
            result['name'] = row[0]
            result['department'] = row[1]
            result['promoted'] = int(row[2])
            result['review'] = float(row[3])
            result['projects'] = int(row[4])
            result['salary'] = row[5]
            result['tenure'] = float(row[6])
            result['satisfaction'] = float(row[7])
            result['bonus'] = int(row[8])
            result['avg_hrs_month'] = float(row[9])
            result['index'] = index  
            res.append(result)
            predictionInputs.append([result['department'], result['promoted'], result['review'], result['projects'], result['salary'], result['tenure'], result['satisfaction'], result['bonus'], result['avg_hrs_month']])
    predictions = pipeline.predict(predictionInputs)
    data = {
        "prediction" : list(map( lambda x : { **x, 'result' : int(predictions[x['index']])}   ,res))
    }
    os.remove(filePath)
    return jsonify(data)


if __name__ == "__main__":
    app.run(debug=True)
