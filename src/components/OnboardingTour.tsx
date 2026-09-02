import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { ArrowLeft, ArrowRight, Sparkles, X } from "lucide-react";
import { getCurrentUser, setCurrentUser } from "@/utils/auth";
import { completeOnboarding } from "../../services/userService";
import type { TourStep, Rect } from "@/types/components/OnboardingTour.types";

// ── Step config ──────────────────────────────────────────────────────────
// `target` matches a `data-tour="..."` attribute already placed on the real
// Home.tsx / Navigation.tsx elements — see those files. If a target isn't
// found in the DOM (e.g. the language switcher is hidden on a narrow mobile
// viewport), the step still shows as a centered card with no spotlight
// rather than breaking the tour.
const STEPS: TourStep[] = [
  {
    target: "tour-add-record",
    title: "Add a policy record",
    body: "Start here to create a new policy record — holder details, nominee, bank info, and policy terms all in one form.",
  },
  {
    target: "tour-view-records",
    title: "View all your records",
    body: "Browse, search, and edit every record you've added. This is your main working list.",
  },
  {
    target: "tour-due-this-month",
    title: "Track this month's dues",
    body: "See every policy with a payment due this month, along with mode of payment and last payment date.",
  },
  {
    target: "tour-missed-payments",
    title: "Catch missed payments early",
    body: "Policies that missed last month's payment show up here — act before a lapse notice goes out.",
  },
  {
    target: "tour-upcoming-due",
    title: "Plan ahead for next month",
    body: "This card shows what's coming due next month, so you can follow up with clients before it's urgent.",
  },
  {
    target: "tour-your-plan",
    title: "Your subscription",
    body: "Check your current plan, when it expires, and upgrade any time from here.",
  },
  {
    target: "tour-language-switcher",
    title: "Switch language",
    body: "Prefer a different language? Change it any time from here — it applies across the whole app.",
  },
  {
    target: "tour-referral-wallet",
    title: "Referral wallet",
    body: "Refer other agents and earn commission here. Track your balance and withdraw once you cross the minimum.",
  },
];

const CARD_WIDTH = 320;
const CARD_GAP = 12;
const getTargetRect = (target: string): Rect | null => {
  const el = document.querySelector<HTMLElement>(`[data-tour="${target}"]`);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { top: r.top, left: r.left, width: r.width, height: r.height };
};

