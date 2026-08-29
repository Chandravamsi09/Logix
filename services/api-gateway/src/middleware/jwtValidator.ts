import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UnauthorizedException, AuthenticatedUser, UserRole } from '@nexus/common';
import { gatewayConfig } from '../config';

export interface AuthenticatedGatewayRequest extends Request {
  user?: AuthenticatedUser;
}

export const authenticateJwt = (isOptional = false) => {
  return (req: AuthenticatedGatewayRequest, _res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      if (isOptional) {
        return next();
      }
      throw new UnauthorizedException('Missing or malformed Bearer authorization token.');
    }

    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, gatewayConfig.JWT_ACCESS_SECRET) as any;
      req.user = {
        userId: decoded.sub || decoded.userId,
        tenantId: decoded.tenantId,
        email: decoded.email,
        roles: decoded.roles || [UserRole.CUSTOMER],
        permissions: decoded.permissions || [],
        sessionId: decoded.sessionId
      };

      // Propagate user metadata downstream in internal headers
      req.headers['x-user-id'] = req.user.userId;
      req.headers['x-tenant-id'] = req.user.tenantId;
      req.headers['x-user-email'] = req.user.email;
      req.headers['x-user-roles'] = JSON.stringify(req.user.roles);
      req.headers['x-user-permissions'] = JSON.stringify(req.user.permissions);

      next();
    } catch (err: any) {
      if (isOptional) {
        return next();
      }
      throw new UnauthorizedException(`Invalid or expired authorization token: ${err.message}`);
    }
  };
};
