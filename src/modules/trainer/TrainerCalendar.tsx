import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../app/store";
import { useAppSelector } from "../../app/hook";
import { getSessionByBatchId, getSessionById, resetSessions } from "../../features/sessionSlice";
import { getBatchByTrainerId } from "../../features/trainerSlice";
import CustomCalendar, { CalendarEvent } from "../../components/custom/CustomCalendar";
import { useNavigate } from "react-router-dom";

// ✅ Format "23:30:00" → "11:30 PM"
const formatTime = (time: string): string => {
  if (!time) return "";
  const [hourStr, minuteStr] = time.split(":");
  let hour = parseInt(hourStr, 10);
  const minute = minuteStr;
  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  return `${hour}:${minute} ${ampm}`;
};

const TrainerCalendar: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { batchList } = useSelector((state: any) => state.trainer);
  const { sessions } = useAppSelector((state: any) => state.session);
  const { userDetails } = useSelector((state: RootState) => state.ar);
  const navigate = useNavigate();
  // Fetch batches for this trainer on mount
  useEffect(() => {
    if (userDetails?.id) {
      dispatch(getBatchByTrainerId({ page: 0, size: 100, trainerId: userDetails.id }));
    }
  }, [userDetails?.id, dispatch]);

  // Handle batch selection → fetch sessions for that batch
  const handleBatchChange = (batchId: string | "all") => {
     if (batchId === "all") {
        dispatch(resetSessions()); 
      } else {
        dispatch(getSessionByBatchId({ batchId, page: 0, size: 50 }));
      }
  };

  // Convert raw sessions → CalendarEvent[]
  const events: CalendarEvent[] = useMemo(() => {
    if (!sessions || sessions.length === 0) return [];
    const now = new Date();

    return sessions.map((session: any) => {
      const eventDate =
        session.isRescheduled && session.rescheduleDate
          ? session.rescheduleDate
          : session.sessionDate;

      const startTime =
        session.isRescheduled && session.rescheduleStartTime
          ? session.rescheduleStartTime
          : session.sessionStartTime;

      const sessionDateTime = new Date(`${eventDate}T${startTime}`);

      return {
        id: session.id,
        title: session.sessionName,
        date: eventDate,
        time: formatTime(startTime),
        type: sessionDateTime < now ? "completed" : "upcoming",
      } as CalendarEvent;
    });
  }, [sessions]);

    // ── Navigate on session card click ──
    const handleEventClick = (event: CalendarEvent) => {
      if (event.id) {
        dispatch(getSessionById(event.id) as any);
        navigate(`/session/${event.id}`);
      }
    };

  return (
    <div style={{ padding: "20px" }}>
      <CustomCalendar
        batches={batchList ?? []}
        onBatchChange={handleBatchChange}
        events={events}
        onEventClick={handleEventClick}
      />
    </div>
  );
};

export default TrainerCalendar;