
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Plus, Search, Edit, Trash2, Users, Eye, Sparkles, Lock, Unlock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { motion } from "framer-motion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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

export default function MyPollsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState(null);
  const [pollToDelete, setPollToDelete] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    base44.auth.me().then(currentUser => {
      setUser(currentUser);
      setIsDarkMode(currentUser.dark_mode || false);
    }).catch(() => {
      navigate(createPageUrl("Polls"));
    });
  }, [navigate]);

  const { data: polls = [], isLoading: pollsLoading } = useQuery({
    queryKey: ['polls'],
    queryFn: () => base44.entities.Poll.list('-created_date'),
    initialData: [],
  });

  const { data: votes = [], isLoading: votesLoading } = useQuery({
    queryKey: ['votes'],
    queryFn: () => base44.entities.Vote.list(),
    initialData: [],
  });

  const deletePollMutation = useMutation({
    mutationFn: async (pollId) => {
      // First delete all votes for this poll
      const pollVotes = votes.filter(v => v.poll_id === pollId);
      for (const vote of pollVotes) {
        await base44.entities.Vote.delete(vote.id);
      }
      // Then delete the poll
      await base44.entities.Poll.delete(pollId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['polls'] });
      queryClient.invalidateQueries({ queryKey: ['votes'] });
      setPollToDelete(null);
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ pollId, newActiveStatus }) => {
      await base44.entities.Poll.update(pollId, { is_active: newActiveStatus });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['polls'] });
    },
  });

  const myPolls = polls.filter(poll => 
    user && poll.created_by === user.email
  );

  const filteredPolls = myPolls.filter(poll => {
    const matchesSearch = poll.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (poll.description && poll.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  const getVotesCount = (pollId) => {
    return votes.filter(vote => vote.poll_id === pollId).length;
  };

  const handleDelete = (poll) => {
    setPollToDelete(poll);
  };

  const confirmDelete = () => {
    if (pollToDelete) {
      deletePollMutation.mutate(pollToDelete.id);
    }
  };

  const handleToggleActive = (e, poll) => {
    e.stopPropagation();
    toggleActiveMutation.mutate({ pollId: poll.id, newActiveStatus: !poll.is_active });
  };

  return (
    <div className={`min-h-screen p-6 ${isDarkMode ? 'bg-gray-900 text-gray-50' : 'bg-gradient-to-br from-slate-50 via-white to-indigo-50'}`}>
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-50 to-violet-50 rounded-full mb-4 border border-indigo-100">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span className="text-sm font-medium text-indigo-900">Your Polls Dashboard</span>
          </div>
          <h1 className="text-5xl font-bold text-slate-900 mb-4">
            My Polls
          </h1>
          <p className="text-xl text-slate-600">
            Manage all the polls you've created
          </p>
        </motion.div>

        {/* Actions Bar */}
        <div className="mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 max-w-md w-full">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Search your polls..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 border-slate-200 bg-white/80 backdrop-blur-sm shadow-sm rounded-xl"
            />
          </div>
          <Link to={createPageUrl("CreatePoll")}>
            <Button className="w-full md:w-auto bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white shadow-lg shadow-indigo-500/30 h-12 px-6 rounded-xl font-semibold">
              <Plus className="w-5 h-5 mr-2" />
              Create New Poll
            </Button>
          </Link>
        </div>

        {/* Polls Grid */}
        {pollsLoading || votesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-white/50 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filteredPolls.length > 0 ? (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.1 } },
              hidden: {}
            }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredPolls.map((poll) => (
              <motion.div
                key={poll.id}
                variants={{
                  visible: { opacity: 1, y: 0 },
                  hidden: { opacity: 0, y: 20 }
                }}
              >
                <Card className="group hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 border-slate-200/60 hover:border-indigo-300 bg-white/80 backdrop-blur-sm">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <Badge 
                        variant="secondary"
                        className={`${categoryColors[poll.category]} border text-xs font-medium`}
                      >
                        {poll.category}
                      </Badge>
                      <div className="flex items-center gap-2">
                        {poll.is_active ? (
                          <Badge className="bg-green-50 text-green-700 border border-green-200 text-xs">
                            Active
                          </Badge>
                        ) : (
                          <Badge className="bg-orange-50 text-orange-700 border border-orange-200 text-xs">
                            Inactive
                          </Badge>
                        )}
                        {poll.share_code && (
                          <Badge className="bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono">
                            {poll.share_code}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <CardTitle className="text-lg font-bold text-slate-900 line-clamp-2">
                      {poll.question}
                    </CardTitle>
                    {poll.description && (
                      <p className="text-sm text-slate-500 mt-2 line-clamp-2">{poll.description}</p>
                    )}
                  </CardHeader>
                  <CardContent className="pt-0 space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Users className="w-4 h-4" />
                        <span className="font-medium">{getVotesCount(poll.id)}</span>
                        <span className="text-slate-400">votes</span>
                      </div>
                      <span className="text-xs text-slate-400">
                        {format(new Date(poll.created_date), "MMM d, yyyy")}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(createPageUrl(`PollDetails?id=${poll.id}`))}
                        className="flex-1 h-9 rounded-lg border-slate-200 hover:bg-slate-50"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(createPageUrl(`EditPoll?id=${poll.id}`))}
                        className="flex-1 h-9 rounded-lg border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(poll)}
                        className="h-9 px-3 rounded-lg border-red-200 text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Quick Toggle */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => handleToggleActive(e, poll)}
                      disabled={toggleActiveMutation.isPending}
                      className={`w-full h-9 rounded-lg ${
                        poll.is_active 
                          ? "border-orange-200 text-orange-700 hover:bg-orange-50" 
                          : "border-green-200 text-green-700 hover:bg-green-50"
                      }`}
                    >
                      {poll.is_active ? (
                        <>
                          <Lock className="w-3 h-3 mr-1" />
                          Deactivate
                        </>
                      ) : (
                        <>
                          <Unlock className="w-3 h-3 mr-1" />
                          Activate
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-violet-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              {searchQuery ? "No polls found" : "You haven't created any polls yet"}
            </h3>
            <p className="text-slate-600 mb-6">
              {searchQuery 
                ? "Try adjusting your search"
                : "Create your first poll and start gathering opinions!"}
            </p>
            {!searchQuery && (
              <Link to={createPageUrl("CreatePoll")}>
                <Button className="bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white shadow-lg shadow-indigo-500/30">
                  <Plus className="w-5 h-5 mr-2" />
                  Create Your First Poll
                </Button>
              </Link>
            )}
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={pollToDelete !== null} onOpenChange={() => setPollToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Poll</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{pollToDelete?.question}"? This action cannot be undone. 
                All votes for this poll will also be deleted.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                {deletePollMutation.isPending ? "Deleting..." : "Delete Poll"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
