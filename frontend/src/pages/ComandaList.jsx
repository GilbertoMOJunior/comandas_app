import { useEffect, useState, useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Card,
  CardContent,
  Typography,
  Box,
  Divider,
  Chip,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import { FiberNew } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../components/common/PageLayout';
import ActionButtons from '../components/common/ActionButtons';
import comandaService, {
  statusLabel,
  statusColor,
  totalComanda,
} from '../services/comandaService';

const formatCurrency = (v) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);

const formatHora = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};

function ComandaList() {
  const navigate = useNavigate();
  const [comandas, setComandas] = useState([]);
  const [totais, setTotais] = useState({});
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  const carregar = useCallback(async () => {
    setLoading(true);
    setErro('');
    try {
      const data = await comandaService.list();
      setComandas(data || []);
      // Carrega itens em paralelo p/ totais
      const pares = await Promise.all(
        (data || []).map((c) =>
          comandaService.listItens(c.id).then((itens) => [c.id, totalComanda(itens)]).catch(() => [c.id, 0])
        )
      );
      setTotais(Object.fromEntries(pares));
    } catch (e) {
      setErro(e.message || 'Erro ao carregar comandas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const handleView = (c) => navigate(`/comanda/${c.id}`);
  const handleEdit = (c) => navigate(`/comanda/${c.id}`);
  const handleDelete = async (c) => {
    if (c.status === 0) {
      if (!window.confirm(`Cancelar comanda "${c.comanda}"?`)) return;
      try {
        await comandaService.cancelar(c.id);
        await carregar();
      } catch (e) {
        setErro(e.message || 'Erro ao cancelar comanda');
      }
    } else {
      if (!window.confirm(`Excluir comanda "${c.comanda}"?`)) return;
      try {
        await comandaService.remove(c.id);
        setComandas((prev) => prev.filter((x) => x.id !== c.id));
      } catch (e) {
        setErro(e.message || 'Erro ao excluir comanda');
      }
    }
  };

  const actions = (
    <Button
      variant="contained"
      color="secondary"
      onClick={() => navigate('/comanda')}
      startIcon={<FiberNew />}
      sx={{ fontWeight: 600, color: 'white' }}
    >
      Nova Comanda
    </Button>
  );

  if (loading) {
    return (
      <PageLayout title="Comandas" actions={actions}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Comandas" actions={actions}>
      <Box sx={{ display: { xs: 'none', md: 'block' } }}>
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead sx={{ backgroundColor: 'rgba(30, 41, 59, 0.04)' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>#</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Comanda</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Cliente</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Funcionário</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Abertura</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Total</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {comandas.map((c) => (
                <TableRow key={c.id} hover>
                  <TableCell>{c.id}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{c.comanda}</TableCell>
                  <TableCell>{c.cliente?.nome || '— sem cliente —'}</TableCell>
                  <TableCell>{c.funcionario?.nome || '—'}</TableCell>
                  <TableCell>{formatHora(c.data_hora)}</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: 'success.main' }}>
                    {formatCurrency(totais[c.id])}
                  </TableCell>
                  <TableCell>
                    <Chip label={statusLabel(c.status)} color={statusColor(c.status)} size="small" />
                  </TableCell>
                  <TableCell align="right">
                    <ActionButtons item={c} onView={handleView} onEdit={handleEdit} onDelete={handleDelete} />
                  </TableCell>
                </TableRow>
              ))}
              {comandas.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">Nenhuma comanda cadastrada.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        {comandas.map((c) => (
          <Card key={c.id} sx={{ mb: 2 }} variant="outlined">
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {c.comanda} · #{c.id}
                </Typography>
                <Chip label={statusLabel(c.status)} color={statusColor(c.status)} size="small" />
              </Box>
              <Divider sx={{ my: 1 }} />
              <Typography variant="body2" color="text.secondary">
                Cliente: {c.cliente?.nome || '— sem cliente —'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Funcionário: {c.funcionario?.nome || '—'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Aberta às {formatHora(c.data_hora)}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'success.main' }}>
                  {formatCurrency(totais[c.id])}
                </Typography>
                <ActionButtons item={c} onView={handleView} onEdit={handleEdit} onDelete={handleDelete} />
              </Box>
            </CardContent>
          </Card>
        ))}
        {comandas.length === 0 && (
          <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            Nenhuma comanda cadastrada.
          </Typography>
        )}
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

export default ComandaList;
