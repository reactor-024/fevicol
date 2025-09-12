import bcrypt from 'bcryptjs';
import { db } from './db';
import { users, organizations, userRoles, type User, type Organization } from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import type { Request, Response, NextFunction } from 'express';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: User & { organization: Organization };
    }
  }
}

export interface AuthUser extends User {
  organization: Organization;
}

export class AuthService {
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  static async authenticateUser(email: string, password: string): Promise<AuthUser | null> {
    try {
      // Find user with organization
      const [userWithOrg] = await db
        .select({
          id: users.id,
          username: users.username,
          email: users.email,
          password: users.password,
          fullName: users.fullName,
          phone: users.phone,
          avatar: users.avatar,
          organizationId: users.organizationId,
          roleId: users.roleId,
          isActive: users.isActive,
          lastLogin: users.lastLogin,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
          organization: {
            id: organizations.id,
            name: organizations.name,
            subdomain: organizations.subdomain,
            settings: organizations.settings,
            isActive: organizations.isActive,
            createdAt: organizations.createdAt,
            updatedAt: organizations.updatedAt,
          }
        })
        .from(users)
        .innerJoin(organizations, eq(users.organizationId, organizations.id))
        .where(and(
          eq(users.email, email),
          eq(users.isActive, true),
          eq(organizations.isActive, true)
        ))
        .limit(1);

      if (!userWithOrg) return null;

      const isPasswordValid = await this.comparePassword(password, userWithOrg.password);
      if (!isPasswordValid) return null;

      // Update last login
      await db
        .update(users)
        .set({ lastLogin: new Date() })
        .where(eq(users.id, userWithOrg.id));

      const { password: _, ...userWithoutPassword } = userWithOrg;
      return userWithoutPassword as AuthUser;
    } catch (error) {
      console.error('Authentication error:', error);
      return null;
    }
  }

  static async registerUser(userData: {
    email: string;
    password: string;
    username: string;
    fullName?: string;
    organizationName?: string;
    organizationSubdomain?: string;
  }): Promise<AuthUser | null> {
    try {
      const hashedPassword = await this.hashPassword(userData.password);

      // Check if user already exists
      const [existingUser] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, userData.email))
        .limit(1);

      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Create organization if provided
      let organizationId: number;
      if (userData.organizationName && userData.organizationSubdomain) {
        const [newOrg] = await db
          .insert(organizations)
          .values({
            name: userData.organizationName,
            subdomain: userData.organizationSubdomain,
          })
          .returning({ id: organizations.id });
        
        organizationId = newOrg.id;

        // Create default admin role for new organization
        await db.insert(userRoles).values({
          name: 'admin',
          description: 'Organization Administrator',
          permissions: ['*'],
          organizationId,
        });
      } else {
        throw new Error('Organization information is required');
      }

      // Get the admin role for this organization
      const [adminRole] = await db
        .select({ id: userRoles.id })
        .from(userRoles)
        .where(and(
          eq(userRoles.organizationId, organizationId),
          eq(userRoles.name, 'admin')
        ))
        .limit(1);

      // Create user
      const [newUser] = await db
        .insert(users)
        .values({
          email: userData.email,
          password: hashedPassword,
          username: userData.username,
          fullName: userData.fullName,
          organizationId,
          roleId: adminRole.id,
        })
        .returning();

      // Fetch user with organization
      const [userWithOrg] = await db
        .select({
          id: users.id,
          username: users.username,
          email: users.email,
          fullName: users.fullName,
          phone: users.phone,
          avatar: users.avatar,
          organizationId: users.organizationId,
          roleId: users.roleId,
          isActive: users.isActive,
          lastLogin: users.lastLogin,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
          organization: {
            id: organizations.id,
            name: organizations.name,
            subdomain: organizations.subdomain,
            settings: organizations.settings,
            isActive: organizations.isActive,
            createdAt: organizations.createdAt,
            updatedAt: organizations.updatedAt,
          }
        })
        .from(users)
        .innerJoin(organizations, eq(users.organizationId, organizations.id))
        .where(eq(users.id, newUser.id))
        .limit(1);

      return userWithOrg as AuthUser;
    } catch (error) {
      console.error('Registration error:', error);
      return null;
    }
  }
}

// Authentication middleware
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session?.userId) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  next();
}

// Role-based authorization middleware
export function requireRole(requiredRoles: string[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    try {
      const [userRole] = await db
        .select({
          name: userRoles.name,
          permissions: userRoles.permissions,
        })
        .from(userRoles)
        .where(eq(userRoles.id, req.user.roleId))
        .limit(1);

      if (!userRole) {
        return res.status(403).json({ message: 'No role found' });
      }

      // Check if user has admin permission (wildcard)
      if (userRole.permissions && userRole.permissions.includes('*')) {
        return next();
      }

      // Check if user has any of the required roles
      const hasRequiredRole = requiredRoles.some(role => 
        userRole.name === role || (userRole.permissions && userRole.permissions.includes(role))
      );

      if (!hasRequiredRole) {
        return res.status(403).json({ message: 'Insufficient permissions' });
      }

      next();
    } catch (error) {
      console.error('Role check error:', error);
      res.status(500).json({ message: 'Authorization error' });
    }
  };
}

// User context middleware - loads user data for authenticated requests
export async function loadUserContext(req: Request, res: Response, next: NextFunction) {
  if (req.session?.userId) {
    try {
      const [userWithOrg] = await db
        .select({
          id: users.id,
          username: users.username,
          email: users.email,
          fullName: users.fullName,
          phone: users.phone,
          avatar: users.avatar,
          organizationId: users.organizationId,
          roleId: users.roleId,
          isActive: users.isActive,
          lastLogin: users.lastLogin,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
          organization: {
            id: organizations.id,
            name: organizations.name,
            subdomain: organizations.subdomain,
            settings: organizations.settings,
            isActive: organizations.isActive,
            createdAt: organizations.createdAt,
            updatedAt: organizations.updatedAt,
          }
        })
        .from(users)
        .innerJoin(organizations, eq(users.organizationId, organizations.id))
        .where(eq(users.id, req.session.userId))
        .limit(1);

      if (userWithOrg && userWithOrg.isActive && userWithOrg.organization.isActive) {
        req.user = userWithOrg as AuthUser;
      } else {
        // Clear invalid session
        delete req.session.userId;
      }
    } catch (error) {
      console.error('User context loading error:', error);
      delete req.session.userId;
    }
  }
  next();
}