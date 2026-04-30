import { LayoutGrid, List } from "lucide-react";

interface ViewToggleProps {
  viewMode: "grid" | "list";
  onViewChange: (mode: "grid" | "list") => void;
}

export const ViewToggle = ({ viewMode, onViewChange }: ViewToggleProps) => (
  <div
    style={{
      display: "flex",
      background: "#f3f4f6",
      borderRadius: "8px",
      padding: "3px",
      gap: "2px",
      flexShrink: 0,
    }}
  >
    <button
      onClick={() => onViewChange("grid")}
      title="Grid view"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "32px",
        height: "32px",
        borderRadius: "6px",
        border: "none",
        cursor: "pointer",
        background: viewMode === "grid" ? "#fff" : "transparent",
        color: viewMode === "grid" ? "#00BF53" : "#9ca3af",
        boxShadow: viewMode === "grid" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
        transition: "all 0.15s",
      }}
    >
      <LayoutGrid size={16} />
    </button>
    <button
      onClick={() => onViewChange("list")}
      title="List view"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "32px",
        height: "32px",
        borderRadius: "6px",
        border: "none",
        cursor: "pointer",
        background: viewMode === "list" ? "#fff" : "transparent",
        color: viewMode === "list" ? "#00BF53" : "#9ca3af",
        boxShadow: viewMode === "list" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
        transition: "all 0.15s",
      }}
    >
      <List size={16} />
    </button>
  </div>
);
