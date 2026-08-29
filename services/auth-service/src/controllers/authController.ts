import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';
import { ValidationUtils } from '@nexus/common';
import { RegisterUserSchema, LoginSchema, CreateTenantSchema } from '../dto/auth.dto';

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = ValidationUtils.validate(RegisterUserSchema, req.body);
      const result = await this.authService.registerUser(validated, req.ip);
      res.status(201).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = ValidationUtils.validate(LoginSchema, req.body);
      const result = await this.authService.login(validated, req.ip);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  createTenant = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = ValidationUtils.validate(CreateTenantSchema, req.body);
      const result = await this.authService.provisionTenant(validated);
      res.status(201).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };
}
