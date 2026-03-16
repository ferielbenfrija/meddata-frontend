import { useEffect, useMemo, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Download, 
  FileText,
  Calendar,
  FileType,
  HardDrive,
  Shield
} from 'lucide-react';
import { useAdminFiles } from '@/contexts/AdminFilesContext';
import { useResearcherActivity } from '@/contexts/ResearcherActivityContext';
import { useToast } from '@/hooks/use-toast';

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export default function FileDetails() {
  const { id } = useParams();
  const { files, ensurePreviewUrl } = useAdminFiles();
  const { toast } = useToast();
  const { recordDownload, recordView } = useResearcherActivity();
  const lastViewedId = useRef<string | null>(null);

  const file = useMemo(
    () => files.find((item) => item.id === id),
    [files, id]
  );

  useEffect(() => {
    if (!file || file.previewUrl) return;
    ensurePreviewUrl(file.id);
  }, [ensurePreviewUrl, file]);

  useEffect(() => {
    if (!file) return;
    if (lastViewedId.current === file.id) return;
    lastViewedId.current = file.id;
    recordView(file.id);
  }, [file, recordView]);

  const handleDownload = async () => {
    if (!file) return;
    const url = file.previewUrl || (await ensurePreviewUrl(file.id));
    if (!url) {
      toast({
        title: 'Download unavailable',
        description: 'Re-upload the file to download it again.',
        variant: 'destructive',
      });
      return;
    }

    const link = document.createElement('a');
    link.href = url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    recordDownload(file.id);
  };

  if (!file) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-4">
          <Link to="/researcher/browse">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">File not found</h1>
            <p className="text-muted-foreground">This file may have been removed.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/researcher/browse">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">{file.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline">{file.kind}</Badge>
            <Badge variant="secondary">Anonymized</Badge>
            <span className="text-sm text-muted-foreground">
              {new Date(file.anonymizedAt || file.uploadedAt).toLocaleDateString()}
            </span>
          </div>
        </div>
        <Button className="gradient-primary text-primary-foreground" onClick={handleDownload}>
          <Download className="h-4 w-4 mr-2" />
          Download
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                This file has been anonymized and is available for research use.
              </p>
            </CardContent>
          </Card>

          {/* Preview */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Document Preview</CardTitle>
              <CardDescription>Preview is available for text and PDF files</CardDescription>
            </CardHeader>
            <CardContent>
              {file.textPreview ? (
                <div className="bg-muted/50 rounded-lg p-6 font-mono text-sm whitespace-pre-wrap text-foreground">
                  {file.textPreview}
                </div>
              ) : file.kind === 'PDF' ? (
                file.previewUrl ? (
                  <iframe
                    title={`Preview of ${file.name}`}
                    src={file.previewUrl}
                    className="w-full h-[520px] rounded-lg border"
                  />
                ) : (
                  <div className="text-sm text-muted-foreground">
                    Loading preview…
                  </div>
                )
              ) : (
                <div className="text-sm text-muted-foreground">
                  Preview is not available for this file type.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* File Info */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-base">File Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                  <FileType className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">File Type</p>
                  <p className="font-medium">{file.kind}</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                  <HardDrive className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">File Size</p>
                  <p className="font-medium">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="font-medium">Anonymized</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Uploaded</p>
                  <p className="font-medium">
                    {new Date(file.uploadedAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Anonymized</p>
                  <p className="font-medium">
                    {file.anonymizedAt ? new Date(file.anonymizedAt).toLocaleString() : 'Not yet'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Access */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Access
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                This file is available to approved researchers. Download and preview use the locally
                stored upload for this browser.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
