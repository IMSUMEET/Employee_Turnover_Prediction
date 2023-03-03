import pickle
import csv
import os
import sqlite3
from flask import Flask, jsonify, request, g, session
from flask_cors import CORS
from dotenv import dotenv_values
from passlib.hash import pbkdf2_sha256

config = dotenv_values(".env") 

app = Flask(__name__)
app.secret_key = config["SECRET_KEY"]
app.config["SESSION_COOKIE_NAME"] = config["COOKIE_SECRET"]
CORS(app)

pipeline = pickle.load(open("./pipeline.pkl", "rb"))

#prediction = pipeline.predict(
#    [['operations', 0, 0.57, 3, 'low', 5, 0.62, 0, 180]])


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

@app.route("/logout", methods = ['POST'])
def logoutUser():
    if 'user' in session:
        session.pop('user')
        return jsonify({"hadPrevilage" : True})
    return jsonify({"hadPrevilage" : False})
    

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
                session['user'] = user
                return jsonify({"success" : True})
    return jsonify({"success" : False})

@app.route("/predict", methods = ['POST'])
def getEmployeeTurnOver():
    if 'user' not in session:
        return jsonify({"access" : False})
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
    if 'user' not in session:
        return jsonify({"access" : False})
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
