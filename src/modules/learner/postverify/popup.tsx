import * as React from "react";
import {
  Dialog,
  DialogContent,
  IconButton,
  Typography,
  Box,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Slide from "@mui/material/Slide";
import { TransitionProps } from "@mui/material/transitions";

import careercompassimg from "../assets/image/careercompassimg.svg";

interface AlertDialogSlideProps {
  open: boolean;
  onClose: () => void;
}

const Transition = React.forwardRef<
  unknown,
  TransitionProps & {
    children: React.ReactElement<any, any>;
  }
>(function Transition(props, ref) {
  return (
    <Slide
      direction="down"
      ref={ref}
      {...props}
      timeout={800}
    />
  );
});

export default function AlertDialogSlide({ open, onClose }: AlertDialogSlideProps) {
  return (
    <Dialog
      open={open}
      TransitionComponent={Transition}
      keepMounted
      onClose={onClose}
      sx={{
        "& .MuiDialog-container": {
          alignItems: "flex-start",   
          justifyContent: "flex-end", 
        }
      }}
      PaperProps={{
        sx: {
          mt: 10,
          borderRadius: "12px",
          padding: { xs: "14px", sm: "18px", md: "24px" },
          width: { xs: "90%", sm: "600px", md: "600px" },
          maxWidth: "100%",
          transition: "transform 10s ease, opacity 0.2s ease",
        },
      }}
    >
      <IconButton
        onClick={onClose}
        sx={{ position: "absolute", top: 8, right: 8 }}
      >
        <CloseIcon />
      </IconButton>

      <DialogContent sx={{ mt: 2 }}>
        <Box
          display="flex"
          alignItems="center"
          gap={3}
          flexDirection={{ xs: "column", sm: "row" }}
          textAlign={{ xs: "center", sm: "left" }}
        >
          <img
            src={careercompassimg}
            alt="career-path"
            style={{
              width: "140px",
              maxWidth: "100%",
              height: "auto",
            }}
          />

          <Box flex={1}>
            <Typography
              variant="h6"
              fontWeight={600}
              sx={{
                color: "#005AFF",
                pb: 2,
                textAlign: { xs: "center", sm: "left" },
              }}
            >
              Why Career Compass?
            </Typography>

            <Box
              sx={{
                backgroundColor: "#EDF3FD",
                borderRadius: "12px",
                padding: "16px",
                lineHeight: "1.5",
                fontFamily: "Satoshi",
                fontSize: { xs: "13px", sm: "14px" },
              }}
            >
              Your answers help us identify the best-fit career roles for you,
              <br />
              highlight skill gaps, and create a personalized growth roadmap.
            </Box>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}