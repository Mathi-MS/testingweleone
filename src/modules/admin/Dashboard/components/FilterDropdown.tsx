import { useRef, useEffect } from "react";

interface FilterDropdownProps {
  isOpen: boolean;
  onToggle: () => void;
  selected: string;
  onSelect: (value: string) => void;
  options: string[] | { label: string; daysAgo: number }[];
  minWidth?: string;
}

const pillStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "4px",
  background: "#f0fdf4",
  border: "1px solid #bbf7d0",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "12px",
  color: "#00BF53",
  fontWeight: 600,
  padding: "3px 8px",
  lineHeight: 1.5,
  whiteSpace: "nowrap",
  width: "80px",
};

const dropdownStyle: React.CSSProperties = {
  position: "absolute",
  right: 0,
  top: "30px",
  zIndex: 50,
  background: "#fff",
  border: "1px solid #e5e7eb",
  borderRadius: "10px",
  boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
  overflow: "hidden",
};

export const FilterDropdown = ({
  isOpen,
  onToggle,
  selected,
  onSelect,
  options,
  minWidth = "150px",
}: FilterDropdownProps) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node) && isOpen)
        onToggle();
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [isOpen, onToggle]);

  const getLabel = (opt: string | { label: string; daysAgo: number }) =>
    typeof opt === "string" ? opt : opt.label;

  return (
    <div
      style={{ position: "relative", flexShrink: 0 }}
      ref={ref}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        style={pillStyle}
      >
        {selected} <span style={{ fontSize: "9px" }}>▾</span>
      </button>
      {isOpen && (
        <div style={{ ...dropdownStyle, minWidth }}>
          {options.map((opt, i) => {
            const label = getLabel(opt);
            return (
              <button
                key={i}
                onClick={() => {
                  onSelect(label);
                  onToggle();
                }}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  padding: "9px 16px",
                  fontSize: "13px",
                  border: "none",
                  cursor: "pointer",
                  borderBottom:
                    i < options.length - 1 ? "1px solid #f3f4f6" : "none",
                  background: selected === label ? "#f0fdf4" : "transparent",
                  color: selected === label ? "#00BF53" : "#374151",
                  fontWeight: selected === label ? 600 : 400,
                }}
                onMouseEnter={(e) => {
                  if (selected !== label)
                    e.currentTarget.style.background = "#f9fafb";
                }}
                onMouseLeave={(e) => {
                  if (selected !== label)
                    e.currentTarget.style.background = "transparent";
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
