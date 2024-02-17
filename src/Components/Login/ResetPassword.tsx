import React, { useState, ChangeEvent } from "react";
import { Input, notification } from "antd";
import { useNavigate,} from "react-router-dom";
import "../Styles/Login.css";
import auth from "../../assets/images/auth.svg";
import mindgraph from "../../assets/images/mindgraph-logo.png";
import { useQuery } from "../../CustomHooks/Usequery";
import api from "../../Api/Api-Service";
interface ResetPasswordState {
    newPassword: string;
    confirmPassword: string;
    passwordError: string;
    confirmPasswordError: string;
}
const ResetPassword: React.FC = () => {
    const query = useQuery();
    const navigate = useNavigate();
    const [state, setState] = useState<ResetPasswordState>({
      newPassword: "",
      confirmPassword: "",
      passwordError: "",
      confirmPasswordError: "",
    });
    const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;
        setState((prevState) => ({
          ...prevState,
          newPassword: inputValue,
          passwordError: /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-zA-Z]).{8,}$/.test(inputValue)
            ? ""
            : "Password must be at least 8 characters and include a number and a special character (!@#$%^&*)",
        }));
      };
      const handleConfirmPasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;
        setState((prevState) => ({
          ...prevState,
          confirmPassword: inputValue,
          confirmPasswordError: inputValue === state.newPassword ? "" : "Passwords do not match",
        }));
      };
      const token = query.get("token");
      const HandleResetPassword = async () => {
        try {
          if (state.newPassword !== state.confirmPassword) {
            //checking if two passwords match
            setState((prevState) => ({ ...prevState, confirmPasswordError: "Passwords do not match" }));
            return;
          }
          // Api call
          const response = await api.post(
            `http://localhost:9090/api/auth/resetpassword?token=${token}`,
            {
              newPassword: state.newPassword,
              confirmPassword: state.confirmPassword,
            }
          );
          if (response.data.status === "OK") {
          notification.success({
            message: "Password Updated",
            description: "Password updated Successfully",
          });
            navigate("/");
          }
        } catch (error) {
          console.error("Error resetting password:", error);
          notification.error({
            message: "Error resetting password",
            description: "Error resetting password:"+ error,
          });
        }
      };
      return(
        <div className="form">
          <form className="innerform">
            <div className="left-section">
              <img src={auth} alt="logo" />
                <div className="left-text">
                </div>
            </div>
            <div className="right-section">
              <img src={mindgraph} alt="mindgraph" />
              <h3>Good to See you again</h3>
              <div className="text">
                <div className="layout">
                  <label id="text"> New Password </label>
                </div>
                <Input.Password
                  placeholder="Enter your Password"
                  value={state.newPassword}
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
                  <div className="layout">
                    <label id="text"> Confrim Password </label>
                  </div>
                  <Input.Password
                    placeholder="Enter your Password"
                    value={state.confirmPassword}
                    onChange={handleConfirmPasswordChange}
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
                  <div className="error">{state.confirmPasswordError}</div>
                  <div>
                    <button id="loginbutton" type="button" onClick={HandleResetPassword}>
                      RESET PASSWORD
                    </button>{" "}
                    {/* onclick is redirected to the login component */}
                  </div>
                </div>
            </div>
          </form>
        </div>
    );
};

export default ResetPassword