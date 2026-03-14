export type ContentFixture = {
  id: string;
  title: string;
  url: string;
  summary: string;
  rationaleSnippet: string;
  topics: string[];
  supportedLanguages: string[];
};

export const wealthContentFixtures: ContentFixture[] = [
  {
    id: "wealth-playbook",
    title: "Global Wealth Playbook",
    url: "https://www.blackrock.com/us/individual/insights",
    summary:
      "Overview of global wealth planning capabilities, advisory models, and support for complex households.",
    rationaleSnippet:
      "Useful when the visitor wants a broad view of advisory coverage and service model.",
    topics: ["wealth", "planning", "advisory", "relationship"],
    supportedLanguages: ["en-US", "de-CH"],
  },
  {
    id: "chief-investment-briefing",
    title: "Chief Investment Briefing",
    url: "https://www.fidelity.com/learning-center/overview",
    summary:
      "Market perspectives, strategic asset allocation thinking, and CIO guidance for investors.",
    rationaleSnippet:
      "Strong match for questions about market outlook, allocation, and portfolio reviews.",
    topics: ["investment", "allocation", "markets", "portfolio"],
    supportedLanguages: ["en-US", "de-CH"],
  },
  {
    id: "wealth-strategy-insights",
    title: "Wealth Strategy Insights",
    url: "https://www.jpmorgan.com/insights/wealth-management",
    summary:
      "Thematic insights across family governance, philanthropy, succession, and long-term planning.",
    rationaleSnippet:
      "Relevant for visitors exploring education, family strategy, or long-horizon planning themes.",
    topics: ["insights", "family", "succession", "philanthropy", "planning"],
    supportedLanguages: ["en-US"],
  },
  {
    id: "sustainable-impact-investing",
    title: "Sustainable and Impact Investing",
    url: "https://www.morganstanley.com/ideas/sustainable-investing",
    summary:
      "Educational content around sustainable investing frameworks and portfolio implementation considerations.",
    rationaleSnippet:
      "Useful when the visitor signals values-based investing interests without requiring live market data.",
    topics: ["sustainable", "impact", "values", "portfolio"],
    supportedLanguages: ["en-US", "de-CH"],
  },
  {
    id: "family-advisory-succession",
    title: "Family Advisory and Succession Planning",
    url: "https://www.schwab.com/learn/story/estate-planning",
    summary:
      "Public guidance on family governance, business transitions, and intergenerational planning topics.",
    rationaleSnippet:
      "Prioritised for succession, family enterprise, and legacy-oriented questions.",
    topics: ["family", "succession", "legacy", "governance"],
    supportedLanguages: ["en-US"],
  },
];
