import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { getCurrentUser, setCurrentUser, isAuthenticated } from "@/utils/auth";
import { useLanguage } from "@/hooks/useLanguage";
import { dueThisMonth, getRecordsWithoutLastPayment } from "../../services/recordService";
import { getProfile } from "../../services/userService";

const Home = () => {
  const [currentMonthTotalDueCount, setCurrentMonthTotalDueCount] = useState(0);
  const [recordsWithoutLastPayment, setRecordsWithoutLastPayment] = useState(0);
  const navigate = useNavigate();
  const { t } = useLanguage();
  let currentUser = getCurrentUser();
  const authenticated = isAuthenticated();

  const fetchRecords = async () => {
    try {
      const user = await getProfile();
      setCurrentUser(user); 
      const userRecords = await dueThisMonth();
      const recordsWithoutLastPayment = await getRecordsWithoutLastPayment();
      setCurrentMonthTotalDueCount(userRecords.totalDue);
      setRecordsWithoutLastPayment(recordsWithoutLastPayment.total);
    } catch (error) {
      console.error(error);
    } finally {
    }
  };

  useEffect(() => {
    if (!authenticated) {
      navigate("/login");
    }
    fetchRecords();
  }, [authenticated, navigate]);

  if (!authenticated || !currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Welcome Section */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-[3.15rem] font-bold text-form-header">
              {t('welcome')}, {currentUser?.name || 'User'}!
            </h1>
            <p className="text-xl text-muted-foreground">
              Manage your life insurance policy records with ease and security
            </p>
          </div>

          {/* User Info Card */}
          {/* <Card className="text-left">
            <CardHeader>
              <CardTitle className="text-form-header">Your Account Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Badge variant="secondary" className="mb-2">Auto-generated ID</Badge>
                <p className="font-mono text-sm">{currentUser?.id}</p>
              </div>
              <div>
                <Badge variant="outline" className="mb-2">Easy-to-remember ID</Badge>
                <p className="font-mono text-sm">{currentUser?.easyId}</p>
              </div>
              <div>
                <Badge variant="secondary" className="mb-2">Email</Badge>
                <p className="text-sm">{currentUser?.email}</p>
              </div>
              <div>
                <Badge variant="outline" className="mb-2">Mobile</Badge>
                <p className="text-sm">{currentUser?.mobileNumber}</p>
              </div>
            </CardContent>
          </Card> */}

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="hover:shadow-lg transition-shadow bg-blue-100">
              <CardHeader>
                <CardTitle className="text-form-header flex items-center">
                  <Plus className="w-5 h-5 mr-2" />
                  {t('addRecord')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Add new life insurance policy records with complete information
                </p>
                <Link to="/add-record">
                  <Button className="w-full bg-primary hover:bg-primary-light">
                    {t("addNewRecord")}
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow bg-yellow-100">
              <CardHeader>
                <CardTitle className="text-form-header flex items-center">
                  <Eye className="w-5 h-5 mr-2" />
                  {t('viewRecords')}{<Badge variant="destructive" className="ml-2">{currentUser.totalRecords}</Badge>}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  View, search, and manage all your existing policy records
                </p>
                <Link to="/view-records">
                  <Button className="w-full bg-primary hover:bg-primary-light">
                    {t("viewAllRecords")}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="hover:shadow-lg transition-shadow bg-green-100">
              <CardHeader>
                <CardTitle className="text-form-header flex items-center">
                  <Plus className="w-5 h-5 mr-2" />
                  {/* Current Month Due {thisMonthDue.totalDue > 0 ? <Badge variant="destructive" className="ml-2">{thisMonthDue.totalDue}</Badge>:''} */}
                  Current Month Due {<Badge variant="destructive" className="ml-2">{currentMonthTotalDueCount}</Badge>}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  View your current month's due policies and their details
                </p>
                <Link to="/view-due-policies">
                  <Button className="w-full bg-primary hover:bg-primary-light">
                    View Due Policies
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow bg-red-100">
              <CardHeader>
                <CardTitle className="text-form-header flex items-center">
                  <Eye className="w-5 h-5 mr-2" />
                  Missing Last Month's Payment {<Badge variant="destructive" className="ml-2">{recordsWithoutLastPayment}</Badge>}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Check for any policies that missed last month's payment and take action
                </p>
                <Link to="/view-missed-payments">
                  <Button className="w-full bg-primary hover:bg-primary-light">
                    View Missed Payments
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Statistics */}
          <Card className="bg-orange-100">
            <CardHeader>
              <CardTitle className="text-form-header">{t("quickStatistics")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div onClick={()=>navigate("/view-records")} style={{ cursor: 'pointer' }}>
                  <p className="text-3xl font-bold text-primary">
                    {currentUser?.totalRecords }
                  </p>
                  <p className="text-muted-foreground">{t("totalRecords")}</p>
                </div>
                <div onClick={()=>navigate("/profile")} style={{ cursor: 'pointer' }}>
                  <p className="text-3xl font-bold text-primary">
                    {currentUser ? Math.floor((Date.now() - new Date(currentUser.createdAt).getTime()) / (1000 * 60 * 60 * 24)) : 0}
                  </p>
                  <p className="text-muted-foreground">{t("daysActive")}</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-primary">100%</p>
                  <p className="text-muted-foreground">{t("dataSecurity")}</p>
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

export default Home;