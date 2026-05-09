import { Typography, Box, Button } from '@mui/material';
import { Home } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../components/common/PageLayout';

const NotFound = () => {
  const navigate = useNavigate();
  return (
    <PageLayout title="404 - Página não encontrada">
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <Typography variant="h1" sx={{ fontWeight: 800, color: 'primary.main', mb: 2 }}>
          404
        </Typography>
        <Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>
          Ops! Página não encontrada.
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          A página que você está procurando não existe ou foi movida.
        </Typography>
        <Button
          variant="contained"
          startIcon={<Home />}
          onClick={() => navigate('/home')}
          size="large"
        >
          Voltar para o início
        </Button>
      </Box>
    </PageLayout>
  );
};

export default NotFound;
