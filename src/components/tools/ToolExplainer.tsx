import { Card, CardContent } from "@/components/ui/card";
import type { ToolExplainerProps } from "@/types/components/tools/ToolExplainer.types";
import { useLanguage } from "@/hooks/useLanguage";

// Static, crawlable explanation under a calculator: how the maths works plus a few honest FAQs.
// Plain headings and paragraphs on purpose (no accordion/JS), so search engines and users with
// scripts disabled see the full text — and the prerendered snapshot includes it.
const ToolExplainer = ({ heading, intro, formula, legend, faqs }: ToolExplainerProps) => {
  const { t } = useLanguage();
  return (
  <section className="mt-8 space-y-6" aria-labelledby="tool-explainer-heading">
    <Card className="rounded-2xl">
      <CardContent className="p-6 md:p-8">
        <h2 id="tool-explainer-heading" className="text-xl font-semibold text-form-header mb-3">{heading}</h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">{intro}</p>
        <p className="rounded-xl bg-muted/50 px-4 py-3 text-sm font-medium text-form-header font-mono overflow-x-auto">{formula}</p>
        <ul className="mt-4 space-y-1.5 text-sm text-muted-foreground list-disc pl-5">
          {legend.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </CardContent>
    </Card>

    <Card className="rounded-2xl">
      <CardContent className="p-6 md:p-8">
        <h2 className="text-xl font-semibold text-form-header mb-4">{t('tools.frequentlyAskedQuestions')}</h2>
        <div className="space-y-5">
          {faqs.map(({ q, a }) => (
            <div key={q}>
              <h3 className="text-sm font-semibold text-form-header mb-1">{q}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </section>
);
};

export default ToolExplainer;
