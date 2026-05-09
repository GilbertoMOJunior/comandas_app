import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  TextField,
  Button,
  Box,
  Snackbar,
  Alert,
  Typography,
  Grid,
  CircularProgress,
} from '@mui/material';
import { Save, Cancel } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import PageLayout from '../components/common/PageLayout';
import {
  useValidationRules,
  masks,
  onlyDigits,
  formatCpf,
  formatTelefone,
} from '../hooks/useValidationRules';
import clienteService from '../services/clienteService';

const ClienteForm = () => {
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
  const [enviando, setEnviando] = useState(false);
  const [carregando, setCarregando] = useState(isEdit);

  const nomeValue = watch('nome', '');

  useEffect(() => {
    if (isEdit) {
      (async () => {
        try {
          const c = await clienteService.getById(id);
          reset({
            nome: c.nome || '',
            cpf: formatCpf(c.cpf),
            telefone: formatTelefone(c.telefone),
          });
        } catch (e) {
          setErro(e.message || 'Erro ao carregar cliente');
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
        cpf: onlyDigits(data.cpf),
        telefone: onlyDigits(data.telefone),
      };
      if (isEdit) {
        await clienteService.update(id, payload);
      } else {
        await clienteService.create(payload);
      }
      setSucesso(true);
      setTimeout(() => navigate('/clientes'), 1000);
    } catch (e) {
      setErro(e.message || 'Erro ao salvar cliente');
    } finally {
      setEnviando(false);
    }
  };

  if (carregando) {
    return (
      <PageLayout title="Editar Cliente">
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      </PageLayout>
    );
  }

  return (
    <PageLayout title={isEdit ? 'Editar Cliente' : 'Novo Cliente'}>
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
                  placeholder="Nome do cliente"
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
                  fullWidth
                  required
                  onChange={(e) => field.onChange(masks.telefone(e.target.value))}
                  error={!!errors.telefone}
                  helperText={errors.telefone?.message}
                />
              )}
            />
          </Grid>
        </Grid>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4, gap: 1 }}>
          <Button startIcon={<Cancel />} onClick={() => navigate('/clientes')} disabled={enviando}>
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
          Cliente salvo com sucesso!
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

export default ClienteForm;
