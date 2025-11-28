
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { List, User, Search, Calendar } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

export default function VotersList({ poll, votes }) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredVotes = votes.filter(vote => {
    const optionText = poll.options[vote.option_index] || "";
    const voterName = vote.voter_name || vote.voter_email || ""; // Added voterName for search
    const matchesSearch = 
      voterName.toLowerCase().includes(searchQuery.toLowerCase()) || // Search by voterName
      optionText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (vote.reason && vote.reason.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  const getOptionColor = (index) => {
    const colors = [
      "bg-indigo-100 text-indigo-700 border-indigo-200",
      "bg-violet-100 text-violet-700 border-violet-200",
      "bg-pink-100 text-pink-700 border-pink-200",
      "bg-amber-100 text-amber-700 border-amber-200",
      "bg-emerald-100 text-emerald-700 border-emerald-200",
      "bg-blue-100 text-blue-700 border-blue-200",
      "bg-red-100 text-red-700 border-red-200",
      "bg-cyan-100 text-cyan-700 border-cyan-200",
    ];
    return colors[index % colors.length];
  };

  return (
    <Card className="border-slate-200/60 bg-white/80 backdrop-blur-sm shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-900">
          <List className="w-5 h-5 text-indigo-600" />
          All Voters ({votes.length})
        </CardTitle>
        <p className="text-sm text-slate-500 mt-1">
          Complete list of voters with their choices and explanations
        </p>
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search by name, choice, or explanation..." // Updated placeholder
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 border-slate-200 rounded-lg"
          />
        </div>
      </CardHeader>
      <CardContent>
        {filteredVotes.length > 0 ? (
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
            {filteredVotes.map((vote, index) => (
              <motion.div
                key={vote.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-slate-50 rounded-xl p-4 border border-slate-200 hover:border-indigo-200 hover:shadow-md transition-all duration-200"
              >
                {/* Voter Info Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 truncate">
                        {vote.voter_name || vote.voter_email} {/* Display voter_name if available, else voter_email */}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <Calendar className="w-3 h-3" />
                        <span>{format(new Date(vote.created_date), "MMM d, yyyy 'at' h:mm a")}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Demographics */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {vote.voter_age && (
                    <Badge variant="secondary" className="bg-slate-100 text-slate-700 border-slate-200 text-xs">
                      Age: {vote.voter_age}
                    </Badge>
                  )}
                  {vote.voter_gender && (
                    <Badge variant="secondary" className="bg-slate-100 text-slate-700 border-slate-200 text-xs capitalize">
                      {vote.voter_gender.replace(/_/g, ' ')}
                    </Badge>
                  )}
                </div>

                {/* Selected Choice */}
                <div className="mb-3">
                  <p className="text-xs text-slate-600 mb-1.5">Selected:</p>
                  <Badge 
                    variant="secondary" 
                    className={`${getOptionColor(vote.option_index)} border font-medium`}
                  >
                    {poll.options[vote.option_index]}
                  </Badge>
                </div>

                {/* Explanation */}
                {vote.reason && (
                  <div className="bg-white rounded-lg p-3 border border-slate-200">
                    <p className="text-xs text-slate-600 mb-1.5 font-medium">Explanation:</p>
                    <p className="text-sm text-slate-800 leading-relaxed">
                      "{vote.reason}"
                    </p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-slate-500">
            {searchQuery ? (
              <>
                <Search className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p>No voters found matching your search</p>
              </>
            ) : (
              <>
                <List className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p>No votes cast yet</p>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
