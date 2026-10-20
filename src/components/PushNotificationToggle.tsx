import { useEffect, useState } from "react";
import type { TranslationKey } from "@/types/i18n.types";
import { Smartphone, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { getPushState, enablePush, disablePush, type PushState } from "@/utils/pushNotifications";
import { sendTestPush } from "../../services/pushService";
import { useLanguage } from "@/hooks/useLanguage";

// i18n keys (module scope can't call hooks); translated where displayed.
const MESSAGES: Partial<Record<PushState, TranslationKey>> = {
  unsupported: "nav.pushUnsupported",
  "ios-install": "nav.pushIosInstall",
  unavailable: "nav.pushUnavailable",
  denied: "nav.pushDenied",
};

const PushNotificationToggle = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [state, setState] = useState<PushState | "loading">("loading");
  const [busy, setBusy] = useState(false);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    let alive = true;
    getPushState()
      .then((s) => alive && setState(s))
      .catch(() => alive && setState("unavailable"));
    return () => { alive = false; };
  }, []);

  const handleChange = async (checked: boolean) => {
    setBusy(true);
    try {
      if (checked) {
        const next = await enablePush();
        setState(next);
        if (next === "denied") {
          toast({ title: t('nav.notificationsBlocked'), description: t(MESSAGES.denied!), variant: "destructive" });
        }
      } else {
        await disablePush();
        setState("off");
      }
    } catch (error) {
      toast({
        title: t('nav.error'),
        description: error?.response?.data?.message || t('nav.couldnTChangeDeviceNotifications'),
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    try {
      const res = await sendTestPush();
      toast({ title: res.message });
    } catch {
      /* apiClient already shows the error toast */
    } finally {
      setTesting(false);
    }
  };

  const message = state !== "loading" && state !== "on" && state !== "off" ? (MESSAGES[state] ? t(MESSAGES[state]!) : null) : null;

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center shrink-0">
            <Smartphone className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">{t('nav.notificationsOnThisDevice')}</p>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
              {message ??
                t('nav.getDueDateReminders')}
            </p>
            {state === "on" && (
              <Button variant="outline" size="sm" className="mt-3 h-8 text-xs" disabled={testing} onClick={handleTest}>
                {testing && <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />}
                {t('nav.sendMeATestNotification')}
              </Button>
            )}
          </div>
          {state === "loading" ? (
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground mt-1 shrink-0" />
          ) : state === "on" || state === "off" ? (
            <Switch
              checked={state === "on"}
              disabled={busy}
              onCheckedChange={handleChange}
              aria-label={t('nav.notificationsOnThisDevice')}
              className="mt-0.5 shrink-0"
            />
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
};

export default PushNotificationToggle;
