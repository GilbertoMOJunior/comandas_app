import { useEffect, useState, useCallback, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  TextField,
  Button,
  Box,
  Snackbar,
  Alert,
  Typography,
  Grid,
  MenuItem,
  Paper,
  Divider,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Stack,
} from '@mui/material';
import { Save, Cancel, Add, Delete, Lock, Block } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import PageLayout from '../components/common/PageLayout';
import { useAuth } from '../context/AuthContext';
import comandaService, {
  statusLabel,
  statusColor,
  totalComanda,
} from '../services/comandaService';
import clienteService from '../services/clienteService';
import produtoService from '../services/produtoService';

const formatCurrency = (v) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(v) || 0);

const ComandaForm = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const isAdmin = usuario?.grupo === 1;

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    setFocus,
    reset,
  } = useForm({
    mode: 'onChange',
    defaultValues: { comanda: '', cliente_id: '' },
  });

  const [comanda, setComanda] = useState(null);
  const [itens, setItens] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [dialogAberto, setDialogAberto] = useState(false);
  const [novoItem, setNovoItem] = useState({ produto_id: '', quantidade: 1, valor_unitario: '' });

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      const [cli, prod] = await Promise.all([
        clienteService.list().catch(() => []),
        produtoService.list().catch(() => []),
      ]);
      setClientes(cli || []);
      setProdutos(prod || []);

      if (isEdit) {
        const c = await comandaService.getById(id);
        setComanda(c);
        reset({ comanda: c.comanda || '', cliente_id: c.cliente_id ?? '' });
        const its = await comandaService.listItens(id).catch(() => []);
        setItens(its || []);
      } else {
        setFocus('comanda');
      }
    } catch (e) {
      setErro(e.message || 'Erro ao carregar dados');
    } finally {
      setCarregando(false);
    }
  }, [id, isEdit, reset, setFocus]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const total = useMemo(() => totalComanda(itens), [itens]);

  const onSubmit = async (data) => {
    if (!usuario?.id) {
      setErro('Usuário não autenticado');
      return;
    }
    setEnviando(true);
    setErro('');
    try {
      if (isEdit) {
        const payload = {
          comanda: data.comanda,
          cliente_id: data.cliente_id === '' ? 0 : Number(data.cliente_id),
        };
        await comandaService.update(id, payload);
        setSucesso('Comanda atualizada!');
      } else {
        const payload = {
          comanda: data.comanda,
          status: 0,
          funcionario_id: usuario.id,
          cliente_id: data.cliente_id === '' ? null : Number(data.cliente_id),
        };
        const created = await comandaService.create(payload);
        setSucesso('Comanda aberta!');
        setTimeout(() => navigate(`/comanda/${created.id}`), 800);
        return;
      }
    } catch (e) {
      setErro(e.message || 'Erro ao salvar comanda');
    } finally {
      setEnviando(false);
    }
  };

  const abrirDialogItem = () => {
    setNovoItem({ produto_id: '', quantidade: 1, valor_unitario: '' });
    setDialogAberto(true);
  };

  const onProdutoSelecionado = (produtoId) => {
    const p = produtos.find((x) => x.id === Number(produtoId));
    setNovoItem((prev) => ({
      ...prev,
      produto_id: produtoId,
      valor_unitario: p ? String(p.valor_unitario) : '',
    }));
  };

  const adicionarItem = async () => {
    if (!novoItem.produto_id || !novoItem.quantidade || !novoItem.valor_unitario) {
      setErro('Preencha produto, quantidade e valor');
      return;
    }
    try {
      await comandaService.addItem(id, {
        produto_id: Number(novoItem.produto_id),
        funcionario_id: usuario.id,
        quantidade: Number(novoItem.quantidade),
        valor_unitario: parseFloat(novoItem.valor_unitario),
      });
      setDialogAberto(false);
      const its = await comandaService.listItens(id);
      setItens(its || []);
      setSucesso('Item adicionado!');
    } catch (e) {
      setErro(e.message || 'Erro ao adicionar item');
    }
  };

  const removerItem = async (itemId) => {
    if (!window.confirm('Remover este item?')) return;
    try {
      await comandaService.removeItem(itemId);
      setItens((prev) => prev.filter((x) => x.id !== itemId));
      setSucesso('Item removido!');
    } catch (e) {
      setErro(e.message || 'Erro ao remover item');
    }
  };

  const cancelarComanda = async () => {
    if (!window.confirm('Cancelar esta comanda?')) return;
    try {
      const updated = await comandaService.cancelar(id);
      setComanda(updated);
      setSucesso('Comanda cancelada!');
    } catch (e) {
      setErro(e.message || 'Erro ao cancelar comanda');
    }
  };

  const fecharComanda = async () => {
    if (!window.confirm('Fechar esta comanda?')) return;
    try {
      const updated = await comandaService.update(id, { status: 1 });
      setComanda(updated);
      setSucesso('Comanda fechada!');
    } catch (e) {
      setErro(e.message || 'Erro ao fechar comanda');
    }
  };

  if (carregando) {
    return (
      <PageLayout title={isEdit ? 'Editar Comanda' : 'Nova Comanda'}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      </PageLayout>
    );
  }

  const readOnly = isEdit && comanda && comanda.status !== 0;

  return (
    <PageLayout title={isEdit ? `Comanda ${comanda?.comanda || ''}` : 'Nova Comanda'}>
      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ maxWidth: 900 }}>
        {isEdit && comanda && (
          <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Chip label={statusLabel(comanda.status)} color={statusColor(comanda.status)} />
            <Typography variant="body2" color="text.secondary">
              Aberta em {new Date(comanda.data_hora).toLocaleString('pt-BR')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              · Funcionário: {comanda.funcionario?.nome || '—'}
            </Typography>
          </Box>
        )}

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="comanda"
              control={control}
              rules={{
                required: 'Identificação é obrigatória',
                maxLength: { value: 100, message: 'Máximo 100 caracteres' },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Comanda / Mesa"
                  placeholder="Ex: Mesa 5, #001..."
                  fullWidth
                  required
                  disabled={readOnly}
                  error={!!errors.comanda}
                  helperText={errors.comanda?.message}
                  slotProps={{ htmlInput: { maxLength: 100 } }}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="cliente_id"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Cliente (opcional)"
                  select
                  fullWidth
                  disabled={readOnly}
                >
                  <MenuItem value="">— Sem cliente —</MenuItem>
                  {clientes.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.nome}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Grid>
        </Grid>

        {!isEdit && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4, gap: 1 }}>
            <Button startIcon={<Cancel />} onClick={() => navigate('/comandas')} disabled={enviando}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={enviando ? <CircularProgress size={16} color="inherit" /> : <Save />}
              disabled={!isValid || enviando}
            >
              Abrir Comanda
            </Button>
          </Box>
        )}

        {isEdit && (
          <>
            <Paper variant="outlined" sx={{ mt: 3, p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Itens da comanda
                </Typography>
                {comanda?.status === 0 && (
                  <Button size="small" variant="contained" startIcon={<Add />} onClick={abrirDialogItem}>
                    Adicionar Item
                  </Button>
                )}
              </Box>
              <Divider sx={{ mb: 2 }} />

              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Produto</TableCell>
                      <TableCell sx={{ fontWeight: 700 }} align="right">Qtd</TableCell>
                      <TableCell sx={{ fontWeight: 700 }} align="right">Valor Unit.</TableCell>
                      <TableCell sx={{ fontWeight: 700 }} align="right">Subtotal</TableCell>
                      {comanda?.status === 0 && isAdmin && <TableCell />}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {itens.map((it) => (
                      <TableRow key={it.id}>
                        <TableCell>{it.produto?.nome || `#${it.produto_id}`}</TableCell>
                        <TableCell align="right">{it.quantidade}</TableCell>
                        <TableCell align="right">{formatCurrency(it.valor_unitario)}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>
                          {formatCurrency(Number(it.valor_unitario) * Number(it.quantidade))}
                        </TableCell>
                        {comanda?.status === 0 && isAdmin && (
                          <TableCell align="right">
                            <IconButton size="small" color="error" onClick={() => removerItem(it.id)}>
                              <Delete fontSize="small" />
                            </IconButton>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                    {itens.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                          Nenhum item na comanda.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Total: {formatCurrency(total)}
                </Typography>
              </Box>
            </Paper>

            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1}
              sx={{ mt: 4, justifyContent: 'flex-end' }}
            >
              <Button startIcon={<Cancel />} onClick={() => navigate('/comandas')}>
                Voltar
              </Button>
              {comanda?.status === 0 && isAdmin && (
                <Button
                  type="submit"
                  variant="outlined"
                  startIcon={<Save />}
                  disabled={!isValid || enviando}
                >
                  Salvar Alterações
                </Button>
              )}
              {comanda?.status === 0 && isAdmin && (
                <Button color="warning" variant="outlined" startIcon={<Block />} onClick={cancelarComanda}>
                  Cancelar Comanda
                </Button>
              )}
              {comanda?.status === 0 && isAdmin && (
                <Button color="success" variant="contained" startIcon={<Lock />} onClick={fecharComanda}>
                  Fechar Comanda
                </Button>
              )}
            </Stack>

            {!isAdmin && comanda?.status === 0 && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                Apenas administradores podem alterar itens, fechar ou cancelar a comanda.
              </Typography>
            )}
          </>
        )}
      </Box>

      <Dialog open={dialogAberto} onClose={() => setDialogAberto(false)} fullWidth maxWidth="sm">
        <DialogTitle>Adicionar Item</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0 }}>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Produto"
                select
                fullWidth
                value={novoItem.produto_id}
                onChange={(e) => onProdutoSelecionado(e.target.value)}
              >
                {produtos.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.nome} — {formatCurrency(p.valor_unitario)}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField
                label="Quantidade"
                type="number"
                fullWidth
                value={novoItem.quantidade}
                onChange={(e) => setNovoItem((p) => ({ ...p, quantidade: e.target.value }))}
                slotProps={{ htmlInput: { min: 1, step: 1 } }}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField
                label="Valor Unitário"
                type="number"
                fullWidth
                value={novoItem.valor_unitario}
                onChange={(e) => setNovoItem((p) => ({ ...p, valor_unitario: e.target.value }))}
                slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogAberto(false)}>Cancelar</Button>
          <Button onClick={adicionarItem} variant="contained" startIcon={<Add />}>
            Adicionar
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!sucesso}
        autoHideDuration={2500}
        onClose={() => setSucesso('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" variant="filled" onClose={() => setSucesso('')}>
          {sucesso}
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

export default ComandaForm;
