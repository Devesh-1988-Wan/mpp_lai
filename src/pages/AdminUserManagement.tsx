import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Users, UserPlus, Edit, Shield, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRoles } from '@/hooks/useRoles';

interface UserProfile {
  id: string;
  email: string;
  display_name?: string;
  created_at: string;
  roles: string[];
}

export const AdminUserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('user');
  const { user } = useAuth();
  const { canManageUsers } = useRoles();
  const { toast } = useToast();

  // Check if user has permission to manage users
  if (!canManageUsers()) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Access Denied</h1>
          <p className="text-muted-foreground">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  const fetchUsers = async () => {
    try {
      // Fetch profiles with user roles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          display_name,
          created_at
        `)
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch user roles
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Combine data
      const usersWithRoles = profiles?.map(profile => {
        const roles = userRoles
          ?.filter(role => role.user_id === profile.id)
          ?.map(role => role.role) || [];
        
        return {
          ...profile,
          roles
        };
      }) || [];

      setUsers(usersWithRoles);
    } catch (error: any) {
      toast({
        title: "Error fetching users",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const assignRole = async () => {
    if (!selectedUser || !selectedRole) return;

    try {
      const { error } = await supabase
        .from('user_roles')
        .insert([{
          user_id: selectedUser,
          role: selectedRole as any // Type assertion to bypass strict typing
        }]);

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast({
            title: "Role already assigned",
            description: "This user already has this role.",
            variant: "destructive",
          });
          return;
        }
        throw error;
      }

      toast({
        title: "Role assigned",
        description: `Successfully assigned ${selectedRole} role.`,
      });

      await fetchUsers();
      setSelectedUser('');
      setSelectedRole('user');
    } catch (error: any) {
      toast({
        title: "Error assigning role",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const removeRole = async (userId: string, roleToRemove: string) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', roleToRemove as any); // Type assertion to bypass strict typing

      if (error) throw error;

      toast({
        title: "Role removed",
        description: `Successfully removed ${roleToRemove} role.`,
      });

      await fetchUsers();
    } catch (error: any) {
      toast({
        title: "Error removing role",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'super_admin':
        return <ShieldCheck className="h-3 w-3" />;
      case 'admin':
        return <Shield className="h-3 w-3" />;
      case 'moderator':
        return <Edit className="h-3 w-3" />;
      default:
        return <Users className="h-3 w-3" />;
    }
  };

  const getRoleVariant = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'destructive' as const;
      case 'admin':
        return 'default' as const;
      case 'moderator':
        return 'secondary' as const;
      default:
        return 'outline' as const;
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">Manage user roles and permissions</p>
        </div>
        <Button onClick={() => window.location.href = '/'} variant="outline">
          Back to Home
        </Button>
      </div>

      {/* Role Assignment Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Assign Role
          </CardTitle>
          <CardDescription>
            Assign roles to users for different access levels
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="user-select">Select User</Label>
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a user" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((userProfile) => (
                    <SelectItem key={userProfile.id} value={userProfile.id}>
                      {userProfile.display_name || userProfile.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role-select">Select Role</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="moderator">Moderator</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button onClick={assignRole} disabled={!selectedUser || !selectedRole}>
                Assign Role
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            All Users ({users.length})
          </CardTitle>
          <CardDescription>
            View and manage all users in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map((userProfile) => (
              <div key={userProfile.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <div className="font-medium">
                    {userProfile.display_name || userProfile.email}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {userProfile.email}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Joined: {new Date(userProfile.created_at).toLocaleDateString()}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="flex flex-wrap gap-1">
                    {userProfile.roles.length > 0 ? (
                      userProfile.roles.map((role) => (
                        <Badge 
                          key={role} 
                          variant={getRoleVariant(role)}
                          className="flex items-center gap-1"
                        >
                          {getRoleIcon(role)}
                          {role.replace('_', ' ')}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 p-0 ml-1 hover:bg-destructive hover:text-destructive-foreground"
                            onClick={() => removeRole(userProfile.id, role)}
                          >
                            ×
                          </Button>
                        </Badge>
                      ))
                    ) : (
                      <Badge variant="outline">No roles assigned</Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {users.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No users found.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Alert>
        <AlertDescription>
          <strong>Role Descriptions:</strong><br />
          • <strong>User:</strong> Basic access to assigned projects<br />
          • <strong>Moderator:</strong> View access to assigned projects<br />
          • <strong>Admin:</strong> Full access to all projects and can manage users<br />
          • <strong>Super Admin:</strong> Complete system access and user management
        </AlertDescription>
      </Alert>
    </div>
  );
};