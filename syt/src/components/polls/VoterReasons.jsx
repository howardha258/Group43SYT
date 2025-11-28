import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, User } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

export default function VoterReasons({ poll, votes }) {
  // Group votes by option
  const votesByOption = poll.options.map((option, index) => ({
    option,
    votes: votes.filter(vote => vote.option_index === index && vote.reason)
  }));

  const totalReasonsCount = votes.filter(v => v.reason).length;

  if (totalReasonsCount === 0) {
    return null;
  }

  return (
    <Card className="border-slate-200/60 bg-white/80 backdrop-blur-sm shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-900">
          <MessageSquare className="w-5 h-5 text-indigo-600" />
          Voter Explanations ({totalReasonsCount})
        </CardTitle>
        <p className="text-sm text-slate-600 mt-1">
          See why people chose their answers
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {votesByOption.map((group, groupIndex) => {
          if (group.votes.length === 0) return null;
          
          return (
            <motion.div
              key={groupIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: groupIndex * 0.1 }}
              className="space-y-3"
            >
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200">
                  {group.option}
                </Badge>
                <span className="text-sm text-slate-600">
                  {group.votes.length} {group.votes.length === 1 ? 'explanation' : 'explanations'}
                </span>
              </div>
              
              <div className="space-y-2">
                {group.votes.map((vote, voteIndex) => (
                  <div
                    key={voteIndex}
                    className="bg-slate-50 rounded-lg p-4 border border-slate-200"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <User className="w-4 h-4 text-indigo-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-800 leading-relaxed mb-2">
                          "{vote.reason}"
                        </p>
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          {vote.voter_age && (
                            <span>Age: {vote.voter_age}</span>
                          )}
                          {vote.voter_gender && (
                            <span>• {vote.voter_gender.replace(/_/g, ' ')}</span>
                          )}
                          <span>• {format(new Date(vote.created_date), "MMM d, yyyy")}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </CardContent>
    </Card>
  );
}