/**
 * Suíte de Testes Automatizados - Validação de E-mail
 * Executa diretamente as funções exportadas de ../script.js
 * Autor: Bruno Cardoso De Oliveira Souza | RA: 8447403702
 */

const { EMAIL_REGEX, analisarEmail, escapeHTML } = require('../script.js');

let passed = 0;
let failed = 0;
const failures = [];

function test(descricao, fn) {
  try {
    fn();
    console.log(`  [PASS] ${descricao}`);
    passed++;
  } catch (err) {
    console.log(`  [FAIL] ${descricao}`);
    console.log(`         -> ${err.message}`);
    failed++;
    failures.push({ descricao, erro: err.message });
  }
}

function expect(valor) {
  return {
    toBe(esperado) {
      if (valor !== esperado) {
        throw new Error(`Esperado ${JSON.stringify(esperado)}, obtido ${JSON.stringify(valor)}`);
      }
    },
    toContain(trecho) {
      if (typeof valor !== 'string' || !valor.includes(trecho)) {
        throw new Error(`Esperado que ${JSON.stringify(valor)} contivesse ${JSON.stringify(trecho)}`);
      }
    },
  };
}

function describe(titulo, fn) {
  console.log(`\n== ${titulo} ==`);
  fn();
}

describe('1. E-mails VÁLIDOS', () => {
  const validos = [
    'bruno@gmail.com',
    'bruno.souza@gmail.com',
    'bruno.cardoso@empresa.com.br',
    'usuario123@dominio.org',
    'teste+tag@exemplo.net',
    'nome_sobrenome@servidor.edu',
    'a@b.io',
    'MAIUSCULO@DOMINIO.COM',
    'num3rico@dom1nio.com',
    'hifen-no-nome@dominio.com',
  ];

  validos.forEach((email) => {
    test(`"${email}" deve ser aceito como válido`, () => {
      const res = analisarEmail(email);
      expect(res.valido).toBe(true);
      expect(res.erros.length).toBe(0);
    });
  });
});

describe('2. Campo vazio, espaços, null e undefined', () => {
  ['', '   ', null, undefined].forEach((entrada) => {
    test(`Entrada ${JSON.stringify(entrada)} deve ser rejeitada`, () => {
      const res = analisarEmail(entrada);
      expect(res.valido).toBe(false);
    });
  });
});

describe('3. E-mails INVÁLIDOS - sem símbolo @', () => {
  ['bruno.souza.gmail.com', 'somente_texto', 'usuario.dominio.com'].forEach((email) => {
    test(`"${email}" (sem @) deve ser rejeitado`, () => {
      const res = analisarEmail(email);
      expect(res.valido).toBe(false);
      expect(res.erros.join(' ')).toContain('@');
    });
  });
});

describe('4. E-mails INVÁLIDOS - múltiplos @', () => {
  ['bruno@@gmail.com', 'a@b@c.com'].forEach((email) => {
    test(`"${email}" (múltiplos @) deve ser rejeitado`, () => {
      const res = analisarEmail(email);
      expect(res.valido).toBe(false);
    });
  });
});

describe('5. E-mails INVÁLIDOS - domínio malformado', () => {
  ['bruno@', 'bruno@.com', 'bruno@com', '@gmail.com', 'bruno@gmail..com'].forEach((email) => {
    test(`"${email}" (domínio inválido) deve ser rejeitado`, () => {
      const res = analisarEmail(email);
      expect(res.valido).toBe(false);
    });
  });
});

describe('6. E-mails INVÁLIDOS - extensão inválida', () => {
  ['bruno@gmail.c', 'bruno@gmail.extensaolonga'].forEach((email) => {
    test(`"${email}" (extensão inválida) deve ser rejeitado`, () => {
      const res = analisarEmail(email);
      expect(res.valido).toBe(false);
    });
  });
});

describe('7. E-mails INVÁLIDOS - espaços internos', () => {
  ['bruno @gmail.com', 'bruno@ gmail.com', 'bru no@gmail.com'].forEach((email) => {
    test(`"${email}" (com espaços) deve ser rejeitado`, () => {
      const res = analisarEmail(email);
      expect(res.valido).toBe(false);
      expect(res.erros.join(' ')).toContain('espaços');
    });
  });
});

describe('8. Mensagens de orientação e Regex exportada', () => {
  test('Campo vazio retorna mensagem de campo obrigatório e composição correta', () => {
    const res = analisarEmail('');
    expect(res.erros[0]).toContain('Campo obrigatório');
    expect(res.erros.join(' ')).toContain('usuario@dominio.extensao');
  });

  test('Erro sem @ inclui orientação da composição correta', () => {
    const res = analisarEmail('bruno.gmail.com');
    expect(res.erros.join(' ')).toContain('usuario@dominio.extensao');
  });

  test('EMAIL_REGEX corresponde diretamente a endereço válido', () => {
    expect(EMAIL_REGEX.test('bruno.souza@uniderp.edu.br')).toBe(true);
  });
});

describe('9. Sanitização XSS com escapeHTML', () => {
  test('Escapa tags <script> corretamente', () => {
    expect(escapeHTML('<script>alert(1)</script>')).toBe('&lt;script&gt;alert(1)&lt;/script&gt;');
  });

  test('Escapa aspas e ampersand corretamente', () => {
    expect(escapeHTML('a&b "teste" \'ok\'')).toBe('a&amp;b &quot;teste&quot; &#39;ok&#39;');
  });
});

const total = passed + failed;
console.log('\n==================================================');
console.log(`RESULTADO FINAL: ${passed}/${total} testes passaram`);
if (failed > 0) {
  console.log(`FALHAS (${failed}):`);
  failures.forEach((f) => console.log(` - ${f.descricao}: ${f.erro}`));
  process.exit(1);
}
console.log('Status: TODOS OS TESTES PASSARAM COM SUCESSO.');
process.exit(0);
