interface QRSession {
  token: string | null;
  timeout: NodeJS.Timeout;
}

const qrMap = new Map<string, QRSession>();

export const createQRSession = (code: string): void => {
  if (qrMap.has(code)) return;

  const timeout = setTimeout(() => {
    qrMap.delete(code);
  }, 60000); // 60 segundos

  qrMap.set(code, { token: null, timeout });
};

export const linkTokenToQR = (code: string, token: string): boolean => {
  const entry = qrMap.get(code);
  if (!entry) return false;
  
  entry.token = token;
  return true;
};

export const getTokenForQR = (code: string): string | null => {
  return qrMap.get(code)?.token ?? null;
};

export const clearQRSession = (code: string): void => {
  const entry = qrMap.get(code);
  if (entry) {
    clearTimeout(entry.timeout);
    qrMap.delete(code);
  }
};

// Opcional: Para propósitos de desarrollo/testing
export const getQRSessionCount = (): number => qrMap.size;