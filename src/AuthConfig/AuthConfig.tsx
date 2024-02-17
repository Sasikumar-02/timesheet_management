export const msalConfig = {
    auth: {
      clientId: '564bfe76-3e07-447c-8fed-74ddae90f041',
      authority: 'https://login.microsoftonline.com/9d666f97-1ab0-4ebf-a6da-0798b0314440',
      redirectUri: 'http://localhost:3000/otp.tsx',
    },
    cache: {
      cacheLocation: 'sessionStorage', 
    },
  } as const;
  