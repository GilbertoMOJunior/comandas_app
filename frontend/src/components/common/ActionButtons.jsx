import { Box, IconButton, Tooltip } from '@mui/material';
import { Edit, Delete, Visibility } from '@mui/icons-material';

const ActionButtons = ({ item, onView, onEdit, onDelete }) => (
  <Box sx={{ display: 'flex', gap: 0.5 }}>
    {onView && (
      <Tooltip title="Visualizar" arrow>
        <IconButton
          size="small"
          color="primary"
          sx={{
            '&:hover': { backgroundColor: 'primary.light', color: 'white' },
          }}
          onClick={() => onView(item)}
        >
          <Visibility fontSize="small" />
        </IconButton>
      </Tooltip>
    )}
    {onEdit && (
      <Tooltip title="Editar" arrow>
        <IconButton
          size="small"
          color="secondary"
          sx={{
            '&:hover': { backgroundColor: 'secondary.light', color: 'white' },
          }}
          onClick={() => onEdit(item)}
        >
          <Edit fontSize="small" />
        </IconButton>
      </Tooltip>
    )}
    {onDelete && (
      <Tooltip title="Excluir" arrow>
        <IconButton
          size="small"
          color="error"
          sx={{
            '&:hover': { backgroundColor: 'error.light', color: 'white' },
          }}
          onClick={() => onDelete(item)}
        >
          <Delete fontSize="small" />
        </IconButton>
      </Tooltip>
    )}
  </Box>
);

export default ActionButtons;
