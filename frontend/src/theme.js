import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1e293b', light: '#334155' },
    secondary: { main: '#f59e0b', light: '#fbbf24' },
    success: { main: '#10b981' },
    error: { main: '#ef4444', light: '#f87171' },
    text: { primary: '#1e293b', secondary: '#64748b' },
    background: { default: '#f8fafc', paper: '#ffffff' },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  shape: { borderRadius: 8 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 600, borderRadius: 8 },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: { background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)' },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            transition: 'all 0.2s ease-in-out',
            '&:hover fieldset': { borderColor: '#f59e0b' },
            '&.Mui-focused fieldset': {
              borderColor: '#f59e0b',
              borderWidth: 2,
            },
            '&.Mui-focused': {
              backgroundColor: 'rgba(245, 158, 11, 0.04)',
            },
          },
          '& .MuiInputLabel-root.Mui-focused': {
            color: '#f59e0b',
            fontWeight: 600,
          },
        },
      },
    },
  },
});
