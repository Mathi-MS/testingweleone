import { TrendingUp, Search, Sparkles, MapPin, ArrowUpRight } from "lucide-react";

interface Suggestion {
  id: string;
  text: string;
}

interface SuggestionListProps {
  suggestions: Suggestion[];
  onSuggestionClick: (suggestion: string) => void;
  className?: string;
}

export function SuggestionList({
  suggestions,
  onSuggestionClick,
  className = "",
}: SuggestionListProps) {
  if (suggestions.length === 0) return null;

  return (
    <div className={`bg-white rounded-t-[20px] rounded-b-none border border-gray-200 border-b-0 shadow-sm p-4 ${className}`}>
      {/* Trending Header */}
      {/* <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-4 h-4 text-gray-600" />
        <span className="text-sm font-medium text-gray-900">Trending</span>
      </div> */}
      
      {/* Suggestion Items */}
      <div className="space-y-3">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion.id}
            onClick={() => onSuggestionClick(suggestion.text)}
            className="w-full flex items-center gap-3 text-left rounded-md transition-colors duration-200 group"
          >
            <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-[#00BF53] transition-colors" />
            <span className="text-sm text-gray-700 group-hover:text-[#00BF53]">{suggestion.text}</span>
          </button>
        ))}
      </div>
      
      {/* Search Input */}
      {/* <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="relative">
          <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Ask anything about Indian markets"
              className="flex-1 bg-transparent border-0 outline-none text-sm text-gray-600 placeholder-gray-400"
            />
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-gray-400" />
              <MapPin className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        </div>
      </div> */}
    </div>
  );
}