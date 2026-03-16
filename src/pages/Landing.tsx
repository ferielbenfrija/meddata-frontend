import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Shield, Database, Users, FileSearch, Lock, ArrowRight } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center">
              <Shield className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">MedData</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/signin">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link to="/signup">
              <Button className="gradient-primary text-primary-foreground">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              Anonymized Medical Data
              <span className="block text-primary">for Research</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-10">
              A secure platform for managing, anonymizing, and sharing medical documents. 
              Empowering researchers with compliant, de-identified healthcare data.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup">
                <Button size="lg" className="gradient-primary text-primary-foreground px-8">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/signin">
                <Button size="lg" variant="outline" className="px-8">
                  Sign In to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-card">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center text-foreground mb-4">
            Why Choose Our Platform?
          </h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Built with security and compliance in mind, our platform streamlines the medical data anonymization process.
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Lock className="h-8 w-8" />}
              title="Secure Anonymization"
              description="Advanced algorithms detect and remove personal identifiers from medical documents automatically."
              gradient="gradient-primary"
            />
            <FeatureCard
              icon={<Database className="h-8 w-8" />}
              title="Multi-Format Support"
              description="Upload PDFs, Word documents, Excel spreadsheets, and text files. We handle all common medical document formats."
              gradient="gradient-info"
            />
            <FeatureCard
              icon={<FileSearch className="h-8 w-8" />}
              title="Easy Discovery"
              description="Researchers can browse, search, and filter anonymized datasets with powerful search tools."
              gradient="gradient-success"
            />
            <FeatureCard
              icon={<Shield className="h-8 w-8" />}
              title="Compliance Ready"
              description="Built to support HIPAA, GDPR, and other healthcare data regulations."
              gradient="gradient-warning"
            />
            <FeatureCard
              icon={<Users className="h-8 w-8" />}
              title="Role-Based Access"
              description="Separate workflows for administrators and researchers with appropriate permissions."
              gradient="gradient-danger"
            />
            <FeatureCard
              icon={<ArrowRight className="h-8 w-8" />}
              title="Audit Trail"
              description="Complete logging of all anonymization activities for compliance and transparency."
              gradient="gradient-primary"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="gradient-primary rounded-2xl p-12 text-center text-primary-foreground">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
              Join researchers and healthcare organizations already using our platform for secure medical data sharing.
            </p>
            <Link to="/signup">
              <Button size="lg" variant="secondary" className="px-8">
                Create Free Account
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
                  <Shield className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="font-bold text-foreground">MedData</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Secure medical data anonymization platform for research.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/about" className="hover:text-primary transition-colors">About</Link></li>
                <li><Link to="/signin" className="hover:text-primary transition-colors">Sign In</Link></li>
                <li><Link to="/signup" className="hover:text-primary transition-colors">Sign Up</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="#" className="hover:text-primary transition-colors">Terms of Service</Link></li>
                <li><Link to="#" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                <li><Link to="#" className="hover:text-primary transition-colors">Compliance</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>support@meddata.example.com</li>
                
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            © 2026 MedData Platform. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ 
  icon, 
  title, 
  description, 
  gradient 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
  gradient: string;
}) {
  return (
    <div className="bg-background rounded-xl p-6 shadow-card hover:shadow-card-hover transition-shadow">
      <div className={`h-14 w-14 rounded-xl ${gradient} flex items-center justify-center text-primary-foreground mb-4`}>
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
