
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Hash, Sparkles, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function JoinPollPage() {
  const navigate = useNavigate();
  const [shareCode, setShareCode] = useState("");
  const [error, setError] = useState("");
  const [searching, setSearching] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    base44.auth.me().then(currentUser => {
      setIsDarkMode(currentUser.dark_mode || false);
    }).catch(() => {});
  }, []);

  const { data: polls = [] } = useQuery({
    queryKey: ['polls'],
    queryFn: () => base44.entities.Poll.list(),
    initialData: [],
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setSearching(true);

    const code = shareCode.trim().toUpperCase();
    
    if (code.length !== 4) {
      setError("Please enter a valid 4-character code");
      setSearching(false);
      return;
    }

    const poll = polls.find(p => p.share_code === code);

    if (poll) {
      navigate(createPageUrl(`PollDetails?id=${poll.id}`));
    } else {
      setError("Poll not found. Please check the code and try again.");
      setSearching(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value.toUpperCase().slice(0, 4);
    setShareCode(value);
    setError("");
  };

  return (
    <div className={`min-h-screen p-6 ${isDarkMode ? 'bg-black' : 'bg-gradient-to-br from-slate-50 via-white to-indigo-50'}`}>
      <div className="max-w-2xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate(createPageUrl("Polls"))}
          className="mb-6 hover:bg-slate-100 rounded-xl"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Polls
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-50 to-violet-50 rounded-full mb-4 border border-indigo-100">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span className="text-sm font-medium text-indigo-900">Join with Code</span>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-3">
            Enter Poll Code
          </h1>
          <p className="text-lg text-slate-600">
            Have a poll code? Enter it below to join and vote
          </p>
        </motion.div>

        <Card className="border-slate-200/60 bg-white/80 backdrop-blur-sm shadow-2xl">
          <CardHeader className="text-center pb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/30">
              <Hash className="w-10 h-10 text-white" />
            </div>
            <CardTitle className="text-2xl text-slate-900">Join a Poll</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="shareCode" className="text-base font-semibold text-slate-900">
                  4-Character Poll Code
                </Label>
                <Input
                  id="shareCode"
                  placeholder="ABCD"
                  value={shareCode}
                  onChange={handleInputChange}
                  required
                  maxLength={4}
                  className="h-16 text-center text-3xl font-bold tracking-widest border-slate-200 rounded-xl font-mono uppercase"
                  autoComplete="off"
                />
                <p className="text-sm text-slate-500 text-center">
                  Enter the 4-character code shared with you
                </p>
              </div>

              {error && (
                <Alert variant="destructive" className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                disabled={shareCode.length !== 4 || searching}
                className="w-full bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white shadow-lg shadow-indigo-500/30 h-14 text-base font-semibold rounded-xl"
              >
                {searching ? "Searching..." : "Join Poll"}
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-200">
              <p className="text-center text-sm text-slate-600 mb-4">
                Don't have a code?
              </p>
              <Button
                variant="outline"
                onClick={() => navigate(createPageUrl("Polls"))}
                className="w-full h-12 border-slate-200 rounded-xl hover:bg-slate-50"
              >
                Browse All Polls
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
