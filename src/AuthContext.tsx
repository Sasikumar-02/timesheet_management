import { AxiosResponse } from 'axios';
import api from './Api/Api-Service';
class AuthService {
  static async refreshAccessToken(): Promise<void> {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      const response: AxiosResponse<{ token: string }> = await api.post(
        '/api/auth/refreshtoken',
        { refreshToken }
      );
      console.log(response);

      const newAccessToken = response.data.token;
      localStorage.setItem('token', newAccessToken);
    } catch (error) {
      console.error('Failed to refresh access token:', error);
      throw error;
    }
  }
  static async logout(): Promise<void> {
    try {

      const accessToken = localStorage.getItem('token');
      await api.post('/api/auth/logout', { accessToken });
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }
}

setInterval(async () => {
  try {
    await AuthService.refreshAccessToken();
  } catch (error) {
    console.error('Error during token refresh:', error);
  }
}, 70000);

export default AuthService;
