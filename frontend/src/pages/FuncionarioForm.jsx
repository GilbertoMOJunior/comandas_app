import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  TextField,
  Button,
  Box,
  Snackbar,
  Alert,
  Typography,
  MenuItem,
  IconButton,
  InputAdornment,
  Grid,
  CircularProgress,
} from '@mui/material';
import { Save, Cancel, Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import PageLayout from '../components/common/PageLayout';
import {
  useValidationRules,
  masks,
  onlyDigits,
  formatCpf,
  formatTelefone,
} from '../hooks/useValidationRules';
import funcionarioService, { GRUPOS } from '../services/funcionarioService';

const FuncionarioForm = () => {
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    setFocus,
    watch,
    reset,
  } = useForm({ mode: 'onChange' });
  const validationRules = useValidationRules();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [carregando, setCarregando] = useState(isEdit);

  const nomeValue = watch('nome', '');

  useEffect(() => {
    if (isEdit) {
      (async () => {
        try {
          const f = await funcionarioService.getById(id);
          reset({
            nome: f.nome || '',
            cpf: formatCpf(f.cpf),
            telefone: formatTelefone(f.telefone),
            matricula: f.matricula || '',
            grupo: f.grupo || '',
            senha: '',
          });
        } catch (e) {
          setErro(e.message || 'Erro ao carregar funcionário');
        } finally {
          setCarregando(false);
        }
      })();
    } else {
      setFocus('nome');
    }
  }, [id, isEdit, reset, setFocus]);

  const onSubmit = async (data) => {
    setEnviando(true);
    setErro('');
    try {
      const payload = {
        nome: data.nome,
        matricula: data.matricula,
        cpf: onlyDigits(data.cpf),
        telefone: onlyDigits(data.telefone),
        grupo: Number(data.grupo),
      };
      if (isEdit) {
        if (data.senha) payload.senha = data.senha;
        await funcionarioService.update(id, payload);
      } else {
        payload.senha = data.senha;
        await funcionarioService.create(payload);
      }
      setSucesso(true);
      setTimeout(() => navigate('/funcionarios'), 1000);
    } catch (e) {
      setErro(e.message || 'Erro ao salvar funcionário');
    } finally {
      setEnviando(false);
    }
  };

  if (carregando) {
    return (
      <PageLayout title="Editar Funcionário">
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      </PageLayout>
    );
  }

  return (
    <PageLayout title={isEdit ? 'Editar Funcionário' : 'Novo Funcionário'}>
      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ maxWidth: 760 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <Controller
              name="nome"
              control={control}
              defaultValue=""
              rules={validationRules.nome}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Nome Completo"
                  placeholder="Nome do funcionário"
                  title="Nome completo"
                  fullWidth
                  required
                  error={!!errors.nome}
                  helperText={errors.nome?.message || `${nomeValue.length}/100 caracteres`}
                  slotProps={{ htmlInput: { maxLength: 100 } }}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="cpf"
              control={control}
              defaultValue=""
              rules={validationRules.cpf}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="CPF"
                  placeholder="000.000.000-00"
                  title="Apenas números"
                  fullWidth
                  required
                  onChange={(e) => field.onChange(masks.cpf(e.target.value))}
                  error={!!errors.cpf}
                  helperText={errors.cpf?.message}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="telefone"
              control={control}
              defaultValue=""
              rules={{ ...validationRules.telefone, required: 'Telefone é obrigatório' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Telefone"
                  placeholder="(00) 00000-0000"
                  title="Telefone para contato"
                  fullWidth
                  required
                  onChange={(e) => field.onChange(masks.telefone(e.target.value))}
                  error={!!errors.telefone}
                  helperText={errors.telefone?.message}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="matricula"
              control={control}
              defaultValue=""
              rules={validationRules.matricula}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Matrícula"
                  placeholder="00001"
                  fullWidth
                  required
                  error={!!errors.matricula}
                  helperText={errors.matricula?.message}
                  slotProps={{ htmlInput: { maxLength: 11 } }}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="grupo"
              control={control}
              defaultValue=""
              rules={validationRules.grupo}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Grupo"
                  select
                  fullWidth
                  required
                  error={!!errors.grupo}
                  helperText={errors.grupo?.message}
                >
                  {Object.entries(GRUPOS).map(([value, label]) => (
                    <MenuItem key={value} value={Number(value)}>
                      {label}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Controller
              name="senha"
              control={control}
              defaultValue=""
              rules={
                isEdit
                  ? {
                      minLength: { value: 6, message: 'Senha deve ter pelo menos 6 caracteres' },
                    }
                  : validationRules.senha
              }
              render={({ field }) => (
                <TextField
                  {...field}
                  label={isEdit ? 'Nova Senha (opcional)' : 'Senha'}
                  placeholder={isEdit ? 'Deixe em branco para manter' : 'Mínimo 6 caracteres'}
                  fullWidth
                  required={!isEdit}
                  type={showPassword ? 'text' : 'password'}
                  error={!!errors.senha}
                  helperText={errors.senha?.message}
                  slotProps={{
                    input: {
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
                />
              )}
            />
          </Grid>
        </Grid>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4, gap: 1 }}>
          <Button startIcon={<Cancel />} onClick={() => navigate('/funcionarios')} disabled={enviando}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            startIcon={enviando ? <CircularProgress size={16} color="inherit" /> : <Save />}
            disabled={!isValid || enviando}
          >
            {isEdit ? 'Salvar' : 'Cadastrar'}
          </Button>
        </Box>

        <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
          * Campos obrigatórios
        </Typography>
      </Box>

      <Snackbar
        open={sucesso}
        autoHideDuration={2000}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" variant="filled">
          Funcionário salvo com sucesso!
        </Alert>
      </Snackbar>

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
    </PageLayout>
  );
};

export default FuncionarioForm;
