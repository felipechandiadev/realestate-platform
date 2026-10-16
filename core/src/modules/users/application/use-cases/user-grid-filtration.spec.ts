import { applyUserGridQuery, parseUserFilters } from './find-admin-users.usecase';

describe('user grid filtration helpers', () => {
  it('parseUserFilters keeps hyphenated values', () => {
    const parsed = parseUserFilters('email-a-b@test.com,name-Juan-Perez');
    expect(parsed.email).toBe('a-b@test.com');
    expect(parsed.name).toBe('Juan-Perez');
  });

  it('applyUserGridQuery applies email filter when columnFilters present', () => {
    const andWhere = jest.fn();
    applyUserGridQuery({ andWhere }, {
      columnFilters: { email: 'admin@' },
    });
    expect(andWhere).toHaveBeenCalledWith(
      expect.stringContaining('user.email'),
      expect.objectContaining({ emailFilter: '%admin@%' }),
    );
  });

  it('applyUserGridQuery skips filters when columnFilters empty (filtration off)', () => {
    const andWhere = jest.fn();
    applyUserGridQuery({ andWhere }, { columnFilters: {} });
    expect(andWhere).not.toHaveBeenCalled();
  });
});
