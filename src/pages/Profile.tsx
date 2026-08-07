import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useLanguage } from "@/hooks/useLanguage";
import { getCurrentUser, isAuthenticated, User, getCustomersList } from "@/utils/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Edit, Save, X, KeyRound, Users, User as UserIcon } from "lucide-react";
import { updateProfile } from "../../services/userService.js";
import { convertDateToIndianFormat } from "@/utils/tools";

const Profile = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { toast } = useToast();
  const currentUser = getCurrentUser();
  const authenticated = isAuthenticated();

  const [isEditing, setIsEditing] = useState(false);
  const [isReferral, setIsReferral] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    fullAddress: "",
    mobileNumber: "",
    email: ""
  });

  useEffect(() => {
    if (!authenticated || !currentUser) {
      navigate("/login");
      return;
    }

    // Initialize form with current user data
    setFormData({
      name: currentUser.name,
      fullAddress: currentUser.fullAddress,
      mobileNumber: currentUser.mobileNumber,
      email: currentUser.email
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authenticated, navigate]);

  if (!authenticated || !currentUser) {
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      const updatedUser = await updateProfile(formData);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));

      setIsEditing(false);
      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setFormData({
      name: currentUser.name,
      fullAddress: currentUser.fullAddress,
      mobileNumber: currentUser.mobileNumber,
      email: currentUser.email
    });
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      <Navigation />

      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="max-w-4xl mx-auto space-y-6">

          {/* ── Top header ── */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Avatar initials */}
              <div className="w-16 h-16 rounded-full bg-blue-100 border-2 border-blue-300 flex items-center justify-center text-blue-700 text-xl font-medium shrink-0">
                {formData.name?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-medium text-form-header leading-tight">{formData.name}</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Policy Agent ·{" "}
                  <span className="font-mono text-xs bg-muted border border-border rounded px-1.5 py-0.5">
                    {currentUser.easyId}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button asChild size="sm">
                <Link to="/referral-program">
                  <Users className="w-4 h-4 mr-1.5" /> Referral program
                </Link>
              </Button>
              {!isEditing ? (
                <Button size="sm" onClick={() => setIsEditing(true)}>
                  <Edit className="w-4 h-4 mr-1.5" /> Edit profile
                </Button>
              ) : (
                <>
                  <Button size="sm" onClick={handleSave}>
                    <Save className="w-4 h-4 mr-1.5" /> Save changes
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleCancel}>
                    <X className="w-4 h-4 mr-1.5" /> Cancel
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Profile Information */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* User IDs Card */}
            <Card className="order-2 lg:order-1 bg-green-100">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                  <UserIcon className="w-5 h-5 mr-2" />
                  Account
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  {
                    label: "Status",
                    value: currentUser?.subscription?.status === "active"
                      ? <Badge className="bg-green-500 text-white border border-green-200">Active</Badge>
                      : <Badge variant="destructive">Expired</Badge>
                  },
                  { label: "Plan", value: `${currentUser.subscription?.duration} — ₹${currentUser.subscription?.price}` },
                  { label: "Expires", value: convertDateToIndianFormat(currentUser.subscription?.endDate) },
                  {
                    label: "Days left",
                    value: (
                      <Badge className="bg-blue-100 text-blue-700 border border-blue-200">
                        {Math.max(0, Math.ceil(
                          (new Date(currentUser.subscription?.endDate).getTime() - Date.now()) / 86400000
                        ))} days
                      </Badge>
                    )
                  },
                  {
                    label: "Referral code",
                    value: <span className="font-mono text-xs bg-muted border border-border rounded px-1.5 py-0.5">{currentUser.referralCode || "N/A"}</span>
                  },
                  { label: "Member since", value: convertDateToIndianFormat(currentUser.createdAt) },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between py-0.5">
                    <span className="text-sm text-muted-foreground">{label}</span>
                    <span className="text-sm font-medium">{value}</span>
                  </div>
                ))}

                {/* Upgrade nudge */}
                <div
                  onClick={() => navigate("/our-plans")}
                  className="mt-3 flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-3 py-2.5 cursor-pointer hover:bg-blue-100 transition-colors"
                >
                  <span className="text-xs font-medium text-blue-700">Upgrade your plan</span>
                  <span className="text-xs text-muted-foreground">See plans →</span>
                </div>
                <div>
                  <Button
                    variant="outline" size="sm"
                    className="w-full bg-red-50 hover:bg-red-100 border-red-200 text-red-700"
                    onClick={() => navigate("/change-password")}
                  >
                    <KeyRound className="w-4 h-4 mr-1.5" /> Change password
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Profile Form */}
            <Card className="lg:col-span-2 bg-cyan-100">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">{t("profileInformation")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">{t('name')}</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      disabled={true}
                      className="bg-muted"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mobileNumber">{t('mobileNumber')}</Label>
                    <Input
                      id="mobileNumber"
                      name="mobileNumber"
                      value={formData.mobileNumber}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={!isEditing ? "bg-muted" : ""}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">{t('email')}</Label>{currentUser.isEmailVerified ? (
                      <Badge variant="success" className="ml-2">Verified</Badge>
                    ) : (
                      <Badge variant="destructive" className="ml-2">Not Verified</Badge>
                    )}
                    <div className="relative">
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={!isEditing ? "bg-muted" : ""}
                      />
                      {!currentUser.isEmailVerified && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="absolute right-1 top-1 bg-red-100 hover:bg-red-200 border-red-300 text-red-800"
                          onClick={() => navigate("/verify-email")}
                        >
                          Verify Now
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fullAddress">{t('fullAddress')}</Label>
                  <Textarea
                    id="fullAddress"
                    name="fullAddress"
                    value={formData.fullAddress}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={!isEditing ? "bg-muted" : ""}
                    rows={4}
                  />
                </div>

                {isEditing && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800">
                      <strong>Note:</strong> User Name and User ID cannot be changed for security reasons.
                      These identifiers are permanently assigned to your account.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Account Statistics */}
          <Card className="bg-orange-100">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Account Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg" onClick={() => navigate("/view-records")} style={{ cursor: 'pointer' }}>
                  <p className="text-2xl font-bold text-primary">
                    {currentUser.totalRecords}
                  </p>
                  <p className="text-sm text-muted-foreground">{t("totalRecords")}</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  {currentUser?.subscription.status === "active" ? (
                    <Badge variant="success" className="mb-2">Active</Badge>
                  ) : (
                    <Badge variant="destructive" className="mb-2">Expired</Badge>
                  )}
                  <p className="text-muted-foreground">Plan Status {currentUser?.subscription.endDate ? `: ${Math.max(0, Math.ceil((new Date(currentUser.subscription.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} Days left` : "No Plan"}</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold text-primary">{currentUser.subscription.planType || 'Premium'}</p>
                  <p className="text-sm text-muted-foreground">{t("accountType")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;