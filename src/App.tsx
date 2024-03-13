import './App.css';
// import AppRoutes from './Routes/AppRoutes'
// import AuthRoutes from './Routes/AuthRoutes';
import { MsalProvider } from '@azure/msal-react';
import { msalConfig } from './AuthConfig/AuthConfig';
import { PublicClientApplication } from '@azure/msal-browser';
import { GlobalRouter } from './Routes/RouterProvider';
function App() {
  const token= localStorage.getItem('token');
  const msalInstance = new PublicClientApplication(msalConfig);
  return (
    <MsalProvider instance={msalInstance}>
      <div className="App">
        {/* {token ? (
          <AppRoutes />
        ) : (
          <AuthRoutes />
        )} */}
        <GlobalRouter/>
      </div>
      
    </MsalProvider>
  );
}
export default App;