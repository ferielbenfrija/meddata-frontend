import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Shield, 
  Database, 
  Lock, 
  FileSearch,
  Users,
  BookOpen,
  Mail,
  ExternalLink
} from 'lucide-react';

export default function About() {
  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">About & Documentation</h1>
        <p className="text-muted-foreground">Learn about the platform and how to use the dataset</p>
      </div>

      {/* Platform Overview */}
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center">
              <Shield className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <CardTitle>MedData Platform</CardTitle>
              <CardDescription>Secure Medical Data Anonymization</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none">
          <p className="text-muted-foreground">
            MedData is a comprehensive platform designed to facilitate secure sharing of medical data for research purposes. 
            Our platform employs advanced anonymization techniques to remove personal identifiable information (PII) from 
            medical documents while preserving the clinical value of the data.
          </p>
          <p className="text-muted-foreground">
            We support healthcare organizations in complying with privacy regulations such as HIPAA and GDPR, 
            while enabling researchers to access valuable medical data for their studies.
          </p>
        </CardContent>
      </Card>

      {/* How It Works */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
          <CardDescription>Understanding our anonymization process</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="h-16 w-16 rounded-xl gradient-info flex items-center justify-center mx-auto mb-4">
                <Database className="h-8 w-8 text-info-foreground" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">1. Data Upload</h3>
              <p className="text-sm text-muted-foreground">
                Administrators upload medical documents in various formats including PDF, Word, and Excel files.
              </p>
            </div>
            <div className="text-center">
              <div className="h-16 w-16 rounded-xl gradient-warning flex items-center justify-center mx-auto mb-4">
                <Lock className="h-8 w-8 text-warning-foreground" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">2. Anonymization</h3>
              <p className="text-sm text-muted-foreground">
                Our system detects and removes PII using automated algorithms with manual review for accuracy.
              </p>
            </div>
            <div className="text-center">
              <div className="h-16 w-16 rounded-xl gradient-success flex items-center justify-center mx-auto mb-4">
                <FileSearch className="h-8 w-8 text-success-foreground" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">3. Research Access</h3>
              <p className="text-sm text-muted-foreground">
                Researchers can browse, search, and download anonymized datasets for their studies.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Types */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Supported Data Types</CardTitle>
          <CardDescription>What kind of data you can find</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { title: 'Patient Records', desc: 'Anonymized patient visit records and medical histories' },
              { title: 'Lab Results', desc: 'Blood work, imaging, and diagnostic test results' },
              { title: 'Clinical Notes', desc: 'Physician notes and consultation summaries' },
              { title: 'Prescription Data', desc: 'Medication records and treatment plans' },
              { title: 'Surgical Records', desc: 'Procedure documentation and outcomes' },
              { title: 'Imaging Reports', desc: 'Radiology and diagnostic imaging findings' },
            ].map((item) => (
              <div key={item.title} className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium text-foreground">{item.title}</h4>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Usage Guidelines */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Usage Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium text-foreground mb-2">Terms of Use</h4>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>Data is provided exclusively for legitimate research purposes</li>
              <li>Re-identification attempts are strictly prohibited</li>
              <li>Proper citation is required when publishing research using this data</li>
              <li>Commercial use requires explicit authorization</li>
            </ul>
          </div>
          <Separator />
          <div>
            <h4 className="font-medium text-foreground mb-2">Data Citation Format</h4>
            <div className="p-4 bg-muted/50 rounded-lg font-mono text-sm">
              MedData Platform. (Year). [Dataset Name]. Retrieved from meddata.example.com
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Legal & Compliance */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Compliance & Legal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Our platform is designed to support compliance with major healthcare data regulations:
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium text-foreground">HIPAA Compliance</h4>
              <p className="text-sm text-muted-foreground mt-1">
                All data is de-identified according to HIPAA Safe Harbor guidelines.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium text-foreground">GDPR Ready</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Anonymization methods support GDPR requirements for EU data.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Contact Us
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Have questions or need assistance? Our team is here to help.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
              <Mail className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">support@meddata.example.com</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
              <ExternalLink className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Documentation</p>
                <p className="font-medium">docs.meddata.example.com</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
