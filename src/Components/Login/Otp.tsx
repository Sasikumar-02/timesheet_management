import React, { useState, useEffect, ChangeEvent, FormEvent, useRef  } from "react";
import { Button,notification } from "antd";
import "../Styles/Login.css";
import { Navigate, useNavigate } from "react-router-dom";
import asset from "../../assets/images/asset.svg";
import mindgraph from "../../assets/images/mindgraph-logo.png";
import api from "../../Api/Api-Service";

interface OtpState {
  otp: string;
  otpError: string;
  showRegenerateButton: boolean;
}

const Otp: React.FC = () => {
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const inputRefs = useRef<Array<HTMLInputElement | null>>(Array(6).fill(null));
  const navigate = useNavigate();

  const [state, setState] = useState<OtpState>({
    otp: "",
    otpError: "",
    showRegenerateButton: false,
  });

  const enableRegenerateButton = () => {
    setState((prevState) => ({
      ...prevState,
      showRegenerateButton: true,
    }));
  };

  const disableRegenerateButton = () => {
    setState((prevState) => ({
      ...prevState,
      showRegenerateButton: false,
    }));
    setTimeout(enableRegenerateButton, 60000);
  };

  const handleRegenerateOTP = async () => {
    try {
      disableRegenerateButton();
      const email = localStorage.getItem("email");
      const response = await api.post("http://localhost:9090/api/auth/otp/regenerate",
        {
          email,
        }
      );
    } catch (error) {
      console.error("Error regenerating OTP:", error);
    }
  };

  const verifyOTP = async (enteredOTP: string): Promise<boolean> => {
    try {
      const email = localStorage.getItem("email");
      const response = await api.post("http://localhost:9090/api/auth/validateOtp",
        {
          email,
          otp: enteredOTP,
        }
      );
      const data = response.data;
      localStorage.setItem("token", data.response.data.token);
      localStorage.setItem("refreshToken", data.response.data.refreshToken);
      localStorage.setItem("userName", data.response.data.userName);
      localStorage.setItem("userEmail", data.response.data.userEmail);

      console.log(data.status);
      return data.status === "OK";
      
    } catch (error) {
      console.error("Error verifying OTP:", error);
      return false;
    }
  };

  // const handleVerifyOTP = async (e: FormEvent) => {
  //   e.preventDefault();

  //   const enteredOTP = otp.join('');

  //   if (enteredOTP.length !== 6 || !/^\d+$/.test(enteredOTP)) {
  //     setState((prevState) => ({
  //       ...prevState,
  //       otpError: "Please enter a valid 6-digit OTP",
  //     }));
  //   } else {
  //     const isOTPValid = await verifyOTP(enteredOTP);
  //     console.log("Is OTP Valid?", isOTPValid);

  //     if (isOTPValid) {
  //       navigate("/dashboard");
  //     } else {
  //       setState((prevState) => ({
  //         ...prevState,
  //         otpError: "Invalid OTP. Please try again.",
  //       }));
  //       notification.error({
  //         message: "Invalid OTP",
  //         description: "Please try again.",
  //         duration:10,
  //       });
  
  //       setTimeout(() => {
  //         navigate("/otp");
  //         window.location.reload();
  //       }, 5000);
  //     }
  //   }
  // };

  const handleVerifyOTP = async (e: FormEvent) => {
    e.preventDefault();
  
    const enteredOTP = otp.join('');
  
    if (enteredOTP.length !== 6 || !/^\d+$/.test(enteredOTP)) {
      setState((prevState) => ({
        ...prevState,
        otpError: "Please enter a valid 6-digit OTP",
      }));
    } else {
      const isOTPValid = await verifyOTP(enteredOTP);
      console.log("Is OTP Valid?", isOTPValid);
      if (isOTPValid) {
        navigate("/dashboard");
      } else {
        setState((prevState) => ({
          ...prevState,
          otpError: "Invalid OTP. Please try again.",
        }));
        notification.error({
          message: "Invalid OTP",
          description: "Please try again.",
          duration: 10,
        });
      }
    }
  };
  
  const handleOtpChange = (index: number, value: string) => {
    const numericValue = value.replace(/\D/g, '');
    const newOtp = [...otp];
    newOtp[index] = numericValue;
    setOtp(newOtp);
    if (numericValue && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus?.();
    }
    if (!numericValue && index > 0 && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1]?.focus?.();
    }
  };
            
  useEffect(() => {
    const timeoutId = setTimeout(enableRegenerateButton, 60000);
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div className="form">
      <form className="innerform">
        <div className="left-section">
          <img src={asset} alt="logo" />
          <div className="left-text"></div>
        </div>
        <div className="right-section">
          <img src={mindgraph} alt="mindgraph" />
          <h3>Good to See you again</h3>
          <div className="otp-form">
            <h3>Enter your OTP</h3>
            <div className="text">
              <div style={{ display: "flex", gap: "5px" }}>
                {otp.map((digit, index) => (
                <input
                className="otpbox"
                  key={index}
                  required
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    handleOtpChange(index, e.target.value)}
                  ref={(el) => (inputRefs.current[index] = el)} />
                  ))}
               </div>
               <div className="error">{state.otpError}</div>
             </div>
             <div>
            <button id="loginbutton" type="submit" onClick={handleVerifyOTP}>  VERIFY OTP </button>
            </div>
             <div>
               {state.showRegenerateButton ? (
                <Button
                  className="regenerateactive"
                  type="link"
                  onClick={handleRegenerateOTP}
                > REGENERATE OTP </Button>
              ) : (
                <Button
                  className="regeneratedisabled"
                  type="link"
                  disabled > REGENERATE OTP </Button>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Otp;


 

 
       