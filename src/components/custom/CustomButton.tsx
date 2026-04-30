import Button from "@mui/material/Button";
import { CustomButtonStyles } from "./CustomStyles";
import { CustomButtonProps } from "../../theme/Custom";

const CustomButton: React.FC<CustomButtonProps> = ({
  type,
  variant,
  startIcon,
  endIcon,
  size,
  label,
  loading,
  disabled,
  boxSx,
  onClick,
  sx,
}) => {
  return (
    <Button
      variant={variant}
      type={type}
      startIcon={startIcon}
      endIcon={endIcon}
      size={size}
      loading={loading}
      onClick={onClick}
      disabled={disabled}
      sx={{
        ...CustomButtonStyles,

        ...(variant === "contained" && {
          backgroundColor: "var(--primary)",
          color: "white",
          "&:hover": { opacity: .8 },
        }),

        ...(variant === "outlined" && {
          borderColor: "var(--primary)",
          color: "var(--primary)",
          backgroundColor: "transparent",
          "&:hover": {
            backgroundColor: "var(--primary)",
            color: "white",
          },
        }),

        ...boxSx,
        ...sx,
      }}
    >
      {label}
    </Button>
  );
};

export default CustomButton;
