import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Mail, Shield, Smartphone } from 'lucide-react';

export default function Profile() {
    const { user } = useAuth();
    const initials = user?.email?.charAt(0).toUpperCase() || 'U';

    return (
        <DashboardLayout title="My Profile">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Profile Header */}
                <div className="flex flex-col md:flex-row items-center gap-6 p-6 bg-card rounded-xl border border-border shadow-sm">
                    <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                        <AvatarImage src="" />
                        <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                    <div className="text-center md:text-left space-y-2">
                        <h2 className="text-2xl font-bold">{user?.email?.split('@')[0]}</h2>
                        <p className="text-muted-foreground">{user?.email}</p>
                        <div className="flex items-center gap-2 justify-center md:justify-start">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                                Free Plan
                            </span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-600">
                                Active
                            </span>
                        </div>
                    </div>
                    <div className="md:ml-auto">
                        <Button>Edit Profile</Button>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Personal Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5 text-primary" />
                                Personal Information
                            </CardTitle>
                            <CardDescription>Update your personal details here.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        value={user?.email || ''}
                                        disabled
                                        className="pl-9 bg-muted"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <div className="relative">
                                    <Smartphone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="phone"
                                        placeholder="+1 (555) 000-0000"
                                        className="pl-9"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Security */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5 text-primary" />
                                Security
                            </CardTitle>
                            <CardDescription>Manage your password and security settings.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Password</Label>
                                <Input type="password" value="********" disabled className="bg-muted" />
                            </div>
                            <Button variant="outline" className="w-full">
                                Change Password
                            </Button>
                            <div className="pt-4 border-t">
                                <p className="text-sm text-muted-foreground mb-4">
                                    Secure your account with 2FA.
                                </p>
                                <Button variant="secondary" className="w-full">
                                    Enable Two-Factor Auth
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
