import React from "react";
import { Paperclip, Mic, ArrowUp, LucideArrowUpRight, Square, X, Check } from "lucide-react";

interface ChatInputAreaProps {
  inputValue: string;
  setInputValue: (value: string) => void;
  handleSend: () => void;
  className?: string;
  showSuggestions?: boolean;
  isStreaming?: boolean;
  handleStop?: () => void;
}

export const ChatInputArea: React.FC<ChatInputAreaProps> = ({
  inputValue,
  setInputValue,
  handleSend,
  className = "",
  showSuggestions = false,
  isStreaming = false,
  handleStop,
}) => {
  const [isFocused, setIsFocused] = React.useState(false);
  const [isRecordingMode, setIsRecordingMode] = React.useState(false);
  const recognitionRef = React.useRef<any>(null);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
      }
    }
  }, []);

  React.useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.onresult = (event: any) => {
        let currentTranscript = "";
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setInputValue(currentTranscript);
      };
      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsRecordingMode(false);
      };
      recognitionRef.current.onend = () => {
        setIsRecordingMode(false);
      };
    }
  }, [setInputValue]);

  const handleMicClick = () => {
    if (recognitionRef.current) {
      try {
        setInputValue("");
        recognitionRef.current.start();
        setIsRecordingMode(true);
      } catch (e) {
        console.error("Speech recognition start error", e);
      }
    } else {
      alert("Microphone is not supported in this browser.");
    }
  };

  const handleCancelMic = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecordingMode(false);
    setInputValue("");
  };

  const handleTick = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecordingMode(false);
    // Use setTimeout so the state can settle, but we can also just call handleSend if there's text
    if (inputValue.trim()) {
      handleSend();
    }
  };

  return (
    <div className={`px-3 sm:px-6 bg-white pb-4 ${className}`}>
      <div className="max-w-3xl mx-auto">
        <div className="relative flex items-center bg-white border-[1.5px] border-[#00BF53] rounded-full transition-shadow px-2 py-1 sm:py-2 min-h-[48px]">
          {/* <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-50">
        {showSuggestions && isFocused && (
          <div className="bg-white rounded-t-[20px] rounded-b-none border border-gray-200 border-b-0 shadow-sm p-4 ">
            <div className="space-y-3">
              <button
                onMouseDown={(e) => {
                  e.preventDefault();
                  setInputValue("Summarize this session.");
                }}
                className="w-full flex items-center gap-3 text-left rounded-md transition-colors duration-200 group"
              >
                <LucideArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-[#00BF53]" />
                <span className="text-sm text-gray-700 group-hover:text-[#00BF53]">
                  Summarize this session.
                </span>
              </button>
            </div>
          </div>
        )}
        <div
          className={`relative flex items-center bg-white border border-gray-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-shadow px-4 py-3 ${showSuggestions && isFocused ? "rounded-b-[30px]" : "rounded-full"}`}
        >
          <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-50">
            <Paperclip className="w-5 h-5" />
          </button> */}

          <input
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              if (isRecordingMode) {
                if (recognitionRef.current) recognitionRef.current.stop();
                setIsRecordingMode(false);
              }
            }}
            onClick={() => {
              if (isRecordingMode) {
                if (recognitionRef.current) recognitionRef.current.stop();
                setIsRecordingMode(false);
              }
            }}
            onKeyDown={(e) => e.key === "Enter" && !isStreaming && inputValue.trim() && handleSend()}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={isRecordingMode ? "Listening..." : "Start your learning journey..."}
            className="flex-1 ml-1 sm:ml-2 mr-2 sm:mr-3 bg-transparent border-none outline-none text-gray-700 placeholder:text-gray-400 text-sm sm:text-base min-h-[24px]"
          />

          <div className="flex items-center gap-1 sm:gap-2">
            {isRecordingMode ? (
              <>
                <button
                  onClick={handleCancelMic}
                  className="p-2 rounded-full transition-all duration-200 bg-red-100 text-red-600 hover:bg-red-200 min-w-[40px] min-h-[40px] flex items-center justify-center"
                  title="Cancel Recording"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <button
                  onClick={handleTick}
                  disabled={!inputValue.trim()}
                  className={`p-2 rounded-full transition-all duration-200 min-w-[40px] min-h-[40px] flex items-center justify-center ${inputValue.trim()
                    ? "bg-green-100 text-green-600 hover:bg-green-200"
                    : "bg-gray-100 text-gray-300 cursor-not-allowed"
                    }`}
                  title="Send Message"
                >
                  <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </>
            ) : isStreaming ? (
              <button
                onClick={handleStop}
                className="p-1 rounded-full transition-all duration-200 bg-green-100 text-[#00BF53] hover:bg-green-200 min-w-[40px] min-h-[40px] flex items-center justify-center"
                title="Stop AI Response"
              >
                <Square className="w-4 h-4 fill-current" />
              </button>
            ) : (
              <>
                <button
                  onClick={handleMicClick}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-50 min-w-[40px] min-h-[40px] flex items-center justify-center"
                  title="Voice Input"
                >
                  <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <button
                  onClick={handleSend}
                  disabled={!inputValue.trim()}
                  className={`p-2 rounded-full transition-all duration-200 min-w-[30px] sm:min-w-[40px] min-h-[30px] sm:min-h-[40px] flex items-center justify-center ${inputValue.trim()
                    ? "bg-gray-200 text-gray-900 hover:bg-gray-300"
                    : "bg-gray-100 text-gray-300 cursor-not-allowed"
                    }`}
                >
                  <ArrowUp className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
