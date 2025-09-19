import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useLanguage } from "@/hooks/useLanguage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  Users, 
  Database, 
  Search, 
  FileText, 
  Languages, 
  Lock, 
  Smartphone,
  Mail,
  Phone,
  MapPin,
  Globe
} from "lucide-react";
import siteConfig from "@/config/siteConfig";

const About = () => {
  const { t } = useLanguage();

  const features = [
    {
      icon: Shield,
      title: "Secure Authentication",
      description: "Multi-level user authentication with auto-generated and easy-to-remember User IDs"
    },
    {
      icon: Database,
      title: "Permanent Data Storage",
      description: "All records are stored permanently in dedicated user folders with reliable data persistence"
    },
    {
      icon: Search,
      title: "Advanced Search & Filter",
      description: "Powerful search functionality with sortable columns and real-time filtering"
    },
    {
      icon: FileText,
      title: "Complete Record Management",
      description: "Add, view, edit, and manage life insurance policy records with detailed information"
    },
    {
      icon: Languages,
      title: "Multi-language Support",
      description: "Full support for English and Hindi languages with easy switching"
    },
    {
      icon: Users,
      title: "User Profile Management",
      description: "Complete user profile management with update capabilities"
    },
    {
      icon: Lock,
      title: "Data Security",
      description: "Secure data handling with encrypted storage and protected user sessions"
    },
    {
      icon: Smartphone,
      title: "Responsive Design",
      description: "Mobile-friendly interface that works seamlessly across all devices"
    }
  ];

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-form-header">About Our Platform</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              A comprehensive life insurance policy management system designed to simplify 
              and secure your policy record keeping with advanced features and user-friendly interface.
            </p>
          </div>

          {/* Mission */}
          <Card>
            <CardHeader>
              <CardTitle className="text-form-header text-2xl">Our Mission</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg text-muted-foreground">
                To provide a secure, reliable, and user-friendly platform for managing life insurance 
                policy records. We aim to simplify the complex process of policy management while 
                ensuring data security and accessibility for all users.
              </p>
            </CardContent>
          </Card>

          {/* Features Grid */}
          <div>
            <h2 className="text-3xl font-bold text-form-header text-center mb-8">Platform Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <feature.icon className="w-6 h-6 text-primary" />
                      </div>
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Technology Stack */}
          <Card>
            <CardHeader>
              <CardTitle className="text-form-header text-2xl">Technology Stack</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Badge variant="secondary" className="p-3 text-center justify-center">React</Badge>
                <Badge variant="secondary" className="p-3 text-center justify-center">TypeScript</Badge>
                <Badge variant="secondary" className="p-3 text-center justify-center">Tailwind CSS</Badge>
                <Badge variant="secondary" className="p-3 text-center justify-center">React Router</Badge>
                <Badge variant="secondary" className="p-3 text-center justify-center">Lucide Icons</Badge>
                <Badge variant="secondary" className="p-3 text-center justify-center">Local Storage</Badge>
                <Badge variant="secondary" className="p-3 text-center justify-center">Responsive Design</Badge>
                <Badge variant="secondary" className="p-3 text-center justify-center">Modern UI/UX</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-form-header text-2xl text-center">Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-form-header">Get in Touch</h3>
                  <div className="space-y-4">
                    {/* <div className="flex items-center space-x-3">
                      <Phone className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium">Phone</p>
                        <p className="text-muted-foreground">+91 9876543210</p>
                      </div>
                    </div> */}
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium">Email</p>
                        <p className="text-muted-foreground">{siteConfig.supportEmail}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium">Address</p>
                        <p className="text-muted-foreground">
                          123 Business District<br />
                          New Delhi, India - 110001
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Globe className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium">Website</p>
                        <p className="text-muted-foreground">{siteConfig.productionUrl}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-form-header">Support Hours</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Monday - Friday:</span> 9:00 AM - 6:00 PM</p>
                    <p><span className="font-medium">Saturday:</span> 10:00 AM - 4:00 PM</p>
                    <p><span className="font-medium">Sunday:</span> Closed</p>
                  </div>
                  
                  <div className="mt-6">
                    <h4 className="font-semibold text-form-header mb-2">Emergency Support</h4>
                    <p className="text-muted-foreground">
                      24/7 emergency support available for critical issues
                    </p>
                    {/* <p className="text-primary font-medium">+91 9876543211</p> */}
                  </div>
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

export default About;