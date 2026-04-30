import {
  Box,
  Typography,
  Checkbox,
  TextField,
  Chip,
  Slider,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import CustomButton from "./CustomButton";
import { useFilter } from "../../contexts/FilterContext";
import { fetchMicroLearnFilterData } from "../../features/chapterSlice";
import { useAppDispatch } from "../../app/hook";
import { GET_MICROLEARN_FILTER_DATA } from "../../graphql/queries/chapterQueries";
import { mlClient } from "../../graphql/client";

interface FilterItem {
  id: string;
  name: string;
}

interface FilterSection {
  title: string;
  count?: number;
  items?: FilterItem[];
  type: "checkbox" | "duration"| "daterange";
}

interface CustomFilterProps {
  open: boolean;
  onClose: () => void;
  json?: FilterSection[];
  onFilterChange?: (filters: any) => void;
}

const CustomFilter = ({
  open,
  onClose,
  json,
  onFilterChange,
}: CustomFilterProps) => {
  const dispatch = useAppDispatch();
  const { selectedFilters, setSelectedFilters } = useFilter();
  const [filterSections, setFilterSections] = useState<FilterSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState("");
  const [popupSelectedFilters, setPopupSelectedFilters] = useState<{
    [key: string]: string[];
  }>({});

  // duration state (minutes)
  const [durationRange, setDurationRange] = useState<number[]>([0, 120]);
  // UI time strings
  const [fromTime, setFromTime] = useState("00:00:00");
  const [toTime, setToTime] = useState("02:00:00");

  const [viewAllOpen, setViewAllOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<FilterSection | null>(null);
  const [searchText, setSearchText] = useState("");
  const [activeLetter, setActiveLetter] = useState<string | null>(null);

  /* ---------- POPUP STATE (ISOLATED) ---------- */
  const [popupApiData, setPopupApiData] = useState<any>(null);
  const [popupLoading, setPopupLoading] = useState(false);
  const [isDurationApplied, setIsDurationApplied] = useState(false);

  /* ---------- INFINITE SCROLL STATE ---------- */
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  /* ---------------- HELPERS ---------------- */

  const minutesToTime = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`;
  };

  const timeToMinutes = (time: string) => {
    const [h = 0, m = 0] = time.split(":").map(Number);
    return h * 60 + m;
  };

  // Debounce helper
  const debounce = useCallback((func: Function, delay: number) => {
    let timeoutId: ReturnType<typeof setTimeout>;
    return (...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  }, []);

  const emitFilters = (range = durationRange) => {
    onFilterChange?.({
      ...selectedFilters,
      duration: {
        from: String(range[0]),
        to: String(range[1]),
      },
    });
  };
  
  const DEFAULT_RANGE: number[] = [0, 120];
  const DEFAULT_FROM = "00:00:00";
  const DEFAULT_TO = "02:00:00";

  const handleResetDuration = () => {
    setDurationRange(DEFAULT_RANGE);
    setFromTime(DEFAULT_FROM);
    setToTime(DEFAULT_TO);
    setIsDurationApplied(false);
    const newFilters = { ...selectedFilters };
    delete newFilters.duration;
    onFilterChange?.(newFilters);
  };

  const handleResetAll = () => {
    setSelectedFilters({});
    setPopupSelectedFilters({});
    setDurationRange(DEFAULT_RANGE);
    setFromTime(DEFAULT_FROM);
    setToTime(DEFAULT_TO);
    setIsDurationApplied(false);
      setSelectedDate("");
    onFilterChange?.({});
  };

  /* ---------------- EFFECTS ---------------- */

  useEffect(() => {
    if (selectedFilters?.duration) {
      const from = Number(selectedFilters.duration.from);
      const to = Number(selectedFilters.duration.to);
      setDurationRange([from, to]);
      setFromTime(minutesToTime(from));
      setToTime(minutesToTime(to));
      setIsDurationApplied(true);
    } else {
      setDurationRange(DEFAULT_RANGE);
      setFromTime(DEFAULT_FROM);
      setToTime(DEFAULT_TO);
      setIsDurationApplied(false);
    }
  }, [open]);

  useEffect(() => {
    if (json) {
      setFilterSections(json);
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [json]);

  const handleApplyDuration = () => {
    setIsDurationApplied(true);
    onFilterChange?.({
      ...selectedFilters,
      duration: {
        from: String(durationRange[0]),
        to: String(durationRange[1]),
      },
    });
  };

  /* ---------------- HANDLERS ---------------- */

  const handleCheckboxChange = (
    sectionTitle: string,
    itemId: string,
    checked: boolean
  ) => {
    if (viewAllOpen) {
      // ✅ POPUP ONLY
      setPopupSelectedFilters((prev) => {
        const updated = { ...prev };
        if (!updated[sectionTitle]) updated[sectionTitle] = [];

        updated[sectionTitle] = checked
          ? [...updated[sectionTitle], itemId]
          : updated[sectionTitle].filter((id) => id !== itemId);

        return updated;
      });
    } else {
      // ✅ BACKGROUND FILTER
      setSelectedFilters((prev: any) => {
        const updated = { ...prev };
        if (!updated[sectionTitle]) updated[sectionTitle] = [];

        updated[sectionTitle] = checked
          ? [...updated[sectionTitle], itemId]
          : updated[sectionTitle].filter((id: any) => id !== itemId);

        const filters: any = { ...updated };
        if (isDurationApplied) {
          filters.duration = {
            from: String(durationRange[0]),
            to: String(durationRange[1]),
          };
        } else {
          delete filters.duration;
        }
        onFilterChange?.(filters);
        return updated;
      });
    }
  };
const handleApplyDate = (dateValue: string) => {
  if (!dateValue) return;
  const filters: any = { ...selectedFilters, updatedAt: dateValue };
  setSelectedFilters(filters);
  onFilterChange?.(filters);
};

const handleResetDate = () => {
  setSelectedDate("");
  const filters: any = { ...selectedFilters };
  delete filters.updatedAt;
  setSelectedFilters(filters);
  onFilterChange?.(filters);
};
  /* ---------- POPUP ITEMS (FROM API OR BASE) ---------- */

  const popupItems: FilterItem[] = useMemo(() => {
    if (!activeSection) return [];

    if (!popupApiData) return activeSection.items || [];

    if (activeSection.title === "Course") {
      return (
        popupApiData.course?.data?.map((i: any) => ({
          id: i.id,
          name: i.courseTitle,
        })) || []
      );
    }

    if (activeSection.title === "Book") {
      return (
        popupApiData.book?.data?.map((i: any) => ({
          id: i.id,
          name: i.bookTitle,
        })) || []
      );
    }

    if (activeSection.title === "Microlearning") {
      return (
        popupApiData.microlearn?.data?.map((i: any) => ({
          id: i.id,
          name: i.microLearnTitle,
        })) || []
      );
    }

    if (activeSection.title === "Chapter") {
      return (
        popupApiData.chapter?.data?.map((i: any) => ({
          id: i.id,
          name: i.chapterTitle,
        })) || []
      );
    }

    return [];
  }, [popupApiData, activeSection]);

  const filteredItems = useMemo(() => {
    const itemsToFilter = popupItems.length > 0 ? popupItems : (activeSection?.items || []);
    
    return itemsToFilter.filter((item) => {
      const matchSearch = item.name
        .toLowerCase()
        .includes(searchText.toLowerCase());
      const matchLetter = activeLetter
        ? item.name[0]?.toUpperCase() === activeLetter
        : true;
      return matchSearch && matchLetter;
    });
  }, [popupItems, activeSection, searchText, activeLetter]);

  const groupedItems = useMemo(() => 
    filteredItems.reduce<Record<string, FilterItem[]>>(
      (acc, item) => {
        const letter = item.name[0]?.toUpperCase() || "#";
        acc[letter] = acc[letter] || [];
        acc[letter].push(item);
        return acc;
      },
      {}
    ), [filteredItems]);

  const hasDataForLetter = useCallback((letter: string) => {
    return groupedItems[letter]?.length > 0;
  }, [groupedItems]);

  /* ---------------- RENDER ---------------- */
  
 const openViewAll = (section: FilterSection) => {
  setActiveSection(section);
  setPopupSelectedFilters({ ...selectedFilters });
  setSearchText("");
  setActiveLetter(null);
  setViewAllOpen(true);
  setCurrentPage(0);
  setHasMoreData(true);
  setPopupApiData(null);

  // ✅ Only fetch from API if no static items provided
  if (!section.items || section.items.length === 0) {
    fetchPopupAlphabetData(null, "", 0, true);
  } else {
    setPopupLoading(false); // static items ready immediately
  }
};

  const applyViewAll = () => {
    setSelectedFilters(popupSelectedFilters);
    const filters: any = { ...popupSelectedFilters };
    if (isDurationApplied) {
      filters.duration = {
        from: String(durationRange[0]),
        to: String(durationRange[1]),
      };
    } else {
      delete filters.duration;
    }
    onFilterChange?.(filters);
    setViewAllOpen(false);
  };

  // ✅ UPDATED: Support pagination and append mode
  const fetchPopupAlphabetData = async (
    alphabet: string | null,
    searchText: any,
    page: number = 0,
    resetData: boolean = false
  ) => {
    try {
      if (resetData) {
        setPopupLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      const { data } = await mlClient.query({
        query: GET_MICROLEARN_FILTER_DATA,
        variables: {
          page: page,
          size: 20,
          alphabet: alphabet,
          searchtext: searchText || null,
        },
        fetchPolicy: "no-cache",
      });

      const newData = (data as any).getMicroLearnFilterData;

      // ✅ Check if we have more data based on active section
      let receivedCount = 0;
      if (activeSection?.title === "Course") {
        receivedCount = newData?.course?.data?.length || 0;
      } else if (activeSection?.title === "Book") {
        receivedCount = newData?.book?.data?.length || 0;
      } else if (activeSection?.title === "Microlearning") {
        receivedCount = newData?.microlearn?.data?.length || 0;
      } else if (activeSection?.title === "Chapter") {
        receivedCount = newData?.chapter?.data?.length || 0;
      }

      setHasMoreData(receivedCount === 20);

      if (resetData) {
        // ✅ First load - replace data
        setPopupApiData(newData);
      } else {
        // ✅ Load more - append data
        setPopupApiData((prev: any) => {
          if (!prev) return newData;

          return {
            course: {
              count: newData.course?.count || prev.course?.count || 0,
              data: [...(prev.course?.data || []), ...(newData.course?.data || [])],
            },
            book: {
              count: newData.book?.count || prev.book?.count || 0,
              data: [...(prev.book?.data || []), ...(newData.book?.data || [])],
            },
            microlearn: {
              count: newData.microlearn?.count || prev.microlearn?.count || 0,
              data: [...(prev.microlearn?.data || []), ...(newData.microlearn?.data || [])],
            },
            chapter: {
              count: newData.chapter?.count || prev.chapter?.count || 0,
              data: [...(prev.chapter?.data || []), ...(newData.chapter?.data || [])],
            },
          };
        });
      }
    } catch (err) {
      console.error("Popup alphabet fetch failed", err);
      setHasMoreData(false);
    } finally {
      setPopupLoading(false);
      setIsLoadingMore(false);
    }
  };

  // ✅ DEBOUNCED INFINITE SCROLL HANDLER
  const handleScroll = useCallback(debounce((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    
    if (isLoadingMore || !hasMoreData || !activeSection) {
      return;
    }

    const { scrollTop, scrollHeight, clientHeight } = target;
    const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;
    
    // ✅ Trigger when user scrolls to 90% of content
    if (scrollPercentage > 0.9) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchPopupAlphabetData(activeLetter, searchText, nextPage, false);
    }
  }, 150), [currentPage, isLoadingMore, hasMoreData, activeSection, activeLetter, searchText]);

  // ✅ Debounced search/alphabet change
  useEffect(() => {
    if (!viewAllOpen || !activeSection) return;

    const handler = setTimeout(() => {
      setCurrentPage(0);
      setHasMoreData(true);
      fetchPopupAlphabetData(activeLetter, searchText, 0, true);
    }, 400);

    return () => clearTimeout(handler);
  }, [searchText, activeLetter, viewAllOpen, activeSection]);

  const totalFilterItems = useMemo(() => {
    return filterSections.reduce(
      (sum, section) => sum + (section.count || 0),
      0
    );
  }, [filterSections]);

  return (
    <Box
      sx={{
        width: open ? 280 : 0,
        transition: "0.3s",
        height: "100vh",
        display: open ? "flex" : "none",
        flexDirection: "column",
        marginTop: "55px",
      }}
    >
      <Box
        sx={{
          border: "1.3px solid var(--greybordertwo)",
          px: 2,
          py: 1,
          borderRadius: "6px",
          mt: 2,
        }}
      >
        <Box display="flex" justifyContent="space-between">
          <Typography
            fontSize={14}
            sx={{
              cursor: "pointer",
              "&:hover": {
                color: "var(--primary)",
              },
            }}
            onClick={handleResetAll}
            fontWeight={600}
          >
            Reset
          </Typography>
          <Typography fontSize={12} color="var(--primary)" fontWeight={600}>
            {totalFilterItems} items
          </Typography>
        </Box>
      </Box>

      <Box sx={{ flexGrow: 1, overflowY: "auto", py: 1 }}>
        {loading ? (
          <Typography textAlign="center">Loading...</Typography>
        ) : (
          filterSections.map((section, idx) => (
            <Box
              key={idx}
              sx={{
                px: 2,
                py: 1.5,
                border: "1.3px solid var(--greybordertwo)",
                borderRadius: "10px",
                mb: 2,
                overflow: "hidden",
                position: "relative",
              }}
            >
              {/* Header */}
              <Box display="flex" justifyContent="space-between">
                <Typography fontWeight={600} fontSize={14}>
                  {section.title}
                </Typography>

                {section.count && (
                  <Chip
                    label={section.count}
                    size="small"
                    sx={{
                      bgcolor: "var(--primary)",
                      color: "#fff",
                      height: 20,
                    }}
                  />
                )}
              </Box>

              {/* Checkbox Section */}
              {section.type === "checkbox" &&
               section.items?.slice(0, 4).map((item) => (
                  <Box
                    key={item.id}
                    display="flex"
                    alignItems="center"
                    sx={{
                      "& .MuiButtonBase-root": {
                        padding: "4px 10px 5px 0px",
                      },
                    }}
                  >
                    <Checkbox
                      size="small"
                      checked={selectedFilters[section.title]?.includes(
                        item.id
                      )}
                      onChange={(e) =>
                        handleCheckboxChange(
                          section.title,
                          item.id,
                          e.target.checked
                        )
                      }
                    />
                    <Typography fontSize={12}>{item.name}</Typography>
                  </Box>
                ))}
              
          {!["duration", "daterange"].includes(section.type) && (
                <Typography
                  sx={{
                    textAlign: "right",
                    fontFamily: "DMSans",
                    fontWeight: 600,
                    fontSize: 12,
                    display: "flex",
                    justifyContent: "end",
                  }}
                >
                  <Box
                    onClick={() => openViewAll(section)}
                    sx={{ cursor: "pointer" }}
                  >
                    View all
                  </Box>
                </Typography>
              )}
              {section.type === "daterange" && (   // ✅ clean, separate block
  <Box mt={1.5}>
    <TextField
      type="date"
      size="small"
      fullWidth
      value={selectedDate}
      onChange={(e) => setSelectedDate(e.target.value)}
      InputLabelProps={{ shrink: true }}
      sx={{ "& .MuiOutlinedInput-root": { fontSize: 12, height: 36 } }}
    />
    <Box display="flex" justifyContent="space-between" mt={1.5}>
      <Box
        onClick={handleResetDate}
        sx={{
          px: 2, py: 0.7, borderRadius: "6px", cursor: "pointer",
          fontSize: 13, fontWeight: 600,
          border: "1px solid var(--primary)", color: "var(--primary)",
        }}
      >
        Reset
      </Box>
      <Box
        onClick={() => handleApplyDate(selectedDate)}
        sx={{
          px: 2, py: 0.7, borderRadius: "6px", cursor: "pointer",
          fontSize: 13, fontWeight: 600,
          bgcolor: selectedDate ? "var(--primary)" : "var(--greyborder)",
          color: "#fff",
          pointerEvents: selectedDate ? "auto" : "none",
        }}
      >
        Apply
      </Box>
    </Box>
  </Box>
)}
              
              {/* Duration Section */}
              {section.type === "duration" && (
                <Box mt={2}>
                  {/* Inputs */}
                  <Box display="flex" gap={2} mb={2}>
                    <TextField
                      label="From"
                      size="small"
                      value={fromTime}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFromTime(val);
                        const min = timeToMinutes(val);
                        setDurationRange([
                          Math.min(min, durationRange[1]),
                          durationRange[1],
                        ]);
                      }}
                    />

                    <TextField
                      label="To"
                      size="small"
                      value={toTime}
                      onChange={(e) => {
                        const val = e.target.value;
                        setToTime(val);
                        const max = timeToMinutes(val);
                        setDurationRange([
                          durationRange[0],
                          Math.max(max, durationRange[0]),
                        ]);
                      }}
                    />
                  </Box>

                  {/* Slider */}
                  <Slider
                    value={durationRange}
                    min={0}
                    max={240}
                    valueLabelDisplay="auto"
                    sx={{
                      color: "var(--primary)",
                      "& .MuiSlider-track": {
                        backgroundColor: "var(--primary)",
                        height: 4,
                      },
                      "& .MuiSlider-thumb": {
                        backgroundColor: "var(--primary)",
                        width: 14,
                        height: 14,
                      },
                      "& .MuiSlider-rail": {
                        backgroundColor: "#E0E0E0",
                        opacity: 1,
                        height: 4,
                      },
                      "& .MuiSlider-valueLabel": {
                        backgroundColor: "var(--primary)",
                        color: "#fff",
                      },
                    }}
                    onChange={(_, val) => {
                      const range = val as number[];
                      setDurationRange(range);
                      setFromTime(minutesToTime(range[0]));
                      setToTime(minutesToTime(range[1]));
                    }}
                  />

                  {/* Reset + OK Buttons */}
                  <Box display="flex" justifyContent="space-between" mt={2}>
                    <Box
                      onClick={handleResetDuration}
                      sx={{
                        px: 2,
                        py: 0.7,
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: 13,
                        fontWeight: 600,
                        border: "1px solid var(--primary)",
                        color: "var(--primary)",
                      }}
                    >
                      Reset
                    </Box>

                    <Box
                      onClick={handleApplyDuration}
                      sx={{
                        px: 2,
                        py: 0.7,
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: 13,
                        fontWeight: 600,
                        bgcolor: "var(--primary)",
                        color: "#fff",
                      }}
                    >
                      OK
                    </Box>
                  </Box>
                </Box>
              )}
            </Box>
          ))
        )}
      </Box>

      {/* POPUP MODAL */}
      {viewAllOpen && activeSection && (
        <Box
          sx={{
            position: "fixed",
            inset: 0,
            bgcolor: "rgba(0,0,0,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1300,
          }}
        >
          <Box
            sx={{
              width: 700,
              bgcolor: "#fff",
              p: 3,
              py: 4,
              borderRadius: "10px",
              minHeight: "400px",
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "row-reverse",
                gap: 2,
                mb: 2,
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              {/* Search */}
              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <TextField
                  size="small"
                  placeholder={`Search ${activeSection.title}`}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  sx={{
                    width: "100%",
                    maxWidth: 300,
                    "& .MuiOutlinedInput-root": {
                      fontSize: "12px",
                      height: 32,
                      paddingRight: "4px",
                      "& fieldset": {
                        borderColor: "var(--greyborder) !important",
                        borderRadius: 1,
                      },
                      "&:hover fieldset": {
                        borderColor: "var(--greyborder) !important",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "var(--greyborder) !important",
                        borderWidth: "1px !important",
                      },
                    },
                    "& input::placeholder": {
                      fontSize: "12px",
                    },
                  }}
                />
              </Box>

              {/* All */}
              <Box>
                <Typography
                  onClick={() => {
                    setActiveLetter(null);
                    setSearchText("");
                  }}
                  sx={{
                    cursor: "pointer",
                    fontFamily: "DMSans",
                    fontWeight: 700,
                    fontSize: 12,
                    color: "var(--textone)",
                    width: "max-content",
                  }}
                >
                  All
                </Typography>
              </Box>

              {/* Alphabet */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                <Box
                  sx={{
                    display: "flex",
                    gap: 2,
                    flexWrap: "wrap",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  {"ABCDEFGHIJKLM".split("").map((l) => {
                    const hasData = hasDataForLetter(l);
                    return (
                      <Typography
                        key={l}
                        onClick={() => {
                          if (!hasData) return;
                          setActiveLetter(l);
                        }}
                        sx={{
                          cursor: hasData ? "pointer" : "default",
                          fontFamily: "DMSans",
                          fontSize: 12,
                          fontWeight: hasData ? 700 : 400,
                          color: hasData
                            ? "var(--textone)"
                            : "var(--textlight)",
                          opacity: hasData ? 1 : 0.4,
                        }}
                      >
                        {l}
                      </Typography>
                    );
                  })}
                </Box>
                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                  {"NOPQRSTUVWXYZ".split("").map((l) => {
                    const hasData = hasDataForLetter(l);
                    return (
                      <Typography
                        key={l}
                        onClick={() => {
                          if (!hasData) return;
                          setActiveLetter(l);
                        }}
                        sx={{
                          cursor: hasData ? "pointer" : "default",
                          fontFamily: "DMSans",
                          fontSize: 12,
                          fontWeight: hasData ? 700 : 400,
                          color: hasData
                            ? "var(--textone)"
                            : "var(--textlight)",
                          opacity: hasData ? 1 : 0.4,
                        }}
                      >
                        {l}
                      </Typography>
                    );
                  })}
                </Box>
              </Box>
            </Box>

            {/* Items List with Infinite Scroll */}
            <Box 
              ref={scrollContainerRef}
              onScroll={handleScroll}
              sx={{ 
                minHeight: 300, 
                maxHeight: 300, 
                overflowY: "auto",
                position: "relative"
              }}
            >
              {popupLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
                  <CircularProgress size={30} />
                </Box>
              ) : Object.keys(groupedItems).length > 0 ? (
                <>
                  {Object.keys(groupedItems).map((letter) => (
                    <Box key={letter}>
                      <Typography fontWeight={600}>{letter}</Typography>
                      {groupedItems[letter].map((item) => (
                        <Box
                          key={item.id}
                          sx={{ display: "flex", gap: 1, alignItems: "center" }}
                        >
                          <Checkbox
                            size="small"
                            checked={popupSelectedFilters[
                              activeSection.title
                            ]?.includes(item.id)}
                            onChange={(e) =>
                              handleCheckboxChange(
                                activeSection.title,
                                item.id,
                                e.target.checked
                              )
                            }
                          />
                          <Typography
                            sx={{
                              cursor: "pointer",
                              fontFamily: "DMSans",
                              fontWeight: 600,
                              fontSize: 12,
                              color: "var(--textone)",
                            }}
                          >
                            {item.name}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  ))}
                  
                  {/* Loading More Indicator */}
                  {isLoadingMore && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                      <CircularProgress size={24} />
                    </Box>
                  )}
                  
                  {/* No More Data Indicator */}
                  {!hasMoreData && filteredItems.length > 0 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                      <Typography fontSize={12} color="textSecondary">
                        No more items
                      </Typography>
                    </Box>
                  )}
                </>
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
                  <Typography color="textSecondary">No items found</Typography>
                </Box>
              )}
            </Box>

            {/* Action Buttons */}
            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
              <CustomButton
                type="button"
                variant="outlined"
                label="Close"
                boxSx={{ width: "max-content", minWidth: "120px" }}
                onClick={() => {
                  if (!activeSection) { setViewAllOpen(false); return; }
                  const cleared = { ...selectedFilters };
                  delete cleared[activeSection.title];
                  setSelectedFilters(cleared);
                  setPopupSelectedFilters(cleared);
                  onFilterChange?.(cleared);
                  setViewAllOpen(false);
                }}
              />
              <CustomButton
                type="button"
                variant="contained"
                label="Apply Filter"
                boxSx={{ width: "max-content", minWidth: "120px" }}
                onClick={applyViewAll}
              />
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default CustomFilter;