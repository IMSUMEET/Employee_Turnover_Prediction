import React, { useState } from "react";
import Heading from "../components/Heading";
import wwwFormURLencode from "../utils/urlencode";

function Login({ onAuth, onBack }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const handleLogin = async (e) => {
    e.preventDefault();
    console.log(username, password);
    try {
      const form = {
        username,
        password,
      };
      const res = await fetch("http://127.0.0.1:5001/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: wwwFormURLencode(form),
      });
      const data = await res.json();
      console.log(data);
      if (!data.success) {
        setMessage("Login Failed! Please check your username and password.");
        return;
      }
      onAuth(data.token);
    } catch (e) {
      console.log(e);
    }
  };
  return (
    <div className="w-full px-40 py-10 bg-black text-teal-600 h-screen">
      <div className="w-full h-[calc(100%-40px)] p-8 bg-white border-teal-600 border rounded-lg shadow shadow-teal-600 grid gap-8 grid-cols-[320px_1fr]">
        <div className="w-full h-full bg-teal-400 flex items-center justify-center rounded-lg">
          <img
            alt="Login"
            src="/images/login.jpg"
            className="w-[320px]  rounded-xl"
          />
        </div>
        <div className="w-full h-full flex flex-col items-center justify-center">
          <div className="w-full flex items-center justify-end gap-8 pb-8 mb-auto">
            <Heading heading="Login" />
            <span className="ml-auto flex items-center gap-4 text-teal-600">
              Does not have an account !
              <button
                className="outline-none rounded-full px-4 py-2 bg-teal-600 text-white"
                onClick={onBack}
              >
                Register
              </button>
            </span>
          </div>
          <div className="flex flex-col gap-8 my-auto px-8 py-16 border border-teal-400 rounded-xl">
            {message !== "" && (
              <p className="text-white p-2 px-4 rounded-lg bg-black">{message}</p>
            )}
            <div>
              <h1 className="font-bold text-xl text-teal-600 mb-2">Username</h1>
              <input
                className="outline-none p-2 rounded-lg border border-teal-400 bg-white placeholder:text-teal-400 w-[480px] max-w-full"
                placeholder="Enter your username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <h1 className="font-bold text-xl text-teal-600 mb-2">Password</h1>
              <input
                className="outline-none p-2 rounded-lg border border-teal-400 bg-white placeholder:text-teal-400 w-[480px] max-w-full"
                placeholder="Enter your password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button
              onClick={handleLogin}
              className="outline-none px-4 py-2 rounded-lg w-full bg-teal-600 text-white"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
