import { Box, Typography, ToggleButtonGroup, ToggleButton } from "@mui/material";
import Header from "../../../components/layout/PublicHeader";
import prefinalicon from "../assets/icon/prefinalicon.svg";
import finalyearicon from "../assets/icon/finalyearicon.svg";
import Professionalicon from "../assets/icon/Professionalicon.svg";
import passedouticon from "../assets/icon/passedouticon.svg";
import { useState } from "react";

interface StudentOption {
    value: string;
    label: string;
    icon: string;
}

const Userdetails = () => {
    const [studentType, setStudentType] = useState<string>("prefinal");

    const handleTypeChange = (event: React.MouseEvent<HTMLElement>, newType: string | null) => {
        if (newType !== null) setStudentType(newType);
    };

    const studentOptions: StudentOption[] = [
        { value: "prefinal", label: "Pre-Final Student", icon: prefinalicon },
        { value: "final", label: "Final Year Student", icon: finalyearicon },
        { value: "graduate", label: "Graduate / Recently Passed Out", icon: passedouticon },
        { value: "professional", label: "Working Professional", icon: Professionalicon },
    ];

    return (
        <>
            <Header />
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    textAlign: "center",
                    mt: 5,
                    px: 2,
                }}
            >
                <Typography
                    sx={{
                        fontSize: { xs: "16px", md: "20px" },
                        fontStyle: "italic",
                        fontWeight: 700,
                    }}
                >
                    Tell us a bit about you so we can personalize your learning journey!
                </Typography>
            </Box>
            <Box display="flex" justifyContent="center" mt={6}>
                <ToggleButtonGroup
                    value={studentType}
                    exclusive
                    onChange={handleTypeChange}
                    sx={{
                        flexWrap: "wrap",
                        justifyContent: "center",
                        "& .MuiToggleButton-root": {
                            borderRadius: "8px",
                            px: 3,
                            width: 300,
                            py: 2,
                            textTransform: "none",
                            m: 1,
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            flexDirection: "row",
                            bgcolor: "#FFFFFF",
                            "&.Mui-selected": {
                                flexDirection: "column",
                                bgcolor: "#FFFFFF",
                            },
                        },
                    }}
                >
                    {studentOptions.map((option) => (
                        <ToggleButton key={option.value} value={option.value}>
                            <img src={option.icon} alt={option.label} style={{ width: 25, height: 25 }} />
                            {option.label}
                        </ToggleButton>
                    ))}
                </ToggleButtonGroup>
            </Box>
        </>
    );
};

export default Userdetails;