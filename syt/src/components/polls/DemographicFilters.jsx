import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Filter, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function DemographicFilters({ filters, onFiltersChange, votes }) {
  const [genderFilter, setGenderFilter] = React.useState(filters.gender || "all");
  const [minAge, setMinAge] = React.useState(filters.minAge || "");
  const [maxAge, setMaxAge] = React.useState(filters.maxAge || "");

  const handleApply = () => {
    onFiltersChange({
      gender: genderFilter,
      minAge: minAge ? parseInt(minAge) : null,
      maxAge: maxAge ? parseInt(maxAge) : null,
    });
  };

  const handleReset = () => {
    setGenderFilter("all");
    setMinAge("");
    setMaxAge("");
    onFiltersChange({
      gender: "all",
      minAge: null,
      maxAge: null,
    });
  };

  const hasActiveFilters = genderFilter !== "all" || minAge !== "" || maxAge !== "";

  // Calculate demographics
  const totalVoters = votes.length;
  const genderBreakdown = {
    male: votes.filter(v => v.voter_gender === "male").length,
    female: votes.filter(v => v.voter_gender === "female").length,
    other: votes.filter(v => v.voter_gender === "other").length,
    prefer_not_to_say: votes.filter(v => v.voter_gender === "prefer_not_to_say").length,
  };

  const ages = votes.filter(v => v.voter_age).map(v => v.voter_age);
  const avgAge = ages.length > 0 ? (ages.reduce((a, b) => a + b, 0) / ages.length).toFixed(1) : "N/A";

  return (
    <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50/50 to-violet-50/50 backdrop-blur-sm shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-slate-900">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-indigo-600" />
            <span>Filter Results</span>
          </div>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="h-8 text-xs text-slate-600 hover:text-slate-900"
            >
              <X className="w-3 h-3 mr-1" />
              Reset
            </Button>
          )}
        </CardTitle>
        <p className="text-xs text-slate-600 mt-1">
          Filter poll results by voter demographics
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Demographics Overview */}
        <div className="bg-white/60 rounded-lg p-4 space-y-3">
          <h4 className="text-sm font-semibold text-slate-900">Voter Demographics</h4>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <p className="text-slate-600">Total Voters</p>
              <p className="text-lg font-bold text-indigo-600">{totalVoters}</p>
            </div>
            <div>
              <p className="text-slate-600">Average Age</p>
              <p className="text-lg font-bold text-indigo-600">{avgAge}</p>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-slate-600 text-xs mb-2">Gender Distribution:</p>
            <div className="flex flex-wrap gap-2">
              {genderBreakdown.male > 0 && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200">
                  Male: {genderBreakdown.male}
                </Badge>
              )}
              {genderBreakdown.female > 0 && (
                <Badge variant="secondary" className="bg-pink-100 text-pink-700 border-pink-200">
                  Female: {genderBreakdown.female}
                </Badge>
              )}
              {genderBreakdown.other > 0 && (
                <Badge variant="secondary" className="bg-purple-100 text-purple-700 border-purple-200">
                  Other: {genderBreakdown.other}
                </Badge>
              )}
              {genderBreakdown.prefer_not_to_say > 0 && (
                <Badge variant="secondary" className="bg-gray-100 text-gray-700 border-gray-200">
                  Prefer not to say: {genderBreakdown.prefer_not_to_say}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-900">Gender</Label>
            <Select value={genderFilter} onValueChange={setGenderFilter}>
              <SelectTrigger className="bg-white border-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Genders</SelectItem>
                <SelectItem value="male">Male Only</SelectItem>
                <SelectItem value="female">Female Only</SelectItem>
                <SelectItem value="other">Other Only</SelectItem>
                <SelectItem value="prefer_not_to_say">Prefer Not to Say</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-900">Age Range</Label>
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  type="number"
                  placeholder="Min"
                  value={minAge}
                  onChange={(e) => setMinAge(e.target.value)}
                  min="13"
                  max="120"
                  className="bg-white border-slate-200"
                />
              </div>
              <span className="flex items-center text-slate-500">to</span>
              <div className="flex-1">
                <Input
                  type="number"
                  placeholder="Max"
                  value={maxAge}
                  onChange={(e) => setMaxAge(e.target.value)}
                  min="13"
                  max="120"
                  className="bg-white border-slate-200"
                />
              </div>
            </div>
          </div>
        </div>

        <Button
          onClick={handleApply}
          className="w-full bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white shadow-lg shadow-indigo-500/30"
        >
          Apply Filters
        </Button>

        {hasActiveFilters && (
          <div className="bg-white/60 rounded-lg p-3">
            <p className="text-xs text-slate-600 mb-2">Active Filters:</p>
            <div className="flex flex-wrap gap-2">
              {genderFilter !== "all" && (
                <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200">
                  Gender: {genderFilter.replace(/_/g, ' ')}
                </Badge>
              )}
              {minAge && (
                <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200">
                  Min Age: {minAge}
                </Badge>
              )}
              {maxAge && (
                <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200">
                  Max Age: {maxAge}
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}