
# Employee Turnover Prediction System

The employee turnover prediction system is a web application that utilizes machine learning algorithms to predict the likelihood of an employee leaving an organization. This system is designed to help human resource departments and managers proactively identify employees who are at risk of leaving the company, allowing them to take steps to retain valuable employees and reduce turnover. The system is intended for use in any organization that wants to improve employee retention and reduce the costs associated with turnover. It can be used by businesses of all sizes, from small startups to large corporations.


## Software requirements

1. VSCode
2. Python 3
3. Node.js
## Deployment

To deploy this project, follow these steps:


1. Open VSCode on the project files directory.

2. In the 'server' folder, create a file called '.env' and add the following line, replacing '<write row string>' with a secret string that should not be shared:
```bash
  SECRET_KEY = < write row string >
```
This key is used to encrypt sensitive data and should be kept secret.

3. Navigate to the 'server' folder in the terminal and run the following commands:
```bash
  cd server
```
```bash
  pip install -r reqirements.txt
```
```bash
  python src/server.py
```
This will install the necessary Python packages and start the server.

4. In a new terminal window, navigate to the client folder and run the following commands:
```bash
  cd client
```
```bash
  npm i
```
```bash
  npm run dev
```
