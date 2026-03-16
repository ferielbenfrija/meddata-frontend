import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  uploadFile,
  getFiles,
  anonymizeFile,
  downloadOriginal,
  downloadAnonymized,
} from "@/lib/api";
import { Upload, CheckCircle, Shield } from "lucide-react";

interface BackendFile {
  id: number;
  originalName: string;
  size: number;
  status: string; // "PENDING" | "ANONYMIZED" ...
}

export default function UploadFiles() {
  const [files, setFiles] = useState<BackendFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // =========================
  // Load files from backend
  // =========================
  const loadFiles = async () => {
    try {
      const data = await getFiles();
      setFiles(data);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error loading files",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadFiles();
  }, []);

  // =========================
  // File size formatter
  // =========================
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  // =========================
  // Upload files
  // =========================
  const handleFiles = async (fileList: FileList) => {
    setLoading(true);
    try {
      for (const file of Array.from(fileList)) {
        await uploadFile(file);
      }

      toast({
        title: "Upload successful",
        description: "Files uploaded to server",
      });

      await loadFiles();
    } catch (error) {
      console.error(error);
      toast({
        title: "Upload failed",
        description: "Server error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // Drag & Drop
  // =========================
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  // =========================
  // Anonymize
  // =========================
  const handleAnonymize = async (id: number) => {
    try {
      await anonymizeFile(id);
      toast({ title: "File anonymized" });
      await loadFiles();
    } catch (error) {
      console.error(error);
      toast({
        title: "Anonymization failed",
        variant: "destructive",
      });
    }
  };

  // =========================
  // Download handlers
  // =========================
  const handleDownloadOriginal = (id: number) => {
    downloadOriginal(id);
  };

  const handleDownloadAnonymized = (id: number) => {
    downloadAnonymized(id);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Upload Files</h1>
        <p className="text-muted-foreground">Upload medical documents to the server</p>
      </div>

      {/* Upload Zone */}
      <Card>
        <CardContent>
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`border-2 border-dashed rounded-xl p-12 text-center transition ${
              isDragging ? "border-primary bg-primary/5" : "border-border"
            }`}
          >
            <Upload className="h-8 w-8 mx-auto mb-4" />
            <p className="font-medium">{isDragging ? "Drop files here" : "Drag & Drop files here"}</p>

            <input
              type="file"
              multiple
              className="hidden"
              id="file-input"
              onChange={(e) => e.target.files && handleFiles(e.target.files)}
            />

            <label htmlFor="file-input">
              <Button asChild className="mt-4 cursor-pointer" disabled={loading}>
                <span>{loading ? "Uploading..." : "Browse Files"}</span>
              </Button>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* File List */}
      {files.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Uploaded Files</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between gap-4 p-4 bg-muted/50 rounded-lg"
                >
                  <div className="min-w-0">
                    <p className="font-medium truncate">{file.originalName}</p>
                    <p className="text-sm text-muted-foreground">{formatFileSize(file.size)}</p>
                    <p className="text-xs mt-1">{file.status}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Download original - always available */}
                    <Button size="sm" variant="outline" onClick={() => handleDownloadOriginal(file.id)}>
                      Download
                    </Button>

                    {/* Download anonymized - only if anonymized */}
                    {file.status === "ANONYMIZED" && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleDownloadAnonymized(file.id)}
                      >
                        Download Anonymized
                      </Button>
                    )}

                    {/* Anonymize or check icon */}
                    {file.status === "ANONYMIZED" ? (
                      <CheckCircle className="text-green-600" />
                    ) : (
                      <Button size="sm" onClick={() => handleAnonymize(file.id)}>
                        <Shield className="h-4 w-4 mr-1" />
                        Anonymize
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
