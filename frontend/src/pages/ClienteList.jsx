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
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import { FiberNew } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../components/common/PageLayout';
import ActionButtons from '../components/common/ActionButtons';
import clienteService from '../services/clienteService';
import { formatCpf, formatTelefone } from '../hooks/useValidationRules';

function ClienteList() {
  const navigate = useNavigate();
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  const carregar = useCallback(async () => {
    setLoading(true);
    setErro('');
    try {
      const data = await clienteService.list();
      setClientes(data || []);
    } catch (e) {
      setErro(e.message || 'Erro ao carregar clientes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const handleView = (c) =>
    alert(`${c.nome}\nCPF: ${formatCpf(c.cpf)}\nTelefone: ${formatTelefone(c.telefone)}`);
  const handleEdit = (c) => navigate(`/cliente/${c.id}`);
  const handleDelete = async (c) => {
    if (!window.confirm(`Excluir "${c.nome}"?`)) return;
    try {
      await clienteService.remove(c.id);
      setClientes((prev) => prev.filter((x) => x.id !== c.id));
    } catch (e) {
      setErro(e.message || 'Erro ao excluir cliente');
    }
  };

  const actions = (
    <Button
      variant="contained"
      color="secondary"
      onClick={() => navigate('/cliente')}
      startIcon={<FiberNew />}
      sx={{ fontWeight: 600, color: 'white' }}
    >
      Novo Cliente
    </Button>
  );

  if (loading) {
    return (
      <PageLayout title="Clientes" actions={actions}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Clientes" actions={actions}>
      <Box sx={{ display: { xs: 'none', md: 'block' } }}>
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead sx={{ backgroundColor: 'rgba(30, 41, 59, 0.04)' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Nome</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>CPF</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Telefone</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {clientes.map((c) => (
                <TableRow key={c.id} hover>
                  <TableCell>{c.id}</TableCell>
                  <TableCell sx={{ fontWeight: 500 }}>{c.nome}</TableCell>
                  <TableCell>{formatCpf(c.cpf)}</TableCell>
                  <TableCell>{formatTelefone(c.telefone)}</TableCell>
                  <TableCell align="right">
                    <ActionButtons item={c} onView={handleView} onEdit={handleEdit} onDelete={handleDelete} />
                  </TableCell>
                </TableRow>
              ))}
              {clientes.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">Nenhum cliente cadastrado.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        {clientes.map((c) => (
          <Card key={c.id} sx={{ mb: 2 }} variant="outlined">
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                {c.nome}
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Typography variant="body2" color="text.secondary">CPF: {formatCpf(c.cpf)}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Telefone: {formatTelefone(c.telefone)}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <ActionButtons item={c} onView={handleView} onEdit={handleEdit} onDelete={handleDelete} />
              </Box>
            </CardContent>
          </Card>
        ))}
        {clientes.length === 0 && (
          <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            Nenhum cliente cadastrado.
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

export default ClienteList;
