import { useEffect, useState, useMemo, useCallback } from 'react';
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
  TextField,
  InputAdornment,
  Avatar,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import { FiberNew, Search, RestaurantMenu } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../components/common/PageLayout';
import ActionButtons from '../components/common/ActionButtons';
import produtoService, { base64ToDataUri } from '../services/produtoService';

function ProdutoList() {
  const navigate = useNavigate();
  const [filtro, setFiltro] = useState('');
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  const carregar = useCallback(async () => {
    setLoading(true);
    setErro('');
    try {
      const data = await produtoService.list();
      setProdutos(data || []);
    } catch (e) {
      setErro(e.message || 'Erro ao carregar produtos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const formatCurrency = (value) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const filtrados = useMemo(
    () =>
      produtos.filter((p) =>
        p.nome.toLowerCase().includes(filtro.toLowerCase()) ||
        (p.descricao || '').toLowerCase().includes(filtro.toLowerCase())
      ),
    [filtro, produtos]
  );

  const handleView = (p) => alert(`${p.nome}\n\n${p.descricao}\n\n${formatCurrency(p.valor_unitario)}`);
  const handleEdit = (p) => navigate(`/produto/${p.id}`);
  const handleDelete = async (p) => {
    if (!window.confirm(`Excluir "${p.nome}"?`)) return;
    try {
      await produtoService.remove(p.id);
      setProdutos((prev) => prev.filter((x) => x.id !== p.id));
    } catch (e) {
      setErro(e.message || 'Erro ao excluir produto');
    }
  };

  const actions = (
    <Button
      variant="contained"
      color="secondary"
      onClick={() => navigate('/produto')}
      startIcon={<FiberNew />}
      sx={{ fontWeight: 600, color: 'white' }}
    >
      Novo Produto
    </Button>
  );

  if (loading) {
    return (
      <PageLayout title="Produtos" actions={actions}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Produtos" actions={actions}>
      <TextField
        fullWidth
        placeholder="Buscar produto..."
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
        sx={{ mb: 3 }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <Search color="action" />
              </InputAdornment>
            ),
          },
        }}
      />

      {/* Desktop */}
      <Box sx={{ display: { xs: 'none', md: 'block' } }}>
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead sx={{ backgroundColor: 'rgba(30, 41, 59, 0.04)' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Foto</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Nome</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Descrição</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Valor Unitário</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtrados.map((p) => (
                <TableRow key={p.id} hover>
                  <TableCell>{p.id}</TableCell>
                  <TableCell>
                    <Avatar
                      src={base64ToDataUri(p.foto) || undefined}
                      variant="rounded"
                      sx={{ width: 44, height: 44, bgcolor: 'rgba(245, 158, 11, 0.15)' }}
                    >
                      <RestaurantMenu color="warning" fontSize="small" />
                    </Avatar>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 500 }}>{p.nome}</TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                    >
                      {p.descricao}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: 'success.main' }}>
                    {formatCurrency(p.valor_unitario)}
                  </TableCell>
                  <TableCell align="right">
                    <ActionButtons item={p} onView={handleView} onEdit={handleEdit} onDelete={handleDelete} />
                  </TableCell>
                </TableRow>
              ))}
              {filtrados.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">Nenhum produto encontrado.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Mobile */}
      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        {filtrados.map((p) => (
          <Card key={p.id} sx={{ mb: 2 }} variant="outlined">
            <CardContent>
              <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
                <Avatar
                  src={base64ToDataUri(p.foto) || undefined}
                  variant="rounded"
                  sx={{ width: 64, height: 64, bgcolor: 'rgba(245, 158, 11, 0.15)' }}
                >
                  <RestaurantMenu color="warning" />
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }} noWrap>
                      {p.nome}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      #{p.id}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {p.descricao}
                  </Typography>
                </Box>
              </Box>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'success.main' }}>
                  {formatCurrency(p.valor_unitario)}
                </Typography>
                <ActionButtons item={p} onView={handleView} onEdit={handleEdit} onDelete={handleDelete} />
              </Box>
            </CardContent>
          </Card>
        ))}
        {filtrados.length === 0 && (
          <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            Nenhum produto encontrado.
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

export default ProdutoList;
