import { useState, useEffect, useCallback } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { getMySessions, revokeSession, revokeOtherSessions } from "../../services/userService";
import { Monitor, MapPin, LogOut, ShieldAlert } from "lucide-react";
import type { Session } from "@/types/pages/SessionManagement.types";
import { formatISTDateTime as fmt } from "@/utils/dateFormat";
import { useLanguage } from "@/hooks/useLanguage";
import Trans from "@/components/Trans";
// (date formatting now imported from dateFormat.ts as `fmt`)

const SessionManagement = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [sessions,   setSessions]   = useState<Session[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [revokingAll, setRevokingAll] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getMySessions();
      setSessions(data);
    } catch (err) {
      console.error(err);
      toast({ title: t('auth.error'), description: t('auth.couldnTLoadYourSessions'), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const handleRevoke = async (sessionId: string) => {
    try {
      setRevokingId(sessionId);
      await revokeSession(sessionId);
      setSessions(prev => prev.filter(s => s.sessionId !== sessionId));
      toast({ title: t('auth.deviceSignedOut') });
    } catch (error) {
      toast({
        title: t('auth.error'),
        description: error?.response?.data?.message || t('auth.couldnTSignOut'),
        variant: "destructive",
      });
    } finally {
      setRevokingId(null);
    }
  };

  const handleRevokeOthers = async () => {
    try {
      setRevokingAll(true);
      const res = await revokeOtherSessions();
      setSessions(prev => prev.filter(s => s.isCurrent));
      toast({ title: t('auth.signedOutEverywhereElse'), description: res.message });
    } catch (error) {
      toast({
        title: t('auth.error'),
        description: error?.response?.data?.message || t('auth.couldnTSignOutOther'),
        variant: "destructive",
      });
    } finally {
      setRevokingAll(false);
    }
  };

  const otherSessionsCount = sessions.filter(s => !s.isCurrent).length;

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      <Navigation />

      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="max-w-2xl mx-auto space-y-5">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-xl font-medium">{t('auth.sessionsDevices')}</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {t('auth.whereYouReCurrentlySigned')}
              </p>
            </div>
            {otherSessionsCount > 0 && (
              <Button size="sm" variant="outline"
                className="bg-red-50 hover:bg-red-100 border-red-200 text-red-700"
                onClick={handleRevokeOthers} disabled={revokingAll}>
                <ShieldAlert className="w-3.5 h-3.5 mr-1.5" />
                {revokingAll ? t('auth.signingOut') : t('auth.signOutOtherDevices', { count: otherSessionsCount })}
              </Button>
            )}
          </div>

          <Card>
            <CardContent className="p-0">
              {loading ? (
                <p className="text-center text-sm text-muted-foreground py-10">{t('common.loading2')}</p>
              ) : !sessions.length ? (
                <p className="text-center text-sm text-muted-foreground py-10">{t('auth.noActiveSessionsFound')}</p>
              ) : (
                <div>
                  {sessions.map((s) => (
                    <div key={s.sessionId} className="p-4 border-b border-border last:border-0 flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Monitor className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium">{s.device}</span>
                          {s.isCurrent && (
                            <Badge className="text-[10px] bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400">
                              {t('auth.thisDevice')}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 flex-wrap mt-0.5">
                          <p className="text-xs text-muted-foreground">{t('auth.signed', { value: fmt(s.createdAt) })}</p>
                          {(s.location || s.ip) && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {s.location || t('auth.unknownLocation')}
                              {s.ip && <span className="text-muted-foreground/60">· {s.ip}</span>}
                            </p>
                          )}
                        </div>
                      </div>
                      {!s.isCurrent && (
                        <Button size="sm" variant="ghost"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 shrink-0"
                          onClick={() => handleRevoke(s.sessionId)}
                          disabled={revokingId === s.sessionId}>
                          <LogOut className="w-3.5 h-3.5 mr-1.5" />
                          {revokingId === s.sessionId ? t('auth.signingOut') : t('auth.signOut')}
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <p className="text-xs text-muted-foreground">
            <Trans i18nKey="auth.donTRecognizeADevice" components={{ link: <a href="/profile" className="text-primary hover:underline" /> }} />
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SessionManagement;