
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Settings as SettingsIcon, Sparkles, Palette, Bell, User, Mail, Shield, Save } from "lucide-react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const themeColors = {
  indigo: { from: "from-indigo-500", to: "to-violet-600", bg: "bg-indigo-500", label: "Indigo" },
  violet: { from: "from-violet-500", to: "to-purple-600", bg: "bg-violet-500", label: "Violet" },
  blue: { from: "from-blue-500", to: "to-cyan-600", bg: "bg-blue-500", label: "Blue" },
  emerald: { from: "from-emerald-500", to: "to-teal-600", bg: "bg-emerald-500", label: "Emerald" },
  rose: { from: "from-rose-500", to: "to-pink-600", bg: "bg-rose-500", label: "Rose" },
  amber: { from: "from-amber-500", to: "to-orange-600", bg: "bg-amber-500", label: "Amber" },
  slate: { from: "from-slate-600", to: "to-gray-700", bg: "bg-slate-600", label: "Slate" }
};

const backgroundStyles = {
  gradient: { label: "Gradient", description: "Colorful gradient background" },
  solid: { label: "Solid", description: "Clean solid color" },
  minimal: { label: "Minimal", description: "Simple white background" }
};

export default function SettingsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Settings state
  const [themeColor, setThemeColor] = useState("indigo");
  const [backgroundStyle, setBackgroundStyle] = useState("gradient");
  const [darkMode, setDarkMode] = useState(false);
  const [showVoterCount, setShowVoterCount] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState("");

  useEffect(() => {
    base44.auth.me().then(currentUser => {
      setUser(currentUser);
      setThemeColor(currentUser.theme_color || "indigo");
      setBackgroundStyle(currentUser.background_style || "gradient");
      setDarkMode(currentUser.dark_mode || false);
      setShowVoterCount(currentUser.show_voter_count !== undefined ? currentUser.show_voter_count : true);
      setEmailNotifications(currentUser.email_notifications !== undefined ? currentUser.email_notifications : true);
      setPhoneNumber(currentUser.phone_number || "");
      setLoading(false);
    }).catch(() => {
      navigate(createPageUrl("Polls"));
    });
  }, [navigate]);

  const updateSettingsMutation = useMutation({
    mutationFn: (data) => base44.auth.updateMe(data),
    onSuccess: (updatedUser) => {
      setUser(updatedUser);
      queryClient.invalidateQueries({ queryKey: ['user'] });
      // Reload page to apply dark mode changes
      window.location.reload();
    },
  });

  const handleSaveSettings = () => {
    updateSettingsMutation.mutate({
      theme_color: themeColor,
      background_style: backgroundStyle,
      dark_mode: darkMode,
      show_voter_count: showVoterCount,
      email_notifications: emailNotifications,
      phone_number: phoneNumber,
    });
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        darkMode ? 'bg-black' : 'bg-gradient-to-br from-slate-50 via-white to-indigo-50'
      }`}>
        <div className="animate-pulse text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-200 to-violet-200 rounded-2xl mx-auto mb-4" />
          <p className={darkMode ? 'text-slate-400' : 'text-slate-600'}>Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-6 ${darkMode ? 'bg-black' : ''}`}>
      <div className="max-w-5xl mx-auto">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-50 to-violet-50 rounded-full mb-4 border border-indigo-100">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span className="text-sm font-medium text-indigo-900">Customize Your Experience</span>
          </div>
          <h1 className={`text-5xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            Settings
          </h1>
          <p className={`text-xl ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            Personalize your SYT experience
          </p>
        </motion.div>

        <Tabs defaultValue="appearance" className="space-y-6">
          <TabsList className="bg-white/80 backdrop-blur-sm border border-slate-200 h-auto p-1">
            <TabsTrigger value="appearance" className="rounded-lg px-6 py-2">
              <Palette className="w-4 h-4 mr-2" />
              Appearance
            </TabsTrigger>
            <TabsTrigger value="account" className="rounded-lg px-6 py-2">
              <User className="w-4 h-4 mr-2" />
              Account
            </TabsTrigger>
            <TabsTrigger value="preferences" className="rounded-lg px-6 py-2">
              <Bell className="w-4 h-4 mr-2" />
              Preferences
            </TabsTrigger>
          </TabsList>

          {/* Appearance Tab */}
          <TabsContent value="appearance" className="space-y-6">
            <Card className="border-slate-200/60 bg-white/80 backdrop-blur-sm shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900">
                  <Palette className="w-5 h-5 text-indigo-600" />
                  Theme & Colors
                </CardTitle>
                <p className="text-sm text-slate-600 mt-1">
                  Customize the look and feel of your interface
                </p>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Dark Mode Toggle */}
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div>
                    <Label htmlFor="darkMode" className="text-base font-semibold text-slate-900 cursor-pointer">
                      Dark Mode
                    </Label>
                    <p className="text-sm text-slate-500 mt-1">
                      Enable dark theme with black background
                    </p>
                  </div>
                  <Switch
                    id="darkMode"
                    checked={darkMode}
                    onCheckedChange={setDarkMode}
                  />
                </div>

                {/* Theme Color Selector */}
                <div className="space-y-4">
                  <Label className="text-base font-semibold text-slate-900">Theme Color</Label>
                  <p className="text-sm text-slate-600">Choose your primary theme color</p>
                  <div className="grid grid-cols-3 md:grid-cols-7 gap-4">
                    {Object.entries(themeColors).map(([key, theme]) => (
                      <button
                        key={key}
                        onClick={() => setThemeColor(key)}
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                          themeColor === key
                            ? "border-slate-900 bg-slate-50 shadow-lg"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${theme.from} ${theme.to} shadow-lg`} />
                        <span className="text-xs font-medium text-slate-900">{theme.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Background Style Selector */}
                <div className="space-y-4">
                  <Label className="text-base font-semibold text-slate-900">Background Style</Label>
                  <p className="text-sm text-slate-600">Select your preferred background appearance</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.entries(backgroundStyles).map(([key, style]) => (
                      <button
                        key={key}
                        onClick={() => setBackgroundStyle(key)}
                        className={`flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all ${
                          backgroundStyle === key
                            ? "border-slate-900 bg-slate-50 shadow-lg"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <div className={`w-full h-20 rounded-lg ${
                          key === 'gradient' ? 'bg-gradient-to-br from-indigo-100 to-violet-100' :
                          key === 'solid' ? 'bg-slate-100' :
                          'bg-white border border-slate-200'
                        }`} />
                        <div className="text-center">
                          <p className="font-semibold text-slate-900">{style.label}</p>
                          <p className="text-xs text-slate-500 mt-1">{style.description}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preview */}
                <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                  <Label className="text-sm font-semibold text-slate-900 mb-3 block">Preview</Label>
                  <div className={`p-6 rounded-xl ${
                    backgroundStyle === 'gradient' ? `bg-gradient-to-br ${themeColors[themeColor].from} ${themeColors[themeColor].to}` :
                    backgroundStyle === 'solid' ? themeColors[themeColor].bg :
                    'bg-white border border-slate-200'
                  }`}>
                    <div className="bg-white rounded-lg p-4 shadow-lg">
                      <h3 className="font-bold text-slate-900 mb-2">Sample Poll Card</h3>
                      <p className="text-sm text-slate-600 mb-3">This is how your polls will look</p>
                      <Button className={`bg-gradient-to-r ${themeColors[themeColor].from} ${themeColors[themeColor].to} text-white`}>
                        Vote Now
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Account Tab */}
          <TabsContent value="account" className="space-y-6">
            <Card className="border-slate-200/60 bg-white/80 backdrop-blur-sm shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900">
                  <Shield className="w-5 h-5 text-indigo-600" />
                  Account Information
                </CardTitle>
                <p className="text-sm text-slate-600 mt-1">
                  View and manage your account details
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-gradient-to-br from-indigo-50 to-violet-50 rounded-xl p-6 border border-indigo-200">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-full flex items-center justify-center shadow-lg">
                      <User className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{user.full_name}</h3>
                      <p className="text-sm text-slate-600">{user.email}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/60 rounded-lg p-4">
                      <p className="text-xs text-slate-600 mb-1">Age</p>
                      <p className="text-lg font-bold text-slate-900">{user.age}</p>
                    </div>
                    <div className="bg-white/60 rounded-lg p-4">
                      <p className="text-xs text-slate-600 mb-1">Gender</p>
                      <p className="text-lg font-bold text-slate-900 capitalize">{user.gender?.replace(/_/g, ' ')}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <Mail className="w-5 h-5 text-slate-500 mt-0.5" />
                    <div className="flex-1">
                      <Label className="text-base font-semibold text-slate-900">Email Address</Label>
                      <p className="text-sm text-slate-600 mt-1">{user.email}</p>
                      <Badge variant="secondary" className="mt-2 bg-green-100 text-green-700 border-green-200">
                        Verified
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <Shield className="w-5 h-5 text-slate-500 mt-0.5" />
                    <div className="flex-1 space-y-3">
                      <div>
                        <Label htmlFor="phoneNumber" className="text-base font-semibold text-slate-900">
                          Phone Number (Optional)
                        </Label>
                        <p className="text-sm text-slate-500 mt-1">
                          Add your phone number with country code for account recovery
                        </p>
                      </div>
                      <Input
                        id="phoneNumber"
                        type="tel"
                        placeholder="e.g., +1 234 567 8900, +44 20 1234 5678, +91 98765 43210"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="h-10 border-slate-200 rounded-lg"
                      />
                      <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                        <p className="text-xs text-blue-900">
                          <strong>Tip:</strong> Include your country code (e.g., +1 for USA, +44 for UK, +91 for India, +86 for China)
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                    <p className="text-sm text-blue-900">
                      <strong>Note:</strong> Your email address is managed by the authentication system and cannot be changed here. 
                      To update your profile information, visit the <button 
                        onClick={() => navigate(createPageUrl("UserProfile"))}
                        className="underline hover:text-blue-700"
                      >User Profile</button> page.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-6">
            <Card className="border-slate-200/60 bg-white/80 backdrop-blur-sm shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900">
                  <Bell className="w-5 h-5 text-indigo-600" />
                  Display & Notification Preferences
                </CardTitle>
                <p className="text-sm text-slate-600 mt-1">
                  Control what you see and how you're notified
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Display Preferences */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-slate-900">Display Options</h3>
                  
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div>
                      <Label htmlFor="showVoterCount" className="text-base font-medium text-slate-900 cursor-pointer">
                        Show Vote Count on Poll Cards
                      </Label>
                      <p className="text-sm text-slate-500 mt-1">
                        Display the number of votes on poll preview cards
                      </p>
                    </div>
                    <Switch
                      id="showVoterCount"
                      checked={showVoterCount}
                      onCheckedChange={setShowVoterCount}
                    />
                  </div>
                </div>

                {/* Notification Preferences */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-slate-900">Notifications</h3>
                  
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div>
                      <Label htmlFor="emailNotifications" className="text-base font-medium text-slate-900 cursor-pointer">
                        Email Notifications
                      </Label>
                      <p className="text-sm text-slate-500 mt-1">
                        Receive email updates about poll activity
                      </p>
                    </div>
                    <Switch
                      id="emailNotifications"
                      checked={emailNotifications}
                      onCheckedChange={setEmailNotifications}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Save Button */}
        <Card className="border-slate-200/60 bg-white/80 backdrop-blur-sm shadow-xl sticky bottom-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-900">Unsaved Changes</p>
                <p className="text-sm text-slate-600">Don't forget to save your settings</p>
              </div>
              <Button
                onClick={handleSaveSettings}
                disabled={updateSettingsMutation.isPending}
                className="bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white shadow-lg shadow-indigo-500/30 px-8"
              >
                {updateSettingsMutation.isPending ? (
                  "Saving..."
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Settings
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
