import jwt from 'jsonwebtoken';
import { authConfig } from '../config';
import { UserEntity } from '../models/entities';
import { AuthenticatedUser } from '@nexus/common';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export class TokenService {
  static generateAuthTokens(user: UserEntity): AuthTokens {
    const payload: AuthenticatedUser = {
      userId: user.id,
      tenantId: user.tenantId,
      email: user.email,
      roles: user.roles,
      permissions: user.permissions
    };

    const accessToken = jwt.sign(payload, authConfig.JWT_ACCESS_SECRET, {
      expiresIn: authConfig.JWT_ACCESS_EXPIRATION,
      subject: user.id
    });

    const refreshToken = jwt.sign(
      { sub: user.id, tenantId: user.tenantId },
      authConfig.JWT_REFRESH_SECRET,
      { expiresIn: authConfig.JWT_REFRESH_EXPIRATION }
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: 900 // 15 mins in seconds
    };
  }

  static verifyRefreshToken(token: string): { sub: string; tenantId: string } {
    return jwt.verify(token, authConfig.JWT_REFRESH_SECRET) as { sub: string; tenantId: string };
  }
}
