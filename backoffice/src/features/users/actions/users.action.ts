'use server';

import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth';
import { env } from '@/lib/env';
import { revalidatePath } from 'next/cache';

export type GridSort = 'asc' | 'desc';

export interface CommunityUsersGridParams {
  fields?: string; // comma-separated list of fields
  sort?: GridSort;
  sortField?: string;
  search?: string;
  filtration?: boolean;
  filters?: string; // e.g. "status-ACTIVE,email-test@example.com"
  pagination?: boolean;
  page?: number;
  limit?: number;
}

export interface CommunityUserGridRow {
  id: string;
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export type CommunityUsersGridResponse =
  | CommunityUserGridRow[]
  | { data: CommunityUserGridRow[]; total: number; page: number; limit: number; totalPages: number };

async function fetchCommunityUsersGrid(
  url: URL,
  accessToken: string,
): Promise<Response> {
  return fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
    cache: 'no-store',
  });
}

/**
 * Get community users grid with pagination, search, and filtering
 * Follows the same pattern as getSalePropertiesGrid
 */
export async function getCommunityUsersGrid(
  params: CommunityUsersGridParams = {}
): Promise<CommunityUsersGridResponse> {
  const session = await getServerSession(authOptions);
  const accessToken = session?.accessToken;

  if (!accessToken) {
    throw new Error('No hay una sesión activa para consultar usuarios de la comunidad.');
  }

  const url = new URL(`${env.backendApiUrl}/users/grid/community`);

  // map boolean flags to 'true'|'false' strings
  const setBoolParam = (key: string, value?: boolean) => {
    if (typeof value === 'boolean') url.searchParams.set(key, value ? 'true' : 'false');
  };

  // attach params
  if (params.fields) url.searchParams.set('fields', params.fields);
  if (params.sort) url.searchParams.set('sort', params.sort);
  if (params.sortField) url.searchParams.set('sortField', params.sortField);
  if (typeof params.search === 'string') url.searchParams.set('search', params.search);
  if (typeof params.filters === 'string') url.searchParams.set('filters', params.filters);
  setBoolParam('filtration', params.filtration);
  setBoolParam('pagination', params.pagination);
  if (typeof params.page === 'number') url.searchParams.set('page', String(params.page));
  if (typeof params.limit === 'number') url.searchParams.set('limit', String(params.limit));

  console.log('Fetching community users with params:', url.toString()); // Debugging log

  const response = await fetchCommunityUsersGrid(url, accessToken);
  const responseText = await response.text();
  console.log('Backend response:', responseText); // Log backend response for debugging

  if (!response.ok) {
    let message = `Error ${response.status} al obtener usuarios de la comunidad`;
    try {
      const payload = JSON.parse(responseText);
      if (payload?.message) message = payload.message;
    } catch {}
    throw new Error(message);
  }

  const result = JSON.parse(responseText);
  return result as CommunityUsersGridResponse;
}

export type ListAdministratorsParams = {
	search?: string;
};

export type BackendAdministrator = {
	id: string;
	username: string;
	email: string;
	status?: string;
	personalInfo?: {
		firstName?: string | null;
		lastName?: string | null;
		phone?: string | null;
		avatarUrl?: string | null;
		address?: string | null;
		city?: string | null;
		state?: string | null;
		country?: string | null;
		profession?: string | null;
		company?: string | null;
		nationality?: string | null;
		gender?: string | null;
		maritalStatus?: string | null;
	} | null;
};

