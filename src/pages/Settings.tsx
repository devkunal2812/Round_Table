import { useState } from "react";
import { Bell, User, Shield, Palette, Globe, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useTheme } from "next-themes";

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    desktop: true,
    marketing: false
  });

  const [profile, setProfile] = useState({
    name: "Captain",
    email: "captain@dot.com",
    role: "Product Manager"
  });

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">Appearance</span>
          </TabsTrigger>
          <TabsTrigger value="language" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <span className="hidden sm:inline">Language</span>
          </TabsTrigger>
          <TabsTrigger value="help" className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Help</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card className="bg-gradient-card shadow-card border-border/50">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="h-20 w-20 bg-gradient-primary">
                  <AvatarFallback className="bg-transparent text-white text-2xl">
                    😎
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Button variant="outline" className="mb-2">Change Avatar</Button>
                  <p className="text-sm text-muted-foreground">JPG, GIF or PNG. 1MB max.</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Input
                  id="role"
                  value={profile.role}
                  onChange={(e) => setProfile(prev => ({ ...prev, role: e.target.value }))}
                />
              </div>

              <Button className="bg-gradient-primary text-white">Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="bg-gradient-card shadow-card border-border/50">
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive email updates about your tasks and projects</p>
                  </div>
                  <Switch
                    checked={notifications.email}
                    onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, email: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">Get push notifications on your mobile device</p>
                  </div>
                  <Switch
                    checked={notifications.push}
                    onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, push: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Desktop Notifications</Label>
                    <p className="text-sm text-muted-foreground">Show notifications on your desktop</p>
                  </div>
                  <Switch
                    checked={notifications.desktop}
                    onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, desktop: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Marketing Emails</Label>
                    <p className="text-sm text-muted-foreground">Receive emails about new features and updates</p>
                  </div>
                  <Switch
                    checked={notifications.marketing}
                    onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, marketing: checked }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card className="bg-gradient-card shadow-card border-border/50">
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-base">Change Password</Label>
                  <p className="text-sm text-muted-foreground mb-3">Update your password to keep your account secure</p>
                  <Button variant="outline">Change Password</Button>
                </div>

                <div>
                  <Label className="text-base">Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground mb-3">Add an extra layer of security to your account</p>
                  <Button variant="outline">Enable 2FA</Button>
                </div>

                <div>
                  <Label className="text-base">Active Sessions</Label>
                  <p className="text-sm text-muted-foreground mb-3">Manage your active sessions across devices</p>
                  <Button variant="outline">View Sessions</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card className="bg-gradient-card shadow-card border-border/50">
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-base">Theme</Label>
                  <p className="text-sm text-muted-foreground mb-3">Choose your preferred theme</p>
                  <div className="grid grid-cols-3 gap-3">
                    <Button
                      variant={theme === "light" ? "default" : "outline"}
                      className="h-20 flex flex-col items-center gap-2"
                      onClick={() => setTheme("light")}
                    >
                      🌞
                      <span className="text-xs">Light</span>
                    </Button>
                    <Button
                      variant={theme === "dark" ? "default" : "outline"}
                      className="h-20 flex flex-col items-center gap-2"
                      onClick={() => setTheme("dark")}
                    >
                      🌙
                      <span className="text-xs">Dark</span>
                    </Button>
                    <Button
                      variant={theme === "system" ? "default" : "outline"}
                      className="h-20 flex flex-col items-center gap-2"
                      onClick={() => setTheme("system")}
                    >
                      ⚡
                      <span className="text-xs">Auto</span>
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="text-base">Color Scheme</Label>
                  <p className="text-sm text-muted-foreground mb-3">Customize your color preferences</p>
                  <div className="flex gap-2">
                    <div className="w-8 h-8 rounded-full bg-dot-purple border-2 border-primary"></div>
                    <div className="w-8 h-8 rounded-full bg-dot-blue border-2 border-transparent"></div>
                    <div className="w-8 h-8 rounded-full bg-dot-green border-2 border-transparent"></div>
                    <div className="w-8 h-8 rounded-full bg-dot-orange border-2 border-transparent"></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="language">
          <Card className="bg-gradient-card shadow-card border-border/50">
            <CardHeader>
              <CardTitle>Language & Region</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-base">Language</Label>
                  <p className="text-sm text-muted-foreground mb-3">Choose your preferred language</p>
                  <Button variant="outline" className="w-full justify-start">
                    🇺🇸 English (US)
                  </Button>
                </div>

                <div>
                  <Label className="text-base">Time Zone</Label>
                  <p className="text-sm text-muted-foreground mb-3">Set your local time zone</p>
                  <Button variant="outline" className="w-full justify-start">
                    🌍 UTC+0 (GMT)
                  </Button>
                </div>

                <div>
                  <Label className="text-base">Date Format</Label>
                  <p className="text-sm text-muted-foreground mb-3">Choose how dates are displayed</p>
                  <Button variant="outline" className="w-full justify-start">
                    MM/DD/YYYY
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="help">
          <Card className="bg-gradient-card shadow-card border-border/50">
            <CardHeader>
              <CardTitle>Help & Support</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Button variant="outline" className="w-full justify-start">
                  📚 Documentation
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  💬 Contact Support
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  🐛 Report a Bug
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  💡 Feature Request
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  📖 Keyboard Shortcuts
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  ℹ️ About .dot
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}