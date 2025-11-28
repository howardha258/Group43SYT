import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

export default function ResultsDisplay({ poll, votes }) {
  const voteCounts = poll.options.map((_, index) => 
    votes.filter(vote => vote.option_index === index).length
  );
  
  const totalVotes = votes.length;
  const maxVotes = Math.max(...voteCounts, 1);
  
  const results = poll.options.map((option, index) => ({
    option,
    count: voteCounts[index],
    percentage: totalVotes > 0 ? (voteCounts[index] / totalVotes) * 100 : 0,
    isLeading: voteCounts[index] === maxVotes && voteCounts[index] > 0
  }));

  return (
    <Card className="border-slate-200/60 bg-white/80 backdrop-blur-sm shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-900">
          <TrendingUp className="w-5 h-5 text-indigo-600" />
          Live Results
        </CardTitle>
        <p className="text-sm text-slate-500 mt-1">
          {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'} cast
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {results.map((result, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {result.isLeading && totalVotes > 0 && (
                  <Trophy className="w-4 h-4 text-amber-500 flex-shrink-0" />
                )}
                <span className="font-medium text-slate-900 truncate">{result.option}</span>
              </div>
              <div className="flex items-center gap-3 ml-4">
                <span className="text-sm font-semibold text-slate-600 whitespace-nowrap">
                  {result.count} {result.count === 1 ? 'vote' : 'votes'}
                </span>
                <span className="text-lg font-bold text-indigo-600 w-14 text-right">
                  {result.percentage.toFixed(1)}%
                </span>
              </div>
            </div>
            <Progress 
              value={result.percentage} 
              className="h-3 bg-slate-100"
              style={{
                background: result.isLeading && totalVotes > 0
                  ? 'linear-gradient(to right, #eef2ff, #f5f3ff)'
                  : '#f1f5f9'
              }}
            />
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
}