export async function listAdministrators(
	params: ListAdministratorsParams = {},
): Promise<{
  success: boolean;
  data?: {
    data: BackendAdministrator[];
    total: number;
    page: number;
    limit: number;
  };
  error?: string;
}> {
	const session = await getServerSession(authOptions);
	const accessToken = session?.accessToken;

	if (!accessToken) {
		return { success: false, error: 'No hay una sesión activa para consultar administradores.' };
	}

	const url = new URL(`${env.backendApiUrl}/users/admins`);

	const normalizedSearch = params.search?.trim();
	if (normalizedSearch) {
		url.searchParams.set('search', normalizedSearch);
	}

	const response = await fetch(url.toString(), {
		headers: {
			Authorization: `Bearer ${accessToken}`,
			Accept: 'application/json',
		},
		cache: 'no-store',
	});

	if (!response.ok) {
		const payload = (await response.json().catch(() => null)) as
			| { message?: string }
			| null;

		return {
			success: false,
			error: payload?.message ?? `Error ${response.status} al obtener la lista de administradores`,
		};
	}

	const data = await response.json();
	return { success: true, data: { data, total: data.length, page: 1, limit: data.length } };
}

export async function listAdminsAgents(params: {
	search?: string;
	page?: number;
	limit?: number;
} = {}): Promise<{
  success: boolean;
  data?: {
    data: BackendAdministrator[];
    total: number;
    page: number;
    limit: number;
  };
  error?: string;
}> {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.accessToken) {
			return { success: false, error: 'No authenticated' };
		}

		const searchParams = new URLSearchParams();
		if (params.search) searchParams.set('search', params.search);
		if (params.page) searchParams.set('page', params.page.toString());
		if (params.limit) searchParams.set('limit', params.limit.toString());

		const url = `${env.backendApiUrl}/users/admins-agents?${searchParams.toString()}`;
		
		const response = await fetch(url, {
			method: 'GET',
			headers: {
				'Authorization': `Bearer ${session.accessToken}`,
				'Content-Type': 'application/json',
			},
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => null);
			return { 
				success: false, 
				error: errorData?.message || `HTTP ${response.status}` 
			};
		}

		const data = await response.json();
		return { success: true, data };
	} catch (error) {
		console.error('Error listing admins and agents:', error);
		return { 
			success: false, 
			error: error instanceof Error ? error.message : 'Unknown error' 
		};
	}
}

export async function listAgents(params: {
	search?: string;
	page?: number;
	limit?: number;
} = {}): Promise<{
  success: boolean;
  data?: {
    data: BackendAdministrator[];
    total: number;
    page: number;
    limit: number;
  };
  error?: string;
}> {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.accessToken) {
			return { success: false, error: 'No authenticated' };
		}

		const searchParams = new URLSearchParams();
		if (params.search) searchParams.set('search', params.search);
		if (params.page) searchParams.set('page', params.page.toString());
		if (params.limit) searchParams.set('limit', params.limit.toString());

		const url = `${env.backendApiUrl}/users/agents?${searchParams.toString()}`;
		
		const response = await fetch(url, {
			method: 'GET',
			headers: {
				'Authorization': `Bearer ${session.accessToken}`,
				'Content-Type': 'application/json',
			},
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => null);
			return { 
				success: false, 
				error: errorData?.message || `HTTP ${response.status}` 
			};
		}

		const data = await response.json();
		return { success: true, data };
	} catch (error) {
		console.error('Error listing agents:', error);
		return { 
			success: false, 
			error: error instanceof Error ? error.message : 'Unknown error' 
		};
	}
}

// ===================================
// CRUD Operations for Users
// ===================================

export interface CreateUserDto {
	username: string;
	email: string;
	password: string;
	role?: 'ADMIN' | 'AGENT';
	personalInfo?: {
		firstName?: string;
		lastName?: string;
		phone?: string;
		avatarUrl?: string;
	};
}

export interface UpdateUserDto {
	username?: string;
	email?: string;
	role?: 'ADMIN' | 'AGENT';
	status?: 'ACTIVE' | 'INACTIVE';
	personalInfo?: {
		firstName?: string;
		lastName?: string;
		phone?: string;
		avatarUrl?: string;
		address?: string;
		city?: string;
		state?: string;
		country?: string;
		profession?: string;
		company?: string;
		nationality?: string;
		gender?: string;
		maritalStatus?: string;
	};
}

export interface ChangePasswordDto {
	oldPassword: string;
	newPassword: string;
}

/**
 * Create a new admin user
 */
