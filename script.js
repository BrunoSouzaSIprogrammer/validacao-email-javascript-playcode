/**
 * Validação de Campo de E-mail em Formulário HTML
 * UNIDERP - Sistemas de Informação | Desenvolvimento em JavaScript
 * Aluno: Bruno Cardoso De Oliveira Souza | RA: 8447403702
 */

// Expressão regular para o formato: usuario@dominio.extensao (extensão com 2 a 8 letras)
const EMAIL_REGEX = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,8}$/;

const ORIENTACAO_FORMATO =
  'Composição correta: usuario@dominio.extensao (ex.: bruno.souza@gmail.com).';

/**
 * Analisa uma string de e-mail e retorna o resultado estruturado da validação.
 * @param {string} email - Valor informado pelo usuário.
 * @returns {{ valido: boolean, erros: string[], emailLimpo: string }}
 */
function analisarEmail(email) {
  const emailLimpo = typeof email === 'string' ? email.trim() : '';

  if (emailLimpo === '') {
    return {
      valido: false,
      erros: ['Campo obrigatório: informe um endereço de e-mail.', ORIENTACAO_FORMATO],
      emailLimpo,
    };
  }

  const erros = [];

  if (/\s/.test(emailLimpo)) {
    erros.push('O e-mail não pode conter espaços em branco.');
  }

  if (!emailLimpo.includes('@')) {
    erros.push('Falta o símbolo <strong>@</strong> separando usuário e domínio.');
  } else {
    const partes = emailLimpo.split('@');
    const usuario = partes[0];
    const dominio = partes[partes.length - 1];

    if (usuario.length === 0) {
      erros.push('Informe o nome de usuário antes do símbolo <strong>@</strong>.');
    }
    if (partes.length > 2) {
      erros.push('O e-mail deve conter apenas um símbolo <strong>@</strong>.');
    }
    if (dominio.length === 0 || !dominio.includes('.')) {
      erros.push('O domínio após o <strong>@</strong> deve conter ponto (ex.: gmail.com).');
    } else {
      if (dominio.startsWith('.') || dominio.endsWith('.') || dominio.includes('..')) {
        erros.push('O domínio não pode iniciar, terminar ou conter pontos consecutivos.');
      }
      const extensao = dominio.split('.').pop();
      if (extensao.length < 2 || extensao.length > 8) {
        erros.push('A extensão após o último ponto deve ter entre 2 e 8 letras (ex.: .com, .br).');
      }
    }
  }

  if (erros.length === 0 && !EMAIL_REGEX.test(emailLimpo)) {
    erros.push('Formato de e-mail inválido: verifique caracteres especiais permitidos.');
  }

  if (erros.length > 0) {
    erros.push(ORIENTACAO_FORMATO);
    return { valido: false, erros, emailLimpo };
  }

  return { valido: true, erros: [], emailLimpo };
}

/**
 * Escapa caracteres especiais HTML para evitar injeção XSS ao renderizar feedback.
 * @param {string} str
 * @returns {string}
 */
function escapeHTML(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

if (typeof document !== 'undefined') {
  const form = document.getElementById('emailForm');
  const emailInput = document.getElementById('emailInput');
  const feedback = document.getElementById('emailFeedback');

  const setInputState = (estado) => {
    emailInput.classList.remove('valid', 'invalid');
    if (estado) emailInput.classList.add(estado);
  };

  const showFeedback = (tipo, titulo, itens = []) => {
    feedback.className = `feedback ${tipo} show`;
    const lista = itens.length ? `<ul>${itens.map((i) => `<li>${i}</li>`).join('')}</ul>` : '';
    feedback.innerHTML = `<strong>${titulo}</strong>${lista}`;
  };

  const clearFeedback = () => {
    setInputState('');
    feedback.className = 'feedback';
    feedback.innerHTML = '';
  };

  function validateEmail(email) {
    const resultado = analisarEmail(email);
    if (!resultado.valido) {
      setInputState('invalid');
      showFeedback('error', 'E-mail inválido:', resultado.erros);
      return false;
    }
    setInputState('valid');
    showFeedback('success', `E-mail válido: ${escapeHTML(resultado.emailLimpo)}`, [
      'A estrutura usuario@dominio.extensao foi preenchida corretamente.',
    ]);
    return true;
  }

  emailInput.addEventListener('input', () => {
    const val = emailInput.value.trim();
    if (val === '') return clearFeedback();
    if (!val.includes('@')) {
      setInputState('');
      showFeedback('info', 'Dica de preenchimento', [
        'Inclua o símbolo <strong>@</strong> seguido do domínio (ex.: usuario@gmail.com).',
      ]);
    } else if (EMAIL_REGEX.test(val) && analisarEmail(val).valido) {
      setInputState('valid');
      feedback.className = 'feedback';
    } else {
      clearFeedback();
    }
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    validateEmail(emailInput.value);
  });

  emailInput.addEventListener('focus', () => {
    if (emailInput.classList.contains('invalid')) clearFeedback();
  });
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { EMAIL_REGEX, analisarEmail, escapeHTML };
}
