export type ContentFixture = {
  id: string;
  title: string;
  url: string;
  summary: string;
  rationaleSnippet: string;
  topics: string[];
  supportedLanguages: string[];
};

export const ubsContentFixtures: ContentFixture[] = [
  {
    id: "ubs-wealth-management",
    title: "UBS Wealth Management",
    url: "https://www.ubs.com/global/en/wealthmanagement.html",
    summary:
      "Overview of UBS wealth management capabilities, advice model, and planning support for complex households.",
    rationaleSnippet:
      "Useful when the visitor wants a broad view of advisory coverage and service model.",
    topics: ["wealth", "planning", "advisory", "relationship"],
    supportedLanguages: ["en-US", "de-CH"],
  },
  {
    id: "ubs-chief-investment-office",
    title: "UBS Chief Investment Office",
    url: "https://www.ubs.com/global/en/wealthmanagement/chief-investment-office.html",
    summary:
      "Market perspectives, strategic asset allocation thinking, and CIO guidance for investors.",
    rationaleSnippet:
      "Strong match for questions about market outlook, allocation, and portfolio reviews.",
    topics: ["investment", "allocation", "markets", "portfolio"],
    supportedLanguages: ["en-US", "de-CH"],
  },
  {
    id: "ubs-wealth-insights",
    title: "UBS Wealth Management Insights",
    url: "https://www.ubs.com/global/en/wealthmanagement/insights.html",
    summary:
      "Thematic insights across family governance, philanthropy, succession, and long-term planning.",
    rationaleSnippet:
      "Relevant for visitors exploring education, family strategy, or long-horizon planning themes.",
    topics: ["insights", "family", "succession", "philanthropy", "planning"],
    supportedLanguages: ["en-US"],
  },
  {
    id: "ubs-sustainable-investing",
    title: "UBS Sustainable and Impact Investing",
    url: "https://www.ubs.com/global/en/wealthmanagement/investment-view/sustainable-investing.html",
    summary:
      "Educational content around sustainable investing frameworks and portfolio implementation considerations.",
    rationaleSnippet:
      "Useful when the visitor signals values-based investing interests without requiring live market data.",
    topics: ["sustainable", "impact", "values", "portfolio"],
    supportedLanguages: ["en-US", "de-CH"],
  },
  {
    id: "ubs-family-advisory",
    title: "UBS Family Advisory and Succession",
    url: "https://www.ubs.com/global/en/wealthmanagement/family-advisory.html",
    summary:
      "Public guidance on family governance, business transitions, and intergenerational planning topics.",
    rationaleSnippet:
      "Prioritised for succession, family enterprise, and legacy-oriented questions.",
    topics: ["family", "succession", "legacy", "governance"],
    supportedLanguages: ["en-US"],
  },
];
