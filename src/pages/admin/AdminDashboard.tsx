import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Shield,
  Clock,
  Upload,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { getFiles } from "@/lib/api";

interface FileEntity {
  id: number;
  originalName: string;
  status: string;
  size: number;
  uploadedAt: string;
}

export default function AdminDashboard() {
  const [files, setFiles] = useState<FileEntity[]>([]);
  const [loading, setLoading] = useState(true);

  // =========================
  // LOAD FILES FROM BACKEND
  // =========================
  useEffect(() => {
    const loadFiles = async () => {
      try {
        const data = await getFiles();
        setFiles(data);
      } catch (error) {
        console.error("Error loading files:", error);
      } finally {
        setLoading(false);
      }
    };

    loadFiles();
  }, []);

  // =========================
  // STATS (REAL DATA)
  // =========================
  const stats = useMemo(() => {
    const total = files.length;
    const anonymized = files.filter(
      (file) => file.status === "ANONYMIZED"
    ).length;
    const pending = files.filter(
      (file) => file.status === "PENDING"
    ).length;

    const storageBytes = files.reduce((sum, file) => sum + file.size, 0);
    const storageMb = storageBytes / (1024 * 1024);

    const storageDisplay =
      storageMb >= 1
        ? `${storageMb.toFixed(1)} MB`
        : `${(storageBytes / 1024).toFixed(1)} KB`;

    return [
      {
        label: "Total Files",
        value: total.toString(),
        change: "Live",
        icon: FileText,
        gradient: "gradient-primary",
      },
      {
        label: "Pending Review",
        value: pending.toString(),
        change: "Awaiting action",
        icon: Clock,
        gradient: "gradient-warning",
      },
      {
        label: "Anonymized",
        value: anonymized.toString(),
        change: "Ready for use",
        icon: Shield,
        gradient: "gradient-success",
      },
      {
        label: "Storage Used",
        value: storageDisplay,
        change: "Current total",
        icon: TrendingUp,
        gradient: "gradient-secondary",
      },
    ];
  }, [files]);

  // =========================
  // RECENT ACTIVITY (BASED ON FILES)
  // =========================
  const recentActivity = useMemo(() => {
    return files.slice(0, 6).map((file) => ({
      id: file.id,
      action:
        file.status === "ANONYMIZED"
          ? "File anonymized"
          : "File uploaded",
      file: file.originalName,
      status: "complete" as const,
      time: new Date(file.uploadedAt).toLocaleString(),
    }));
  }, [files]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage and anonymize medical documents
          </p>
        </div>

        <div className="flex gap-3">
          <Link to="/admin/upload">
            <Button className="gradient-primary text-primary-foreground">
              <Upload className="mr-2 h-4 w-4" />
              Upload Files
            </Button>
          </Link>

          <Link to="/admin/anonymize">
            <Button variant="outline">
              <Shield className="mr-2 h-4 w-4" />
              Anonymize
            </Button>
          </Link>
        </div>
      </div>

      {/* ========================= */}
      {/* STATS GRID */}
      {/* ========================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card
            key={stat.label}
            className="shadow-card hover:shadow-card-hover transition-shadow"
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {stat.label}
                  </p>
                  <p className="text-3xl font-bold text-foreground mt-1">
                    {stat.value}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {stat.change}
                  </p>
                </div>

                <div
                  className={`h-12 w-12 rounded-xl ${stat.gradient} flex items-center justify-center`}
                >
                  <stat.icon className="h-6 w-6 text-primary-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ========================= */}
      {/* RECENT ACTIVITY */}
      {/* ========================= */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-card">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest file operations
            </CardDescription>
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : recentActivity.length === 0 ? (
              <div className="text-sm text-muted-foreground text-center py-8">
                No activity yet. Upload a file to get started.
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg flex items-center justify-center gradient-success">
                        <CheckCircle className="h-5 w-5 text-primary-foreground" />
                      </div>

                      <div>
                        <p className="font-medium text-foreground">
                          {activity.action}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {activity.file}
                        </p>
                      </div>
                    </div>

                    <span className="text-sm text-muted-foreground">
                      {activity.time}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ========================= */}
        {/* QUICK ACTIONS */}
        {/* ========================= */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-3">
            <Link to="/admin/upload" className="block">
              <Button variant="outline" className="w-full justify-between">
                Upload New Files
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>

            <Link to="/admin/files" className="block">
              <Button variant="outline" className="w-full justify-between">
                Manage All Files
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
