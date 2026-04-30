import {
  UsersThree,
  BookOpen,
  Chalkboard,
  Robot,
  DownloadSimple,
  Envelope,
  UsersFour,
} from "@phosphor-icons/react";
import { ReactNode } from "react";

export const getDateLabel = (daysAgo: number) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const DATE_OPTIONS = [
  { label: "Today", daysAgo: 0 },
  { label: "Yesterday", daysAgo: 1 },
  { label: getDateLabel(2), daysAgo: 2 },
  { label: getDateLabel(3), daysAgo: 3 },
  { label: getDateLabel(4), daysAgo: 4 },
];

export const TOKEN_OPTIONS = ["Today", "Last 7 days", "Last 30 days"];

export const TABS = [
  { key: "all", label: "All" },
  { key: "Total Registrations", label: "Total Registrations" },
  { key: "Course Enrollments", label: "Course Enrollments" },
  { key: "Masterclass Enrollments", label: "Masterclass Enrollments" },
  {
    key: "Token Consumed in Website AI",
    label: "Token Consumed in Website AI",
  },
  { key: "Career Compass", label: "Career Compass" },
  { key: "Brochure Downloads", label: "Brochure Downloads" },
  { key: "Contact Inquiry", label: "Contact Inquiry" },
  { key: "Course Lead", label: "Course Lead" },
] as const;

export type TabKey = (typeof TABS)[number]["key"];

export type StatItem = {
  icon: ReactNode;
  title: string;
  value: string;
  change: string;
  positive: boolean;
  highlight: string;
};

export const getInitialStats = (): StatItem[] => [
  {
    icon: <UsersThree size={20} color="#6b7280" />,
    title: "Total Registrations",
    value: "1,780",
    change: "+15%",
    positive: true,
    highlight: "#00BF53",
  },
  {
    icon: <BookOpen size={20} color="#6b7280" />,
    title: "Course Enrollments",
    value: "512",
    change: "-15%",
    positive: false,
    highlight: "#00BF53",
  },
  {
    icon: <Chalkboard size={20} color="#6b7280" />,
    title: "Masterclass Enrollments",
    value: "320",
    change: "+15%",
    positive: true,
    highlight: "#00BF53",
  },
  {
    icon: <Robot size={20} color="#6b7280" />,
    title: "Token Consumed in Website AI",
    value: "10,525",
    change: "-15%",
    positive: false,
    highlight: "#00BF53",
  },
  {
    icon: <Robot size={20} color="#6b7280" />,
    title: "Career Compass",
    value: "10,525",
    change: "-15%",
    positive: false,
    highlight: "#00BF53",
  },
  {
    icon: <DownloadSimple size={20} color="#6b7280" />,
    title: "Brochure Downloads",
    value: "0",
    change: "+0%",
    positive: true,
    highlight: "#00BF53",
  },
  {
    icon: <Envelope size={20} color="#6b7280" />,
    title: "Contact Inquiry",
    value: "0",
    change: "+0%",
    positive: true,
    highlight: "#00BF53",
  },
  {
    icon: <UsersFour size={20} color="#6b7280" />,
    title: "Course Lead",
    value: "0",
    change: "+0%",
    positive: true,
    highlight: "#00BF53",
  },
];

export const TABLE_COLUMNS: Record<TabKey, { key: string; label: string }[]> = {
  all: [
    { key: "metric", label: "Metric" },
    { key: "value", label: "Value" },
    { key: "change", label: "Change" },
    { key: "trend", label: "Trend" },
  ],
  "Total Registrations": [
    { key: "metric", label: "Metric" },
    { key: "value", label: "Total Registrations" },
    { key: "change", label: "Change" },
    { key: "trend", label: "Trend" },
  ],
  "Course Enrollments": [
    { key: "sNo", label: "S.No" },
    { key: "batchName", label: "Batch Name" },
    { key: "batchId", label: "Batch ID" },
    { key: "userName", label: "User Name" },
    { key: "email", label: "Email" },
    { key: "mobileNumber", label: "Mobile" },
    { key: "learnerId", label: "Learner ID" },
    { key: "userId", label: "User ID" },
    { key: "userType", label: "User Type" },
    { key: "source", label: "Source" },
    { key: "date", label: "Date" },
    { key: "time", label: "Time" },
    { key: "paymentType", label: "Payment Type" },
  ],
  "Masterclass Enrollments": [
    { key: "sNo", label: "S.No" },
    { key: "batchName", label: "Batch Name" },
    { key: "batchId", label: "Batch ID" },
    { key: "userName", label: "User Name" },
    { key: "email", label: "Email" },
    { key: "mobileNumber", label: "Mobile" },
    { key: "learnerId", label: "Learner ID" },
    { key: "userId", label: "User ID" },
    { key: "userType", label: "User Type" },
    { key: "source", label: "Source" },
    { key: "date", label: "Date" },
    { key: "time", label: "Time" },
    { key: "paymentType", label: "Payment Type" },
  ],
  "Token Consumed in Website AI": [
    { key: "metric", label: "Metric" },
    { key: "value", label: "Token Consumed" },
    { key: "change", label: "Change" },
    { key: "trend", label: "Trend" },
  ],
  "Career Compass": [
    { key: "sNo", label: "S.No" },
    { key: "userId", label: "User ID" },
    { key: "username", label: "Username" },
    { key: "fullName", label: "Full Name" },
    { key: "email", label: "Email" },
    { key: "mobileNumber", label: "Mobile" },
    { key: "primaryTrack", label: "Primary Track" },
    { key: "secondaryTrack", label: "Secondary Track" },
    { key: "completedAt", label: "Completed At" },
  ],
  "Brochure Downloads": [
    { key: "sNo", label: "S.No" },
    { key: "name", label: "Name" },
    { key: "mobileNumber", label: "Mobile" },
    { key: "batchName", label: "Batch Name" },
    { key: "downloadedAt", label: "Downloaded At" },
  ],
  "Contact Inquiry": [
    { key: "sNo", label: "S.No" },
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "mobileNo", label: "Mobile" },
    { key: "createdAt", label: "Created At" },
  ],
  "Course Lead": [
    { key: "sNo", label: "S.No" },
    { key: "name", label: "Name" },
    { key: "mobileNo", label: "Mobile" },
    { key: "batchNames", label: "Batch Names" },
    { key: "createdAt", label: "Created At" },
  ],
};