export async function createAdmin(data: {
	username: string;
	email: string;
	password: string;
	firstName: string;
	lastName: string;
	phone?: string;
	avatarFile?: File;
}): Promise<{
  success: boolean;
  data?: BackendAdministrator;
  error?: string;
  message?: string;
}> {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.accessToken) {
			console.error('[createAdmin] No access token found');
			return { success: false, error: 'No autenticado' };
		}

		console.log('[createAdmin] Starting admin creation with:', {
			username: data.username,
			email: data.email,
			firstName: data.firstName,
			lastName: data.lastName,
			phone: data.phone,
			hasAvatar: !!data.avatarFile,
		});

		let avatarUrl: string | undefined = undefined;

		// Step 1: Upload avatar if provided
		if (data.avatarFile && data.avatarFile.size > 0) {
			console.log('[createAdmin] Uploading avatar...');
			const uploadFormData = new FormData();
			uploadFormData.append('file', data.avatarFile);
			uploadFormData.append('path', 'public/users');

			const uploadRes = await fetch(`${env.backendApiUrl}/multimedia/upload`, {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${session.accessToken}`,
				},
				body: uploadFormData,
			});

			if (!uploadRes.ok) {
				const error = await uploadRes.json().catch(() => null);
				console.error('[createAdmin] Avatar upload failed:', error);
				return {
					success: false,
					error: 'Error al subir avatar: ' + (error?.message || 'Error desconocido'),
				};
			}

			const uploadData = await uploadRes.json();
			avatarUrl = uploadData.url || uploadData.path;
			console.log('[createAdmin] Avatar uploaded successfully:', avatarUrl);
		}

		// Step 2: Create the admin user
		const createUserData: CreateUserDto = {
			username: data.username.trim(),
			email: data.email.trim().toLowerCase(),
			password: data.password,
			role: 'ADMIN',
			personalInfo: {
				firstName: data.firstName.trim(),
				lastName: data.lastName.trim(),
				phone: data.phone?.trim(),
				avatarUrl: avatarUrl,
			},
		};

		console.log('[createAdmin] Creating user with data:', {
			username: createUserData.username,
			email: createUserData.email,
			role: createUserData.role,
		});

		const createResponse = await fetch(`${env.backendApiUrl}/users`, {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${session.accessToken}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(createUserData),
		});

		console.log('[createAdmin] Create response status:', createResponse.status);

		if (!createResponse.ok) {
			const errorData = await createResponse.json().catch(() => null);
			const errorMsg = errorData?.message || `Error ${createResponse.status} al crear administrador`;

			// Handle specific error cases
			if (createResponse.status === 409 || errorMsg.includes('unique')) {
				return {
					success: false,
					error: 'El nombre de usuario o email ya existe en el sistema',
				};
			}

			console.error('[createAdmin] User creation failed:', errorMsg);
			return {
				success: false,
				error: errorMsg,
			};
		}

		const user = await createResponse.json();
		console.log('[createAdmin] User created successfully:', { id: user.id, username: user.username });

		revalidatePath('/users/administrators', 'page');

		return {
			success: true,
			data: user,
			message: 'Administrador creado exitosamente',
		};
	} catch (error) {
		console.error('[createAdmin] Exception thrown:', error);
		const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
		return {
			success: false,
			error: errorMsg,
		};
	}
}

/**
 * Get a user by ID
 */
export async function getUser(id: string): Promise<{
  success: boolean;
  data?: BackendAdministrator;
  error?: string;
}> {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.accessToken) {
			return { success: false, error: 'No authenticated' };
		}

		const response = await fetch(`${env.backendApiUrl}/users/${id}`, {
			method: 'GET',
			headers: {
				'Authorization': `Bearer ${session.accessToken}`,
				'Content-Type': 'application/json',
			},
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => null);
			return { 
				success: false, 
				error: errorData?.message || `Failed to fetch user: ${response.status}` 
			};
		}

		const result = await response.json();
		return { success: true, data: result };
	} catch (error) {
		console.error('Error fetching user:', error);
		return { 
			success: false, 
			error: error instanceof Error ? error.message : 'Unknown error' 
		};
	}
}

/**
 * Update a user
 */
export async function updateUser(id: string, data: UpdateUserDto): Promise<{
  success: boolean;
  data?: BackendAdministrator;
  error?: string;
}> {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.accessToken) {
			return { success: false, error: 'No authenticated' };
		}

		const response = await fetch(`${env.backendApiUrl}/users/${id}`, {
			method: 'PATCH',
			headers: {
				'Authorization': `Bearer ${session.accessToken}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(data),
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => null);
			return { 
				success: false, 
				error: errorData?.message || `Failed to update user: ${response.status}` 
			};
		}

		const result = await response.json();
		revalidatePath('/users/administrators', 'page');
		return { success: true, data: result };
	} catch (error) {
		console.error('Error updating user:', error);
		return { 
			success: false, 
			error: error instanceof Error ? error.message : 'Unknown error' 
		};
	}
}

