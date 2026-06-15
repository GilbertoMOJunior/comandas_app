export const useValidationRules = () => ({
  nome: {
    required: 'Nome é obrigatório',
    maxLength: { value: 100, message: 'Nome deve ter no máximo 100 caracteres' },
  },
  cpf: {
    required: 'CPF é obrigatório',
    pattern: {
      value: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
      message: 'CPF inválido (use o formato 000.000.000-00)',
    },
  },
  telefone: {
    pattern: {
      value: /^\(\d{2}\)\s\d{4,5}-\d{4}$/,
      message: 'Telefone inválido (use o formato (00) 00000-0000)',
    },
  },
  email: {
    pattern: {
      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: 'E-mail inválido',
    },
    maxLength: { value: 100, message: 'E-mail deve ter no máximo 100 caracteres' },
  },
  cep: {
    pattern: {
      value: /^\d{5}-\d{3}$/,
      message: 'CEP inválido (use o formato 00000-000)',
    },
  },
  endereco: {
    maxLength: { value: 150, message: 'Endereço deve ter no máximo 150 caracteres' },
  },
  bairro: {
    maxLength: { value: 50, message: 'Bairro deve ter no máximo 50 caracteres' },
  },
  cidade: {
    maxLength: { value: 50, message: 'Cidade deve ter no máximo 50 caracteres' },
  },
  observacao: {
    maxLength: { value: 200, message: 'Observação deve ter no máximo 200 caracteres' },
  },
  matricula: {
    required: 'Matrícula é obrigatória',
    maxLength: { value: 11, message: 'Matrícula deve ter no máximo 11 caracteres' },
  },
  senha: {
    required: 'Senha é obrigatória',
    minLength: { value: 5, message: 'Senha deve ter pelo menos 5 caracteres' },
  },
  grupo: { required: 'Grupo é obrigatório' },
  descricao: {
    required: 'Descrição é obrigatória',
    maxLength: { value: 200, message: 'Descrição deve ter no máximo 200 caracteres' },
  },
  valor_unitario: {
    required: 'Valor unitário é obrigatório',
    min: { value: 0.01, message: 'Valor deve ser maior que 0' },
  },
});

export default useValidationRules;

export const masks = {
  cpf: (value) =>
    value
      .replace(/\D/g, '')
      .slice(0, 11)
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2'),

  telefone: (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 10) {
      return digits
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4})(\d)/, '$1-$2');
    }
    return digits
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2');
  },

  cep: (value) =>
    value
      .replace(/\D/g, '')
      .slice(0, 8)
      .replace(/(\d{5})(\d)/, '$1-$2'),
};

export const onlyDigits = (value) => (value || '').replace(/\D/g, '');

export const formatCpf = (digits) => {
  const d = onlyDigits(digits).padStart(11, '0').slice(0, 11);
  if (!digits) return '';
  return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

export const formatTelefone = (digits) => {
  const d = onlyDigits(digits);
  if (!d) return '';
  if (d.length <= 10) return d.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  return d.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
};
