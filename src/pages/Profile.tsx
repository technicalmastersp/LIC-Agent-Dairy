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
import { Edit, Save, X, Users, User as UserIcon } from "lucide-react";
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
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-form-header">{formData.name}</h1>
              <p className="text-muted-foreground">
                View and update your profile information
              </p>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              {/* {!isReferral ? (
                <Button 
                  onClick={() => setIsReferral(true)}
                  className="bg-primary hover:bg-primary-light"
                  disabled={true}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Refferal Program
                </Button>
              ) : (
                <div className="flex space-x-2">
                  <Button 
                    // onClick={handleSave}
                    onClick={() => setIsReferral(false)}
                    className="bg-primary hover:bg-primary-light"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Close
                  </Button>
                </div>
              )} */}
              <Button
                asChild
                className="bg-primary hover:bg-primary-light"
              >
                <Link to="/referral-program">
                <span>Referral Program</span>
              </Link>
              </Button>

              {!isEditing ? (
                <Button 
                  onClick={() => setIsEditing(true)}
                  className="bg-primary hover:bg-primary-light"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              ) : (
                <div className="flex space-x-2">
                  <Button 
                    onClick={handleSave}
                    className="bg-primary hover:bg-primary-light"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                  <Button 
                    onClick={handleCancel}
                    variant="outline"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Profile Information */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* User IDs Card */}
            <Card className="order-2 lg:order-1 bg-rose-100">
              <CardHeader>
                <CardTitle className="text-form-header flex items-center">
                  <UserIcon className="w-5 h-5 mr-2" />
                  User Identifiers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Auto-generated User ID 
                  </Label>
                  <Badge variant="secondary" className="mt-1 font-mono">
                    {currentUser.id}
                  </Badge>
                </div>
                <div>
                  <Label className="text-base font-medium text-muted-foreground">
                    Easy-to-remember User ID
                  </Label>
                  <Badge variant="outline" className="mt-1 font-mono">
                    {currentUser.easyId}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Account Created
                  </Label>
                  <p className="text-sm">
                    {convertDateToIndianFormat(currentUser.createdAt)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Current Plan
                  </Label>
                  {currentUser.subscription ? (
                    <p className="text-sm">
                      {currentUser.subscription.duration} — ₹{currentUser.subscription.price} ({currentUser.subscription.status})
                    </p>
                  ) : (
                    <Badge variant="secondary" className="mt-1">No active plan</Badge>
                  )}
                </div>
                {currentUser.subscription && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Plan Ends On <button onClick={()=>navigate("/our-plans")} type="button" className="ml-2 px-2 border rounded-sm text-xs hover:bg-indigo-50 active:bg-green-300 border-indigo-600 text-indigo-600">Upgrade your plan</button>
                    </Label>
                    <p className="text-sm">
                      {convertDateToIndianFormat(currentUser.subscription.endDate)}
                    </p>
                  </div>
                )}
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Your Referral Code
                  </Label>
                  <p className="text-sm">
                    {currentUser.referralCode || "N/A"}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Profile Form */}
            <Card className="lg:col-span-2 bg-cyan-100">
              <CardHeader>
                <CardTitle className="text-form-header">{t("profileInformation")}</CardTitle>
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
                    <Label htmlFor="email">{t('email')}</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={!isEditing ? "bg-muted" : ""}
                    />
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
              <CardTitle className="text-form-header">Account Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg" onClick={()=>navigate("/view-records")} style={{ cursor: 'pointer' }}>
                  <p className="text-2xl font-bold text-primary">
                    {currentUser.totalRecords}
                  </p>
                  <p className="text-sm text-muted-foreground">{t("totalRecords")}</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold text-primary">
                    {Math.floor((Date.now() - new Date(currentUser.createdAt).getTime()) / (1000 * 60 * 60 * 24))}
                  </p>
                  <p className="text-sm text-muted-foreground">{t("daysActive")}</p>
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