import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
const LoadingSpinnerRedirect: React.FC = () => {
    const navigate = useNavigate()
    const [redirect, setRedirect] = useState<boolean>(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      setRedirect(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);
  if (redirect) {
    navigate("/")
  }
  return (
    <div className="text-center mt-5">
      <p className="mt-2"><FontAwesomeIcon icon={faSpinner} spin />&nbsp;
      Redirecting to Login page...</p>
    </div>
  );
};
export default LoadingSpinnerRedirect;