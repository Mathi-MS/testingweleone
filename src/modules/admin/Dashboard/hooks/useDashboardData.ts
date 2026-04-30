import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../../app/store";
import {
  getDashboardBatchReportThunk,
  getAIDailyUsageThunk,
  getAssessmentResultsThunk,
  getBrochureHistoryThunk,
  getContactInquiryThunk,
  getCourseLeadThunk,
} from "../../../../features/report/reportSlice";

export const useDashboardData = (selectedToken: string) => {
  const dispatch = useDispatch<any>();
  const {
    dashboardCourseData,
    dashboardMasterclassData,
    aiUsageData,
    assessmentResults,
    assessmentCount,
    brochureHistory,
    brochureHistoryCount,
    contactInquiry,
    contactInquiryCount,
    courseLead,
    courseLeadCount,
    loading,
    error,
  } = useSelector((state: RootState) => state.report);

  useEffect(() => {
    dispatch(getDashboardBatchReportThunk({ page: 0, size: 1000, isMasterClass: false }));
    dispatch(getDashboardBatchReportThunk({ page: 0, size: 1000, isMasterClass: true }));
    const today = new Date().toISOString().split("T")[0];
    dispatch(getAIDailyUsageThunk({ date: today }));
    dispatch(getAssessmentResultsThunk({ page: 1, limit: 1000 }));
    dispatch(getBrochureHistoryThunk({}));
    dispatch(getContactInquiryThunk({}));
    dispatch(getCourseLeadThunk({}));
  }, [dispatch]);

  useEffect(() => {
    const getDateFilter = () => {
      const today = new Date().toISOString().split("T")[0];
      if (selectedToken === "Today") return { date: today };
      if (selectedToken === "Last 7 days") {
        const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0];
        return { dateFrom: sevenDaysAgo, dateTo: today };
      }
      if (selectedToken === "Last 30 days") {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0];
        return { dateFrom: thirtyDaysAgo, dateTo: today };
      }
      return {};
    };
    dispatch(getAIDailyUsageThunk(getDateFilter()));
  }, [selectedToken, dispatch]);

  return {
    dashboardCourseData,
    dashboardMasterclassData,
    aiUsageData,
    assessmentResults,
    assessmentCount,
    brochureHistory,
    brochureHistoryCount,
    contactInquiry,
    contactInquiryCount,
    courseLead,
    courseLeadCount,
    loading,
    error,
  };
};
