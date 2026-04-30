import React, { useMemo, useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  useTheme,
  useMediaQuery,
  FormControl,
  Select,
  MenuItem,
  Tooltip,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { ChevronLeft, ChevronRight, XCircle ,UserPlusIcon, UserPlus} from "lucide-react";
import activesession from "../../../src/assets/icon/activesession.svg";
import upcomingicon from "../../../src/assets/icon/upcomingicon.svg";

// ─── Types ────────────────────────────────────────────────────────────────────

type EventType = "completed" | "upcoming" |  "leave" | "dropOff";

export interface CalendarEvent {
  id?: string ;
  title: string;
  date: string;
  time: string;
  endTime?: string;
  type: EventType;
}

export interface BatchOption {
  id: string ;
  batchName: string;
}

export interface CustomCalendarProps {
  batches?: BatchOption[];
  onBatchChange?: (batchId: string | "all") => void;
  events?: CalendarEvent[];
  defaultBatch?: string | "all";
  onEventClick?: (event: CalendarEvent) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

interface DayCell {
  date: number | "";
  fullDate?: Date;
  events: CalendarEvent[];
}

const daysHeader = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const getCalendarDays = (year: number, month: number): DayCell[] => {
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0);
  const days: DayCell[] = [];
  const startDay = start.getDay();

  for (let i = 0; i < startDay; i++) {
    days.push({ date: "", events: [] });
  }
  for (let i = 1; i <= end.getDate(); i++) {
    days.push({ date: i, fullDate: new Date(year, month, i), events: [] });
  }
  return days;
};

// ─── Component ────────────────────────────────────────────────────────────────

const CustomCalendar: React.FC<CustomCalendarProps> = ({
  batches = [],
  onBatchChange,
  events = [],
  defaultBatch = "all",
  onEventClick,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const today = new Date();
  const [currentDate, setCurrentDate] = useState(today);
  const [selectedBatch, setSelectedBatch] = useState<string | "all">(defaultBatch);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const monthLabel = currentDate.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  const handleBatchChange = (e: any) => {
    const value = e.target.value;
    setSelectedBatch(value);
    onBatchChange?.(value);
  };

  const calendarDays = useMemo(() => {
    const days = getCalendarDays(year, month);

    return days.map((day) => {
      if (!day.fullDate) return day;

      const dayEvents = events.filter((e) => {
        const eventDate = new Date(e.date + "T00:00:00");
        return eventDate.toDateString() === day.fullDate!.toDateString();
      });

      return { ...day, events: dayEvents };
    });
  }, [year, month, events]);

  return (
    <Box>
      {/* ── Header ── */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          gap: 1,
          mb: 2,
        }}
      >
        <Box>
          <Typography variant="h5" fontWeight={600}>
            {monthLabel}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Click on any session to view details
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            width: { xs: "100%", sm: "auto" },
            justifyContent: { xs: "space-between", sm: "flex-end" },
          }}
        >
          {/* {batches.length > 0 && ( */}
            <FormControl size="small" sx={{ minWidth: 300, maxWidth: 300 }}>
              <Select
                value={selectedBatch}
                onChange={handleBatchChange}
                IconComponent={ExpandMoreIcon}
                sx={{
                  fontSize: "12px",
                  height: 39,
                  mr: 1,
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#D1D5DB",
                    borderWidth: "1px",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#D1D5DB",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#D1D5DB",
                  },
                  "& .MuiSvgIcon-root": {
                    color: "#D1D5DB",
                    fontSize: 18,
                    right: 8,
                  },
                }}
              >
                <MenuItem value="all" sx={{ fontSize: "12px" }}>
                  All Batches
                </MenuItem>
                {batches.map((b) => (
                  <MenuItem key={b.id} value={String(b.id)} sx={{ fontSize: "12px" }}>
                    {b.batchName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          {/* )} */}

          {/* Legend */}
          <Box
            sx={{
              display: "flex",
              gap: 1,
              flexWrap: "wrap",
              justifyContent: { xs: "space-between", sm: "flex-start" },
              width: { xs: "100%", sm: "auto" },
            }}
          >
            <LegendBadge icon={activesession} label="Completed" color="#22c55e" />
            <LegendBadge icon={upcomingicon} label="Upcoming" color="#3b82f6" />
            <LegendBadge icon={UserPlusIcon} label="DropOff" color="#F59E0B" />
            <LegendBadge icon={XCircle} label="Leave" color="#DC2626" />
          </Box>

          {/* Month navigation */}
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <IconButton onClick={handlePrevMonth}>
              <ChevronLeft size={18} />
            </IconButton>
            <IconButton onClick={handleNextMonth}>
              <ChevronRight size={18} />
            </IconButton>
          </Box>
        </Box>
      </Box>

      {/* ── Calendar Grid ── */}
      <Box
        sx={{
          border: "1px solid #E5E7EB",
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        <Box sx={{ overflowX: { xs: "auto", md: "hidden" } }}>
          {/* Days Header */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(7, minmax(120px, 1fr))",
              minWidth: { xs: 840, md: "100%" },
              borderBottom: "1px solid #E5E7EB",
              position: "sticky",
              top: 0,
              bgcolor: "#fff",
              zIndex: 1,
            }}
          >
            {daysHeader.map((day, index) => (
              <Box
                key={day}
                sx={{
                  p: { xs: 1, md: 2 },
                  textAlign: "center",
                  fontWeight: 600,
                  fontSize: { xs: 12, md: 14 },
                  bgcolor: index === 0 ? "#FAFBFC" : "#F8FAFC",
                  borderRight: index !== 6 ? "1px solid #E5E7EB" : "none",
                }}
              >
                {isMobile ? day.slice(0, 3) : day}
              </Box>
            ))}
          </Box>

          {/* Days Grid */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(7, minmax(120px, 1fr))",
              minWidth: { xs: 840, md: "100%" },
            }}
          >
            {calendarDays.map((day, index) => {
              const isToday =
                day.fullDate &&
                today.toDateString() === day.fullDate.toDateString();
              const isLastColumn = index % 7 === 6;

              return (
                <Box
                  key={index}
                  sx={{
                    minHeight: { xs: 90, md: 120 },
                    p: { xs: 0.5, md: 1 },
                    position: "relative",
                    borderRight: !isLastColumn ? "1px solid #E5E7EB" : "none",
                    borderBottom: "1px solid #E5E7EB",
                    bgcolor:
                      index % 7 === 0 ? "#FAFBFC" : isToday ? "#f0fdf4" : "#fff",
                  }}
                >
                  {day.date !== "" && (
                    <Typography
                      variant="caption"
                      sx={{ fontSize: { xs: 10, md: 12 } }}
                    >
                      {day.date}
                    </Typography>
                  )}

                  {isToday && (
                    <Box
                      sx={{
                        position: "absolute",
                        top: 6,
                        right: 6,
                        width: 20,
                        height: 20,
                        bgcolor: "#00BF53",
                        color: "#fff",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 10,
                      }}
                    >
                      {day.date}
                    </Box>
                  )}

                {day.events.map((event, i) => (
  <Box
    key={i}
    onClick={() => onEventClick?.(event)}
    sx={{
      mt: 0.5,
      p: { xs: 0.5, md: 1 },
      borderRadius: 1,
      fontSize: { xs: 10, md: 12 },
      position: "relative",
      cursor: onEventClick ? "pointer" : "default",
      // ✅ leave → red background
     bgcolor:
  event.type === "completed"
    ? "#d1fae5"
    : event.type === "leave"
    ? "#fee2e2"
    : event.type === "dropOff"
    ? "rgba(245, 158, 11, 0.2)"
    : "#dbeafe",
      transition: "all 0.15s ease",
      "&:hover": onEventClick ? { opacity: 0.8, transform: "scale(1.02)" } : {},
    }}
  >
    <Box
      sx={{
        position: "absolute",
        right: 10,
        top: "50%",
        transform: "translateY(-50%)",
        height: "70%",
        width: 6,
        borderRadius: "999px",
        // ✅ leave → red indicator
       bgcolor:
  event.type === "completed"
    ? "#22c55e"
    : event.type === "leave"
    ? "#DC2626"
    : event.type === "dropOff"
    ? "#F59E0B"   // ✅ ADD THIS
    : "#3b82f6",
      }}
    />
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      {event.type === "dropOff" ? (
    <UserPlus size={16} color="#F59E0B" />   // 🟠 DropOff
  ) : event.type === "leave" ? (
    <XCircle size={16} color="#DC2626" />    // 🔴 Leave
  ) : (
    <img
      src={event.type === "completed" ? activesession : upcomingicon}
      alt={event.type}
      style={{ width: 14, height: 14 }}
    />
  )}
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "start" }}>
        <Tooltip title={event.title} placement="top" arrow>
          <Typography
            sx={{
              fontSize: { xs: 10, md: 12 },
              fontWeight: 700,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: "100px",
              cursor: onEventClick ? "pointer" : "default",
            }}
          >
            {event.title}
          </Typography>
        </Tooltip>
        <Typography
          variant="caption"
          sx={{ fontSize: { xs: 9, md: 11 }, fontWeight: 400 }}
        >
          {event.time}{event.endTime ? ` - ${event.endTime}` : ""}
        </Typography>
      </Box>
    </Box>
  </Box>
))}
                </Box>
              );
            })}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

// ─── Legend Badge ─────────────────────────────────────────────────────────────

const LegendBadge: React.FC<{ icon: any; label: string; color: string }> = ({
  icon:Icon,
  label,
  color,
}) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      gap: 0.8,
      px: { xs: 1, sm: 2 },
      py: { xs: 0.4, sm: 0.5 },
      borderRadius: "6px",
      bgcolor: "#F1F5F9",
      position: "relative",
      flex: { xs: "1 1 48%", sm: "unset" },
      minWidth: 120,
    }}
  >
     {typeof Icon === "string" ? (
      <img src={Icon} alt={label} style={{ width: 14, height: 14 }} />
    ) : (
      <Icon size={14} color={color} />
    )}
    <Typography sx={{ fontSize: { xs: 11, sm: 13 }, fontWeight: 500 }}>
      {label}
    </Typography>
    <Box
      sx={{
        position: "absolute",
        right: 6,
        width: 5,
        height: { xs: 16, sm: 20 },
        borderRadius: "999px",
        bgcolor: color,
      }}
    />
  </Box>
);

export default CustomCalendar;