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
      level: DEFAULT_POLICY_ID,
      forceChangeOnFirstLogin: false,
      isExpirationActive: false,
      expirationDays: 90
    };
  }

  // Se for uma string de nível (ex: 'low' | 'medium' | 'high' | 'very_high')
  if (typeof policyData === 'string' && PASSWORD_DIFFICULTY_LEVELS[policyData]) {
    return {
      ...PASSWORD_DIFFICULTY_LEVELS[policyData],
      level: policyData,
      forceChangeOnFirstLogin: false,
      isExpirationActive: false,
      expirationDays: 90
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
    forceChangeOnFirstLogin: !!policyData.forceChangeOnFirstLogin,
    isExpirationActive: !!policyData.isExpirationActive,
    expirationDays: typeof policyData.expirationDays === 'number' ? policyData.expirationDays : 90,
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

/**
 * Verifica o status de expiração da senha do usuário
 */
export function checkPasswordExpiration(user, tenantSettings) {
  const policy = getEffectivePasswordPolicy(tenantSettings);
  if (!policy.isExpirationActive || !policy.expirationDays) {
    return { isExpired: false, daysRemaining: null, daysSinceChange: 0, isExpiringSoon: false };
  }

  // Data de referência: passwordUpdatedAt ou createdAt
  const changeDateStr = user?.passwordUpdatedAt || user?.passwordLastChangedAt || user?.createdAt;
  if (!changeDateStr) {
    return { isExpired: false, daysRemaining: policy.expirationDays, daysSinceChange: 0, isExpiringSoon: false };
  }

  const changeDate = new Date(changeDateStr);
  const now = new Date();
  const diffTime = now.getTime() - changeDate.getTime();
  const daysSinceChange = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const daysRemaining = policy.expirationDays - daysSinceChange;

  const isExpired = daysRemaining <= 0;
  // Alerta preventivo se faltar 7 dias ou menos
  const isExpiringSoon = !isExpired && daysRemaining <= 7;

  return {
    isExpired,
    daysRemaining: Math.max(0, daysRemaining),
    daysSinceChange,
    isExpiringSoon,
    expiryDaysTotal: policy.expirationDays
  };
}

/**
 * Avalia se o usuário deve ser forçado a alterar a senha
 */
export function shouldForcePasswordChange(user, tenantSettings) {
  if (!user) return { shouldForce: false, reason: '' };

  const policy = getEffectivePasswordPolicy(tenantSettings);

  // 1. Checagem de Primeiro Acesso
  if (policy.forceChangeOnFirstLogin) {
    if (user.mustChangePassword === true) {
      return { shouldForce: true, reason: 'first_login' };
    }
    // Se o usuário foi criado e nunca atualizou a senha (não tem passwordUpdatedAt)
    if (!user.passwordUpdatedAt && user.createdAt) {
      return { shouldForce: true, reason: 'first_login' };
    }
  }

  // 2. Checagem de Expiração Periódica
  if (policy.isExpirationActive) {
    const expiration = checkPasswordExpiration(user, tenantSettings);
    if (expiration.isExpired) {
      return { shouldForce: true, reason: 'expired', expiration };
    }
  }

  return { shouldForce: false, reason: '' };
}
