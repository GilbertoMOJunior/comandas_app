import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Snackbar,
  Alert,
  TextField,
  Button,
  Divider,
  MenuItem,
  Stack,
} from '@mui/material';
import {
  Person,
  Schedule,
  Receipt,
  ArrowBack,
  CheckCircle,
  RestaurantMenu,
} from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PageLayout from '../../components/common/PageLayout';
import recebimentoService from '../../services/recebimentoService';
import clienteService from '../../services/clienteService';
import { base64ToDataUri } from '../../services/produtoService';
import { useAuth } from '../../context/AuthContext';

const formatCurrency = (v) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(v) || 0);

const formatDataHora = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const parseValor = (s) => {
  if (s === '' || s === null || s === undefined) return 0;
  const n = Number(String(s).replace(',', '.'));
  return Number.isFinite(n) && n >= 0 ? n : 0;
};

const CaixaConferencia = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { usuario } = useAuth();

  const idsParam = searchParams.get('ids') || '';
  const ids = useMemo(
    () =>
      idsParam
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    [idsParam]
  );

  const [detalhe, setDetalhe] = useState(null);
  const [clientes, setClientes] = useState([]);
  const [clienteIdSel, setClienteIdSel] = useState('');
  const [descontoStr, setDescontoStr] = useState('');
  const [acrescimoStr, setAcrescimoStr] = useState('');
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (ids.length === 0) {
      setErro('Nenhuma comanda selecionada.');
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const [det, cli] = await Promise.all([
          recebimentoService.detalharComandas(ids),
          clienteService.list().catch(() => []),
        ]);
        if (cancelled) return;
        setDetalhe(det);
        setClientes(cli || []);
        const clienteInicial = det?.comandas?.find((c) => c.cliente)?.cliente?.id;
        if (clienteInicial) setClienteIdSel(String(clienteInicial));
      } catch (e) {
        if (!cancelled) setErro(e.message || 'Erro ao carregar comandas.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [ids]);

  const subtotalGeral = detalhe?.subtotal_geral ?? 0;
  const desconto = parseValor(descontoStr);
  const acrescimo = parseValor(acrescimoStr);
  const valorFinal = Math.max(0, subtotalGeral - desconto + acrescimo);
  const valorFinalNegativo = subtotalGeral - desconto + acrescimo < 0;

  const finalizar = async () => {
    if (!detalhe || ids.length === 0) return;
    if (!usuario?.id) {
      setErro('Usuário não autenticado.');
      return;
    }
    if (valorFinalNegativo) {
      setErro('Valor final não pode ser negativo. Ajuste desconto ou acréscimo.');
      return;
    }
    setEnviando(true);
    setErro('');
    try {
      const payload = {
        comandas_ids: ids.map((x) => Number(x)),
        funcionario_id: Number(usuario.id),
        cliente_id: clienteIdSel ? Number(clienteIdSel) : null,
        desconto_valor: desconto,
        acrescimo_valor: acrescimo,
      };
      const res = await recebimentoService.recebimentoCompleto(payload);
      navigate(`/caixa/comprovante/${res.recebimento_id}`, { replace: true });
    } catch (e) {
      setErro(e.message || 'Erro ao finalizar recebimento.');
    } finally {
      setEnviando(false);
    }
  };

  if (loading) {
    return (
      <PageLayout title="Conferência de Comandas" maxWidth="xl">
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      </PageLayout>
    );
  }

  if (!detalhe) {
    return (
      <PageLayout title="Conferência de Comandas" maxWidth="xl">
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Typography color="text.secondary">Nenhum dado para exibir.</Typography>
          <Button
            sx={{ mt: 2 }}
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate('/caixa')}
          >
            Voltar ao dashboard
          </Button>
        </Box>
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
  }

  return (
    <PageLayout title="Conferência de Comandas" maxWidth="xl">
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        spacing={1}
        sx={{ mb: 2 }}
      >
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/caixa')}>
          Voltar ao dashboard
        </Button>
        <Chip
          icon={<Receipt />}
          label={`${detalhe.quantidade_comandas} comanda(s) selecionada(s)`}
          color="primary"
          variant="outlined"
        />
      </Stack>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Stack spacing={2}>
            {detalhe.comandas.map((c) => (
              <Paper key={c.id} variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={1}
                  justifyContent="space-between"
                  sx={{ mb: 1.5 }}
                >
                  <Box>
                    <Typography variant="overline" color="text.secondary">
                      Comanda
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 800 }}>
                      {c.comanda}{' '}
                      <Typography component="span" variant="caption" color="text.secondary">
                        #{c.id}
                      </Typography>
                    </Typography>
                  </Box>
                  <Stack spacing={0.5}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Person fontSize="small" sx={{ color: 'text.secondary' }} />
                      <Typography variant="body2">
                        Cliente: <strong>{c.cliente?.nome || 'Sem cliente'}</strong>
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Schedule fontSize="small" sx={{ color: 'text.secondary' }} />
                      <Typography variant="body2">{formatDataHora(c.data_hora)}</Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      Aberta por: {c.funcionario?.nome || '—'}
                    </Typography>
                  </Stack>
                </Stack>

                <Divider sx={{ mb: 1.5 }} />

                <TableContainer>
                  <Table size="small">
                    <TableHead sx={{ backgroundColor: 'rgba(30, 41, 59, 0.04)' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700, width: 64 }}>Foto</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Produto</TableCell>
                        <TableCell sx={{ fontWeight: 700 }} align="right">
                          Qtd
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700 }} align="right">
                          Valor unit.
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700 }} align="right">
                          Subtotal
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {c.produtos.map((p) => (
                        <TableRow key={`${c.id}-${p.produto_id}`}>
                          <TableCell>
                            {p.foto ? (
                              <Avatar
                                variant="rounded"
                                src={base64ToDataUri(p.foto)}
                                alt={p.nome}
                                sx={{ width: 48, height: 48 }}
                              />
                            ) : (
                              <Avatar variant="rounded" sx={{ width: 48, height: 48, bgcolor: 'grey.300' }}>
                                <RestaurantMenu fontSize="small" />
                              </Avatar>
                            )}
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {p.nome}
                            </Typography>
                            {p.descricao && (
                              <Typography variant="caption" color="text.secondary">
                                {p.descricao}
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell align="right">{p.quantidade}</TableCell>
                          <TableCell align="right">{formatCurrency(p.valor_unitario)}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>
                            {formatCurrency(p.subtotal)}
                          </TableCell>
                        </TableRow>
                      ))}
                      {c.produtos.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                            Comanda sem produtos.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>

                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    gap: 1,
                    mt: 1.5,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Subtotal da comanda:
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: 'success.main' }}>
                    {formatCurrency(c.subtotal)}
                  </Typography>
                </Box>
              </Paper>
            ))}
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Paper
            elevation={3}
            sx={{
              p: 2.5,
              borderRadius: 3,
              position: { md: 'sticky' },
              top: { md: 88 },
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              Resumo do Pagamento
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Stack spacing={1.25} sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography color="text.secondary">Subtotal geral</Typography>
                <Typography sx={{ fontWeight: 600 }}>{formatCurrency(subtotalGeral)}</Typography>
              </Box>
            </Stack>

            <TextField
              label="Desconto (R$)"
              type="number"
              fullWidth
              value={descontoStr}
              onChange={(e) => setDescontoStr(e.target.value)}
              slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
              sx={{ mb: 1.5 }}
            />
            <TextField
              label="Acréscimo (R$)"
              type="number"
              fullWidth
              value={acrescimoStr}
              onChange={(e) => setAcrescimoStr(e.target.value)}
              slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
              sx={{ mb: 1.5 }}
            />

            <TextField
              label="Cliente (opcional)"
              select
              fullWidth
              value={clienteIdSel}
              onChange={(e) => setClienteIdSel(e.target.value)}
              sx={{ mb: 2 }}
            >
              <MenuItem value="">— Sem cliente —</MenuItem>
              {clientes.map((c) => (
                <MenuItem key={c.id} value={String(c.id)}>
                  {c.nome}
                </MenuItem>
              ))}
            </TextField>

            <Divider sx={{ mb: 2 }} />

            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                backgroundColor: valorFinalNegativo
                  ? 'rgba(239, 68, 68, 0.08)'
                  : 'rgba(16, 185, 129, 0.08)',
                mb: 2,
              }}
            >
              <Typography variant="caption" color="text.secondary">
                Valor final
              </Typography>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  color: valorFinalNegativo ? 'error.main' : 'success.main',
                }}
              >
                {formatCurrency(valorFinal)}
              </Typography>
              {valorFinalNegativo && (
                <Typography variant="caption" color="error">
                  Desconto excede o subtotal.
                </Typography>
              )}
            </Box>

            <Button
              fullWidth
              size="large"
              variant="contained"
              color="success"
              startIcon={enviando ? <CircularProgress size={18} color="inherit" /> : <CheckCircle />}
              disabled={enviando || ids.length === 0 || valorFinalNegativo}
              onClick={finalizar}
              sx={{ fontWeight: 700 }}
            >
              {enviando ? 'Processando...' : 'Finalizar Recebimento'}
            </Button>

            <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5, display: 'block' }}>
              Recebedor: <strong>{usuario?.nome || '—'}</strong>
            </Typography>
          </Paper>
        </Grid>
      </Grid>

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

export default CaixaConferencia;
