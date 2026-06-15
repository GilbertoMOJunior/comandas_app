import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Tooltip,
  Avatar,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Dashboard,
  People,
  Group,
  RestaurantMenu,
  Receipt,
  ReceiptLong,
  PointOfSale,
  Logout,
  AccountCircle,
  Menu as MenuIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';

const Navbar = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileDrawerOpen(false);
  };

  const menuItems = [
    { label: 'Dashboard', icon: <Dashboard />, path: '/home' },
    { label: 'Funcionários', icon: <People />, path: '/funcionarios' },
    { label: 'Clientes', icon: <Group />, path: '/clientes' },
    { label: 'Produtos', icon: <RestaurantMenu />, path: '/produtos' },
    { label: 'Comandas', icon: <Receipt />, path: '/comandas' },
    { label: 'Caixa', icon: <PointOfSale />, path: '/caixa' },
    { label: 'Histórico', icon: <ReceiptLong />, path: '/caixa/historico' },
  ];

  const handleDrawerToggle = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  };

  const handleNavigate = (path) => {
    navigate(path);
    setMobileDrawerOpen(false);
  };

  const drawer = (
    <Box sx={{ textAlign: 'left', width: 260 }}>
      <Box sx={{ p: 2, borderBottom: '1px solid rgba(0,0,0,0.12)' }}>
        <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 700 }}>
          Menu
        </Typography>
      </Box>
      <List>
        {menuItems.map((item) => (
          <ListItem
            key={item.path}
            button
            onClick={() => handleNavigate(item.path)}
            sx={{ cursor: 'pointer', '&:hover': { backgroundColor: 'rgba(245, 158, 11, 0.08)' } }}
          >
            <ListItemIcon sx={{ color: 'primary.main' }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        <ListItem
          button
          onClick={() => handleNavigate('/perfil')}
          sx={{ cursor: 'pointer', '&:hover': { backgroundColor: 'rgba(245, 158, 11, 0.08)' } }}
        >
          <ListItemIcon sx={{ color: 'primary.main' }}>
            <AccountCircle />
          </ListItemIcon>
          <ListItemText primary="Perfil" />
        </ListItem>
        <ListItem
          button
          onClick={handleLogout}
          sx={{ cursor: 'pointer', '&:hover': { backgroundColor: 'rgba(239, 68, 68, 0.08)' } }}
        >
          <ListItemIcon sx={{ color: 'error.main' }}>
            <Logout />
          </ListItemIcon>
          <ListItemText primary="Sair" sx={{ color: 'error.main' }} />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <AppBar position="sticky" elevation={2}>
      <Toolbar sx={{ minHeight: 64, px: { xs: 1, sm: 2 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <Typography
            variant="h5"
            component="div"
            onClick={() => isAuthenticated && navigate('/home')}
            sx={{
              fontWeight: 700,
              background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              fontSize: { xs: '1.2rem', sm: '1.5rem' },
              cursor: isAuthenticated ? 'pointer' : 'default',
            }}
          >
            <RestaurantMenu sx={{ color: '#f59e0b', fontSize: { xs: '1.5rem', sm: '2rem' } }} />
            <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
              Comandas do Zé
            </Box>
            <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>
              Zé
            </Box>
          </Typography>
        </Box>

        {isAuthenticated && (
          <>
            {/* Menu Desktop */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 0.5 }}>
              {menuItems.map((item) => (
                <Tooltip key={item.path} title={item.label} arrow>
                  <Button
                    color="inherit"
                    onClick={() => navigate(item.path)}
                    startIcon={item.icon}
                    sx={{
                      px: 1.5,
                      py: 1,
                      borderRadius: 2,
                      '&:hover': { backgroundColor: 'rgba(245, 158, 11, 0.15)' },
                    }}
                  >
                    <Typography variant="body2" sx={{ display: { xs: 'none', lg: 'inline' } }}>
                      {item.label}
                    </Typography>
                  </Button>
                </Tooltip>
              ))}
              <Tooltip title="Perfil" arrow>
                <IconButton color="inherit" onClick={() => navigate('/perfil')}>
                  <Avatar
                    src="/FormAcademia.jpg"
                    alt="Gilberto"
                    sx={{ width: 36, height: 36, border: '2px solid #f59e0b' }}
                  >
                    <AccountCircle />
                  </Avatar>
                </IconButton>
              </Tooltip>
              <Tooltip title="Sair" arrow>
                <IconButton
                  color="inherit"
                  onClick={handleLogout}
                  sx={{ '&:hover': { backgroundColor: 'rgba(239, 68, 68, 0.2)' } }}
                >
                  <Logout />
                </IconButton>
              </Tooltip>
            </Box>

            {/* Menu Mobile */}
            <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1 }}>
              <Tooltip title="Perfil" arrow>
                <IconButton color="inherit" onClick={() => navigate('/perfil')}>
                  <Avatar
                    src="/FormAcademia.jpg"
                    alt="Gilberto"
                    sx={{ width: 36, height: 36, border: '2px solid #f59e0b' }}
                  >
                    <AccountCircle />
                  </Avatar>
                </IconButton>
              </Tooltip>
              <IconButton
                color="inherit"
                onClick={handleDrawerToggle}
                sx={{ '&:hover': { backgroundColor: 'rgba(245, 158, 11, 0.15)' } }}
              >
                <MenuIcon />
              </IconButton>
            </Box>
          </>
        )}
      </Toolbar>

      <Drawer
        anchor="right"
        variant="temporary"
        open={mobileDrawerOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 260 },
        }}
      >
        {drawer}
      </Drawer>
    </AppBar>
  );
};

export default Navbar;
