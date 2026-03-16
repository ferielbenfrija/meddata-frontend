import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Search, 
  MoreHorizontal,
  Eye,
  Download,
  Trash2,
  Filter,
  FileText,
  FileSpreadsheet,
  File,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AdminFile, useAdminFiles } from '@/contexts/AdminFilesContext';
import AdminFilePreviewDialog from '@/components/admin/AdminFilePreviewDialog';

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export default function ManageFiles() {
  const { files, removeFile, ensurePreviewUrl } = useAdminFiles();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [previewFile, setPreviewFile] = useState<AdminFile | null>(null);
  const { toast } = useToast();
  const itemsPerPage = 6;

  const anonymizedFiles = useMemo(
    () => files.filter((file) => file.status === 'anonymized'),
    [files]
  );

  const filteredFiles = useMemo(() => {
    return anonymizedFiles.filter((file) => {
      const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = typeFilter === 'all' || file.kind === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [anonymizedFiles, searchQuery, typeFilter]);

  const totalPages = Math.ceil(filteredFiles.length / itemsPerPage) || 1;
  const paginatedFiles = filteredFiles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getFileIcon = (kind: string) => {
    switch (kind) {
      case 'PDF': return <FileText className="h-4 w-4 text-destructive" />;
      case 'Excel': return <FileSpreadsheet className="h-4 w-4 text-success" />;
      case 'Word': return <File className="h-4 w-4 text-primary" />;
      default: return <FileText className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const handleDownload = async (file: AdminFile) => {
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
  };

  const handleDelete = (file: AdminFile) => {
    removeFile(file.id);
    toast({
      title: 'File deleted',
      description: `${file.name} has been removed.`,
      variant: 'destructive',
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Manage Files</h1>
        <p className="text-muted-foreground">View and manage anonymized documents</p>
      </div>

      <Card className="shadow-card">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={(value) => {
              setTypeFilter(value);
              setCurrentPage(1);
            }}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="File type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="PDF">PDF</SelectItem>
                <SelectItem value="Word">Word</SelectItem>
                <SelectItem value="Excel">Excel</SelectItem>
                <SelectItem value="Text">Text</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Anonymized Files</CardTitle>
          <CardDescription>{filteredFiles.length} files found</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredFiles.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-8">
              No anonymized files yet.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead>Anonymized</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedFiles.map((file) => (
                  <TableRow key={file.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
                          {getFileIcon(file.kind)}
                        </div>
                        <span className="font-medium">{file.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{file.kind}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(file.uploadedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {file.anonymizedAt ? new Date(file.anonymizedAt).toLocaleDateString() : '-'}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatFileSize(file.size)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setPreviewFile(file)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Preview
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDownload(file)}>
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDelete(file)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                {Math.min(currentPage * itemsPerPage, filteredFiles.length)} of{' '}
                {filteredFiles.length} files
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <AdminFilePreviewDialog
        file={previewFile}
        open={!!previewFile}
        onOpenChange={(open) => !open && setPreviewFile(null)}
      />
    </div>
  );
}
