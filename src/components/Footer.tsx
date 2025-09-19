import { useLanguage } from "@/hooks/useLanguage";
import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Globe } from "lucide-react";
import { isAuthenticated } from "@/utils/auth";
import siteConfig from "@/config/siteConfig";

const Footer = () => {
  const { t } = useLanguage();
  const authenticated = isAuthenticated();

  return (
    <footer className="bg-primary text-white mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-accent">Quick Links</h3>
            {authenticated ? (
              <div className="space-y-2">
                <Link to="/" className="block hover:text-accent transition-colors">
                  {t('home')}
                </Link>
                <Link to="/add-record" className="block hover:text-accent transition-colors">
                  {t('addRecord')}
                </Link>
                <Link to="/view-records" className="block hover:text-accent transition-colors">
                  {t('viewRecords')}
                </Link>
                <Link to="/profile" className="block hover:text-accent transition-colors">
                  Profile
                </Link>
              </div>
            // ) : (
            ) : (
              <div className="space-y-2">
                <Link to="/Login" className="block hover:text-accent transition-colors">
                  Log in
                </Link>
                <Link to="/signup" className="block hover:text-accent transition-colors">
                  Sign Up
                </Link>
              </div>
            )}
            <div className="space-y-2">
              <Link to="/about" className="block hover:text-accent transition-colors mt-2">
                About Us
              </Link>
              <Link to="/our-plans" className="block hover:text-accent transition-colors">
                Our Plans
              </Link>
              <Link to="/lic-info-hub" className="block hover:text-accent transition-colors">
                Best Info Hub
              </Link>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-accent">Contact Info</h3>
            <div className="space-y-3">
              {/* <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4" />
                <span>+91 9876543210</span>
              </div> */}
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>{siteConfig.supportEmail}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span>New Delhi, India</span>
              </div>
              <div className="flex items-center space-x-2">
                <Globe className="w-4 h-4" />
                <span>{siteConfig.productionUrl}</span>
              </div>
            </div>
          </div>

          {/* Features */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-accent">Features</h3>
            <div className="space-y-2 text-sm">
              <p>✓ Secure Policy Management</p>
              <p>✓ Multi-language Support</p>
              <p>✓ User Authentication</p>
              <p>✓ Data Export & Import</p>
              <p>✓ Search & Filter Records</p>
              <p>✓ Real-time Updates</p>
            </div>
          </div>

          {/* Company Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-accent">About Company</h3>
            <p className="text-sm mb-4">
              Your trusted partner for life insurance policy management. 
              Secure, reliable, and user-friendly platform for all your policy needs.
            </p>
            <div className="text-xs text-gray-300">
              <p>© 2024 Policy Records Management</p>
              <p>All Rights Reserved</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/20 mt-8 pt-4 text-center text-sm">
          <p>Built with React • Secure • Reliable • Multi-language Support</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;