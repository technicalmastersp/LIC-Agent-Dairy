import { useState, useEffect, useCallback } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import PushNotificationToggle from "@/components/PushNotificationToggle";
import { useToast } from "@/hooks/use-toast";
import { getNotificationPreferences, updateNotificationPreferences } from "../../services/userService";
import { Bell, CalendarClock, CreditCard } from "lucide-react";
import type { Preferences } from "@/types/pages/NotificationPreferences.types";
import { useLanguage } from "@/hooks/useLanguage";
const DEFAULT_PREFS: Preferences = {
  policyDueReminders: true,
  subscriptionReminders: true,
};

const NotificationPreferences = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [prefs,    setPrefs]    = useState<Preferences>(DEFAULT_PREFS);
  const [loading,  setLoading]  = useState(true);
  // Tracks which single toggle is mid-save so only that switch shows as
  // disabled/pending, rather than freezing the whole card on every change.
  const [saving,   setSaving]   = useState<keyof Preferences | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getNotificationPreferences();
      setPrefs({ ...DEFAULT_PREFS, ...data });
    } catch (err) {
      console.error(err);
      toast({ title: t('profile.error'), description: t('profile.couldnTLoadYourNotification'), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const handleToggle = async (key: keyof Preferences, value: boolean) => {
    const previous = prefs[key];
    setPrefs(p => ({ ...p, [key]: value })); // optimistic
    setSaving(key);
    try {
      await updateNotificationPreferences({ [key]: value });
    } catch (error) {
      setPrefs(p => ({ ...p, [key]: previous })); // roll back on failure
      toast({
        title: t('profile.error'),
        description: error?.response?.data?.message || t('profile.couldnTSaveThatChange'),
        variant: "destructive",
      });
    } finally {
      setSaving(null);
    }
  };

  const options: {
    key: keyof Preferences;
    icon: typeof CalendarClock;
    title: string;
    desc: string;
  }[] = [
    {
      key: "policyDueReminders",
      icon: CalendarClock,
      title: t('profile.paymentDueReminders'),
      desc: t('profile.emailMeWhenAPolicy'),
    },
    {
      key: "subscriptionReminders",
      icon: CreditCard,
      title: t('profile.subscriptionReminders'),
      desc: t('profile.emailMeBeforeMyPlan'),
    },
  ];

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      <Navigation />

      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="max-w-2xl mx-auto space-y-5">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            <div>
              <h1 className="text-xl font-medium">{t('profile.notificationPreferences')}</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {t('profile.chooseWhichReminderEmails')}
              </p>
            </div>
          </div>

          {/* OS-level notifications (Windows / phone notification panel) — per device */}
          <PushNotificationToggle />

          <Card>
            <CardContent className="p-0">
              {loading ? (
                <p className="text-center text-sm text-muted-foreground py-10">{t('common.loading2')}</p>
              ) : (
                <div>
                  {options.map(({ key, icon: Icon, title, desc }) => (
                    <div key={key} className="flex items-start gap-4 p-5 border-b border-border last:border-0">
                      <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{desc}</p>
                      </div>
                      <Switch
                        checked={prefs[key]}
                        disabled={saving === key}
                        onCheckedChange={(checked) => handleToggle(key, checked)}
                        className="mt-0.5 shrink-0"
                      />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <p className="text-xs text-muted-foreground">
            {t('profile.thisOnlyControlsReminderEmails')}
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NotificationPreferences;