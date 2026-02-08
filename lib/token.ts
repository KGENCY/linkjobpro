// 12자리 랜덤 토큰 생성
export function generateToken(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let token = '';
  for (let i = 0; i < 12; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

// 토큰 유효성 검증
export function validateToken(token: string): boolean {
  if (!token || typeof token !== 'string') return false;
  if (token.length !== 12) return false;
  // 허용된 문자만 포함하는지 확인
  const validChars = /^[A-HJ-NP-Za-hj-np-z2-9]+$/;
  return validChars.test(token);
}

// 토큰 타입 (외국인/기업)
export type TokenType = 'foreigner' | 'company';

// 토큰으로 케이스 ID 조회를 위한 매핑 키 생성
export function getTokenMappingKey(token: string, type: TokenType): string {
  return `token_${type}_${token}`;
}
