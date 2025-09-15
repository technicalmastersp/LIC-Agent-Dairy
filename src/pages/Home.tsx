import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Table, User } from "lucide-react";
import Navigation from "@/components/Navigation";
import { getCurrentUser, isAuthenticated, getUserRecords } from "@/utils/auth";
import { useLanguage } from "@/hooks/useLanguage";

const Home = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const currentUser = getCurrentUser();
  const authenticated = isAuthenticated();

  useEffect(() => {
    if (!authenticated) {
      navigate("/login");
    }
  }, [authenticated, navigate]);

  if (!authenticated || !currentUser) {
    return null;
  }

  const userRecords = getUserRecords(currentUser.id);

  return (
    <div className="min-h-screen bg-muted/30">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Welcome Section */}
          <Card className="bg-gradient-to-br from-primary/5 to-accent/20 border-primary/20">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-primary-foreground" />
              </div>
              <CardTitle className="text-3xl text-form-header">
                {t('welcome')}, {currentUser.name}!
              </CardTitle>
              <CardDescription className="text-lg text-muted-foreground">
                Life Insurance Corporation Record Management System
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-semibold text-form-subheader">{t('userId')}</h4>
                  <p className="text-muted-foreground">{currentUser.id}</p>
                  <p className="text-muted-foreground text-xs">({currentUser.easyId})</p>
                </div>
                <div>
                  <h4 className="font-semibold text-form-subheader">{t('designation')}</h4>
                  <p className="text-muted-foreground">{currentUser.designation}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
              <Link to="/add-record">
                <CardHeader className="pb-4">
                  <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-3 group-hover:bg-primary-light transition-colors">
                    <Plus className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <CardTitle className="text-xl text-form-header">{t('addRecord')}</CardTitle>
                  <CardDescription>
                    Create a new life insurance policy record with complete details
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    Fill out policy holder information, family details, and beneficiary data
                  </div>
                </CardContent>
              </Link>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
              <Link to="/view-records">
                <CardHeader className="pb-4">
                  <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-3 group-hover:bg-primary-light transition-colors">
                    <Table className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <CardTitle className="text-xl text-form-header">{t('viewRecords')}</CardTitle>
                  <CardDescription>
                    Browse, search, and manage existing policy records
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    Search and sort through all insurance records with detailed view options
                  </div>
                </CardContent>
              </Link>
            </Card>
          </div>

          {/* System Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-form-header">System Information</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <h4 className="font-semibold text-form-subheader">Current User</h4>
                <p className="text-muted-foreground">{currentUser.name}</p>
                <p className="text-xs text-muted-foreground">{currentUser.email}</p>
              </div>
              <div>
                <h4 className="font-semibold text-form-subheader">{t('totalRecords')}</h4>
                <p className="text-muted-foreground">
                  {userRecords.length} policies
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-form-subheader">Last Access</h4>
                <p className="text-muted-foreground">{new Date().toLocaleDateString()}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Home;