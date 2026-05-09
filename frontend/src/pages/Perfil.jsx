import { Box, Paper, Typography, Avatar, Grid, Chip, Divider } from '@mui/material';
import { Badge, AccountCircle, Phone, Group as GroupIcon } from '@mui/icons-material';
import PageLayout from '../components/common/PageLayout';
import { useAuth } from '../context/AuthContext';
import { grupoLabel } from '../services/funcionarioService';
import { formatCpf, formatTelefone } from '../hooks/useValidationRules';

const Perfil = () => {
  const { usuario } = useAuth();

  const grupoChipColor = (g) =>
    ({ 1: 'primary', 2: 'secondary', 3: 'success', 4: 'warning' }[g] || 'default');

  return (
    <PageLayout title="Perfil" maxWidth="md">
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Paper
          elevation={2}
          sx={{
            p: { xs: 3, sm: 5 },
            borderRadius: 4,
            width: '100%',
            maxWidth: 720,
            textAlign: 'center',
          }}
        >
          <Avatar
            sx={{
              width: 140,
              height: 140,
              mx: 'auto',
              mb: 2,
              bgcolor: '#f59e0b',
              boxShadow: '0 8px 24px rgba(245, 158, 11, 0.3)',
              fontSize: 64,
            }}
          >
            <AccountCircle sx={{ fontSize: 100 }} />
          </Avatar>

          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            {usuario?.nome || 'Usuário'}
          </Typography>
          {usuario?.grupo != null && (
            <Chip
              label={grupoLabel(usuario.grupo)}
              color={grupoChipColor(usuario.grupo)}
              icon={<GroupIcon />}
              sx={{ mb: 3 }}
            />
          )}

          <Divider sx={{ my: 3 }} />

          <Grid container spacing={2} sx={{ textAlign: 'left' }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Badge color="primary" />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Matrícula
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {usuario?.matricula || '—'}
                  </Typography>
                </Box>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <AccountCircle color="primary" />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    CPF
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {usuario?.cpf ? formatCpf(usuario.cpf) : '—'}
                  </Typography>
                </Box>
              </Box>
            </Grid>

            {usuario?.telefone && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <Phone color="primary" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Telefone
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {formatTelefone(usuario.telefone)}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            )}
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Typography variant="body2" color="text.secondary">
            Sistema Comandas do Zé · v1.0
          </Typography>
        </Paper>
      </Box>
    </PageLayout>
  );
};

export default Perfil;
