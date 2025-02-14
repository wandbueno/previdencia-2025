import { Request, Response } from 'express';
import { z } from 'zod';
import { UpdateUserService } from '../../services/user/updateUserService';
import { AppError } from '../../errors/AppError';

const appUserSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('Email inválido').optional().nullable(),
  active: z.boolean(),
  type: z.literal('app'),
  canProofOfLife: z.boolean(),
  canRecadastration: z.boolean(),
  rg: z.string().min(1, 'RG é obrigatório'),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida'),
  address: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  registrationNumber: z.string().optional().nullable(),
  processNumber: z.string().optional().nullable(),
  benefitStartDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida'),
  benefitEndDate: z.string().min(1, 'Data fim ou VITALICIO é obrigatório'),
  benefitType: z.enum(['APOSENTADORIA', 'PENSAO']),
  retirementType: z.string().optional().nullable(),
  pensionGrantorName: z.string().optional().nullable(),
  legalRepresentative: z.string().optional().nullable()
});

const adminUserSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('Email inválido').optional().nullable(),
  active: z.boolean(),
  type: z.literal('admin')
});

export class UpdateUserController {
  async handle(request: Request, response: Response) {
    try {
      const { subdomain, id } = request.params;
      const data = appUserSchema.parse(request.body);

      const updateUserService = new UpdateUserService();

      const user = await updateUserService.execute({
        id,
        subdomain,
        tableType: 'app',
        name: data.name,
        email: data.email,
        active: data.active,
        canProofOfLife: data.canProofOfLife,
        canRecadastration: data.canRecadastration,
        rg: data.rg,
        birthDate: data.birthDate,
        address: data.address,
        phone: data.phone,
        registrationNumber: data.registrationNumber,
        processNumber: data.processNumber,
        benefitStartDate: data.benefitStartDate,
        benefitEndDate: data.benefitEndDate,
        benefitType: data.benefitType,
        retirementType: data.retirementType,
        pensionGrantorName: data.pensionGrantorName,
        legalRepresentative: data.legalRepresentative
      });

      return response.json(user);
    } catch (error: any) {
      console.error('Error in UpdateUserController:', error);
      
      if (error instanceof z.ZodError) {
        return response.status(400).json({
          error: 'Validation error',
          details: error.errors
        });
      }

      if (error instanceof AppError) {
        return response.status(error.statusCode).json({
          error: error.message
        });
      }

      return response.status(500).json({
        error: 'Internal server error'
      });
    }
  }

  async handleAdmin(request: Request, response: Response) {
    try {
      const { id } = request.params;
      const data = adminUserSchema.parse(request.body);

      const updateUserService = new UpdateUserService();

      const user = await updateUserService.execute({
        id,
        subdomain: 'wandbueno', // Admin users são sempre da organização principal
        tableType: 'admin',
        name: data.name,
        email: data.email,
        active: data.active
      });

      return response.json(user);
    } catch (error: any) {
      console.error('Error in UpdateUserController.handleAdmin:', error);
      
      if (error instanceof z.ZodError) {
        return response.status(400).json({
          error: 'Validation error',
          details: error.errors
        });
      }

      if (error instanceof AppError) {
        return response.status(error.statusCode).json({
          error: error.message
        });
      }

      return response.status(500).json({
        error: 'Internal server error'
      });
    }
  }
}