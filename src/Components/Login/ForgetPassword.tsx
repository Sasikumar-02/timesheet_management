// ForgetPassword.tsx

import React, { useState, ChangeEvent } from "react";
import { Input, notification } from "antd";
import { Link } from "react-router-dom";
import {
  Button,
  CardActions,
  CardContent,
  Divider,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import api from "../../Api/Api-Service";
import "../Styles/Login.css"; // Import your existing Login.css
import forgot from "../../assets/images/forgotpassword.svg";
import mindgraph from "../../assets/images/mindgraph-logo.png";

interface ForgetPasswordState {
  email: string;
  emailError: string;
  errorMessage: string | null;
}

const ForgetPassword: React.FC = () => {
  const [state, setState] = useState<ForgetPasswordState>({
    email: "",
    emailError: "",
    errorMessage: null,
  });

  const randomString = Math.random().toString(36).slice(8);
  const [captcha, setCaptcha] = useState(randomString);
  const [text, setText] = useState("");

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setState((prevState) => ({
      ...prevState,
      email: inputValue,
      emailError: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inputValue)
        ? ""
        : "Invalid Email",
    }));
  };

  const refreshString = () => {
    setCaptcha(Math.random().toString(36).slice(8));
  };

  const handleSendRequest = async () => {
    setState((prevState) => ({
      ...prevState,
      errorMessage: null,
    }));

    if (text !== captcha) {
      notification.error({
        message: "Invalid Captcha",
        description: "Please enter the valid captcha",
      });
      return;
    }

    if (!text) {
      notification.error({
        message: "Invalid Captcha",
        description: "Please enter the captcha",
      });
      return;
    }
    const apiEndpoint = "http://localhost:9090/api/auth/forgotpassword";
    const headers = {
      "Content-Type": "application/json",
    };
    const requestBody = {
      email: state.email,
    };

    try {
      const response = await api.post(apiEndpoint, requestBody, { headers });
      if (response.data.status === "OK") {
        const responseData = response.data.response;
        notification.success({
          message: "Mail sent Successfully",
          description:
            "Password reset link has been sent to your email." + responseData,
        });
      }
    } catch (error:any) {
      notification.error({
        message: "Error",
        description: `Error sending password change request: ${error.message}`,
      });
    }
  };

  return (
    <div className="form">
      <form className="innerform">
        <div className="left-section">
          <img src={forgot} alt="logo" />
        </div>
        <div className="right-section">
          <img src={mindgraph} alt="mindgraph" />
          <h3>Good to See you again</h3>
          <div className="text">
            <div className="layout">
              <label id="text">E-mail ID</label>
            </div>
            <Input
              value={state.email}
              onChange={handleEmailChange}
              placeholder="Enter your E-mail ID"
              prefix={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 32 32"
                  fill="none"
                >
                </svg>
              }
            />
            <div className="error">{state.emailError}</div>
            <div>
              <div className="layout">
                <label>Enter CAPTCHA</label>
              </div>
              <div className="card">
                <Input 
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Enter the Captcha"
                  className="Captcha-input"
                />
                <Divider />
                <CardContent>
                  <CardActions>
                    <div className="zigzag">{captcha}</div>
                    <Button
                      startIcon={<RefreshIcon />}
                      onClick={refreshString}
                      id="captchabutton"
                    ></Button>
                  </CardActions>
                </CardContent>
              </div>
            </div>
            {text !== "" && text !== captcha && (
              <div className="error">Invalid Captcha</div>
            )}
            <div>
              <button
                id="loginbutton"
                type="button"
                onClick={handleSendRequest}
                disabled={text !== captcha}
              >
                Next
              </button>
            </div>
            <div className="redirect">
              <Link id="fp" to="/">
                Back to Login Page
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ForgetPassword;
