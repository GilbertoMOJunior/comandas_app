import { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  Divider,
  Stack,
  GlobalStyles,
} from '@mui/material';
import { Print, ArrowBack } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import recebimentoService from '../../services/recebimentoService';

const formatCurrency = (v) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(v) || 0);

const formatDataHora = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const CupomLine = ({ left, right, bold = false, big = false }) => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      fontFamily: '"Roboto Mono", "Courier New", monospace',
      fontSize: big ? 16 : 13,
      fontWeight: bold ? 700 : 400,
      py: 0.25,
    }}
  >
    <span>{left}</span>
    <span>{right}</span>
  </Box>
);

const CaixaComprovante = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [comprovante, setComprovante] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await recebimentoService.comprovante(id);
        if (!cancelled) setComprovante(data);
      } catch (e) {
        if (!cancelled) setErro(e.message || 'Erro ao carregar comprovante.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const imprimir = () => window.print();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!comprovante) {
    return (
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <Typography color="text.secondary">Comprovante não encontrado.</Typography>
        <Button
          sx={{ mt: 2 }}
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate('/caixa')}
        >
          Voltar
        </Button>
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
      </Box>
    );
  }

  const { cabecalho, cliente, funcionario, comandas, resumo_valores, recebimento, rodape } =
    comprovante;

  return (
    <>
      <GlobalStyles
        styles={{
          '@media print': {
            'header, .MuiAppBar-root, .no-print': { display: 'none !important' },
            body: { backgroundColor: 'white !important' },
            '.cupom-paper': {
              boxShadow: 'none !important',
              border: 'none !important',
              margin: '0 !important',
              padding: '0 !important',
              maxWidth: '100% !important',
            },
          },
        }}
      />

      <Box
        sx={{
          minHeight: 'calc(100vh - 96px)',
          backgroundColor: 'rgba(30, 41, 59, 0.04)',
          py: { xs: 2, md: 4 },
          px: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Stack
          direction="row"
          spacing={1}
          className="no-print"
          sx={{ mb: 2, width: '100%', maxWidth: 420, justifyContent: 'space-between' }}
        >
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate('/caixa')}
          >
            Fechar
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Print />}
            onClick={imprimir}
          >
            Imprimir
          </Button>
        </Stack>

        <Paper
          elevation={3}
          className="cupom-paper"
          sx={{
            width: '100%',
            maxWidth: 400,
            p: 3,
            borderRadius: 2,
            backgroundColor: 'white',
            color: '#1e293b',
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 1.5 }}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 800,
                letterSpacing: 1,
                fontFamily: '"Roboto Mono", "Courier New", monospace',
              }}
            >
              {cabecalho.estabelecimento}
            </Typography>
            <Typography
              variant="caption"
              sx={{ fontFamily: '"Roboto Mono", "Courier New", monospace', display: 'block' }}
            >
              {cabecalho.titulo}
            </Typography>
            <Typography
              variant="caption"
              sx={{ fontFamily: '"Roboto Mono", "Courier New", monospace', display: 'block' }}
            >
              Emissão: {cabecalho.data_emissao}
            </Typography>
          </Box>

          <Divider sx={{ borderStyle: 'dashed', my: 1 }} />

          <Box sx={{ mb: 1 }}>
            <CupomLine
              left="Cliente:"
              right={cliente?.nome || 'Não informado'}
            />
            <CupomLine
              left="Recebedor:"
              right={funcionario?.nome || '—'}
            />
            <CupomLine
              left="Recebimento:"
              right={`#${recebimento.id} · ${formatDataHora(recebimento.data_hora)}`}
            />
          </Box>

          <Divider sx={{ borderStyle: 'dashed', my: 1 }} />

          {comandas.map((c) => (
            <Box key={c.id} sx={{ mb: 1.5 }}>
              <Typography
                sx={{
                  fontFamily: '"Roboto Mono", "Courier New", monospace',
                  fontWeight: 700,
                  fontSize: 13,
                }}
              >
                COMANDA: {c.comanda} · #{c.id}
              </Typography>
              <Typography
                sx={{
                  fontFamily: '"Roboto Mono", "Courier New", monospace',
                  fontSize: 11,
                  color: 'text.secondary',
                }}
              >
                Aberta: {formatDataHora(c.data_hora)}
              </Typography>

              <Box sx={{ mt: 0.5 }}>
                {c.produtos.map((p, idx) => (
                  <Box key={`${c.id}-${idx}`} sx={{ mb: 0.5 }}>
                    <Typography
                      sx={{
                        fontFamily: '"Roboto Mono", "Courier New", monospace',
                        fontSize: 12.5,
                      }}
                    >
                      {p.nome}
                    </Typography>
                    <CupomLine
                      left={`  ${p.quantidade} x ${formatCurrency(p.valor_unitario)}`}
                      right={formatCurrency(p.subtotal)}
                    />
                  </Box>
                ))}
                {c.produtos.length === 0 && (
                  <Typography
                    sx={{
                      fontFamily: '"Roboto Mono", "Courier New", monospace',
                      fontSize: 12,
                      color: 'text.secondary',
                      fontStyle: 'italic',
                    }}
                  >
                    Sem produtos.
                  </Typography>
                )}
              </Box>

              <CupomLine
                left="Subtotal da comanda"
                right={formatCurrency(c.subtotal)}
                bold
              />
              <Divider sx={{ borderStyle: 'dashed', my: 0.5 }} />
            </Box>
          ))}

          <CupomLine
            left="SUBTOTAL GERAL"
            right={formatCurrency(resumo_valores.subtotal_geral)}
          />
          <CupomLine
            left="Desconto"
            right={`- ${formatCurrency(resumo_valores.desconto_total)}`}
          />
          <CupomLine
            left="Acréscimo"
            right={`+ ${formatCurrency(resumo_valores.acrescimo_total)}`}
          />

          <Divider sx={{ borderStyle: 'dashed', my: 1 }} />

          <CupomLine
            left="VALOR FINAL"
            right={formatCurrency(resumo_valores.valor_final)}
            bold
            big
          />

          <Divider sx={{ borderStyle: 'dashed', my: 1 }} />

          <Box sx={{ textAlign: 'center', mt: 1 }}>
            <Typography
              sx={{
                fontFamily: '"Roboto Mono", "Courier New", monospace',
                fontSize: 12,
              }}
            >
              {rodape.mensagem}
            </Typography>
            <Typography
              sx={{
                fontFamily: '"Roboto Mono", "Courier New", monospace',
                fontSize: 10.5,
                color: 'text.secondary',
                mt: 0.5,
              }}
            >
              Autenticação: {rodape.autenticacao}
            </Typography>
          </Box>
        </Paper>
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
    </>
  );
};

export default CaixaComprovante;
