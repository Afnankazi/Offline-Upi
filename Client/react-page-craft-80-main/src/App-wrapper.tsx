
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';
import { UserProvider } from './context/UserContext';
import { Toaster } from '@/components/ui/sonner';

const AppWrapper = () => {
  return (
    <UserProvider>
      <Router>
        <App />
        <Toaster />
      </Router>
    </UserProvider>
  );
};

export default AppWrapper;
