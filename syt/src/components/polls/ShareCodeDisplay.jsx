import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Share2, Copy, Check } from "lucide-react";
import { motion } from "framer-motion";

export default function ShareCodeDisplay({ shareCode }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(shareCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50 to-violet-50 backdrop-blur-sm shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-900">
          <Share2 className="w-5 h-5 text-indigo-600" />
          Share This Poll
        </CardTitle>
        <p className="text-sm text-slate-600 mt-1">
          Share this code with others to let them vote
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <p className="text-sm font-medium text-slate-600 mb-3">Poll Code</p>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 shadow-lg border-2 border-indigo-200"
          >
            <div className="text-5xl font-bold tracking-widest text-indigo-600 font-mono">
              {shareCode}
            </div>
          </motion.div>
        </div>

        <Button
          onClick={handleCopy}
          className="w-full bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white shadow-lg shadow-indigo-500/30 h-12 rounded-xl font-semibold"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 mr-2" />
              Copy Code
            </>
          )}
        </Button>

        <div className="bg-white/50 rounded-xl p-4 border border-indigo-100">
          <p className="text-xs text-slate-600 text-center">
            Anyone with this code can access and vote on your poll
          </p>
        </div>
      </CardContent>
    </Card>
  );
}