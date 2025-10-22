import { Activity, Github } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="bg-primary rounded-lg p-2">
                <Activity className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg">AI Medical Assistant</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Empowering health with AI-driven diagnostics for symptom analysis and skin disease detection.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-smooth">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/symptom-analysis" className="text-sm text-muted-foreground hover:text-primary transition-smooth">
                  Symptom Analysis
                </Link>
              </li>
              <li>
                <Link to="/image-analysis" className="text-sm text-muted-foreground hover:text-primary transition-smooth">
                  Image Analysis
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Social */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">Connect</h3>
            <p className="text-sm text-muted-foreground">
              Built with React, Tailwind CSS, and FastAPI
            </p>
            <div className="flex gap-3">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-secondary hover:bg-primary hover:text-primary-foreground transition-smooth"
                aria-label="GitHub"
              >
                <Github className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} AI Medical Assistant. For educational and informational purposes only.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
