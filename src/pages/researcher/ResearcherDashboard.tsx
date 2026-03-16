import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  FileText, 
  Database,
  TrendingUp,
  Clock,
  ArrowRight,
  Filter
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useAdminFiles } from '@/contexts/AdminFilesContext';
import { useResearcherActivity } from '@/contexts/ResearcherActivityContext';

export default function ResearcherDashboard() {
  const { files } = useAdminFiles();
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { recordSearch } = useResearcherActivity();

  const stats = useMemo(() => {
    const total = files.length;
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    const newThisWeek = files.filter((file) => new Date(file.anonymizedAt || file.uploadedAt) >= lastWeek).length;
    const kinds = new Set(files.map((file) => file.kind));

    return [
      { label: 'Total Dataset', value: total.toString(), icon: Database, gradient: 'gradient-primary' },
      { label: 'New This Week', value: newThisWeek.toString(), icon: TrendingUp, gradient: 'gradient-success' },
      { label: 'File Types', value: kinds.size.toString(), icon: Filter, gradient: 'gradient-info' },
    ];
  }, [files]);

  const recentFiles = useMemo(
    () =>
      [...files]
        .sort((a, b) => {
          const dateA = new Date(a.anonymizedAt || a.uploadedAt).getTime();
          const dateB = new Date(b.anonymizedAt || b.uploadedAt).getTime();
          return dateB - dateA;
        })
        .slice(0, 4),
    [files]
  );

  const fileTypeSummary = useMemo(() => {
    const counts = files.reduce<Record<string, number>>((acc, file) => {
      acc[file.kind] = (acc[file.kind] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([kind, count]) => ({ kind, count }));
  }, [files]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Researcher Dashboard</h1>
        <p className="text-muted-foreground">Explore medical datasets from all admins</p>
      </div>

      {/* Search Bar */}
      <Card className="shadow-card gradient-primary">
        <CardContent className="p-8">
          <h2 className="text-2xl font-bold text-primary-foreground mb-4">
            Search the Dataset
          </h2>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search by keyword, category, or file type..."
                className="pl-12 h-12 bg-card text-foreground"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <Button
              size="lg"
              variant="secondary"
              className="h-12"
              onClick={() => {
                recordSearch(query);
                navigate(`/researcher/browse?query=${encodeURIComponent(query)}`);
              }}
            >
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <Card key={stat.label} className="shadow-card hover:shadow-card-hover transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{stat.value}</p>
                </div>
                <div className={`h-12 w-12 rounded-xl ${stat.gradient} flex items-center justify-center`}>
                  <stat.icon className="h-6 w-6 text-primary-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Files */}
        <Card className="lg:col-span-2 shadow-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recently Added</CardTitle>
              <CardDescription>Latest files in the dataset</CardDescription>
            </div>
            <Link to="/researcher/browse">
              <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentFiles.length === 0 ? (
              <div className="text-sm text-muted-foreground text-center py-8">
                No anonymized files yet.
              </div>
            ) : (
              <div className="space-y-4">
                {recentFiles.map((file) => (
                  <Link
                    key={file.id}
                    to={`/researcher/file/${file.id}`}
                    className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg gradient-primary flex items-center justify-center">
                        <FileText className="h-5 w-5 text-primary-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{file.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">{file.kind}</Badge>
                          <Badge variant="secondary" className="text-xs">Anonymized</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {new Date(file.anonymizedAt || file.uploadedAt).toLocaleDateString()}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* File Types */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>File Types</CardTitle>
            <CardDescription>Current dataset breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            {fileTypeSummary.length === 0 ? (
              <div className="text-sm text-muted-foreground text-center py-6">
                No files to summarize yet.
              </div>
            ) : (
              <div className="space-y-3">
                {fileTypeSummary.map((entry) => (
                  <Link
                    key={entry.kind}
                    to={`/researcher/browse?type=${entry.kind}`}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                  >
                    <span className="font-medium text-foreground">{entry.kind}</span>
                    <Badge variant="secondary">{entry.count}</Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