/**
 * Delete a user (soft delete)
 */
export async function deleteUser(id: string): Promise<{
  success: boolean;
  error?: string;
}> {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.accessToken) {
			return { success: false, error: 'No authenticated' };
		}

		const response = await fetch(`${env.backendApiUrl}/users/${id}`, {
			method: 'DELETE',
			headers: {
				'Authorization': `Bearer ${session.accessToken}`,
				'Content-Type': 'application/json',
			},
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => null);
			return { 
				success: false, 
				error: errorData?.message || `Failed to delete user: ${response.status}` 
			};
		}

		revalidatePath('/users/administrators', 'page');
		return { success: true };
	} catch (error) {
		console.error('Error deleting user:', error);
		return { 
			success: false, 
			error: error instanceof Error ? error.message : 'Unknown error' 
		};
	}
}

/**
 * Change user password
 */
export async function changeUserPassword(id: string, passwordData: ChangePasswordDto): Promise<{
  success: boolean;
  error?: string;
}> {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.accessToken) {
			return { success: false, error: 'No authenticated' };
		}

		const response = await fetch(`${env.backendApiUrl}/users/${id}/change-password`, {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${session.accessToken}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(passwordData),
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => null);
			return { 
				success: false, 
				error: errorData?.message || `Failed to change password: ${response.status}` 
			};
		}

		return { success: true };
	} catch (error) {
		console.error('Error changing password:', error);
		return { 
			success: false, 
			error: error instanceof Error ? error.message : 'Unknown error' 
		};
	}
}

/**
 * Assign role to user
 */
export async function assignUserRole(id: string, role: 'ADMIN' | 'AGENT'): Promise<{
  success: boolean;
  data?: BackendAdministrator;
  error?: string;
}> {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.accessToken) {
			return { success: false, error: 'No authenticated' };
		}

		const response = await fetch(`${env.backendApiUrl}/users/${id}/role`, {
			method: 'PATCH',
			headers: {
				'Authorization': `Bearer ${session.accessToken}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ role }),
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => null);
			return { 
				success: false, 
				error: errorData?.message || `Failed to assign role: ${response.status}` 
			};
		}

		const result = await response.json();
		revalidatePath('/users/administrators', 'page');
		return { success: true, data: result };
	} catch (error) {
		console.error('Error assigning role:', error);
		return { 
			success: false, 
			error: error instanceof Error ? error.message : 'Unknown error' 
		};
	}
}

/**
 * Set user status (active/inactive)
 */
export async function setUserStatus(id: string, status: 'ACTIVE' | 'INACTIVE'): Promise<{
  success: boolean;
  data?: BackendAdministrator;
  error?: string;
}> {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.accessToken) {
			return { success: false, error: 'No authenticated' };
		}

		const response = await fetch(`${env.backendApiUrl}/users/${id}/status`, {
			method: 'PATCH',
			headers: {
				'Authorization': `Bearer ${session.accessToken}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ status }),
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => null);
			return { 
				success: false, 
				error: errorData?.message || `Failed to set status: ${response.status}` 
			};
		}

		const result = await response.json();
		revalidatePath('/users/administrators', 'page');
		revalidatePath('/users/community', 'page');
		revalidatePath(`/users/community/${id}`, 'page');
		return { success: true, data: result };
	} catch (error) {
		console.error('Error setting status:', error);
		return { 
			success: false, 
			error: error instanceof Error ? error.message : 'Unknown error' 
		};
	}
}

