import { useEffect, useState, useCallback } from 'react';
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
  Tooltip,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  AccountBalanceWallet,
  Receipt,
  InfoOutlined,
} from '@mui/icons-material';
import PageLayout from '../components/common/PageLayout';
import comandaService, { totalComanda } from '../services/comandaService';

const formatCurrency = (v) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);

const formatHora = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
};
const endOfToday = () => {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d.toISOString();
};

const Caixa = () => {
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  const carregar = useCallback(async () => {
    setLoading(true);
    setErro('');
    try {
      const fechadas = await comandaService.list({
        status: 1,
        data_inicio: startOfToday(),
        data_fim: endOfToday(),
      });
      const comTotais = await Promise.all(
        (fechadas || []).map(async (c) => {
          const itens = await comandaService.listItens(c.id).catch(() => []);
          return {
            id: c.id,
            hora: formatHora(c.data_hora),
            tipo: 'Entrada',
            valor: totalComanda(itens),
            descricao: `Comanda "${c.comanda}" — ${c.cliente?.nome || 'Sem cliente'}`,
          };
        })
      );
      comTotais.sort((a, b) => a.hora.localeCompare(b.hora));
      setMovimentacoes(comTotais);
    } catch (e) {
      setErro(e.message || 'Erro ao carregar caixa');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const totalEntradas = movimentacoes
    .filter((m) => m.tipo === 'Entrada')
    .reduce((s, m) => s + m.valor, 0);
  const totalSaidas = 0;
  const saldo = totalEntradas - totalSaidas;

  const cards = [
    { icon: <TrendingUp />, label: 'Entradas (hoje)', value: formatCurrency(totalEntradas), color: '#10b981' },
    {
      icon: <TrendingDown />,
      label: 'Saídas',
      value: formatCurrency(totalSaidas),
      color: '#ef4444',
      tooltip: 'Sangrias/saídas manuais ainda não disponíveis na API.',
    },
    { icon: <AccountBalanceWallet />, label: 'Saldo', value: formatCurrency(saldo), color: '#f59e0b' },
    { icon: <Receipt />, label: 'Movimentos', value: movimentacoes.length, color: '#3b82f6' },
  ];

  if (loading) {
    return (
      <PageLayout title="Caixa do Dia" maxWidth="xl">
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Caixa do Dia" maxWidth="xl">
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {cards.map((c) => (
          <Grid key={c.label} size={{ xs: 6, md: 3 }}>
            <Paper elevation={2} sx={{ p: 2, borderRadius: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: c.color, width: 48, height: 48 }}>{c.icon}</Avatar>
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Typography variant="caption" color="text.secondary">
                    {c.label}
                  </Typography>
                  {c.tooltip && (
                    <Tooltip title={c.tooltip}>
                      <InfoOutlined sx={{ fontSize: 14, color: 'text.secondary' }} />
                    </Tooltip>
                  )}
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {c.value}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
        Movimentações de hoje (comandas fechadas)
      </Typography>
      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead sx={{ backgroundColor: 'rgba(30, 41, 59, 0.04)' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Hora</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Tipo</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Descrição</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="right">Valor</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {movimentacoes.map((m) => (
              <TableRow key={m.id} hover>
                <TableCell>{m.hora}</TableCell>
                <TableCell>
                  <Chip label={m.tipo} color="success" size="small" />
                </TableCell>
                <TableCell>{m.descricao}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, color: 'success.main' }}>
                  + {formatCurrency(m.valor)}
                </TableCell>
              </TableRow>
            ))}
            {movimentacoes.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                  Nenhuma comanda fechada hoje.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

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

export default Caixa;
