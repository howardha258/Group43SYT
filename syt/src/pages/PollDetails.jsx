
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Calendar, User, Lock, Unlock, BarChart3, PieChart, List } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import VotingInterface from "../components/polls/VotingInterface";
import ResultsDisplay from "../components/polls/ResultsDisplay";
import ResultsChart from "../components/polls/ResultsChart";
import VotersList from "../components/polls/VotersList";
import ShareCodeDisplay from "../components/polls/ShareCodeDisplay";
import DemographicFilters from "../components/polls/DemographicFilters";
import VoterReasons from "../components/polls/VoterReasons";

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

export default function PollDetailsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const pollId = urlParams.get("id");

  const [user, setUser] = useState(null);
  const [filters, setFilters] = useState({
    gender: "all",
    minAge: null,
    maxAge: null,
  });
  const [resultFormat, setResultFormat] = useState("bars");
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    base44.auth.me().then(currentUser => {
      setUser(currentUser);
      setIsDarkMode(currentUser.dark_mode || false);
    }).catch(() => {});
  }, []);

  const { data: polls = [], isLoading: pollLoading } = useQuery({
    queryKey: ['polls'],
    queryFn: () => base44.entities.Poll.list(),
    initialData: [],
  });

  const { data: votes = [], isLoading: votesLoading } = useQuery({
    queryKey: ['votes'],
    queryFn: () => base44.entities.Vote.list(),
    initialData: [],
  });

  const poll = polls.find(p => p.id === pollId);
  const pollVotes = votes.filter(v => v.poll_id === pollId);
  
  // Apply demographic filters
  const filteredVotes = pollVotes.filter(vote => {
    // Gender filter
    if (filters.gender !== "all" && vote.voter_gender !== filters.gender) {
      return false;
    }
    
    // Age filter
    if (filters.minAge !== null && vote.voter_age < filters.minAge) {
      return false;
    }
    if (filters.maxAge !== null && vote.voter_age > filters.maxAge) {
      return false;
    }
    
    return true;
  });
  
  const userVote = user ? votes.find(v => v.poll_id === pollId && v.voter_email === user.email) : null;
  const isCreator = user && poll && poll.created_by === user.email;

  const voteMutation = useMutation({
    mutationFn: async ({ pollId, optionIndex, optionText, voterEmail, voterName, voterAge, voterGender, reason }) => {
      if (userVote && !poll.allow_multiple_votes) {
        throw new Error("You have already voted on this poll");
      }
      
      if (userVote && poll.allow_multiple_votes) {
        await base44.entities.Vote.update(userVote.id, {
          option_index: optionIndex,
          option_text: optionText,
          voter_name: voterName,
          voter_age: voterAge,
          voter_gender: voterGender,
          reason: reason,
        });
      } else {
        await base44.entities.Vote.create({
          poll_id: pollId,
          option_index: optionIndex,
          option_text: optionText,
          voter_email: voterEmail,
          voter_name: voterName,
          voter_age: voterAge,
          voter_gender: voterGender,
          reason: reason,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['votes'] });
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async (newActiveStatus) => {
      await base44.entities.Poll.update(pollId, { is_active: newActiveStatus });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['polls'] });
    },
  });

  const handleVote = (optionIndex, reason) => {
    if (!user) {
      base44.auth.redirectToLogin();
      return;
    }

    voteMutation.mutate({
      pollId: poll.id,
      optionIndex,
      optionText: poll.options[optionIndex],
      voterEmail: user.email,
      voterName: user.full_name,
      voterAge: user.age,
      voterGender: user.gender,
      reason: reason,
    });
  };

  const handleToggleActive = () => {
    if (isCreator) {
      toggleActiveMutation.mutate(!poll.is_active);
    }
  };

  if (pollLoading || votesLoading) {
    return (
      <div className={`min-h-screen p-6 flex items-center justify-center ${
        isDarkMode ? 'bg-black' : 'bg-gradient-to-br from-slate-50 via-white to-indigo-50'
      }`}>
        <div className="animate-pulse text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-200 to-violet-200 rounded-2xl mx-auto mb-4" />
          <p className={isDarkMode ? 'text-slate-400' : 'text-slate-600'}>Loading poll...</p>
        </div>
      </div>
    );
  }

  if (!poll) {
    return (
      <div className={`min-h-screen p-6 flex items-center justify-center ${
        isDarkMode ? 'bg-black' : 'bg-gradient-to-br from-slate-50 via-white to-indigo-50'
      }`}>
        <div className="text-center">
          <h2 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Poll not found</h2>
          <Button onClick={() => navigate(createPageUrl("Polls"))}>
            Back to Polls
          </Button>
        </div>
      </div>
    );
  }

  const isPollClosed = poll.ends_at && new Date(poll.ends_at) < new Date();
  
  const hasActiveFilters = filters.gender !== "all" || filters.minAge !== null || filters.maxAge !== null;

  return (
    <div className={`min-h-screen p-6 ${isDarkMode ? 'bg-black' : 'bg-gradient-to-br from-slate-50 via-white to-indigo-50'}`}>
      <div className="max-w-7xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate(createPageUrl("Polls"))}
          className="mb-6 hover:bg-slate-100 rounded-xl"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Polls
        </Button>

        <div className="grid lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Poll Header */}
            <Card className="border-slate-200/60 bg-white/80 backdrop-blur-sm shadow-xl">
              <CardHeader className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge 
                    variant="secondary"
                    className={`${categoryColors[poll.category]} border text-sm font-medium`}
                  >
                    {poll.category}
                  </Badge>
                  {isPollClosed && (
                    <Badge variant="secondary" className="bg-red-100 text-red-700 border-red-200">
                      <Lock className="w-3 h-3 mr-1" />
                      Closed
                    </Badge>
                  )}
                  {!isPollClosed && poll.is_active && (
                    <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                      <Unlock className="w-3 h-3 mr-1" />
                      Active
                    </Badge>
                  )}
                  {!isPollClosed && !poll.is_active && (
                    <Badge variant="secondary" className="bg-orange-100 text-orange-700 border-orange-200">
                      <Lock className="w-3 h-3 mr-1" />
                      Inactive
                    </Badge>
                  )}
                  {isCreator && (
                    <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 border-indigo-200">
                      Your Poll
                    </Badge>
                  )}
                </div>
                
                <CardTitle className="text-3xl font-bold text-slate-900">
                  {poll.question}
                </CardTitle>
                
                {poll.description && (
                  <p className="text-lg text-slate-600 leading-relaxed">
                    {poll.description}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-6 text-sm text-slate-600 pt-2">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>Created by {poll.created_by_name || poll.created_by}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{format(new Date(poll.created_date), "MMMM d, yyyy")}</span>
                  </div>
                  {poll.ends_at && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>Ends {format(new Date(poll.ends_at), "MMMM d, yyyy")}</span>
                    </div>
                  )}
                </div>

                {/* Quick Toggle for Creator */}
                {isCreator && !isPollClosed && (
                  <div className="pt-4 border-t border-slate-200">
                    <Button
                      onClick={handleToggleActive}
                      disabled={toggleActiveMutation.isPending}
                      variant={poll.is_active ? "outline" : "default"}
                      className={poll.is_active 
                        ? "border-orange-200 text-orange-700 hover:bg-orange-50" 
                        : "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"}
                    >
                      {toggleActiveMutation.isPending ? (
                        "Updating..."
                      ) : poll.is_active ? (
                        <>
                          <Lock className="w-4 h-4 mr-2" />
                          Deactivate Poll
                        </>
                      ) : (
                        <>
                          <Unlock className="w-4 h-4 mr-2" />
                          Activate Poll
                        </>
                      )}
                    </Button>
                    <p className="text-xs text-slate-500 mt-2">
                      {poll.is_active 
                        ? "Deactivating will prevent new votes from being cast" 
                        : "Activating will allow users to vote again"}
                    </p>
                  </div>
                )}
              </CardHeader>
            </Card>

            {/* Voting Section */}
            {!isPollClosed && poll.is_active && (!userVote || poll.allow_multiple_votes) && (
              <Card className="border-slate-200/60 bg-white/80 backdrop-blur-sm shadow-xl">
                <CardHeader>
                  <CardTitle className="text-xl text-slate-900">Cast Your Vote</CardTitle>
                  {userVote && poll.allow_multiple_votes && (
                    <p className="text-sm text-slate-600">
                      You can update your vote at any time
                    </p>
                  )}
                </CardHeader>
                <CardContent>
                  <VotingInterface
                    poll={poll}
                    onVote={handleVote}
                    isSubmitting={voteMutation.isPending}
                    currentVote={userVote?.option_index}
                    currentReason={userVote?.reason}
                  />
                </CardContent>
              </Card>
            )}

            {/* Inactive Poll Message */}
            {!isPollClosed && !poll.is_active && !isCreator && (
              <Card className="border-orange-200 bg-orange-50/50 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <Lock className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-orange-900">This poll is currently inactive</p>
                      <p className="text-sm text-orange-700">
                        The poll creator has temporarily disabled voting
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Results - Different formats for creator */}
            {isCreator ? (
              <div className="space-y-4">
                {hasActiveFilters && (
                  <div className="bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-200 rounded-xl p-4">
                    <p className="text-sm font-medium text-indigo-900">
                      Showing filtered results: {filteredVotes.length} of {pollVotes.length} votes
                    </p>
                  </div>
                )}

                <Tabs value={resultFormat} onValueChange={setResultFormat} className="space-y-4">
                  <TabsList className="bg-white/80 backdrop-blur-sm border border-slate-200 h-auto p-1">
                    <TabsTrigger value="bars" className="rounded-lg px-4 py-2">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Bar Chart
                    </TabsTrigger>
                    <TabsTrigger value="pie" className="rounded-lg px-4 py-2">
                      <PieChart className="w-4 h-4 mr-2" />
                      Pie Chart
                    </TabsTrigger>
                    <TabsTrigger value="list" className="rounded-lg px-4 py-2">
                      <List className="w-4 h-4 mr-2" />
                      Voters List
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="bars">
                    <ResultsDisplay poll={poll} votes={filteredVotes} />
                  </TabsContent>

                  <TabsContent value="pie">
                    <ResultsChart poll={poll} votes={filteredVotes} />
                  </TabsContent>

                  <TabsContent value="list">
                    <VotersList poll={poll} votes={filteredVotes} />
                  </TabsContent>
                </Tabs>
              </div>
            ) : (
              <ResultsDisplay poll={poll} votes={filteredVotes} />
            )}

            {/* Voter Reasons - Only visible to creator */}
            {isCreator && pollVotes.length > 0 && (
              <VoterReasons poll={poll} votes={filteredVotes} />
            )}

            {/* Already Voted Message */}
            {userVote && !poll.allow_multiple_votes && !isPollClosed && (
              <Card className="border-green-200 bg-green-50/50 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-green-900">You've already voted!</p>
                      <p className="text-sm text-green-700">
                        Your vote: <span className="font-medium">{userVote.option_text}</span>
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Share Code - Only visible to creator */}
            {isCreator && poll.share_code && (
              <ShareCodeDisplay shareCode={poll.share_code} />
            )}
            
            {/* Demographic Filters - Only visible to creator */}
            {isCreator && pollVotes.length > 0 && (
              <DemographicFilters
                filters={filters}
                onFiltersChange={setFilters}
                votes={pollVotes}
              />
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