/**
 * Find user by ID for change history display
 */
export async function findUserById(id: string): Promise<{ id: string; name: string } | null> {
	const session = await getServerSession(authOptions);
	if (!session?.accessToken) return null;

	try {
		const res = await fetch(`${env.backendApiUrl}/users/${id}`, {
			headers: { Authorization: `Bearer ${session.accessToken}` },
		});
		if (!res.ok) return null;
		const user = await res.json();
		return { 
			id: user.id, 
			name: `${user.personalInfo?.firstName || ''} ${user.personalInfo?.lastName || ''}`.trim() || user.username || 'Usuario' 
		};
	} catch {
		return null;
	}
}

/**
 * Update user avatar
 */
export async function updateUserAvatar(id: string, formData: FormData): Promise<{
  success: boolean;
  data?: { avatarUrl: string };
  error?: string;
}> {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.accessToken) {
			return { success: false, error: 'No authenticated' };
		}

		const response = await fetch(`${env.backendApiUrl}/users/${id}/avatar`, {
			method: 'PUT',
			headers: {
				Authorization: `Bearer ${session.accessToken}`,
			},
			body: formData,
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => null);
			return { 
				success: false, 
				error: errorData?.message || `Failed to update avatar: ${response.status}` 
			};
		}

		const result = await response.json();
		revalidatePath('/users/administrators', 'page');
		revalidatePath('/users/agents', 'page');
		const avatarUrl =
			typeof result?.avatarUrl === 'string'
				? result.avatarUrl
				: typeof result?.data?.avatarUrl === 'string'
					? result.data.avatarUrl
					: undefined;
		return { success: true, data: avatarUrl ? { avatarUrl } : undefined };
	} catch (error) {
		console.error('Error updating avatar:', error);
		return { 
			success: false, 
			error: error instanceof Error ? error.message : 'Unknown error' 
		};
	}
}

// ===================================
// MyAccount Functions
// ===================================

/**
 * Update user profile (for MyAccount)
 */
export async function updateUserProfile(userId: string, data: Partial<UpdateUserDto>): Promise<{
  success: boolean;
  data?: BackendAdministrator;
  error?: string;
}> {
	return updateUser(userId, data);
}

/**
 * Update person information
 */
