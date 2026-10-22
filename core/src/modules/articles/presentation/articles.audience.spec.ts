/** Tests unitarios: el público solo ve artículos activos. */
import { filterArticlesForAudience } from './articles.controller';

describe('filterArticlesForAudience', () => {
  const articles = [
    { id: 'a', isActive: true },
    { id: 'b', isActive: false },
    { id: 'c' },
  ];

  it('anónimo/COMMUNITY: solo activos', () => {
    expect(filterArticlesForAudience(articles, false).map((a) => a.id)).toEqual(
      ['a'],
    );
  });

  it('staff: todos', () => {
    expect(filterArticlesForAudience(articles, true)).toHaveLength(3);
  });
});
