import { Link } from 'react-router-dom';
import { Activity, Heart } from 'lucide-react';
import { MedicalDisclaimer } from '@/components/MedicalDisclaimer';

export const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        {/* Disclaimer */}
        <div className="mb-8 bg-white/10 rounded-xl p-6">
          <MedicalDisclaimer variant="default" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center">
                <Activity className="h-6 w-6 text-accent-foreground" />
              </div>
              <span className="font-display font-bold text-xl">MediVision Buddy</span>
            </Link>
            <p className="text-primary-foreground/70 text-sm max-w-md">
              AI-powered chest disease detection system designed to support healthcare professionals 
              and medical students in their diagnostic journey.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li>
                <Link to="/dashboard" className="hover:text-primary-foreground transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/xray-analysis" className="hover:text-primary-foreground transition-colors">
                  X-Ray Analysis
                </Link>
              </li>
              <li>
                <Link to="/symptom-checker" className="hover:text-primary-foreground transition-colors">
                  Symptom Checker
                </Link>
              </li>
              <li>
                <Link to="/chat" className="hover:text-primary-foreground transition-colors">
                  AI Assistant
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li>
                <a href="#" className="hover:text-primary-foreground transition-colors">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary-foreground transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary-foreground transition-colors">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-primary-foreground/60">
            © {new Date().getFullYear()} MediVision Buddy. All rights reserved.
          </p>
          <p className="text-sm text-primary-foreground/60 flex items-center gap-1">
            Made with <Heart className="h-4 w-4 text-accent" /> for healthcare
          </p>
        </div>
      </div>
    </footer>
  );
};
