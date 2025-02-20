import { Request, Response } from 'express';
import { CreateUserService } from '../../services/user/createUserService';
import { z } from 'zod';
import { UserTableType } from '../../types/user';

export class CreateUserController {
  async handleAdmin(request: Request, response: Response) {
    try {
      const baseUserSchema = z.object({
        name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
        email: z.string().optional().or(z.literal('')),
        cpf: z.string().regex(/^\d{11}$/, 'CPF inválido'),
        password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
        type: z.enum(['admin', 'app']),
        organizationId: z.string().uuid('ID da organização inválido')
      });

      const appUserSchema = baseUserSchema.extend({
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

      const data = request.body;
      const createUserService = new CreateUserService();

      // Use appropriate schema based on user type
      if (data.type === 'admin') {
        const validatedData = baseUserSchema.parse(data);
        const user = await createUserService.execute({
          ...validatedData,
          tableType: validatedData.type as UserTableType
        });
        return response.status(201).json(user);
      } else {
        const validatedData = appUserSchema.parse(data);
        const user = await createUserService.execute({
          ...validatedData,
          tableType: validatedData.type as UserTableType
        });
        return response.status(201).json(user);
      }
    } catch (error: any) {
      console.error('Error in createUserController.handleAdmin:', error);
      
      if (error instanceof z.ZodError) {
        return response.status(400).json({
          error: 'Validation error',
          details: error.errors
        });
      }

      if (error instanceof Error) {
        return response.status(400).json({
          error: error.message
        });
      }

      return response.status(500).json({
        error: 'Internal server error'
      });
    }
  }

  async handle(request: Request, response: Response) {
    try {
      const { subdomain } = request.params;

      const baseUserSchema = z.object({
        name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
        email: z.string().optional().or(z.literal('')),
        cpf: z.string().regex(/^\d{11}$/, 'CPF inválido'),
        password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
        type: z.enum(['admin', 'app'])
      });

      const appUserSchema = baseUserSchema.extend({
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

      const data = request.body;
      const createUserService = new CreateUserService();

      // Use appropriate schema based on user type
      if (data.type === 'admin') {
        const validatedData = baseUserSchema.parse(data);
        const user = await createUserService.execute({
          ...validatedData,
          tableType: validatedData.type as UserTableType,
          organizationId: request.organization?.id || ''
        });
        return response.status(201).json(user);
      } else {
        const validatedData = appUserSchema.parse(data);
        const user = await createUserService.execute({
          ...validatedData,
          tableType: validatedData.type as UserTableType,
          organizationId: request.organization?.id || ''
        });
        return response.status(201).json(user);
      }
    } catch (error: any) {
      console.error('Error in createUserController.handle:', error);
      
      if (error instanceof z.ZodError) {
        return response.status(400).json({
          error: 'Validation error',
          details: error.errors
        });
      }

      if (error instanceof Error) {
        return response.status(400).json({
          error: error.message
        });
      }

      return response.status(500).json({
        error: 'Internal server error'
      });
    }
  }
}