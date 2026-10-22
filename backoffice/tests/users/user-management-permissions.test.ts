/**
 * Tests unitarios (todo mockeado, sin servidor ni red): solo ADMIN gestiona
 * otros usuarios; cada usuario puede editar su propio perfil.
 */
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

const mockGetServerSession = jest.fn<() => Promise<unknown>>();
jest.mock('next-auth', () => ({ getServerSession: () => mockGetServerSession() }));
jest.mock('@/lib/auth', () => ({ authOptions: {} }));
jest.mock('@/lib/env', () => ({ env: { backendApiUrl: 'http://core.test' } }));
jest.mock('next/cache', () => ({ revalidatePath: jest.fn() }));

import {
  USER_MANAGEMENT_FORBIDDEN_MESSAGE,
  canManageUser,
  canManageUsers,
  isAdminRole,
} from '@/src/features/users/permissions';
import {
  assignUserRole,
  changeUserPassword,
  deleteCommunityUser,
  deleteUser,
  resetUserPassword,
  setUserStatus,
  updateUser,
  updateUserAvatar,
} from '@/src/features/users/actions/users.action';
import { deleteAgent, setAgentStatus, updateAgent } from '@/src/features/users/actions/agents.action';

const fetchMock = jest.fn<typeof fetch>();
(globalThis as { fetch: typeof fetch }).fetch = fetchMock;

const sessionAs = (role: string, id = 'self-id') =>
  mockGetServerSession.mockResolvedValue({ accessToken: 'tkn', user: { id, role } });

const forbidden = { success: false, error: USER_MANAGEMENT_FORBIDDEN_MESSAGE };

describe('permissions (puro)', () => {
  it('solo ADMIN gestiona otros usuarios', () => {
    expect(isAdminRole('ADMIN')).toBe(true);
    expect(isAdminRole('AGENT')).toBe(false);
    expect(canManageUsers({ role: 'ADMIN' })).toBe(true);
    expect(canManageUsers({ role: 'AGENT' })).toBe(false);
    expect(canManageUsers(null)).toBe(false);
  });

  it('cada usuario puede gestionarse a sí mismo', () => {
    expect(canManageUser({ id: 'a', role: 'AGENT' }, 'a')).toBe(true);
    expect(canManageUser({ id: 'a', role: 'AGENT' }, 'b')).toBe(false);
    expect(canManageUser({ id: 'x', role: 'ADMIN' }, 'b')).toBe(true);
    expect(canManageUser({ role: 'AGENT' }, undefined)).toBe(false);
  });
});

describe('server actions: AGENT recibe error en español sin llamar a core', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    sessionAs('AGENT');
  });

  it.each([
    ['updateUser (otro)', () => updateUser('otro', {} as never)],
    ['deleteUser', () => deleteUser('otro')],
    ['changeUserPassword (otro)', () => changeUserPassword('otro', {} as never)],
    ['resetUserPassword', () => resetUserPassword('otro', 'NuevaClave123')],
    ['assignUserRole', () => assignUserRole('otro', 'ADMIN')],
    ['setUserStatus', () => setUserStatus('otro', 'INACTIVE')],
    ['updateUserAvatar (otro)', () => updateUserAvatar('otro', new FormData())],
    ['deleteCommunityUser', () => deleteCommunityUser('otro')],
    ['updateAgent (otro)', () => updateAgent('otro', { firstName: 'X' })],
    ['deleteAgent', () => deleteAgent('otro')],
    ['setAgentStatus', () => setAgentStatus('otro', 'INACTIVE')],
  ])('%s', async (_name, call) => {
    await expect(call()).resolves.toEqual(forbidden);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('AGENT sí puede editar su propio perfil', async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ id: 'self-id' }), { status: 200 }));
    const result = await updateUser('self-id', { email: 'yo@x.cl' } as never);
    expect(result.success).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(String(fetchMock.mock.calls[0][0])).toBe('http://core.test/users/self-id');
  });
});

describe('server actions: ADMIN llama a core', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    sessionAs('ADMIN', 'admin-id');
  });

  it('setUserStatus y deleteUser van a core', async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({}), { status: 200 }));
    await expect(setUserStatus('otro', 'INACTIVE')).resolves.toMatchObject({ success: true });
    await expect(deleteUser('otro')).resolves.toMatchObject({ success: true });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
