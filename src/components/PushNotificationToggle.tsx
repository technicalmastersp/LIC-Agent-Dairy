import { useEffect, useState } from "react";
import { Smartphone, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { getPushState, enablePush, disablePush, type PushState } from "@/utils/pushNotifications";
import { sendTestPush } from "../../services/pushService";

const MESSAGES: Partial<Record<PushState, string>> = {
  unsupported: "This browser doesn't support device notifications. Try Chrome, Edge or Firefox.",
  "ios-install":
    "On iPhone/iPad, first add this app to your Home Screen (Share → Add to Home Screen), open it from there, then come back here.",
  unavailable: "Device notifications aren't available right now. Please try again later.",
  denied:
    "Notifications are blocked for this site. Allow them in your browser's site settings, then reload this page.",
};

const PushNotificationToggle = () => {
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
          toast({ title: "Notifications blocked", description: MESSAGES.denied, variant: "destructive" });
        }
      } else {
        await disablePush();
        setState("off");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Couldn't change device notifications.",
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

  const message = state !== "loading" && state !== "on" && state !== "off" ? MESSAGES[state] : null;

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center shrink-0">
            <Smartphone className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">Notifications on this device</p>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
              {message ??
                "Get due-date reminders and updates in your Windows or phone notification panel, even when this tab is closed. This applies to this device only."}
            </p>
            {state === "on" && (
              <Button variant="outline" size="sm" className="mt-3 h-8 text-xs" disabled={testing} onClick={handleTest}>
                {testing && <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />}
                Send me a test notification
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
              aria-label="Notifications on this device"
              className="mt-0.5 shrink-0"
            />
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
};

export default PushNotificationToggle;
