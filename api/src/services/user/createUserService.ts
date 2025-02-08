import { db } from '../../lib/database';
import { AppError } from '../../errors/AppError';
import { hash } from 'bcryptjs';
import { generateId, getCurrentTimestamp } from '../../utils/database';
import { CreateUserDTO, UserType } from '../../types/user';

export class CreateUserService {
  async execute({ 
    name, 
    email, 
    cpf, 
    password, 
    tableType, 
    organizationId,
    canProofOfLife,
    canRecadastration,
    rg,
    birthDate,
    address,
    phone,
    registrationNumber,
    processNumber,
    benefitStartDate,
    benefitEndDate,
    benefitType,
    retirementType,
    insuredName,
    legalRepresentative
  }: CreateUserDTO) {
    try {
      const mainDb = db.getMainDb();
      const tableName = tableType === 'admin' ? 'admin_users' : 'app_users';
      const role: UserType = tableType === 'admin' ? 'ADMIN' : 'USER';

      // Get organization
      const organization = mainDb.prepare(`
        SELECT subdomain, name FROM organizations 
        WHERE id = ? AND active = 1
      `).get(organizationId) as { subdomain: string; name: string } | undefined;

      if (!organization) {
        throw new AppError('Organization not found or inactive');
      }

      const organizationDb = await db.getOrganizationDb(organization.subdomain);

      // Check if CPF is already in use (only if email is provided)
      // if (email) {
      //   const emailExists = organizationDb.prepare(`
      //     SELECT 1 FROM ${tableName} WHERE email = ?
      //   `).get(email);

      //   if (emailExists) {
      //     throw new AppError('Email already in use');
      //   }
      // }

      // Check if CPF is already in use
      const cpfExists = organizationDb.prepare(`
        SELECT 1 FROM ${tableName} WHERE cpf = ?
      `).get(cpf);

      if (cpfExists) {
        throw new AppError('CPF já em uso');
      }

      const id = generateId();
      const hashedPassword = await hash(password, 8);
      const timestamp = getCurrentTimestamp();

      // Create user in organization database
      const query = tableName === 'app_users' 
        ? `
          INSERT INTO ${tableName} (
            id, name, cpf, email, password,
            role, active, can_proof_of_life, can_recadastration,
            rg, birth_date, address, phone, registration_number,
            process_number, benefit_start_date, benefit_end_date,
            benefit_type, retirement_type, insured_name,
            legal_representative, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `
        : `
          INSERT INTO ${tableName} (
            id, name, cpf, email, password,
            role, active, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)
        `;

      const params = tableName === 'app_users'
        ? [
            id,
            name,
            cpf,
            email || null,
            hashedPassword,
            role,
            canProofOfLife === true ? 1 : 0,
            canRecadastration === true ? 1 : 0,
            rg,
            birthDate,
            address || null,
            phone || null,
            registrationNumber,
            processNumber,
            benefitStartDate,
            benefitEndDate,
            benefitType,
            retirementType || null,
            insuredName || null,
            legalRepresentative || null,
            timestamp,
            timestamp
          ]
        : [
            id,
            name,
            cpf,
            email || null,
            hashedPassword,
            role,
            timestamp,
            timestamp
          ];

      organizationDb.prepare(query).run(...params);

      return {
        id,
        name,
        email,
        cpf,
        role,
        active: true,
        canProofOfLife: tableName === 'app_users' ? Boolean(canProofOfLife) : undefined,
        canRecadastration: tableName === 'app_users' ? Boolean(canRecadastration) : undefined,
        rg,
        birthDate,
        address,
        phone,
        registrationNumber,
        processNumber,
        benefitStartDate,
        benefitEndDate,
        benefitType,
        retirementType,
        insuredName,
        legalRepresentative,
        createdAt: timestamp,
        updatedAt: timestamp,
        organizationId,
        organizationName: organization.name
      };
    } catch (error) {
      console.error('Error creating user:', error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Error creating user');
    }
  }
}