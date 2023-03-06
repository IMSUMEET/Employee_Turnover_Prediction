import pickle
import csv
import os
import sqlite3
from flask import Flask, jsonify, request, g 
from flask_cors import CORS 
from dotenv import dotenv_values
from passlib.hash import pbkdf2_sha256
from functools import wraps
import jwt
from datetime import datetime, timedelta

config = dotenv_values(".env") 

app = Flask(__name__)
app.secret_key = config["SECRET_KEY"]
CORS(app, supports_credentials=True)

pipeline = pickle.load(open("./pipeline.pkl", "rb"))

#prediction = pipeline.predict(
#    [['operations', 0, 0.57, 3, 'low', 5, 0.62, 0, 180]])

# decorator for verifying the JWT
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        # jwt is passed in the request header
        if 'x-access-token' in request.headers:
            token = request.headers['x-access-token']
        # return 401 if token is not passed
        if not token:
            return jsonify({'message' : 'Token is missing !!'}), 401
  
        try:
            # decoding the payload to fetch the stored details
            data = jwt.decode(token, config['SECRET_KEY'], algorithms=['HS256'])
        except Exception as e:
            print(e)
            return jsonify({
                'message' : 'Token is invalid !!'
            }), 401
        # returns the current logged in users context to the routes
        return  f(data, *args, **kwargs)
  
    return decorated


@app.route("/registration", methods = ['POST'])
def registerUser():
    username = request.form.get('username')
    password = request.form.get('password')     
    db = get_db()
    curr = db.cursor()
    query = curr.execute("select * from users where username=:username",{"username" : username})
    result = query.fetchall()
    if len(result) == 0:
        curr.execute("insert into users (username, password) values (?, ?)", (username,pbkdf2_sha256.hash(password)))
        db.commit()
        return jsonify({"success" : True})
    return jsonify({"success" : False})


@app.route("/login", methods = ['POST'])
def loginUser():
    if(request.method == 'POST'):
        username = request.form.get('username')
        password = request.form.get('password')     
        curr = get_db().cursor()
        query = curr.execute("select * from users where username=:username",{"username" : username})
        result = query.fetchall()
        if len(result) != 0:
            user = result[0][1]
            userPass = result[0][2]
            if pbkdf2_sha256.verify(password, userPass):
                token = jwt.encode({'public_id': user[0][0],'exp' : datetime.utcnow() + timedelta(minutes = 30)}, config['SECRET_KEY'])
                return jsonify({"success" : True, "token" : token})
    return jsonify({"success" : False})

@app.route("/predict", methods = ['POST'])
@token_required
def getEmployeeTurnOver(user):
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
    response = jsonify(data)
    response.headers["Access-Control-Allow-Credentials"] = "true"
    return response

@app.route("/predictions", methods = ['POST'])
@token_required
def getEmployeesTurnOver(user):
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
            index += 1
    predictions = pipeline.predict(predictionInputs)
    data = {
        "prediction" : list(map( lambda x : { **x, 'result' : int(predictions[x['index']-1])}   ,res))
    }
    os.remove(filePath)
    response = jsonify(data)
    return response

def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect('./users.db')
    return db

@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

if __name__ == "__main__":
    app.run(debug=True, port=5001)
