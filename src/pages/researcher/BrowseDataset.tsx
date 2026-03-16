import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, Download, Eye } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useAdminFiles } from '@/contexts/AdminFilesContext'
import { useResearcherActivity } from '@/contexts/ResearcherActivityContext'

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const isAnonymized = (status?: string) =>
  (status || '').toUpperCase() === 'ANONYMIZED'

export default function BrowseDataset() {
  const { files, ensurePreviewUrl } = useAdminFiles()
  const { toast } = useToast()
  const { recordDownload } = useResearcherActivity()

  const [searchQuery, setSearchQuery] = useState('')

  // ✅ Le chercheur voit seulement les fichiers anonymisés
  const filteredFiles = useMemo(() => {
    return files
      .filter((file) => isAnonymized(file.status))
      .filter((file) =>
        file.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
  }, [files, searchQuery])

  const handleDownload = async (file: any) => {
    if (!isAnonymized(file.status)) {
      toast({
        title: 'Not available yet',
        description: 'File is still pending anonymization.',
        variant: 'destructive',
      })
      return
    }

    const url = file.previewUrl || (await ensurePreviewUrl(file.id))

    if (!url) {
      toast({
        title: 'Download unavailable',
        variant: 'destructive',
      })
      return
    }

    const link = document.createElement('a')
    link.href = url
    link.download = file.name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    recordDownload(file.id)
  }

  return (
    <div className="space-y-6 animate-fade-in">

      <div>
        <h1 className="text-2xl font-bold">Browse Dataset</h1>
        <p className="text-muted-foreground">
          Access anonymized medical datasets
        </p>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div>
        <p className="text-sm text-muted-foreground">
          {filteredFiles.length} anonymized files found
        </p>
      </div>

      {filteredFiles.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            No anonymized files available.
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFiles.map((file) => (
            <Card key={file.id} className="hover:shadow-md transition">
              <CardHeader>
                <CardTitle className="text-base truncate">
                  {file.name}
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">ANONYMIZED</Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)}
                  </span>
                </div>

                <div className="flex gap-2">
                  <Button asChild variant="outline" size="sm" className="flex-1">
                    <Link to={`/researcher/file/${file.id}`}>
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Link>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(file)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}