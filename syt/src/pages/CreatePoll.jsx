
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, ArrowLeft, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

// Generate random 4-character code
const generateShareCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed ambiguous characters
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

export default function CreatePollPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [user, setUser] = useState(null); // New state for user
  const [isDarkMode, setIsDarkMode] = useState(false); // New state for dark mode

  const [question, setQuestion] = useState("");
  const [description, setDescription] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [category, setCategory] = useState("general");
  const [endsAt, setEndsAt] = useState("");
  const [allowMultipleVotes, setAllowMultipleVotes] = useState(false);

  // New useEffect hook to fetch user data
  useEffect(() => {
    base44.auth.me()
      .then(currentUser => {
        setUser(currentUser);
        setIsDarkMode(currentUser.dark_mode || false); // Set dark mode from user preference
      })
      .catch((error) => {
        console.error("Failed to fetch user:", error);
        // Optionally handle the error, e.g., redirect to login or show a message
      });
  }, []);

  const createPollMutation = useMutation({
    mutationFn: (pollData) => base44.entities.Poll.create(pollData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['polls'] });
      navigate(createPageUrl("Polls"));
    },
  });

  const addOption = () => {
    setOptions([...options, ""]);
  };

  const removeOption = (index) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const validOptions = options.filter(opt => opt.trim() !== "");
    
    if (question.trim() === "" || validOptions.length < 2) {
      // Basic validation for question and at least two valid options
      return;
    }

    const pollData = {
      question: question.trim(),
      description: description.trim(),
      options: validOptions,
      category,
      allow_multiple_votes: allowMultipleVotes,
      is_active: true,
      share_code: generateShareCode(),
      created_by_name: user?.full_name || user?.email || "Anonymous", // Added created_by_name
    };

    if (endsAt) {
      pollData.ends_at = new Date(endsAt).toISOString();
    }

    createPollMutation.mutate(pollData);
  };

  return (
    <div className={`min-h-screen p-6 ${isDarkMode ? 'bg-black' : 'bg-gradient-to-br from-slate-50 via-white to-indigo-50'}`}>
      <div className="max-w-3xl mx-auto">
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
          className="mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-50 to-violet-50 rounded-full mb-4 border border-indigo-100">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span className="text-sm font-medium text-indigo-900">Create New Poll</span>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-3">
            What would you like to ask?
          </h1>
          <p className="text-lg text-slate-600">
            Create a poll and share it with a 4-character code
          </p>
        </motion.div>

        <Card className="border-slate-200/60 bg-white/80 backdrop-blur-sm shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl text-slate-900">Poll Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Question */}
              <div className="space-y-2">
                <Label htmlFor="question" className="text-base font-semibold text-slate-900">
                  Question *
                </Label>
                <Input
                  id="question"
                  placeholder="What's your question?"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  required
                  className="h-12 text-base border-slate-200 rounded-xl"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-base font-semibold text-slate-900">
                  Description (Optional)
                </Label>
                <Textarea
                  id="description"
                  placeholder="Add more context to your poll..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="border-slate-200 rounded-xl resize-none"
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category" className="text-base font-semibold text-slate-900">
                  Category
                </Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="h-12 border-slate-200 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="politics">Politics</SelectItem>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="entertainment">Entertainment</SelectItem>
                    <SelectItem value="sports">Sports</SelectItem>
                    <SelectItem value="lifestyle">Lifestyle</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Options */}
              <div className="space-y-3">
                <Label className="text-base font-semibold text-slate-900">
                  Options * (minimum 2)
                </Label>
                {options.map((option, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder={`Option ${index + 1}`}
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      className="h-12 border-slate-200 rounded-xl"
                    />
                    {options.length > 2 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeOption(index)}
                        className="h-12 w-12 rounded-xl border-slate-200 hover:bg-red-50 hover:border-red-200 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={addOption}
                  className="w-full h-12 border-dashed border-2 border-slate-300 hover:border-indigo-400 hover:bg-indigo-50 rounded-xl"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Option
                </Button>
              </div>

              {/* End Date */}
              <div className="space-y-2">
                <Label htmlFor="endsAt" className="text-base font-semibold text-slate-900">
                  End Date (Optional)
                </Label>
                <Input
                  id="endsAt"
                  type="datetime-local"
                  value={endsAt}
                  onChange={(e) => setEndsAt(e.target.value)}
                  className="h-12 border-slate-200 rounded-xl"
                />
              </div>

              {/* Allow Multiple Votes */}
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div>
                  <Label htmlFor="allowMultiple" className="text-base font-semibold text-slate-900 cursor-pointer">
                    Allow users to change their vote
                  </Label>
                  <p className="text-sm text-slate-500 mt-1">
                    Users can update their vote after submission
                  </p>
                </div>
                <Switch
                  id="allowMultiple"
                  checked={allowMultipleVotes}
                  onCheckedChange={setAllowMultipleVotes}
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={createPollMutation.isPending}
                className="w-full bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white shadow-lg shadow-indigo-500/30 h-14 text-base font-semibold rounded-xl"
              >
                {createPollMutation.isPending ? "Creating Poll..." : "Create Poll"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