const OnboardingTour = () => {
  const currentUser = getCurrentUser();

  // Two phases: an intro dialog offering to start, then the step-by-step
  // spotlight walkthrough. Only ever shown when the backend flag says the
  // user genuinely hasn't seen it — see hasSeenOnboarding on the User model.
  const [phase, setPhase] = useState<"intro" | "steps" | "done">(
    currentUser && currentUser.hasSeenOnboarding === false ? "intro" : "done"
  );
  const [stepIndex, setStepIndex] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const finishing = useRef(false);

  const step = STEPS[stepIndex];

  // Recompute the highlighted target's position whenever the step changes,
  // and keep it in sync on scroll/resize while a step is showing.
  useLayoutEffect(() => {
    if (phase !== "steps") return;

    const el = document.querySelector<HTMLElement>(`[data-tour="${step.target}"]`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    // Scroll takes a moment to settle — recompute a couple of times rather
    // than once immediately, so the spotlight doesn't lag behind.
    const measure = () => setRect(getTargetRect(step.target));
    measure();
    const t1 = setTimeout(measure, 150);
    const t2 = setTimeout(measure, 400);

    window.addEventListener("scroll", measure, true);
    window.addEventListener("resize", measure);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener("scroll", measure, true);
      window.removeEventListener("resize", measure);
    };
  }, [phase, step?.target]);

  const persistSeen = async () => {
    if (finishing.current) return; // guard against double-click on Finish/Skip
    finishing.current = true;
    try {
      await completeOnboarding();
    } catch {
      // Best-effort — if this fails the tour just replays next login,
      // which is a minor annoyance, not a broken state worth blocking on.
    }
    const user = getCurrentUser();
    if (user) setCurrentUser({ ...user, hasSeenOnboarding: true });
  };

  const handleStart = () => {
    setStepIndex(0);
    setPhase("steps");
  };

  const handleSkip = () => {
    setPhase("done");
    void persistSeen();
  };

  const handleFinish = () => {
    setPhase("done");
    void persistSeen();
  };

  const handleNext = () => {
    if (stepIndex === STEPS.length - 1) {
      handleFinish();
    } else {
      setStepIndex((i) => i + 1);
    }
  };

  const handleBack = () => {
    setStepIndex((i) => Math.max(0, i - 1));
  };

  if (!currentUser || phase === "done") return null;

  if (phase === "intro") {
    return (
      <Dialog open onOpenChange={(open) => !open && handleSkip()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mb-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
            </div>
            <DialogTitle>Welcome to LIC Agent Diary</DialogTitle>
            <DialogDescription>
              Want a 60-second tour of where everything lives on your dashboard? You can skip any time.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={handleSkip}>Skip for now</Button>
            <Button onClick={handleStart}>Take the tour</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // ── Step overlay ──────────────────────────────────────────────────────
  // Positioned via a portal so it sits above everything regardless of
  // where in the tree this component is mounted, with a simple
  // box-shadow "spotlight" cutout — no extra dependency needed.
  const cardStyle = (() => {
    if (!rect) {
      // Target not found on this viewport (e.g. language switcher hidden
      // on mobile) — fall back to a centered card so the step still reads.
      return {
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: CARD_WIDTH,
      } as React.CSSProperties;
    }

    const estimatedCardHeight = 190;
    const spaceBelow = window.innerHeight - (rect.top + rect.height);
    const placeAbove = spaceBelow < estimatedCardHeight + CARD_GAP && rect.top > estimatedCardHeight + CARD_GAP;

    const top = placeAbove
      ? rect.top - CARD_GAP
      : rect.top + rect.height + CARD_GAP;

    let left = rect.left + rect.width / 2 - CARD_WIDTH / 2;
    left = Math.max(16, Math.min(left, window.innerWidth - CARD_WIDTH - 16));

    return {
      top,
      left,
      width: CARD_WIDTH,
      transform: placeAbove ? "translateY(-100%)" : undefined,
    } as React.CSSProperties;
  })();

  return createPortal(
    <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true" aria-label="Product tour">
      {/* Backdrop with a spotlight cutout around the current target.
          pointer-events: auto so clicks outside the tooltip are blocked —
          keeps the tour from being derailed by an accidental click-through
          to a stat card that would navigate away mid-tour. */}
      <div
        className="absolute inset-0 transition-all duration-200"
        style={
          rect
            ? {
                boxShadow: "0 0 0 9999px rgba(15, 23, 42, 0.55)",
                position: "absolute",
                top: rect.top - 6,
                left: rect.left - 6,
                width: rect.width + 12,
                height: rect.height + 12,
                borderRadius: 10,
                border: "2px solid rgba(59, 130, 246, 0.9)",
              }
            : { background: "rgba(15, 23, 42, 0.55)" }
        }
      />

      {/* Step card */}
      <div
        className="absolute bg-card border border-border rounded-lg shadow-xl p-4"
        style={cardStyle}
      >
        <div className="flex items-start justify-between gap-2 mb-1">
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
            Step {stepIndex + 1} of {STEPS.length}
          </span>
          <button
            type="button"
            onClick={handleSkip}
            aria-label="Skip tour"
            className="text-muted-foreground hover:text-foreground transition-colors -mt-0.5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <h3 className="text-sm font-semibold mb-1">{step.title}</h3>
        <p className="text-xs text-muted-foreground leading-relaxed mb-3">{step.body}</p>

        {/* Progress dots */}
        <div className="flex items-center gap-1 mb-3">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === stepIndex ? "w-4 bg-blue-600" : "w-1.5 bg-muted"
              }`}
            />
          ))}
        </div>

        <div className="flex items-center justify-between gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs"
            onClick={handleBack}
            disabled={stepIndex === 0}
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back
          </Button>
          <Button size="sm" className="text-xs" onClick={handleNext}>
            {stepIndex === STEPS.length - 1 ? "Finish" : "Next"}
            {stepIndex !== STEPS.length - 1 && <ArrowRight className="w-3.5 h-3.5 ml-1" />}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default OnboardingTour;