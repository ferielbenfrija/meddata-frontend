import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { AdminFile, useAdminFiles } from '@/contexts/AdminFilesContext';
import { useEffect } from 'react';

interface AdminFilePreviewDialogProps {
  file: AdminFile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatTimestamp = (iso: string) => new Date(iso).toLocaleString();

export default function AdminFilePreviewDialog({ file, open, onOpenChange }: AdminFilePreviewDialogProps) {
  const { ensurePreviewUrl, files } = useAdminFiles();
  const currentFile = file ? files.find((item) => item.id === file.id) ?? file : null;

  useEffect(() => {
    if (!currentFile || currentFile.previewUrl) return;
    ensurePreviewUrl(currentFile.id);
  }, [ensurePreviewUrl, currentFile]);

  if (!currentFile) return null;

  const textPreview = currentFile.textPreview || '';
  const truncated = textPreview.length > 5000;
  const displayText = truncated ? textPreview.slice(0, 5000) + '\n\n... (truncated)' : textPreview;
  const canShowPdf = currentFile.previewUrl && currentFile.kind === 'PDF';
  const canShowImage = currentFile.previewUrl && currentFile.kind === 'Image';
  const canShowVideo = currentFile.previewUrl && currentFile.kind === 'Video';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>File Preview</DialogTitle>
          <DialogDescription>
            {currentFile.name}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap gap-2 text-sm">
          <Badge variant="outline">{currentFile.kind}</Badge>
          <Badge variant="secondary">{formatFileSize(currentFile.size)}</Badge>
          <Badge variant={currentFile.status === 'anonymized' ? 'default' : 'secondary'}>
            {currentFile.status === 'anonymized' ? 'Anonymized' : 'Pending'}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm mt-4">
          <div className="rounded-lg border p-3">
            <p className="text-muted-foreground">Uploaded</p>
            <p className="font-medium">{formatTimestamp(currentFile.uploadedAt)}</p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-muted-foreground">Anonymized</p>
            <p className="font-medium">
              {currentFile.anonymizedAt ? formatTimestamp(currentFile.anonymizedAt) : 'Not yet'}
            </p>
          </div>
        </div>

        {textPreview ? (
          <div className="mt-6">
            <p className="text-sm font-medium mb-2">Text Preview</p>
            <pre className="text-xs whitespace-pre-wrap rounded-lg bg-muted/40 p-4 max-h-80 overflow-y-auto">
{displayText}
            </pre>
          </div>
        ) : canShowPdf ? (
          <div className="mt-6">
            <p className="text-sm font-medium mb-2">PDF Preview</p>
            <iframe
              title={`Preview of ${currentFile.name}`}
              src={currentFile.previewUrl}
              className="w-full h-[480px] rounded-lg border"
            />
          </div>
        ) : canShowImage ? (
          <div className="mt-6">
            <p className="text-sm font-medium mb-2">Image Preview</p>
            <img
              src={currentFile.previewUrl as string}
              alt={currentFile.name}
              className="max-h-[480px] w-full object-contain rounded-lg border bg-muted/40"
            />
          </div>
        ) : canShowVideo ? (
          <div className="mt-6">
            <p className="text-sm font-medium mb-2">Video Preview</p>
            <video
              src={currentFile.previewUrl as string}
              controls
              className="w-full max-h-[480px] rounded-lg border bg-black"
            />
          </div>
        ) : (
          <div className="mt-6 rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
            Preview is available for text, PDF, image, and standard video files uploaded in this session.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
