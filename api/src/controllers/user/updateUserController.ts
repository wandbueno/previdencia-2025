import { Request, Response } from 'express';
import { z } from 'zod';
import { UpdateUserService } from '../../services/user/updateUserService';
import { UserTableType } from '../../types/user';
import { AppError } from '../../errors/AppError';

export class UpdateUserController {
  async handle(request: Request, response: Response) {
    try {
      const { subdomain, id } = request.params;
      const { type } = request.body;

      const updateUserSchema = z.object({
        name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
        email: z.string().email('Email inválido').optional().or(z.literal('')),
        active: z.boolean(),
        type: z.enum(['admin', 'app']),
        canProofOfLife: z.boolean().optional(),
        canRecadastration: z.boolean().optional(),
        rg: z.string().min(1, 'RG é obrigatório'),
        birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida'),
        address: z.string().optional().or(z.literal('')),
        phone: z.string().optional().or(z.literal('')),
        registrationNumber: z.string().optional().or(z.literal('')),
        processNumber: z.string().optional().or(z.literal('')),
        benefitStartDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida'),
        benefitEndDate: z.string().min(1, 'Data fim ou VITALICIO é obrigatório'),
        benefitType: z.enum(['APOSENTADORIA', 'PENSAO']),
        retirementType: z.string().optional().or(z.literal('')),
        insuredName: z.string().optional().or(z.literal('')),
        legalRepresentative: z.string().optional().or(z.literal(''))
      });

      const data = updateUserSchema.parse(request.body);

      const updateUserService = new UpdateUserService();
      const user = await updateUserService.execute({
        id,
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
        insuredName: data.insuredName,
        legalRepresentative: data.legalRepresentative,
        subdomain,
        tableType: type as UserTableType
      });

      return response.json(user);
    } catch (error: any) {
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

      console.error('Error updating user:', error);
      return response.status(500).json({
        error: 'Internal server error'
      });
    }
  }

  async handleAdmin(request: Request, response: Response) {
    try {
      // Verifica se é superadmin
      if (!request.user.isSuperAdmin) {
        throw new AppError('Não autorizado. Apenas super administradores podem atualizar usuários.', 403);
      }

      const { id } = request.params;
      const { type, organizationId } = request.body;

      const updateUserSchema = z.object({
        name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
        email: z.string().email('Email inválido').optional().or(z.literal('')),
        active: z.boolean(),
        type: z.enum(['admin', 'app']),
        organizationId: z.string().uuid('ID da organização inválido'),
        canProofOfLife: z.boolean().optional(),
        canRecadastration: z.boolean().optional(),
        rg: z.string().min(1, 'RG é obrigatório'),
        birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida'),
        address: z.string().optional().or(z.literal('')),
        phone: z.string().optional().or(z.literal('')),
        registrationNumber: z.string().optional().or(z.literal('')),
        processNumber: z.string().optional().or(z.literal('')),
        benefitStartDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida'),
        benefitEndDate: z.string().min(1, 'Data fim ou VITALICIO é obrigatório'),
        benefitType: z.enum(['APOSENTADORIA', 'PENSAO']),
        retirementType: z.string().optional().or(z.literal('')),
        insuredName: z.string().optional().or(z.literal('')),
        legalRepresentative: z.string().optional().or(z.literal(''))
      });

      const data = updateUserSchema.parse(request.body);

      const updateUserService = new UpdateUserService();
      const user = await updateUserService.execute({
        id,
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
        insuredName: data.insuredName,
        legalRepresentative: data.legalRepresentative,
        tableType: type as UserTableType,
        organizationId
      });

      return response.json(user);
    } catch (error: any) {
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

      console.error('Error updating user:', error);
      return response.status(500).json({
        error: 'Internal server error'
      });
    }
  }
}