const BAR_DATA = [3, 5, 4, 6, 7];

interface MiniBarChartProps {
  highlight: string;
}

export const MiniBarChart = ({ highlight }: MiniBarChartProps) => (
  <div
    style={{
      display: "flex",
      alignItems: "flex-end",
      gap: "3px",
      height: "40px",
    }}
  >
    {BAR_DATA.map((h, i) => (
      <div
        key={i}
        style={{
          width: "10px",
          height: `${(h / 5) * 100}%`,
          borderRadius: "2px",
          backgroundColor: i === BAR_DATA.length - 1 ? highlight : "#e5e7eb",
        }}
      />
    ))}
  </div>
);
