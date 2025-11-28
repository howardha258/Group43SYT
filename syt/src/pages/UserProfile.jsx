
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserCircle, Edit2, Save, X, Sparkles, TrendingUp, History, FolderOpen, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const categoryColors = {
  general: "bg-slate-100 text-slate-700 border-slate-200",
  politics: "bg-red-100 text-red-700 border-red-200",
  technology: "bg-blue-100 text-blue-700 border-blue-200",
  entertainment: "bg-purple-100 text-purple-700 border-purple-200",
  sports: "bg-green-100 text-green-700 border-green-200",
  lifestyle: "bg-pink-100 text-pink-700 border-pink-200",
  education: "bg-amber-100 text-amber-700 border-amber-200",
  other: "bg-gray-100 text-gray-700 border-gray-200"
};

export default function UserProfilePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editAge, setEditAge] = useState("");
  const [editGender, setEditGender] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    base44.auth.me().then(currentUser => {
      setUser(currentUser);
      setEditAge(currentUser.age?.toString() || "");
      setEditGender(currentUser.gender || "");
      setIsDarkMode(currentUser.dark_mode || false);
    }).catch(() => {
      navigate(createPageUrl("Polls"));
    });
  }, [navigate]);

  const { data: polls = [] } = useQuery({
    queryKey: ['polls'],
    queryFn: () => base44.entities.Poll.list('-created_date'),
    initialData: [],
  });

  const { data: votes = [] } = useQuery({
    queryKey: ['votes'],
    queryFn: () => base44.entities.Vote.list('-created_date'),
    initialData: [],
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data) => base44.auth.updateMe(data),
    onSuccess: (updatedUser) => {
      setUser(updatedUser);
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });

  const userPolls = polls.filter(poll => user && poll.created_by === user.email);
  const userVotes = votes.filter(vote => user && vote.voter_email === user.email);

  const handleSaveProfile = () => {
    if (!editAge || !editGender) return;
    
    updateProfileMutation.mutate({
      age: parseInt(editAge),
      gender: editGender,
    });
  };

  const handleCancelEdit = () => {
    setEditAge(user?.age?.toString() || "");
    setEditGender(user?.gender || "");
    setIsEditing(false);
  };

  const getVotesCount = (pollId) => {
    return votes.filter(vote => vote.poll_id === pollId).length;
  };

  const getPollById = (pollId) => {
    return polls.find(p => p.id === pollId);
  };

  if (!user) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isDarkMode ? 'bg-black' : 'bg-gradient-to-br from-slate-50 via-white to-indigo-50'
      }`}>
        <div className="animate-pulse text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-200 to-violet-200 rounded-2xl mx-auto mb-4" />
          <p className={isDarkMode ? 'text-slate-400' : 'text-slate-600'}>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-6 ${isDarkMode ? 'bg-black' : ''}`}>
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-50 to-violet-50 rounded-full mb-4 border border-indigo-100">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span className="text-sm font-medium text-indigo-900">Your Profile</span>
          </div>
          <h1 className="text-5xl font-bold text-slate-900 mb-4">
            Profile Dashboard
          </h1>
          <p className="text-xl text-slate-600">
            Manage your information and view your activity
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Profile Info Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <Card className="border-slate-200/60 bg-white/80 backdrop-blur-sm shadow-xl sticky top-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl text-slate-900">Profile Info</CardTitle>
                  {!isEditing ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                      className="h-8 px-3 rounded-lg border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                    >
                      <Edit2 className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCancelEdit}
                        className="h-8 px-3 rounded-lg"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSaveProfile}
                        disabled={updateProfileMutation.isPending}
                        className="h-8 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700"
                      >
                        <Save className="w-3 h-3 mr-1" />
                        Save
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar */}
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/30 mb-4">
                    <UserCircle className="w-16 h-16 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{user.full_name}</h3>
                  <p className="text-sm text-slate-500">{user.email}</p>
                  <Badge className="mt-2 bg-indigo-100 text-indigo-700 border-indigo-200">
                    {user.role === 'admin' ? 'Admin' : 'User'}
                  </Badge>
                </div>

                {/* Profile Fields */}
                <div className="space-y-4 pt-4 border-t border-slate-200">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-900">Age</Label>
                    {isEditing ? (
                      <Input
                        type="number"
                        value={editAge}
                        onChange={(e) => setEditAge(e.target.value)}
                        min="13"
                        max="120"
                        className="h-10 border-slate-200 rounded-lg"
                      />
                    ) : (
                      <p className="text-base text-slate-700">{user.age || "Not set"}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-900">Gender</Label>
                    {isEditing ? (
                      <Select value={editGender} onValueChange={setEditGender}>
                        <SelectTrigger className="h-10 border-slate-200 rounded-lg">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                          <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="text-base text-slate-700 capitalize">
                        {user.gender?.replace(/_/g, ' ') || "Not set"}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-900">Member Since</Label>
                    <p className="text-base text-slate-700">
                      {format(new Date(user.created_date), "MMMM d, yyyy")}
                    </p>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200">
                  <div className="bg-gradient-to-br from-indigo-50 to-violet-50 rounded-xl p-4 border border-indigo-100">
                    <p className="text-xs text-slate-600 mb-1">Polls Created</p>
                    <p className="text-2xl font-bold text-indigo-600">{userPolls.length}</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                    <p className="text-xs text-slate-600 mb-1">Votes Cast</p>
                    <p className="text-2xl font-bold text-green-600">{userVotes.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Activity Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <Tabs defaultValue="polls" className="space-y-6">
              <TabsList className="bg-white/80 backdrop-blur-sm border border-slate-200 h-auto p-1">
                <TabsTrigger value="polls" className="rounded-lg px-6 py-2">
                  <FolderOpen className="w-4 h-4 mr-2" />
                  My Polls
                </TabsTrigger>
                <TabsTrigger value="votes" className="rounded-lg px-6 py-2">
                  <History className="w-4 h-4 mr-2" />
                  Voting History
                </TabsTrigger>
              </TabsList>

              {/* My Polls Tab */}
              <TabsContent value="polls" className="space-y-4">
                <Card className="border-slate-200/60 bg-white/80 backdrop-blur-sm shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-slate-900">
                      <TrendingUp className="w-5 h-5 text-indigo-600" />
                      Polls You Created ({userPolls.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {userPolls.length > 0 ? (
                      <div className="space-y-3">
                        {userPolls.slice(0, 10).map((poll) => (
                          <Link
                            key={poll.id}
                            to={createPageUrl(`PollDetails?id=${poll.id}`)}
                            className="block"
                          >
                            <div className="p-4 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 hover:border-indigo-200 transition-all duration-200">
                              <div className="flex items-start justify-between gap-3 mb-2">
                                <h4 className="font-semibold text-slate-900 line-clamp-1">
                                  {poll.question}
                                </h4>
                                <Badge
                                  variant="secondary"
                                  className={`${categoryColors[poll.category]} border text-xs flex-shrink-0`}
                                >
                                  {poll.category}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-slate-600">
                                <span>{getVotesCount(poll.id)} votes</span>
                                <span>•</span>
                                <span>{format(new Date(poll.created_date), "MMM d, yyyy")}</span>
                                {poll.share_code && (
                                  <>
                                    <span>•</span>
                                    <span className="font-mono text-indigo-600">{poll.share_code}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </Link>
                        ))}
                        {userPolls.length > 10 && (
                          <Link to={createPageUrl("MyPolls")}>
                            <Button variant="outline" className="w-full rounded-xl">
                              View All Polls
                            </Button>
                          </Link>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <FolderOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-600 mb-4">You haven't created any polls yet</p>
                        <Link to={createPageUrl("CreatePoll")}>
                          <Button className="bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700">
                            Create Your First Poll
                          </Button>
                        </Link>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Voting History Tab */}
              <TabsContent value="votes" className="space-y-4">
                <Card className="border-slate-200/60 bg-white/80 backdrop-blur-sm shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-slate-900">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      Your Voting History ({userVotes.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {userVotes.length > 0 ? (
                      <div className="space-y-3">
                        {userVotes.slice(0, 15).map((vote) => {
                          const poll = getPollById(vote.poll_id);
                          if (!poll) return null;
                          
                          return (
                            <Link
                              key={vote.id}
                              to={createPageUrl(`PollDetails?id=${poll.id}`)}
                              className="block"
                            >
                              <div className="p-4 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 hover:border-green-200 transition-all duration-200">
                                <div className="flex items-start justify-between gap-3 mb-2">
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-slate-900 line-clamp-1 mb-1">
                                      {poll.question}
                                    </h4>
                                    <div className="flex items-center gap-2">
                                      <Badge className="bg-green-50 text-green-700 border-green-200 text-xs">
                                        Your vote: {vote.option_text}
                                      </Badge>
                                    </div>
                                  </div>
                                  <Badge
                                    variant="secondary"
                                    className={`${categoryColors[poll.category]} border text-xs flex-shrink-0`}
                                  >
                                    {poll.category}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-slate-600">
                                  <span>Voted on {format(new Date(vote.created_date), "MMM d, yyyy")}</span>
                                  <span>•</span>
                                  <span>{getVotesCount(poll.id)} total votes</span>
                                </div>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <History className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-600 mb-4">You haven't voted on any polls yet</p>
                        <Link to={createPageUrl("Polls")}>
                          <Button className="bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700">
                            Browse Polls
                          </Button>
                        </Link>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
