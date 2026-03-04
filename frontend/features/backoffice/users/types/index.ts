/**
 * @fileoverview User and team member domain types
 */

/**
 * User role
 */
export type UserRole = 'ADMIN' | 'AGENT' | 'MANAGER' | 'COMMUNITY' | 'CUSTOMER';

/**
 * User status
 */
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION';

/**
 * User entity
 */
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  status: UserStatus;
  role: UserRole;
  verified: boolean;
  lastLogin?: Date;
  loginCount: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User profile with additional info
 */
export interface UserProfile extends User {
  bio?: string;
  company?: string;
  location?: string;
  website?: string;
  licenseNumber?: string;
  isTeamLeader?: boolean;
  teamId?: string;
  permissions: Permission[];
}

/**
 * User permission
 */
export interface Permission {
  id: string;
  name: string;
  description: string;
}

/**
 * Team member entity
 */
export interface TeamMember {
  id: string;
  userId: string;
  user: User;
  teamId: string;
  role: 'LEADER' | 'MEMBER';
  joinedAt: Date;
}

/**
 * Team entity
 */
export interface Team {
  id: string;
  name: string;
  description?: string;
  leader: User;
  members: TeamMember[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User grid item
 */
export interface UserGridItem {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: UserStatus;
  verified: boolean;
  lastLogin?: Date;
  createdAt: Date;
}

/**
 * Paginated users response
 */
export interface UserGridResponse {
  items: UserGridItem[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

/**
 * Create user DTO
 */
export interface CreateUserDto {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  status?: UserStatus;
  password?: string;
  sendInvitation?: boolean;
}

/**
 * Update user DTO
 */
export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  company?: string;
  location?: string;
  licenseNumber?: string;
}

/**
 * Update user status DTO
 */
export interface UpdateUserStatusDto {
  status: UserStatus;
}

/**
 * Update user role DTO
 */
export interface UpdateUserRoleDto {
  role: UserRole;
}

/**
 * Change password DTO
 */
export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Query parameters for user filtering
 */
export interface UserQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole;
  status?: UserStatus;
  verified?: boolean;
  sortField?: 'createdAt' | 'email' | 'firstName';
  sortOrder?: 'asc' | 'desc';
}