import { Request, Response } from 'express';
import { z } from 'zod';
import { UpdateUserService } from '../../services/user/updateUserService';
import { AppError } from '../../errors/AppError';

const userSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('Email inválido').optional().nullable(),
  active: z.boolean(),
  type: z.enum(['app', 'admin']),
  password: z.string()
    .min(5, 'Senha deve ter no mínimo 5 caracteres')
    .optional()
    .nullable()
    .or(z.literal('')), // Permite string vazia
  canProofOfLife: z.boolean().optional(),
  canRecadastration: z.boolean().optional(),
  rg: z.string().min(1, 'RG é obrigatório').optional(),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida').optional(),
  address: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  registrationNumber: z.string().optional().nullable(),
  processNumber: z.string().optional().nullable(),
  benefitStartDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida').optional(),
  benefitEndDate: z.string().min(1, 'Data fim ou VITALICIO é obrigatório').optional(),
  benefitType: z.enum(['APOSENTADORIA', 'PENSAO']).optional(),
  retirementType: z.string().optional().nullable(),
  insuredName: z.string().optional().nullable(),
  legalRepresentative: z.string().optional().nullable(),
  organizationId: z.string().uuid('ID da organização inválido').optional()
});

export class UpdateUserController {
  async handle(request: Request, response: Response) {
    try {
      const { subdomain, id } = request.params;
      const data = userSchema.parse(request.body);

      // Se não tiver subdomain nos params, usa o organizationId do body
      const organizationId = subdomain || data.organizationId;

      if (!organizationId) {
        throw new AppError('Organization ID is required');
      }

      const updateUserService = new UpdateUserService();

      const user = await updateUserService.execute({
        id,
        organizationId,
        tableType: data.type,
        name: data.name,
        email: data.email,
        active: data.active,
        password: data.password,
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
}