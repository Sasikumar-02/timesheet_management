import React, { useState, ChangeEvent, FormEvent } from "react";
import { Input, notification } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { useMsal } from '@azure/msal-react';
import asset from "../../assets/images/asset.svg";
import mindgraph from "../../assets/images/mindgraph-logo.png";
import "../Styles/Login.css";
import api from '../../Api/Api-Service'
interface LoginState {
  userName: string;
  emailError: string;
  password: string;
  passwordError: string;
}

const Login: React.FC = () => {
  const host_name= process.env.Host_name || "http://localhost:9090"
  const { instance } = useMsal();
  const navigate = useNavigate();
  const [state, setState] = useState<LoginState>({
    userName: "",
    emailError: "",
    password: "",
    passwordError: ""
  });

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setState((prevState) => ({
      ...prevState,
      userName: inputValue,
      emailError: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inputValue)
        ? ""
        : "Invalid Email",
    }));
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setState((prevState) => ({
      ...prevState,
      password: inputValue,
      passwordError: /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-zA-Z]).{8,}$/.test(
        inputValue
      )
        ? ""
        : "Password must be at least 8 characters and include a number and a special character (!@#$%^&*)",
    }));
  };

  const isLoginDisabled =!state.userName || !state.password || state.emailError || state.passwordError;
  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (!isLoginDisabled) {
      try {
        const loginResponse = await api.post("http://localhost:9090/api/auth/login",
          {
            userName: state.userName,
            password: state.password,
          }
        );
        console.log(loginResponse);
        localStorage.setItem("email", loginResponse.data.response.data.email);
        console.log(localStorage.getItem("email"));
        notification.success({
          message: "Login Successful",
          description: "OTP has been sent to your email.",
        });
        navigate("/otp");
      } catch (error) {
        console.error("Login error:", error);
        notification.error({
          message: "Login Failed",
          description: "Please try again.",
        });
      }
    }
  };
  // const handleMicrosoftLogin = async () => {
  //   try {
  //     const response = await instance.loginPopup();
  //     console.log(response);
  //     localStorage.setItem("token", response.accessToken);
  //     notification.success({
  //       message: "Login Successful",
  //       description: "Microsoft Login Successful",
  //     });
  //     navigate("/dashboard");
  //     window.location.reload();
  //   } catch (error) {
  //     console.error('Login failed', error);
  //     notification.error({
  //       message: "Microsoft Login Failed",
  //       description: "Please try again.",
  //     });
  //   }
  // };    
  return (
    <div className="form">
      <form className="innerform">
        <div className="left-section">
          <img src={asset} alt="logo" />
          <div className="left-text">
            <center>
              Empower Your Team, Elevate Your Business: Streamlining Success
              with Efficient Asset Management
            </center>
          </div>
        </div>
        <div className="right-section">
          <img src={mindgraph} alt="mindgraph" />
          <h3>Good to See you again</h3>
          <div className="text">
            <div className="layout">
              <label id="text">E-mail ID</label>
            </div>
            <Input
              placeholder="Enter your E-mail ID"
              value={state.userName}
              onChange={handleEmailChange}
              prefix={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 32 32"
                  fill="none"
                >
                  <g clipPath="url(#clip0_11_8)">
                    <path
                      d="M26.6667 5.33331H5.33335C3.86669 5.33331 2.68002 6.53331 2.68002 7.99998L2.66669 24C2.66669 25.4666 3.86669 26.6666 5.33335 26.6666H26.6667C28.1334 26.6666 29.3334 25.4666 29.3334 24V7.99998C29.3334 6.53331 28.1334 5.33331 26.6667 5.33331ZM26.6667 10.6666L16 17.3333L5.33335 10.6666V7.99998L16 14.6666L26.6667 7.99998V10.6666Z"
                      fill="#041724"
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_11_8">
                      <rect width="32" height="32" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
              }
            />
            <div className="error">{state.emailError}</div>
            <div className="layout">
              <label id="text"> Password </label>
            </div>
            <Input.Password
              placeholder="Enter your Password"
              value={state.password}
              onChange={handlePasswordChange}
              prefix={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 32 32"
                  fill="none"
                >
                  <g clipPath="url(#clip0_200_2756)">
                    <path
                      d="M24 10.6667H22.6666V8.00004C22.6666 4.32004 19.68 1.33337 16 1.33337C12.32 1.33337 9.33331 4.32004 9.33331 8.00004V10.6667H7.99998C6.53331 10.6667 5.33331 11.8667 5.33331 13.3334V26.6667C5.33331 28.1334 6.53331 29.3334 7.99998 29.3334H24C25.4666 29.3334 26.6666 28.1334 26.6666 26.6667V13.3334C26.6666 11.8667 25.4666 10.6667 24 10.6667ZM16 22.6667C14.5333 22.6667 13.3333 21.4667 13.3333 20C13.3333 18.5334 14.5333 17.3334 16 17.3334C17.4666 17.3334 18.6666 18.5334 18.6666 20C18.6666 21.4667 17.4666 22.6667 16 22.6667ZM20.1333 10.6667H11.8666V8.00004C11.8666 5.72004 13.72 3.86671 16 3.86671C18.28 3.86671 20.1333 5.72004 20.1333 8.00004V10.6667Z"
                      fill="#041724"
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_200_2756">
                      <rect width="32" height="32" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
              }
            />
            <div className="error">{state.passwordError}</div>
            <div className="forget">
              <Link id="fp" to="/forgetPassword">
                Forget Password?
              </Link>
            </div>
          </div>
          <div>
            <button
              id="login"
              type="submit"
              onClick={handleLogin}
            >
              LOGIN
            </button>
          </div>
    {/* <div className="oauth-container">
          <Tooltip title="Login with Microsoft" placement="bottom">
            <Button
              id="oauth"
              type="primary"
              onClick={handleMicrosoftLogin}
              style={{
                width: 'calc(100% - 40px)', 
                borderRadius: '20px', 
                marginTop: '16px', 
                backgroundColor: '#ffff',
                borderColor: '#ffff', 
              }}
            >
              <WindowsOutlined style={{ color: 'black', marginRight: '8px',fontSize:'larger' }} />
              Login with Microsoft
            </Button>
          </Tooltip>
        </div> */}
        </div>
      </form>
    </div>
  );
};

export default Login
