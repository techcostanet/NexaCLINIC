/**
 * Política de Complexidade e Segurança de Senhas — Nex-Ai CLINIC
 * Permite parametrização por tenant/clínica para que cada instituição defina seu nível de exigência.
 */

export const PASSWORD_DIFFICULTY_LEVELS = {
  low: {
    id: 'low',
    name: 'Simples',
    badge: 'Flexível',
    color: '#0284c7', // Sky
    minLength: 4,
    requireLetters: false,
    requireNumbers: false,
    requireUppercase: false,
    requireSpecialChars: false,
    description: 'Mínimo de 4 dígitos ou caracteres livres. Ideal para agilidade máxima no plantão.',
    example: '1234, plantao1'
  },
  medium: {
    id: 'medium',
    name: 'Padrão',
    badge: 'Recomendado',
    color: '#10b981', // Emerald
    minLength: 6,
    requireLetters: true,
    requireNumbers: true,
    requireUppercase: false,
    requireSpecialChars: false,
    description: 'Mínimo de 6 caracteres combinando letras e números. Equilíbrio entre segurança e usabilidade hospitalar.',
    example: 'clinica123, nexa2026'
  },
  high: {
    id: 'high',
    name: 'Forte',
    badge: 'Corporativo',
    color: '#f59e0b', // Amber
    minLength: 8,
    requireLetters: true,
    requireNumbers: true,
    requireUppercase: true,
    requireSpecialChars: false,
    description: 'Mínimo de 8 caracteres contendo letras maiúsculas, minúsculas e números.',
    example: 'Clinica2026, SaudeNexa1'
  },
  very_high: {
    id: 'very_high',
    name: 'Rigoroso',
    badge: 'LGPD',
    color: '#8b5cf6', // Violet
    minLength: 8,
    requireLetters: true,
    requireNumbers: true,
    requireUppercase: true,
    requireSpecialChars: true,
    description: 'Mínimo de 8 caracteres com letras maiúsculas, minúsculas, números e caracteres especiais (!@#$...).',
    example: 'Nexa#2026!, Clinica$89'
  }
};

export const DEFAULT_POLICY_ID = 'medium';

/**
 * Obtém a política de senha ativa com base nas configurações da clínica (tenantSettings)
 */
export function getEffectivePasswordPolicy(tenantSettings) {
  const policyData = tenantSettings?.passwordPolicy;
  
  if (!policyData) {
    return {
      ...PASSWORD_DIFFICULTY_LEVELS[DEFAULT_POLICY_ID],
      level: DEFAULT_POLICY_ID
    };
  }

  // Se for uma string de nível (ex: 'low' | 'medium' | 'high' | 'very_high')
  if (typeof policyData === 'string' && PASSWORD_DIFFICULTY_LEVELS[policyData]) {
    return {
      ...PASSWORD_DIFFICULTY_LEVELS[policyData],
      level: policyData
    };
  }

  // Se for um objeto com level e customizações
  const baseLevel = policyData.level && PASSWORD_DIFFICULTY_LEVELS[policyData.level]
    ? PASSWORD_DIFFICULTY_LEVELS[policyData.level]
    : PASSWORD_DIFFICULTY_LEVELS[DEFAULT_POLICY_ID];

  return {
    ...baseLevel,
    ...policyData,
    minLength: typeof policyData.minLength === 'number' ? policyData.minLength : baseLevel.minLength,
    requireLetters: policyData.requireLetters !== undefined ? !!policyData.requireLetters : baseLevel.requireLetters,
    requireNumbers: policyData.requireNumbers !== undefined ? !!policyData.requireNumbers : baseLevel.requireNumbers,
    requireUppercase: policyData.requireUppercase !== undefined ? !!policyData.requireUppercase : baseLevel.requireUppercase,
    requireSpecialChars: policyData.requireSpecialChars !== undefined ? !!policyData.requireSpecialChars : baseLevel.requireSpecialChars,
    level: policyData.level || DEFAULT_POLICY_ID
  };
}

/**
 * Valida uma senha frente à política informada e calcula força em tempo real
 */
export function validatePasswordAgainstPolicy(password = '', policyInput) {
  const policy = policyInput?.minLength !== undefined ? policyInput : getEffectivePasswordPolicy(policyInput);
  const pwd = String(password || '');

  const hasMinLength = pwd.length >= policy.minLength;
  const hasLetters = /[a-zA-Z]/.test(pwd);
  const hasNumbers = /[0-9]/.test(pwd);
  const hasUppercase = /[A-Z]/.test(pwd);
  const hasSpecial = /[^a-zA-Z0-9]/.test(pwd);

  const checks = [
    {
      id: 'length',
      label: `Mínimo ${policy.minLength} dígitos`,
      met: hasMinLength,
      required: true
    }
  ];

  if (policy.requireLetters) {
    checks.push({
      id: 'letters',
      label: 'Conter letras',
      met: hasLetters,
      required: true
    });
  }

  if (policy.requireNumbers) {
    checks.push({
      id: 'numbers',
      label: 'Conter números',
      met: hasNumbers,
      required: true
    });
  }

  if (policy.requireUppercase) {
    checks.push({
      id: 'uppercase',
      label: 'Letra maiúscula',
      met: hasUppercase,
      required: true
    });
  }

  if (policy.requireSpecialChars) {
    checks.push({
      id: 'special',
      label: 'Símbolo especial (!@#$)',
      met: hasSpecial,
      required: true
    });
  }

  const errors = [];
  if (!hasMinLength) {
    errors.push(`A senha deve ter no mínimo ${policy.minLength} caracteres.`);
  }
  if (policy.requireLetters && !hasLetters) {
    errors.push('A senha deve conter pelo menos uma letra.');
  }
  if (policy.requireNumbers && !hasNumbers) {
    errors.push('A senha deve conter pelo menos um número.');
  }
  if (policy.requireUppercase && !hasUppercase) {
    errors.push('A senha deve conter pelo menos uma letra maiúscula.');
  }
  if (policy.requireSpecialChars && !hasSpecial) {
    errors.push('A senha deve conter pelo menos um caractere especial (ex: !@#$%).');
  }

  // Cálculo de pontuação de força (0 a 100)
  let score = 0;
  if (pwd.length > 0) {
    if (hasMinLength) score += 30;
    if (pwd.length >= 8) score += 15;
    if (pwd.length >= 12) score += 10;
    if (hasLetters) score += 15;
    if (hasNumbers) score += 15;
    if (hasUppercase) score += 10;
    if (hasSpecial) score += 10;
  }
  score = Math.min(100, score);

  let strengthLabel = 'Fraca';
  let strengthColor = '#ef4444'; // Red

  if (score >= 80) {
    strengthLabel = 'Excelente';
    strengthColor = '#10b981'; // Green
  } else if (score >= 60) {
    strengthLabel = 'Forte';
    strengthColor = '#059669'; // Emerald
  } else if (score >= 40) {
    strengthLabel = 'Média';
    strengthColor = '#f59e0b'; // Amber
  } else if (score >= 20) {
    strengthLabel = 'Baixa';
    strengthColor = '#f97316'; // Orange
  }

  return {
    isValid: errors.length === 0 && pwd.length > 0,
    score,
    strengthLabel,
    strengthColor,
    checks,
    errors,
    error: errors[0] || null
  };
}
