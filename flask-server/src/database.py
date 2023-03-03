import sqlite3
from dotenv import dotenv_values
from passlib.hash import pbkdf2_sha256

config = dotenv_values(".env") 

connection = sqlite3.connect("users.db")
cursor = connection.cursor()

username = config["TEST_USER"]
password = pbkdf2_sha256.hash(config["TEST_PASSWORD"])

cursor.execute("create table users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, password TEXT)")
cursor.execute("insert into users (username, password) values (?, ?)",(username,password ))

connection.commit()
connection.close()