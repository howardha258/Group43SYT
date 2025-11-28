import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function VotingInterface({ poll, onVote, isSubmitting, currentVote, currentReason }) {
  const [selectedOption, setSelectedOption] = useState(
    currentVote !== null && currentVote !== undefined ? currentVote.toString() : null
  );
  const [reason, setReason] = useState(currentReason || "");
  const [reasonError, setReasonError] = useState("");

  const countWords = (text) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const wordCount = countWords(reason);
  const isReasonValid = wordCount >= 5;

  const handleReasonChange = (e) => {
    setReason(e.target.value);
    if (reasonError) {
      setReasonError("");
    }
  };

  const handleSubmit = () => {
    if (selectedOption === null) return;

    if (!isReasonValid) {
      setReasonError(`Please enter at least 5 words. Current: ${wordCount} word${wordCount !== 1 ? 's' : ''}`);
      return;
    }

    onVote(parseInt(selectedOption), reason);
  };

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-semibold text-slate-900 mb-3 block">
          Select your choice:
        </Label>
        <RadioGroup value={selectedOption} onValueChange={setSelectedOption}>
          <div className="space-y-3">
            {poll.options.map((option, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Label
                  htmlFor={`option-${index}`}
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                    selectedOption === index.toString()
                      ? "border-indigo-500 bg-gradient-to-r from-indigo-50 to-violet-50 shadow-md"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                  <span className="flex-1 font-medium text-slate-900">{option}</span>
                  {currentVote !== null && currentVote !== undefined && currentVote === index && (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  )}
                </Label>
              </motion.div>
            ))}
          </div>
        </RadioGroup>
      </div>

      {selectedOption !== null && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <Label htmlFor="reason" className="text-base font-semibold text-slate-900">
            Why did you choose this? *
          </Label>
          <p className="text-sm text-slate-600">
            Please explain your choice in at least 5 words
          </p>
          <Textarea
            id="reason"
            placeholder="I chose this because..."
            value={reason}
            onChange={handleReasonChange}
            rows={4}
            className={`border-slate-200 rounded-xl resize-none ${
              reasonError ? 'border-red-300 focus:border-red-500' : ''
            }`}
          />
          <div className="flex items-center justify-between">
            <span className={`text-sm ${
              isReasonValid ? 'text-green-600' : 'text-slate-500'
            }`}>
              {wordCount} / 5 words minimum
            </span>
            {isReasonValid && (
              <span className="text-sm text-green-600 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                Looks good!
              </span>
            )}
          </div>
          {reasonError && (
            <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{reasonError}</span>
            </div>
          )}
        </motion.div>
      )}

      <Button
        onClick={handleSubmit}
        disabled={selectedOption === null || !isReasonValid || isSubmitting}
        className="w-full bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white shadow-lg shadow-indigo-500/30 py-6 text-base font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          "Submitting..."
        ) : currentVote !== null && currentVote !== undefined ? (
          poll.allow_multiple_votes ? "Update Vote" : "Vote Already Cast"
        ) : (
          "Cast Your Vote"
        )}
      </Button>
    </div>
  );
}