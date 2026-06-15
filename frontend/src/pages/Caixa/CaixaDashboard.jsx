import { useEffect, useState, useMemo, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Snackbar,
  Alert,
  Card,
  CardActionArea,
  CardContent,
  InputAdornment,
  Stack,
  Divider,
} from '@mui/material';
import {
  Search,
  Refresh,
  ArrowForward,
  Receipt,
  Person,
  Schedule,
  CheckCircle,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../../components/common/PageLayout';
import recebimentoService from '../../services/recebimentoService';

const formatCurrency = (v) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);

const formatHora = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};

const POLL_INTERVAL_MS = 15000;

const CaixaDashboard = () => {
  const navigate = useNavigate();
  const [comandas, setComandas] = useState([]);
  const [selecionadas, setSelecionadas] = useState(() => new Set());
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [erro, setErro] = useState('');

  const carregar = useCallback(async ({ silent = false } = {}) => {
    if (silent) setRefreshing(true);
    else setLoading(true);
    try {
      const data = await recebimentoService.dashboard();
      setComandas(data || []);
    } catch (e) {
      setErro(e.message || 'Erro ao carregar comandas abertas');
    } finally {
      if (silent) setRefreshing(false);
      else setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregar();
    const id = setInterval(() => carregar({ silent: true }), POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [carregar]);

  const buscaNorm = busca.trim().toLowerCase();
  const filtradas = useMemo(() => {
    if (!buscaNorm) return comandas;
    return comandas.filter(
      (c) =>
        String(c.id).includes(buscaNorm) ||
        (c.comanda || '').toLowerCase().includes(buscaNorm) ||
        (c.cliente?.nome || '').toLowerCase().includes(buscaNorm)
    );
  }, [comandas, buscaNorm]);

  const toggleSelecao = (id) => {
    setSelecionadas((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBuscaEnter = (e) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    if (!buscaNorm) return;
    const exata = comandas.find(
      (c) =>
        String(c.id) === buscaNorm ||
        (c.comanda || '').toLowerCase() === buscaNorm
    );
    const alvo = exata || filtradas[0];
    if (alvo) {
      setSelecionadas((prev) => new Set(prev).add(alvo.id));
      setBusca('');
    } else {
      setErro(`Nenhuma comanda corresponde a "${busca}"`);
    }
  };

  const totalSelecionado = useMemo(
    () =>
      comandas
        .filter((c) => selecionadas.has(c.id))
        .reduce((s, c) => s + Number(c.total || 0), 0),
    [comandas, selecionadas]
  );

  const avancar = () => {
    if (selecionadas.size === 0) return;
    const ids = Array.from(selecionadas).join(',');
    navigate(`/caixa/conferencia?ids=${ids}`);
  };

  const actions = (
    <Stack direction="row" spacing={1}>
      <Button
        variant="outlined"
        color="inherit"
        startIcon={refreshing ? <CircularProgress size={16} color="inherit" /> : <Refresh />}
        onClick={() => carregar({ silent: true })}
        sx={{
          color: 'white',
          borderColor: 'rgba(255,255,255,0.5)',
          '&:hover': { borderColor: 'white', backgroundColor: 'rgba(255,255,255,0.08)' },
        }}
      >
        Atualizar
      </Button>
    </Stack>
  );

  if (loading) {
    return (
      <PageLayout title="Caixa - Comandas Abertas" maxWidth="xl" actions={actions}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Caixa - Comandas Abertas" maxWidth="xl" actions={actions}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        sx={{ mb: 3, alignItems: { md: 'center' } }}
      >
        <TextField
          fullWidth
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          onKeyDown={handleBuscaEnter}
          placeholder="Digite o número da comanda ou nome do cliente (Enter adiciona à seleção)"
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            },
          }}
          sx={{ maxWidth: { md: 520 } }}
        />

        <Paper
          variant="outlined"
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            p: 1.5,
            borderRadius: 2,
            backgroundColor: selecionadas.size > 0 ? 'rgba(16, 185, 129, 0.08)' : 'background.default',
            borderColor: selecionadas.size > 0 ? 'success.main' : 'divider',
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Selecionadas
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 700 }}>
              {selecionadas.size} comanda(s) — Total {formatCurrency(totalSelecionado)}
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="success"
            endIcon={<ArrowForward />}
            disabled={selecionadas.size === 0}
            onClick={avancar}
            sx={{ fontWeight: 600 }}
          >
            Avançar para conferência
          </Button>
        </Paper>
      </Stack>

      <Divider sx={{ mb: 2 }} />

      {filtradas.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
          <Receipt sx={{ fontSize: 56, mb: 1, opacity: 0.4 }} />
          <Typography variant="h6">Nenhuma comanda aberta encontrada.</Typography>
          {buscaNorm && (
            <Typography variant="body2">
              Tente outro termo ou limpe o campo de busca.
            </Typography>
          )}
        </Box>
      ) : (
        <Grid container spacing={2}>
          {filtradas.map((c) => {
            const checked = selecionadas.has(c.id);
            return (
              <Grid key={c.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <Card
                  variant="outlined"
                  sx={{
                    borderRadius: 3,
                    borderColor: checked ? 'success.main' : 'divider',
                    borderWidth: checked ? 2 : 1,
                    backgroundColor: checked ? 'rgba(16, 185, 129, 0.06)' : 'background.paper',
                    transition: 'all .15s ease',
                    '&:hover': { transform: 'translateY(-2px)', boxShadow: 3 },
                  }}
                >
                  <CardActionArea onClick={() => toggleSelecao(c.id)}>
                    <CardContent>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          justifyContent: 'space-between',
                          mb: 1,
                        }}
                      >
                        <Box>
                          <Typography variant="overline" color="text.secondary">
                            Comanda
                          </Typography>
                          <Typography variant="h5" sx={{ fontWeight: 800, lineHeight: 1.1 }}>
                            {c.comanda}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            #{c.id}
                          </Typography>
                        </Box>
                        <Checkbox
                          checked={checked}
                          color="success"
                          icon={<Receipt />}
                          checkedIcon={<CheckCircle />}
                          onClick={(e) => e.stopPropagation()}
                          onChange={() => toggleSelecao(c.id)}
                        />
                      </Box>

                      <Stack spacing={0.75} sx={{ mb: 1.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Person fontSize="small" sx={{ color: 'text.secondary' }} />
                          <Typography variant="body2">
                            {c.cliente?.nome || 'Sem cliente'}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Schedule fontSize="small" sx={{ color: 'text.secondary' }} />
                          <Typography variant="body2">{formatHora(c.data_hora)}</Typography>
                        </Box>
                      </Stack>

                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          mt: 1,
                        }}
                      >
                        <Chip
                          label={`${c.quantidade_produtos} item(ns)`}
                          size="small"
                          color="default"
                        />
                        <Typography variant="h6" sx={{ fontWeight: 700, color: 'success.main' }}>
                          {formatCurrency(c.total)}
                        </Typography>
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

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

export default CaixaDashboard;
