
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserCircle, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function ProfileSetupPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    base44.auth.me().then(currentUser => {
      setUser(currentUser);
      // If profile already completed, redirect to polls
      if (currentUser.profile_completed) {
        navigate(createPageUrl("Polls"));
      }
      setLoading(false);
    }).catch(() => {
      navigate(createPageUrl("Polls"));
    });
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!age || !gender) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await base44.auth.updateMe({
        age: parseInt(age),
        gender,
        profile_completed: true
      });
      
      navigate(createPageUrl("Polls"));
    } catch (error) {
      console.error("Error updating profile:", error);
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-200 to-violet-200 rounded-2xl mx-auto mb-4" />
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-50 to-violet-50 rounded-full mb-4 border border-indigo-100">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span className="text-sm font-medium text-indigo-900">Welcome to SYT</span>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-3">
            Complete Your Profile
          </h1>
          <p className="text-lg text-slate-600">
            Tell us a bit about yourself to get started
          </p>
        </div>

        <Card className="border-slate-200/60 bg-white/80 backdrop-blur-sm shadow-2xl">
          <CardHeader className="text-center pb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/30">
              <UserCircle className="w-12 h-12 text-white" />
            </div>
            <CardTitle className="text-2xl text-slate-900">Profile Information</CardTitle>
            <p className="text-sm text-slate-600 mt-2">
              Signed in as <span className="font-medium">{user?.email}</span>
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Full Name (readonly, from auth) */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-base font-semibold text-slate-900">
                  Full Name
                </Label>
                <Input
                  id="name"
                  value={user?.full_name || ""}
                  disabled
                  className="h-12 border-slate-200 rounded-xl bg-slate-50"
                />
              </div>

              {/* Age */}
              <div className="space-y-2">
                <Label htmlFor="age" className="text-base font-semibold text-slate-900">
                  Age *
                </Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="Enter your age"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  required
                  min="13"
                  max="120"
                  className="h-12 border-slate-200 rounded-xl"
                />
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <Label htmlFor="gender" className="text-base font-semibold text-slate-900">
                  Gender *
                </Label>
                <Select value={gender} onValueChange={setGender} required>
                  <SelectTrigger className="h-12 border-slate-200 rounded-xl">
                    <SelectValue placeholder="Select your gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Email (readonly, from auth) */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-base font-semibold text-slate-900">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="h-12 border-slate-200 rounded-xl bg-slate-50"
                />
                <p className="text-xs text-slate-500">
                  Your email is verified and managed by the platform
                </p>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting || !age || !gender}
                className="w-full bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white shadow-lg shadow-indigo-500/30 h-14 text-base font-semibold rounded-xl"
              >
                {isSubmitting ? "Saving..." : "Complete Profile & Continue"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-slate-500 mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </motion.div>
    </div>
  );
}