export async function updatePerson(personId: string, data: {
	dni?: string;
	address?: string;
	phone?: string;
	email?: string;
	dniCardFrontId?: string;
	dniCardRearId?: string;
}): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.accessToken) {
			return { success: false, error: 'No authenticated' };
		}

		const response = await fetch(`${env.backendApiUrl}/people/${personId}`, {
			method: 'PATCH',
			headers: {
				'Authorization': `Bearer ${session.accessToken}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(data),
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => null);
			return { 
				success: false, 
				error: errorData?.message || `Failed to update person: ${response.status}` 
			};
		}

		const result = await response.json();
		return { success: true, data: result };
	} catch (error) {
		console.error('Error updating person:', error);
		return { 
			success: false, 
			error: error instanceof Error ? error.message : 'Unknown error' 
		};
	}
}

/**
 * Create a new person
 */
export async function createPerson(data: {
	name?: string;
	dni?: string;
	address?: string;
	phone?: string;
	email?: string;
	userId?: string;
	dniCardFrontId?: string;
	dniCardRearId?: string;
}): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.accessToken) {
			return { success: false, error: 'No authenticated' };
		}

		const response = await fetch(`${env.backendApiUrl}/people`, {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${session.accessToken}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(data),
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => null);
			return { 
				success: false, 
				error: errorData?.message || `Failed to create person: ${response.status}` 
			};
		}

		const result = await response.json();
		return { success: true, data: result };
	} catch (error) {
		console.error('Error creating person:', error);
		return { 
			success: false, 
			error: error instanceof Error ? error.message : 'Unknown error' 
		};
	}
}

/**
 * Change password (for MyAccount)
 */
export async function changePassword(userId: string, data: {
	currentPassword: string;
	newPassword: string;
}): Promise<{
  success: boolean;
  error?: string;
}> {
	return changeUserPassword(userId, {
		oldPassword: data.currentPassword,
		newPassword: data.newPassword,
	});
}

/**
 * Upload multimedia file
 */
export async function uploadMultimedia(file: File): Promise<{
  success: boolean;
  data?: { id: string; url: string };
  error?: string;
}> {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.accessToken) {
			return { success: false, error: 'No authenticated' };
		}

		const formData = new FormData();
		formData.append('file', file);

		const response = await fetch(`${env.backendApiUrl}/multimedia/upload`, {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${session.accessToken}`,
			},
			body: formData,
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => null);
			return { 
				success: false, 
				error: errorData?.message || `Failed to upload file: ${response.status}` 
			};
		}

		const result = await response.json();
		return { success: true, data: result };
	} catch (error) {
		console.error('Error uploading multimedia:', error);
		return { 
			success: false, 
			error: error instanceof Error ? error.message : 'Unknown error' 
		};
	}
}

/**
 * Get current user profile (for MyAccount)
 */
export async function getCurrentUserProfile(): Promise<{
  success: boolean;
  data?: {
    id: string;
    username: string;
    email: string;
    personalInfo?: {
      firstName?: string;
      lastName?: string;
      phone?: string;
      avatarUrl?: string;
    };
    person?: {
      id: string;
      dni?: string;
      address?: string;
      phone?: string;
      email?: string;
      dniCardFrontUrl?: string;
      dniCardRearUrl?: string;
      verified: boolean;
    };
    role: string;
    status: string;
    lastLogin?: string;
    createdAt: string;
    updatedAt: string;
  };
  error?: string;
}> {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.accessToken) {
			return { success: false, error: 'No authenticated' };
		}

		const response = await fetch(`${env.backendApiUrl}/users/profile`, {
			method: 'GET',
			headers: {
				'Authorization': `Bearer ${session.accessToken}`,
				'Content-Type': 'application/json',
			},
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => null);
			return { 
				success: false, 
				error: errorData?.message || `Failed to get profile: ${response.status}` 
			};
		}

		const result = await response.json();
		return { success: true, data: result };
	} catch (error) {
		console.error('Error getting current user profile:', error);
		return { 
			success: false, 
			error: error instanceof Error ? error.message : 'Unknown error' 
		};
	}
}

/**
 * Delete a community user (soft delete)
 * Follows the same pattern as deleteProperty
 */
export async function deleteCommunityUser(userId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return { success: false, error: 'No authenticated' };
    }

    const response = await fetch(`${env.backendApiUrl}/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      return { 
        success: false, 
        error: errorData?.message || `Error al eliminar usuario: ${response.status}` 
      };
    }

    // Revalidate the community users grid path
    revalidatePath('/users/community');

    return { success: true };
  } catch (error) {
    console.error('Error deleting community user:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error al eliminar usuario' 
    };
  }
}

/**
 * Upload DNI front or rear image for person
 * @param file - The image file to upload
 * @param type - 'DNI_FRONT' or 'DNI_REAR'
 */
export async function uploadMultimediaDni(
  file: File,
  type: 'DNI_FRONT' | 'DNI_REAR'
): Promise<{
  success: boolean;
  data?: { id: string; url: string; type: string };
  error?: string;
}> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return { success: false, error: 'No authenticated' };
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const response = await fetch(`${env.backendApiUrl}/multimedia/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      return { 
        success: false, 
        error: errorData?.message || `Error al subir documento: ${response.status}` 
      };
    }

    const result = await response.json();
    return { success: true, data: result };
  } catch (error) {
    console.error('Error uploading DNI image:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error al subir documento' 
    };
  }
}

