import React from "react";

const formatDate = (dateStr: string) =>
  new Date(dateStr.replace(" IST", "").replace(" UTC", "")).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  );

const formatDateTime = (dateStr: string) => {
  const date = new Date(dateStr.replace(" IST", "").replace(" UTC", ""));
  const dateFormatted = date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const timeFormatted = date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  return `${dateFormatted}, ${timeFormatted}`;
};

export const mapCareerCompassData = (assessmentResults: any[]) =>
  assessmentResults.map((result, index) => ({
    sNo: index + 1,
    userId: result.userId,
    username: result.username || "-",
    email: result.email || "-",
    mobileNumber: result.mobileNumber || "-",
    fullName: result.fullName || "-",
    primaryTrack: result.primaryTrack,
    secondaryTrack: result.secondaryTrack,
    completedAt: result.completedAt ? formatDate(result.completedAt) : "-",
  }));

export const mapEnrollmentData = (data: any) => {
  if (!data?.data) return [];
  const rows = data.data.flatMap((batch: any) => {
    if (!batch.usereportresponse || batch.usereportresponse.length === 0)
      return [];
    return batch.usereportresponse.map((user: any) => ({
      batchName: batch.batchName || "-",
      batchId: batch.batchId || "-",
      userName: user.userName || "-",
      email: user.email || "-",
      mobileNumber: user.mobileNumber || "-",
      learnerId: user.learnerId || "-",
      userId: user.userId || "-",
      userType: user.userType || "-",
      source: user.source || "-",
      date: user.date || "-",
      time: user.time || "-",
      paymentType: batch.paymentType || "-",
      batchStartDate: batch.batchStartDate || "-",
      batchEndDate: batch.batchEndDate || "-",
      updatedAt: batch.updatedAt ? formatDate(batch.updatedAt) : "-",
    }));
  });
  return rows.map((row: any, index: number) => ({ sNo: index + 1, ...row }));
};

export const mapStatsData = (
  stats: any[],
  getSubtitle: (title: string) => string,
) =>
  stats.map((stat) => ({
    metric: stat.title,
    value: stat.value,
    change: (
      <span
        style={{
          color: stat.positive ? "#16a34a" : "#dc2626",
          fontWeight: 600,
        }}
      >
        {stat.change}
      </span>
    ),
    trend: (
      <span style={{ color: "#9ca3af", fontSize: "12px" }}>
        {getSubtitle(stat.title)}
      </span>
    ),
  }));

export const mapBrochureHistoryData = (data: any[]) =>
  data.map((item, index) => ({
    sNo: index + 1,
    name: item.name || "-",
    email: item.email || "-",
    mobileNumber: item.mobileNumber || "-",
    batchName: item.batchName || "-",
    downloadedAt: item.downloadedAt ? formatDateTime(item.downloadedAt) : "-",
  }));

export const mapContactInquiryData = (data: any[]) =>
  data.map((item, index) => ({
    sNo: index + 1,
    name: item.name || "-",
    email: item.email || "-",
    mobileNo: item.mobileNo || "-",
    isActive: item.isActive ? "Active" : "Inactive",
    createdAt: item.createdAt ? formatDateTime(item.createdAt) : "-",
  }));

export const mapCourseLeadData = (data: any[]) =>
  data.map((item, index) => ({
    sNo: index + 1,
    name: item.name || "-",
    email: item.email || "-",
    mobileNo: item.mobileNo || "-",
    batchNames: item.batchDetails?.length
      ? item.batchDetails.map((b: any) => b.batchName).join(", ")
      : "-",
    isActive: item.isActive ? "Active" : "Inactive",
    createdAt: item.createdAt ? formatDateTime(item.createdAt) : "-",
  }));
