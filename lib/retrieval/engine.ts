import type { ExperienceVariant } from "@/lib/domain/models";
import { wealthContentFixtures, type ContentFixture } from "@/lib/retrieval/fixtures";

export type Recommendation = {
  id: string;
  title: string;
  url: string;
  sourceUrl: string;
  rationaleSnippet: string;
  summary: string;
  score: number;
};

type RecommendationContext = {
  experience: ExperienceVariant;
  language: string;
  query: string;
};

const goalKeywords: Record<string, string[]> = {
  "advisor-consultation": ["advisory", "planning", "relationship"],
  "portfolio-review": ["portfolio", "allocation", "investment", "markets"],
  "event-rsvp": ["insights", "family", "planning"],
};

function tokenize(value: string): string[] {
  return value
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .map((token) => token.trim())
    .filter(Boolean);
}

function unique<TValue>(values: TValue[]): TValue[] {
  return Array.from(new Set(values));
}

function buildKeywordSet(context: RecommendationContext): string[] {
  const queryKeywords = tokenize(context.query);
  const goalTokens = goalKeywords[context.experience.conversionGoal] ?? [];
  const variantTokens = tokenize(context.experience.name);

  return unique([...queryKeywords, ...goalTokens, ...variantTokens]);
}

function recommendationFromFixture(
  fixture: ContentFixture,
  score: number,
): Recommendation {
  return {
    id: fixture.id,
    title: fixture.title,
    url: fixture.url,
    sourceUrl: fixture.url,
    rationaleSnippet: fixture.rationaleSnippet,
    summary: fixture.summary,
    score,
  };
}

export function getCuratedRecommendations(
  experience: ExperienceVariant,
  language: string,
): Recommendation[] {
  return experience.curatedUrls
    .map((url) => {
      const fixture = wealthContentFixtures.find((item) => item.url === url);

      if (!fixture || !fixture.supportedLanguages.includes(language)) {
        return null;
      }

      return recommendationFromFixture(fixture, 100);
    })
    .filter((value): value is Recommendation => value !== null);
}

export function rankRuntimeRecommendations(
  context: RecommendationContext,
): Recommendation[] {
  const keywords = buildKeywordSet(context);

  return wealthContentFixtures
    .filter((fixture) => fixture.supportedLanguages.includes(context.language))
    .map((fixture) => {
      const score = keywords.reduce((currentScore, keyword) => {
        return currentScore + (fixture.topics.includes(keyword) ? 10 : 0);
      }, 0);

      const fixtureScore = score + (fixture.topics.includes("planning") ? 2 : 0);

      return recommendationFromFixture(fixture, fixtureScore);
    })
    .sort((left, right) => right.score - left.score || left.title.localeCompare(right.title))
    .slice(0, 3);
}

export function getRecommendations(
  context: RecommendationContext,
): Recommendation[] {
  if (context.experience.contentMode === "curated") {
    const curated = getCuratedRecommendations(context.experience, context.language);

    if (curated.length > 0) {
      return curated;
    }
  }

  return rankRuntimeRecommendations(context);
}
