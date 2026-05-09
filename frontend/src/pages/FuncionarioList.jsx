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
import funcionarioService, { grupoLabel } from '../services/funcionarioService';
import { formatCpf, formatTelefone } from '../hooks/useValidationRules';

const grupoColor = (g) =>
  ({
    1: 'primary',
    2: 'secondary',
    3: 'success',
    4: 'warning',
  }[g] || 'default');

function FuncionarioList() {
  const navigate = useNavigate();
  const [funcionarios, setFuncionarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  const carregar = useCallback(async () => {
    setLoading(true);
    setErro('');
    try {
      const data = await funcionarioService.list();
      setFuncionarios(data || []);
    } catch (e) {
      setErro(e.message || 'Erro ao carregar funcionários');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const handleView = (f) =>
    alert(`${f.nome}\nCPF: ${formatCpf(f.cpf)}\nMatrícula: ${f.matricula}\nGrupo: ${grupoLabel(f.grupo)}`);
  const handleEdit = (f) => navigate(`/funcionario/${f.id}`);
  const handleDelete = async (f) => {
    if (!window.confirm(`Excluir "${f.nome}"?`)) return;
    try {
      await funcionarioService.remove(f.id);
      setFuncionarios((prev) => prev.filter((x) => x.id !== f.id));
    } catch (e) {
      setErro(e.message || 'Erro ao excluir funcionário');
    }
  };

  const actions = (
    <Button
      variant="contained"
      color="secondary"
      onClick={() => navigate('/funcionario')}
      startIcon={<FiberNew />}
      sx={{ fontWeight: 600, color: 'white' }}
    >
      Novo Funcionário
    </Button>
  );

  if (loading) {
    return (
      <PageLayout title="Funcionários" actions={actions}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Funcionários" actions={actions}>
      <Box sx={{ display: { xs: 'none', md: 'block' } }}>
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead sx={{ backgroundColor: 'rgba(30, 41, 59, 0.04)' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Nome</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>CPF</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Matrícula</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Grupo</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {funcionarios.map((f) => (
                <TableRow key={f.id} hover>
                  <TableCell>{f.id}</TableCell>
                  <TableCell sx={{ fontWeight: 500 }}>{f.nome}</TableCell>
                  <TableCell>{formatCpf(f.cpf)}</TableCell>
                  <TableCell>{f.matricula}</TableCell>
                  <TableCell>
                    <Chip label={grupoLabel(f.grupo)} color={grupoColor(f.grupo)} size="small" />
                  </TableCell>
                  <TableCell align="right">
                    <ActionButtons item={f} onView={handleView} onEdit={handleEdit} onDelete={handleDelete} />
                  </TableCell>
                </TableRow>
              ))}
              {funcionarios.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">Nenhum funcionário cadastrado.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        {funcionarios.map((f) => (
          <Card key={f.id} sx={{ mb: 2 }} variant="outlined">
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {f.nome}
                </Typography>
                <Chip label={grupoLabel(f.grupo)} color={grupoColor(f.grupo)} size="small" />
              </Box>
              <Divider sx={{ my: 1 }} />
              <Typography variant="body2" color="text.secondary">
                CPF: {formatCpf(f.cpf)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Telefone: {formatTelefone(f.telefone)}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Matrícula: {f.matricula}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <ActionButtons item={f} onView={handleView} onEdit={handleEdit} onDelete={handleDelete} />
              </Box>
            </CardContent>
          </Card>
        ))}
        {funcionarios.length === 0 && (
          <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            Nenhum funcionário cadastrado.
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

export default FuncionarioList;
