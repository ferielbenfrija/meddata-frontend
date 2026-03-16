import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Eye, CheckCircle, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AdminFile, useAdminFiles } from '@/contexts/AdminFilesContext';
import AdminFilePreviewDialog from '@/components/admin/AdminFilePreviewDialog';
import { Link } from 'react-router-dom';

export default function AnonymizeFiles() {
  const { files, anonymizeFile } = useAdminFiles();
  const [searchQuery, setSearchQuery] = useState('');
  const [previewFile, setPreviewFile] = useState<AdminFile | null>(null);
  const { toast } = useToast();

  const pendingFiles = useMemo(
    () => files.filter((file) => file.status === 'uploaded'),
    [files]
  );

  const filteredFiles = useMemo(
    () =>
      pendingFiles.filter((file) =>
        file.name.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [pendingFiles, searchQuery]
  );

  const handleAnonymize = (fileId: string, name: string, kind: string) => {
    anonymizeFile(fileId);
    const publishedAs = kind === 'Text' ? 'published as text for researchers' : 'published for researchers to download';
    toast({
      title: 'File anonymized',
      description: `${name} is now ${publishedAs}.`,
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Anonymize Files</h1>
        <p className="text-muted-foreground">Review pending uploads and approve anonymization</p>
        <p className="text-sm text-muted-foreground mt-2">
          When you approve anonymization, the file is published to the researcher dataset. Text-based files (TXT, CSV) are
          available as readable text; PDF, Word, Excel, and medical imaging files (e.g. JPG/PNG radiology images, MRI videos,
          DICOM) are available for download.
        </p>
      </div>

      <Card className="shadow-card">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search pending files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {filteredFiles.length === 0 ? (
        <Card className="shadow-card">
          <CardContent className="py-10 text-center text-sm text-muted-foreground space-y-3">
            <div className="flex justify-center">
              <div className="h-12 w-12 rounded-xl gradient-warning flex items-center justify-center">
                <Shield className="h-6 w-6 text-primary-foreground" />
              </div>
            </div>
            <p>No pending files right now.</p>
            <Button asChild variant="outline">
              <Link to="/admin/upload">Upload new files</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredFiles.map((file) => (
            <Card key={file.id} className="shadow-card hover:shadow-card-hover transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-base">{file.name}</CardTitle>
                    <CardDescription>
                      {file.kind} - Uploaded {new Date(file.uploadedAt).toLocaleString()}
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
                    Pending
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setPreviewFile(file)}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Preview
                  </Button>
                  <Button
                    className="flex-1 gradient-success text-success-foreground"
                    onClick={() => handleAnonymize(file.id, file.name, file.kind)}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Approve Anonymization
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AdminFilePreviewDialog
        file={previewFile}
        open={!!previewFile}
        onOpenChange={(open) => !open && setPreviewFile(null)}
      />
    </div>
  );
}
