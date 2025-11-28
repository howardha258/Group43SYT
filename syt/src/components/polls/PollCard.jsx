import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Clock, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

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

export default function PollCard({ poll, votesCount, hasVoted }) {
  return (
    <Link to={createPageUrl(`PollDetails?id=${poll.id}`)}>
      <Card className="group hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 border-slate-200/60 hover:border-indigo-300 bg-white/80 backdrop-blur-sm cursor-pointer">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3 mb-2">
            <Badge 
              variant="secondary"
              className={`${categoryColors[poll.category]} border text-xs font-medium`}
            >
              {poll.category}
            </Badge>
            {hasVoted && (
              <Badge className="bg-green-50 text-green-700 border border-green-200">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Voted
              </Badge>
            )}
          </div>
          <CardTitle className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors duration-200 line-clamp-2">
            {poll.question}
          </CardTitle>
          {poll.description && (
            <p className="text-sm text-slate-500 mt-2 line-clamp-2">{poll.description}</p>
          )}
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4 text-slate-600">
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                <span className="font-medium">{votesCount}</span>
                <span className="text-slate-400">votes</span>
              </div>
              {poll.ends_at && (
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  <span className="text-slate-400">
                    Ends {format(new Date(poll.ends_at), "MMM d")}
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="mt-3 text-xs text-slate-400">
            Created {format(new Date(poll.created_date), "MMM d, yyyy")}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}