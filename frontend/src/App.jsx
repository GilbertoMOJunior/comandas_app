import { BrowserRouter } from 'react-router-dom';
import { Container, ThemeProvider, CssBaseline } from '@mui/material';
import { AuthProvider } from './context/AuthContext';
import { theme } from './theme';
import Navbar from './components/common/Navbar';
import AppRoutes from './routes/Router';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AuthProvider>
          <Navbar />
          <Container
            maxWidth={false}
            disableGutters
            sx={{
              mt: { xs: 1, sm: 2 },
              mb: { xs: 1, sm: 2 },
              px: { xs: 0, sm: 1 },
            }}
          >
            <AppRoutes />
          </Container>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
