import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import CustomCalendar, { CalendarEvent } from "../../components/custom/CustomCalendar";
import { getSessionByBatchId, getSessionById, resetSessions } from "../../features/sessionSlice";
import { AppDispatch, RootState } from "../../app/store";
import { fetchLearnerBatches } from "../../features/learnerBatchesSlice";
import { useAppSelector } from "../../app/hook";
import { clearsessionsLearner, fetchSessionsByLearner } from "../../features/batchSlice";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatTime = (time: string): string => {
  if (!time) return "";
  const [hourStr, minuteStr] = time.split(":");
  let hour = parseInt(hourStr, 10);
  const minute = minuteStr;
  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  return `${hour}:${minute} ${ampm}`;
};

// ─── Component ────────────────────────────────────────────────────────────────

const LearnerCalendar: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { batches } = useAppSelector((state: any) => state.learnerBatches);
  const { sessions } = useAppSelector((state: any) => state.session);
  const { userDetails } = useSelector((state: RootState) => state.ar);
  const { sessionsLearner } = useSelector((state: RootState) => state.batch);
  // Fetch enrolled batches for this learner on mount
  useEffect(() => {
    const learnerId = userDetails?.id;
    if (learnerId) {
      dispatch(fetchLearnerBatches({ learnerId, page: 0, size: 100 }));
    }
  }, [dispatch, userDetails?.id]);

  // Handle batch selection → fetch sessions for that batch
const handleBatchChange = (batchId: string | "all") => {
  const learnerId = userDetails?.id;

  console.log("Batch Selected:", batchId);
  console.log("Learner ID:", learnerId);

  if (!learnerId) {
    console.warn("❌ learnerId is missing");
    return;
  }

  if (batchId === "all") {

    dispatch(clearsessionsLearner());
  } else {
    console.log("✅ Calling API");

    dispatch(
      fetchSessionsByLearner({
        batchId,
        learnerId,
        page: 0,
        size: 50,
      })
    );
  }
};
  
  // Convert raw sessions → CalendarEvent[]
const events: CalendarEvent[] = useMemo(() => {
  if (!sessionsLearner || sessionsLearner.length === 0) return [];
  const now = new Date();

  return sessionsLearner.map((session: any) => {
    const eventDate =
      session.isRescheduled && session.rescheduleDate
        ? session.rescheduleDate
        : session.sessionDate;

    const startTime =
      session.isRescheduled && session.rescheduleStartTime
        ? session.rescheduleStartTime
        : session.sessionStartTime;

    const endTime =
      session.isRescheduled && session.rescheduleEndTime
        ? session.rescheduleEndTime
        : session.sessionEndTime;

    const sessionDateTime = new Date(`${eventDate}T${startTime}`);

    const learnerInfo = session.learnerDetails?.[0];
    const isPresent = learnerInfo?.isPresent ?? false;
    const isDropOff = learnerInfo?.isDropOff ?? false;
    const isCompleted = session.isCompleted ?? false;
    let type: "completed" | "upcoming" | "leave" | "dropOff";

    if (isDropOff) {
      // ⭐ Highest priority
      type = "dropOff";
    } else if (isCompleted) {
      type = "completed"; // ✅ force green if completed
    } else if (sessionDateTime > now) {
      type = "upcoming";
    } else if (isPresent) {
      type = "completed";
    } else {
      type = "leave";
    }

    return {
      id: session.id,
      title: session.sessionName,
      date: eventDate,
      time: formatTime(startTime),
      endTime: formatTime(endTime),
      type,
    } as CalendarEvent;
  });
}, [sessionsLearner]);

  // ── Navigate on session card click ──
  const handleEventClick = (event: CalendarEvent) => {
    if (event.id) {
      dispatch(getSessionById(event.id) as any);
      // navigate(`/session/${event.id}`);
      navigate(`/session/${event.id}`, { state: { from: "calendar" } });
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <CustomCalendar
        batches={batches ?? []}
        onBatchChange={handleBatchChange}
        events={events}
        onEventClick={handleEventClick}
      />
    </div>
  );
};

export default LearnerCalendar;