/**
 * Get user favorite properties with details
 */
export async function getUserFavoriteProperties(userId: string): Promise<any[]> {
  const session = await getServerSession(authOptions);
  const accessToken = session?.accessToken;

  if (!accessToken) {
    throw new Error('No hay una sesión activa.');
  }

  const response = await fetch(`${env.backendApiUrl}/users/${userId}/favorites/details`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    let message = 'Error al obtener favoritos';
    try {
      const payload = await response.json();
      if (payload?.message) message = payload.message;
    } catch {}
    throw new Error(message);
  }

  return response.json();
}

/**
 * Get user favorite property IDs
 */
export async function getUserFavoriteIds(userId: string): Promise<string[]> {
  try {
    const session = await getServerSession(authOptions);
    const accessToken = session?.accessToken;

    if (!accessToken) {
      console.warn('[getUserFavoriteIds] no active session');
      return [];
    }

    const response = await fetch(`${env.backendApiUrl}/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      // Log backend status/message for easier debugging, but don't throw to avoid breaking the UI
      let backendMessage = '';
      try {
        const payload = await response.json();
        if (payload?.message) backendMessage = ` - ${payload.message}`;
      } catch (e) {}
      console.warn(`[getUserFavoriteIds] backend returned ${response.status}${backendMessage}`);
      return [];
    }

    const user = await response.json();
    return (user.favoriteProperties || []).map((fav: any) => fav.propertyId);
  } catch (error) {
    console.error('[getUserFavoriteIds] unexpected error', error);
    return [];
  }
}

export type CommunityUserDetailHeader = {
  id: string;
  username: string;
  email: string;
  displayName: string;
  status: string | null;
  emailVerified: boolean;
  role: string;
  createdAt: string | null;
  updatedAt: string | null;
  lastLogin: string | null;
  personalInfo: {
    firstName?: string | null;
    lastName?: string | null;
    phone?: string | null;
    avatarUrl?: string | null;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    country?: string | null;
    profession?: string | null;
    company?: string | null;
    nationality?: string | null;
    gender?: string | null;
    maritalStatus?: string | null;
  } | null;
  person: {
    id: string;
    dni?: string | null;
    address?: string | null;
    phone?: string | null;
    email?: string | null;
    verified: boolean;
    dniCardFrontUrl?: string | null;
    dniCardRearUrl?: string | null;
  } | null;
};

/**
 * Header + profile payload for community user detail (COMMUNITY only).
 */
export async function getCommunityUserHeader(id: string): Promise<{
  success: boolean;
  data?: CommunityUserDetailHeader;
  error?: string;
}> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return { success: false, error: 'No authenticated' };
    }

    const [userRes, profileRes] = await Promise.all([
      fetch(`${env.backendApiUrl}/users/${id}`, {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
          Accept: 'application/json',
        },
        cache: 'no-store',
      }),
      fetch(`${env.backendApiUrl}/users/${id}/profile`, {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
          Accept: 'application/json',
        },
        cache: 'no-store',
      }),
    ]);

    if (!userRes.ok) {
      const errorData = await userRes.json().catch(() => null);
      return {
        success: false,
        error: errorData?.message || `Failed to fetch user: ${userRes.status}`,
      };
    }

    const user = await userRes.json();
    const profile = profileRes.ok ? await profileRes.json() : null;
    const role = String(user.role || profile?.role || '').toUpperCase();
    if (role && role !== 'COMMUNITY') {
      return { success: false, error: 'NOT_COMMUNITY_USER' };
    }

    const personalInfo = profile?.personalInfo ?? user.personalInfo ?? null;
    const firstName = personalInfo?.firstName?.trim() || '';
    const lastName = personalInfo?.lastName?.trim() || '';
    const displayName =
      [firstName, lastName].filter(Boolean).join(' ') ||
      user.username ||
      user.email ||
      'Usuario';

    return {
      success: true,
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        displayName,
        status: user.status ?? null,
        emailVerified: Boolean(user.emailVerified),
        role: role || 'COMMUNITY',
        createdAt: user.createdAt ? String(user.createdAt) : null,
        updatedAt: user.updatedAt ? String(user.updatedAt) : null,
        lastLogin: user.lastLogin ? String(user.lastLogin) : null,
        personalInfo: personalInfo
          ? {
              firstName: personalInfo.firstName ?? null,
              lastName: personalInfo.lastName ?? null,
              phone: personalInfo.phone ?? null,
              avatarUrl: personalInfo.avatarUrl ?? null,
              address: personalInfo.address ?? null,
              city: personalInfo.city ?? null,
              state: personalInfo.state ?? null,
              country: personalInfo.country ?? null,
              profession: personalInfo.profession ?? null,
              company: personalInfo.company ?? null,
              nationality: personalInfo.nationality ?? null,
              gender: personalInfo.gender ?? null,
              maritalStatus: personalInfo.maritalStatus ?? null,
            }
          : null,
        person: profile?.person
          ? {
              id: profile.person.id,
              dni: profile.person.dni ?? null,
              address: profile.person.address ?? null,
              phone: profile.person.phone ?? null,
              email: profile.person.email ?? null,
              verified: Boolean(profile.person.verified),
              dniCardFrontUrl: profile.person.dniCardFrontUrl ?? null,
              dniCardRearUrl: profile.person.dniCardRearUrl ?? null,
            }
          : null,
      },
    };
  } catch (error) {
    console.error('Error fetching community user header:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Resend email verification for a community user (staff).
 */
export async function resendCommunityUserVerification(
  id: string,
  email: string,
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return { success: false, error: 'No authenticated' };
    }

    const response = await fetch(
      `${env.backendApiUrl}/auth/resend-verification-email`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ email }),
      },
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      return {
        success: false,
        error:
          errorData?.message ||
          `Failed to resend verification: ${response.status}`,
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Error resending verification:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export type CommunityUserInterestItem = {
  id: string;
  message?: string | null;
  interestedUserMessage?: string | null;
  interestedUserEmail?: string | null;
  createdAt?: string | null;
  propertyId?: string | null;
};

/**
 * INTEREST notifications linked to this community user (sender or email match).
 */
export async function getCommunityUserInterestNotifications(
  userId: string,
  email: string,
): Promise<{ success: boolean; data?: CommunityUserInterestItem[]; error?: string }> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return { success: false, error: 'No authenticated' };
    }

    const response = await fetch(
      `${env.backendApiUrl}/notifications?page=1&limit=100`,
      {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
          Accept: 'application/json',
        },
        cache: 'no-store',
      },
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      return {
        success: false,
        error: errorData?.message || `Failed to fetch notifications: ${response.status}`,
      };
    }

    const payload = await response.json();
    const rows: any[] = Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.data)
        ? payload.data
        : [];

    const emailNorm = email.trim().toLowerCase();
    const filtered = rows
      .filter((n) => {
        if (n.type !== 'INTEREST') return false;
        if (n.senderId && n.senderId === userId) return true;
        if (
          n.interestedUserEmail &&
          String(n.interestedUserEmail).trim().toLowerCase() === emailNorm
        ) {
          return true;
        }
        return false;
      })
      .map((n) => {
        const propertyMatch =
          typeof n.message === 'string'
            ? n.message.match(/\[PROPERTY_ID:\s*([^\]]+)\]/i)
            : null;
        return {
          id: n.id,
          message: n.message ?? null,
          interestedUserMessage: n.interestedUserMessage ?? null,
          interestedUserEmail: n.interestedUserEmail ?? null,
          createdAt: n.createdAt ? String(n.createdAt) : null,
          propertyId: propertyMatch?.[1]?.trim() || null,
        } satisfies CommunityUserInterestItem;
      });

    return { success: true, data: filtered };
  } catch (error) {
    console.error('Error fetching community interest notifications:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
