import { Injectable } from '@nestjs/common';
import { ArticleRepository } from '../../domain/article.repository';
import { Article } from '../../domain/article.entity';
import { IsNull } from 'typeorm';

@Injectable()
export class FindRelatedArticlesUseCase {
  constructor(private readonly repo: ArticleRepository) {}

  private countCommonWords(a: string, b: string): number {
    const splitA = a.toLowerCase().split(/\W+/).filter(Boolean);
    const splitB = b.toLowerCase().split(/\W+/).filter(Boolean);
    return splitA.filter(word => splitB.includes(word)).length;
  }

  async execute(currentArticleId: string, limit = 4): Promise<Article[]> {
    const current = await this.repo.findOne({ where: { id: currentArticleId, deletedAt: IsNull() } });
    if (!current) return [];

    const candidates = await this.repo.find({
      where: { isActive: true, deletedAt: IsNull() },
    });

    const filtered = candidates.filter(a => a.id !== currentArticleId);
    if (filtered.length === 0) return [];

    const scored = filtered.map(candidate => {
      let score = 0;
      if (candidate.category === current.category) score += 100;
      const commonWords = this.countCommonWords(current.title, candidate.title);
      score += commonWords * 75;
      if (current.subtitle && candidate.subtitle) {
        score += this.countCommonWords(current.subtitle, candidate.subtitle) * 50;
      }
      const daysDiff =
        Math.abs(new Date(current.createdAt).getTime() - new Date(candidate.createdAt).getTime()) /
        (1000 * 60 * 60 * 24);
      if (daysDiff <= 30) score += 50;
      const daysSinceCreation =
        (new Date().getTime() - new Date(candidate.createdAt).getTime()) /
        (1000 * 60 * 60 * 24);
      if (daysSinceCreation <= 90) score += 10;
      return { ...candidate, _score: score };
    });

    scored.sort((a, b) => (b._score || 0) - (a._score || 0));
    const result = scored.slice(0, Math.max(1, limit)).map(({ _score, ...rest }: any) => rest);
    return result;
  }
}
