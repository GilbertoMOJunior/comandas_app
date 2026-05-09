import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import {
  TextField,
  Button,
  Box,
  Typography,
  Paper,
  IconButton,
  InputAdornment,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Person,
  Lock,
} from '@mui/icons-material';
import useValidationRules, { masks, onlyDigits } from '../../hooks/useValidationRules';

const LoginForm = () => {
  const validationRules = useValidationRules();
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    setFocus,
  } = useForm({ mode: 'onChange' });
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    setFocus('cpf');
  }, [setFocus]);

  const onSubmit = async (data) => {
    setEnviando(true);
    setErro('');
    try {
      await login(onlyDigits(data.cpf), data.senha);
    } catch (e) {
      setErro(e.message || 'Não foi possível conectar à API.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: 'calc(100vh - 100px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Paper
        elevation={10}
        sx={{
          p: { xs: 3, sm: 5 },
          maxWidth: 420,
          width: '100%',
          borderRadius: 4,
          background: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box
            component="img"
            src="/WhatsApp Image.jpeg"
            alt="Comandas do Zé"
            sx={{
              width: 120,
              height: 120,
              mx: 'auto',
              mb: 2,
              borderRadius: '50%',
              objectFit: 'cover',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
            }}
          />
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 700,
              background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              mb: 1,
            }}
          >
            Comandas do Zé
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Faça login para acessar o sistema
          </Typography>
        </Box>

        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <Controller
            name="cpf"
            control={control}
            defaultValue=""
            rules={validationRules.cpf}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="CPF"
                placeholder="000.000.000-00"
                title="Digite seu CPF"
                margin="normal"
                required
                onChange={(e) => field.onChange(masks.cpf(e.target.value))}
                error={!!errors.cpf}
                helperText={errors.cpf?.message}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person color="action" />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{ mb: 1 }}
              />
            )}
          />
          <Controller
            name="senha"
            control={control}
            defaultValue=""
            rules={validationRules.senha}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Senha"
                placeholder="Mínimo 6 caracteres"
                title="Digite sua senha"
                type={showPassword ? 'text' : 'password'}
                margin="normal"
                required
                error={!!errors.senha}
                helperText={errors.senha?.message}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword((v) => !v)}
                          edge="end"
                          size="small"
                          tabIndex={-1}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{ mb: 3 }}
              />
            )}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={!isValid || enviando}
            startIcon={enviando ? <CircularProgress size={18} color="inherit" /> : null}
            sx={{
              py: 1.5,
              fontSize: '1rem',
              background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
              },
            }}
          >
            {enviando ? 'Entrando...' : 'Entrar'}
          </Button>
        </Box>
      </Paper>

      <Snackbar
        open={!!erro}
        autoHideDuration={5000}
        onClose={() => setErro('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="error" variant="filled" onClose={() => setErro('')}>
          {erro}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default LoginForm;
