import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useResearcherActivity } from '@/contexts/ResearcherActivityContext';
import { User, Lock, Mail, Calendar, Loader2 } from 'lucide-react';

export default function ResearcherProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { stats } = useResearcherActivity();
  const [isUpdating, setIsUpdating] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    institution: 'Harvard Medical School',
    department: 'Cardiology Research',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const initials = user?.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';

  const joinedDate = user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—';

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast({
      title: 'Profile updated',
      description: 'Your profile information has been saved.',
    });
    setIsUpdating(false);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: 'Passwords do not match',
        description: 'Please make sure your passwords match.',
        variant: 'destructive',
      });
      return;
    }

    setIsUpdating(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast({
      title: 'Password changed',
      description: 'Your password has been updated successfully.',
    });
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setIsUpdating(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
        <p className="text-muted-foreground">Manage your researcher account</p>
      </div>

      {/* Profile Card */}
      <Card className="shadow-card">
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="gradient-primary text-primary-foreground text-2xl">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-bold text-foreground">{user?.name}</h2>
              <p className="text-muted-foreground">{user?.email}</p>
              <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Joined {joinedDate}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Information */}
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg gradient-primary flex items-center justify-center">
              <User className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your account details</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={profileData.name}
                  onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="institution">Institution</Label>
                <Input
                  id="institution"
                  value={profileData.institution}
                  onChange={(e) => setProfileData(prev => ({ ...prev, institution: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  value={profileData.department}
                  onChange={(e) => setProfileData(prev => ({ ...prev, department: e.target.value }))}
                />
              </div>
            </div>
            <Button 
              type="submit" 
              className="gradient-primary text-primary-foreground"
              disabled={isUpdating}
            >
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Password Settings */}
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg gradient-warning flex items-center justify-center">
              <Lock className="h-5 w-5 text-warning-foreground" />
            </div>
            <div>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your security credentials</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
              />
            </div>
            <Separator />
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                />
              </div>
            </div>
            <Button 
              type="submit" 
              variant="outline"
              disabled={isUpdating || !passwordData.currentPassword || !passwordData.newPassword}
            >
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Change Password'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Activity Stats */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Activity Statistics</CardTitle>
          <CardDescription>Your platform usage summary</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold text-foreground">{stats.filesViewed}</p>
              <p className="text-sm text-muted-foreground">Files Viewed</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold text-foreground">{stats.downloads}</p>
              <p className="text-sm text-muted-foreground">Downloads</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold text-foreground">{stats.savedSearches}</p>
              <p className="text-sm text-muted-foreground">Saved Searches</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
