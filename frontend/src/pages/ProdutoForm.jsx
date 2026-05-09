import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  TextField,
  Button,
  Box,
  InputLabel,
  Snackbar,
  Alert,
  Typography,
  Avatar,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import { PhotoCamera as PhotoCameraIcon, Save, Cancel, AttachMoney } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import PageLayout from '../components/common/PageLayout';
import { useValidationRules } from '../hooks/useValidationRules';
import produtoService, { fileToBase64, base64ToDataUri } from '../services/produtoService';

const ProdutoForm = () => {
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
  const [preview, setPreview] = useState(null);
  const [fotoBase64, setFotoBase64] = useState(null);
  const [fotoChanged, setFotoChanged] = useState(false);

  const nomeValue = watch('nome', '');
  const descricaoValue = watch('descricao', '');

  useEffect(() => {
    if (isEdit) {
      (async () => {
        try {
          const p = await produtoService.getById(id);
          reset({
            nome: p.nome || '',
            descricao: p.descricao || '',
            valor_unitario: p.valor_unitario ?? '',
          });
          if (p.foto) {
            setPreview(base64ToDataUri(p.foto));
            setFotoBase64(p.foto);
          }
        } catch (e) {
          setErro(e.message || 'Erro ao carregar produto');
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
        descricao: data.descricao,
        valor_unitario: parseFloat(data.valor_unitario),
      };
      if (!isEdit || fotoChanged) {
        payload.foto = fotoBase64;
      }
      if (isEdit) {
        await produtoService.update(id, payload);
      } else {
        await produtoService.create(payload);
      }
      setSucesso(true);
      setTimeout(() => navigate('/produtos'), 1000);
    } catch (e) {
      setErro(e.message || 'Erro ao salvar produto');
    } finally {
      setEnviando(false);
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      const b64 = await fileToBase64(file);
      setFotoBase64(b64);
      setFotoChanged(true);
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(file);
    } catch {
      setErro('Erro ao carregar imagem');
    }
  };

  if (carregando) {
    return (
      <PageLayout title="Editar Produto">
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      </PageLayout>
    );
  }

  return (
    <PageLayout title={isEdit ? 'Editar Produto' : 'Novo Produto'}>
      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ maxWidth: 720 }}>
        <Controller
          name="nome"
          control={control}
          defaultValue=""
          rules={validationRules.nome}
          render={({ field }) => (
            <TextField
              {...field}
              label="Nome"
              placeholder="Ex: Hambúrguer Clássico"
              title="Nome do produto"
              fullWidth
              required
              margin="normal"
              error={!!errors.nome}
              helperText={errors.nome?.message || `${nomeValue.length}/100 caracteres`}
              slotProps={{ htmlInput: { maxLength: 100 } }}
            />
          )}
        />

        <Controller
          name="descricao"
          control={control}
          defaultValue=""
          rules={validationRules.descricao}
          render={({ field }) => (
            <TextField
              {...field}
              label="Descrição"
              placeholder="Descreva os ingredientes do produto"
              title="Descrição detalhada"
              fullWidth
              required
              margin="normal"
              multiline
              rows={3}
              error={!!errors.descricao}
              helperText={errors.descricao?.message || `${descricaoValue.length}/200 caracteres`}
              slotProps={{ htmlInput: { maxLength: 200 } }}
            />
          )}
        />

        <Controller
          name="valor_unitario"
          control={control}
          defaultValue=""
          rules={validationRules.valor_unitario}
          render={({ field }) => (
            <TextField
              {...field}
              label="Valor Unitário"
              placeholder="0,00"
              title="Valor de venda em reais"
              fullWidth
              required
              margin="normal"
              type="number"
              error={!!errors.valor_unitario}
              helperText={errors.valor_unitario?.message}
              slotProps={{
                htmlInput: { step: '0.01', min: '0' },
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <AttachMoney color="action" />
                    </InputAdornment>
                  ),
                },
              }}
            />
          )}
        />

        <Box sx={{ mt: 3, mb: 2 }}>
          <InputLabel sx={{ mb: 1, fontWeight: 600 }}>Foto do Produto</InputLabel>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {preview && (
              <Avatar src={preview} variant="rounded" sx={{ width: 80, height: 80 }} />
            )}
            <input
              id="foto-upload"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            <label htmlFor="foto-upload" style={{ flex: 1 }}>
              <Button variant="outlined" component="span" startIcon={<PhotoCameraIcon />} fullWidth>
                {preview ? 'Trocar Foto' : 'Selecionar Foto'}
              </Button>
            </label>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4, gap: 1 }}>
          <Button startIcon={<Cancel />} onClick={() => navigate('/produtos')} disabled={enviando}>
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
          Produto salvo com sucesso!
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

export default ProdutoForm;
