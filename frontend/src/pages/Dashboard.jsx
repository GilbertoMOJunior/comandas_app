import { useEffect, useState } from 'react';
import { Typography, Box, Grid, Paper, Avatar, Skeleton, Tooltip } from '@mui/material';
import {
  People,
  Group,
  RestaurantMenu,
  Receipt,
  PointOfSale,
  InfoOutlined,
} from '@mui/icons-material';
import PageLayout from '../components/common/PageLayout';
import { useAuth } from '../context/AuthContext';
import funcionarioService from '../services/funcionarioService';
import clienteService from '../services/clienteService';
import produtoService from '../services/produtoService';
import comandaService, { totalComanda } from '../services/comandaService';

const formatCurrency = (v) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);

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
const startOfMonth = () => {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
};

const StatCard = ({ icon, label, value, color, loading, tooltip }) => (
  <Paper
    elevation={2}
    sx={{
      p: 2.5,
      borderRadius: 3,
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      transition: 'transform 0.2s ease',
      '&:hover': { transform: 'translateY(-4px)' },
    }}
  >
    <Avatar sx={{ bgcolor: color, width: 56, height: 56 }}>{icon}</Avatar>
    <Box sx={{ flex: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
        {tooltip && (
          <Tooltip title={tooltip}>
            <InfoOutlined sx={{ fontSize: 14, color: 'text.secondary' }} />
          </Tooltip>
        )}
      </Box>
      {loading ? (
        <Skeleton width={80} height={32} />
      ) : (
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          {value}
        </Typography>
      )}
    </Box>
  </Paper>
);

const pad2 = (n) => String(n).padStart(2, '0');

const Dashboard = () => {
  const { usuario } = useAuth();
  const [stats, setStats] = useState({
    funcionarios: null,
    clientes: null,
    produtos: null,
    comandasAbertas: null,
    caixaDia: null,
    vendasMes: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const safeLen = (p) => p.then((d) => (Array.isArray(d) ? d.length : 0)).catch(() => null);

      const sumComandas = async (params) => {
        try {
          const lista = await comandaService.list(params);
          const totais = await Promise.all(
            (lista || []).map((c) =>
              comandaService.listItens(c.id).then(totalComanda).catch(() => 0)
            )
          );
          return totais.reduce((s, t) => s + t, 0);
        } catch {
          return null;
        }
      };

      const [funcionarios, clientes, produtos, comandasAbertas, caixaDia, vendasMes] = await Promise.all([
        safeLen(funcionarioService.list()),
        safeLen(clienteService.list()),
        safeLen(produtoService.list()),
        safeLen(comandaService.list({ status: 0 })),
        sumComandas({ status: 1, data_inicio: startOfToday(), data_fim: endOfToday() }),
        sumComandas({ status: 1, data_inicio: startOfMonth() }),
      ]);

      if (!cancelled) {
        setStats({ funcionarios, clientes, produtos, comandasAbertas, caixaDia, vendasMes });
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const fmtN = (n) => (n === null ? '—' : pad2(n));
  const fmtV = (v) => (v === null ? '—' : formatCurrency(v));

  const cards = [
    { icon: <People />, label: 'Funcionários', value: fmtN(stats.funcionarios), color: '#1e293b' },
    { icon: <Group />, label: 'Clientes', value: fmtN(stats.clientes), color: '#10b981' },
    { icon: <RestaurantMenu />, label: 'Produtos', value: fmtN(stats.produtos), color: '#f59e0b' },
    { icon: <Receipt />, label: 'Comandas Abertas', value: fmtN(stats.comandasAbertas), color: '#ef4444' },
    {
      icon: <PointOfSale />,
      label: 'Caixa do Dia',
      value: fmtV(stats.caixaDia),
      color: '#3b82f6',
      tooltip: 'Soma das comandas fechadas hoje.',
    },
    {
      icon: (
        <Box
          component="img"
          src="/FormAcademia.jpg"
          alt="Vendas"
          sx={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
        />
      ),
      label: 'Vendas no Mês',
      value: fmtV(stats.vendasMes),
      color: '#8b5cf6',
      tooltip: 'Soma das comandas fechadas no mês corrente.',
    },
  ];

  return (
    <PageLayout title="Dashboard" maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
          Bem-vindo, {usuario?.nome || 'usuário'}!
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {new Date().toLocaleDateString('pt-BR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </Typography>
      </Box>

      <Grid container spacing={2}>
        {cards.map((s) => (
          <Grid key={s.label} size={{ xs: 12, sm: 6, md: 4 }}>
            <StatCard {...s} loading={loading} />
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 5, p: 3, borderRadius: 3, backgroundColor: 'rgba(245, 158, 11, 0.08)' }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
          Sobre o sistema
        </Typography>
        <Typography variant="body2" color="text.secondary">
          O <strong>Comandas do Zé</strong> é o sistema de gerenciamento da lanchonete. Por aqui
          você gerencia funcionários, clientes, cardápio, comandas e o caixa do dia.
        </Typography>
      </Box>
    </PageLayout>
  );
};

export default Dashboard;
