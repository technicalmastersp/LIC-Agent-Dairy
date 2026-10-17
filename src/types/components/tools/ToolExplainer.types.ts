export interface ToolFaq {
  q: string;
  a: string;
}

export interface ToolExplainerProps {
  /** e.g. "How a lumpsum investment grows" */
  heading: string;
  /** Plain-language explanation shown above the formula. */
  intro: string;
  /** The formula, as text (e.g. "Maturity = P × (1 + r)^t"). */
  formula: string;
  /** What the symbols in the formula mean. */
  legend: string[];
  faqs: ToolFaq[];
}
