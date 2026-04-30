import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";

interface CategoryFilterProps {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  selectedCourseTypes?: string[];
  onCourseTypesChange?: (types: string[]) => void;
}

export function CategoryFilter({
  categories,
  activeCategory,
  onCategoryChange,
  selectedCourseTypes = [],
  onCourseTypesChange,
}: CategoryFilterProps) {
  const categoriesScrollRef = useRef<HTMLDivElement>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const courseTypes = [
    "EDUCATORS",
    "FRESHERS",
    "WORKING_PROFESSIONALS",
    "STUDENTS",
  ];

  const formatCourseType = (type: string) =>
    type
      .split("_")
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(" ");

  const scrollCategories = (direction: string) => {
    if (!categoriesScrollRef.current) return;
    categoriesScrollRef.current.scrollBy({
      left: direction === "left" ? -200 : 200,
      behavior: "smooth",
    });
  };

  const toggleCourseType = (type: string) => {
    if (!onCourseTypesChange) return;
    const isSelected = selectedCourseTypes.includes(type);
    onCourseTypesChange(isSelected ? [] : [type]);
    setIsDropdownOpen(false);
  };

  return (
    <div className="relative mb-4">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4 w-full">
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="py-2 rounded-full text-sm font-semibold text-[#00BF53] flex items-center gap-2 whitespace-nowrap"
          >
            {selectedCourseTypes.length > 0
              ? formatCourseType(selectedCourseTypes[0])
              : "All Course Types"}
            <ChevronDown className="w-4 h-4" />
          </button>
          {isDropdownOpen && (
            <div className="absolute top-full mt-2 bg-white border rounded-lg shadow-lg z-10 min-w-[200px]">
              {courseTypes.map((type) => {
                const isSelected = selectedCourseTypes.includes(type);
                return (
                  <button
                    key={type}
                    onClick={() => toggleCourseType(type)}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                      isSelected
                        ? "bg-green-50 text-[#00BF53] font-medium"
                        : "text-gray-700"
                    }`}
                  >
                    {formatCourseType(type)}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-hidden w-full">
            <button
          onClick={() => scrollCategories("left")}
          className="py-2 flex-shrink-0"
        >
          <ChevronLeft className="text-gray-300" />
        </button>

        <div
          ref={categoriesScrollRef}
          className="flex gap-3 overflow-x-auto scrollbar-hide"
          style={{ scrollbarWidth: "none", width: "100%" }}
        >
          {categories.map((category) => {
            const isActive = activeCategory === category;
            return (
              <div
                key={category}
                onClick={() => onCategoryChange(category)}
                className={`px-4 py-2 rounded-full text-xs font-medium border cursor-pointer whitespace-nowrap transition-colors ${
                  isActive
                    ? "bg-green-100 text-green-800 border-green-200"
                    : "text-gray-500 border-gray-200 hover:bg-green-100 hover:text-green-800 hover:border-green-200"
                }`}
              >
                {category.replace(/_/g, " ")}
              </div>
            );
          })}
        </div>

        <button
          onClick={() => scrollCategories("right")}
          className="py-2 flex-shrink-0"
        >
          <ChevronRight className="text-gray-300" />
        </button>
        </div>
      </div>
    </div>
  );
}
