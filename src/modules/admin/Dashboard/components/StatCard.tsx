import { ReactNode } from "react";
import { MiniBarChart } from "./MiniBarChart";

interface StatCardProps {
  icon: ReactNode;
  title: string;
  value: string;
  change: string;
  positive: boolean;
  highlight: string;
  subtitle: string;
  loading?: boolean;
  onClick: () => void;
  filterComponent?: ReactNode;
}

export const StatCard = ({
  icon,
  title,
  value,
  change,
  positive,
  highlight,
  subtitle,
  loading,
  onClick,
  filterComponent,
}: StatCardProps) => (
  <div
    onClick={onClick}
    style={{
      backgroundColor: "#FEFEFE",
      borderRadius: "12px",
      padding: "16px",
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.18)",
      minHeight: "140px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      cursor: "pointer",
      transition: "all 0.2s",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15)";
      e.currentTarget.style.transform = "translateY(-2px)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.18)";
      e.currentTarget.style.transform = "translateY(0)";
    }}
  >
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: "16px",
      }}
    >
      <div
        style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1 }}
      >
        {icon}
        <span style={{ fontSize: "13px", color: "#374151", fontWeight: "500" }}>
          {title}
        </span>
      </div>
      {filterComponent || (
        <span
          style={{
            fontSize: "18px",
            color: "#9ca3af",
            cursor: "pointer",
            lineHeight: 1,
            flexShrink: 0,
          }}
        >
          ···
        </span>
      )}
    </div>

    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
      }}
    >
      <div>
        <div
          style={{
            fontSize: "28px",
            fontWeight: "700",
            color: "#111827",
            lineHeight: 1,
            marginBottom: "6px",
          }}
        >
          {loading ? "..." : value}
        </div>
        <div
          style={{
            fontSize: "12px",
            color: positive ? "#16a34a" : "#dc2626",
            fontWeight: "500",
          }}
        >
          {change}{" "}
          <span style={{ color: "#9ca3af", fontWeight: "400" }}>
            {subtitle}
          </span>
        </div>
      </div>
      <MiniBarChart highlight={highlight} />
    </div>
  </div>
);
