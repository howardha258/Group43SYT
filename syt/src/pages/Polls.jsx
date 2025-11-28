
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Plus, Search, Sparkles, Filter, Hash } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PollCard from "../components/polls/PollCard";
import { motion } from "framer-motion";

export default function PollsPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [user, setUser] = useState(null);
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false); // New state for dark mode

  useEffect(() => {
    base44.auth.me().then(currentUser => {
      setUser(currentUser);
      setIsDarkMode(currentUser.dark_mode || false); // Set dark mode based on user preference
      // Check if profile is completed, if not redirect to setup
      if (!currentUser.profile_completed) {
        navigate(createPageUrl("ProfileSetup"));
      }
      setCheckingProfile(false);
    }).catch(() => {
      setCheckingProfile(false);
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

  const filteredPolls = polls.filter(poll => {
    const matchesSearch = poll.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (poll.description && poll.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = categoryFilter === "all" || poll.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getVotesCount = (pollId) => {
    return votes.filter(vote => vote.poll_id === pollId).length;
  };

  const hasUserVoted = (pollId) => {
    return user && votes.some(vote => vote.poll_id === pollId && vote.voter_email === user.email);
  };

  if (checkingProfile) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isDarkMode ? 'bg-black' : 'bg-gradient-to-br from-slate-50 via-white to-indigo-50'
      }`}>
        <div className="animate-pulse text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-200 to-violet-200 rounded-2xl mx-auto mb-4" />
          <p className={isDarkMode ? 'text-slate-400' : 'text-slate-600'}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-6 ${isDarkMode ? 'bg-black text-white' : 'bg-gradient-to-br from-slate-50 via-white to-indigo-50'}`}>
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 border ${isDarkMode ? 'bg-zinc-800 border-zinc-700' : 'bg-gradient-to-r from-indigo-50 to-violet-50 border-indigo-100'}`}>
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-indigo-900'}`}>Real-time Polling Platform</span>
          </div>
          <h1 className={`text-5xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            Discover & Vote on Polls
          </h1>
          <p className={`text-xl max-w-2xl mx-auto mb-6 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
            Share your opinion and see what others think in real-time
          </p>
          <Button
            onClick={() => navigate(createPageUrl("JoinPoll"))}
            variant="outline"
            className={`border-indigo-200 text-indigo-700 hover:bg-indigo-50 ${isDarkMode ? 'dark:border-zinc-700 dark:text-indigo-300 dark:hover:bg-zinc-800' : ''}`}
          >
            <Hash className="w-4 h-4 mr-2" />
            Have a poll code? Join now
          </Button>
        </motion.div>

        {/* Actions Bar */}
        <div className="mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 max-w-md w-full">
            <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
            <Input
              placeholder="Search polls..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`pl-12 h-12 shadow-sm rounded-xl ${isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white placeholder-slate-500' : 'border-slate-200 bg-white/80 backdrop-blur-sm'}`}
            />
          </div>
          <Link to={createPageUrl("CreatePoll")}>
            <Button className="w-full md:w-auto bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white shadow-lg shadow-indigo-500/30 h-12 px-6 rounded-xl font-semibold">
              <Plus className="w-5 h-5 mr-2" />
              Create New Poll
            </Button>
          </Link>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Filter className={`w-4 h-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} />
            <span className={`text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Filter by category:</span>
          </div>
          <Tabs value={categoryFilter} onValueChange={setCategoryFilter}>
            <TabsList className={`${isDarkMode ? 'bg-zinc-800 border-zinc-700' : 'bg-white/80 backdrop-blur-sm border border-slate-200'} h-auto p-1 flex-wrap justify-start`}>
              <TabsTrigger value="all" className={`rounded-lg ${isDarkMode ? 'data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=inactive]:text-slate-300' : ''}`}>All</TabsTrigger>
              <TabsTrigger value="general" className={`rounded-lg ${isDarkMode ? 'data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=inactive]:text-slate-300' : ''}`}>General</TabsTrigger>
              <TabsTrigger value="politics" className={`rounded-lg ${isDarkMode ? 'data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=inactive]:text-slate-300' : ''}`}>Politics</TabsTrigger>
              <TabsTrigger value="technology" className={`rounded-lg ${isDarkMode ? 'data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=inactive]:text-slate-300' : ''}`}>Technology</TabsTrigger>
              <TabsTrigger value="entertainment" className={`rounded-lg ${isDarkMode ? 'data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=inactive]:text-slate-300' : ''}`}>Entertainment</TabsTrigger>
              <TabsTrigger value="sports" className={`rounded-lg ${isDarkMode ? 'data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=inactive]:text-slate-300' : ''}`}>Sports</TabsTrigger>
              <TabsTrigger value="lifestyle" className={`rounded-lg ${isDarkMode ? 'data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=inactive]:text-slate-300' : ''}`}>Lifestyle</TabsTrigger>
              <TabsTrigger value="education" className={`rounded-lg ${isDarkMode ? 'data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=inactive]:text-slate-300' : ''}`}>Education</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Polls Grid */}
        {pollsLoading || votesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className={`h-64 rounded-2xl animate-pulse ${isDarkMode ? 'bg-zinc-800' : 'bg-white/50'}`} />
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
                <PollCard
                  poll={poll}
                  votesCount={getVotesCount(poll.id)}
                  hasVoted={hasUserVoted(poll.id)}
                  isDarkMode={isDarkMode} // Pass dark mode prop to PollCard
                />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-violet-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-indigo-600" />
            </div>
            <h3 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>No polls found</h3>
            <p className={`mb-6 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              {searchQuery || categoryFilter !== "all" 
                ? "Try adjusting your search or filters"
                : "Be the first to create a poll!"}
            </p>
            {!searchQuery && categoryFilter === "all" && (
              <Link to={createPageUrl("CreatePoll")}>
                <Button className="bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white shadow-lg shadow-indigo-500/30">
                  <Plus className="w-5 h-5 mr-2" />
                  Create Your First Poll
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
