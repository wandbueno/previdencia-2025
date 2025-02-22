import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import { db } from '../lib/database';
import { OrganizationRow } from '../types/organization';
import { RequestOrganization } from '../types/express';

export async function ensureOrganizationAdmin(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const { organizationId, id: userId, role } = request.user;

  if (!organizationId || !userId) {
    throw new AppError('Unauthorized', 401);
  }

  try {
    // Get organization from main database
    const mainDb = db.getMainDb();
    const organization = mainDb.prepare(`
      SELECT id, name, subdomain, state, city, active, services
      FROM organizations 
      WHERE id = ? AND active = 1
    `).get(organizationId) as OrganizationRow | undefined;

    if (!organization) {
      throw new AppError('Organization not found or inactive', 404);
    }

    // Get organization database
    const organizationDb = db.getOrganizationDb(organization.subdomain);

    // Check if user is an admin in this organization
    const adminUser = organizationDb.prepare(`
      SELECT id, role FROM admin_users 
      WHERE id = ? AND active = 1 AND role = 'ADMIN'
    `).get(userId);

    if (!adminUser && role !== 'ADMIN') {
      throw new AppError('User is not an admin of this organization', 403);
    }

    // Add organization to request with parsed services
    request.organization = {
      id: organization.id,
      name: organization.name,
      subdomain: organization.subdomain,
      state: organization.state,
      city: organization.city,
      active: organization.active,
      services: JSON.parse(organization.services || '[]')
    } as RequestOrganization;

    return next();
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Error checking organization admin permissions', 500);
  }
}