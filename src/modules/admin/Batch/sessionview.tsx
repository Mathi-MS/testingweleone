import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  Divider,
  Chip,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  Stack,
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";

interface SessionDetail {
  id: string;
  name: string;
  day: string;
  date: string;
  time: string;
  actualStart: string;
  actualEnd: string;
  trainerJoin: string;
  trainerOut: string;
  topics: string;
}

interface ContentItem {
  id: number;
  title: string;
  description: string;
  duration: string;
}

const sessionData: SessionDetail = {
  id: "SE001",
  name: "Alpha Batch",
  day: "Tuesday",
  date: "26-12-2025",
  time: "1 hr 15 mins",
  actualStart: "11:00 AM",
  actualEnd: "12:15 PM",
  trainerJoin: "10:55 AM",
  trainerOut: "12:20 PM",
  topics: "Req. Empty, Table + More...",
};

const contentList: ContentItem[] = [
  {
    id: 1,
    title: "Introduction & Welcome",
    description: "Course overview and introduction",
    duration: "03:00",
  },
  {
    id: 2,
    title: "React Hooks Overview",
    description: "Understanding hooks and usage",
    duration: "12:00",
  },
  {
    id: 3,
    title: "useState Deep Dive",
    description: "State handling patterns",
    duration: "18:00",
  },
  {
    id: 4,
    title: "useEffect Explained",
    description: "Side effects and lifecycle",
    duration: "15:00",
  },
  {
    id: 5,
    title: "Practical Examples",
    description: "Hands-on coding session",
    duration: "20:00",
  },
];

const SessionView: React.FC = () => {
  const [tab, setTab] = useState(0);

  return (
    <Box p={3}>
      {/* Breadcrumb */}
      <Typography variant="body2" color="text.secondary">
        Batch / Session / View
      </Typography>

      {/* Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mt={2}
      >
        <Typography variant="h6">{sessionData.id}</Typography>
        <Stack direction="row" spacing={2}>
          <Button variant="outlined">Cancel</Button>
          <Button variant="contained" color="success">
            Save
          </Button>
        </Stack>
      </Box>

      {/* Session Details */}
      <Paper sx={{ p: 2, mt: 3 }}>
        <Grid container spacing={3}>
          {/* <Grid item xs={12} md={6}>
            <Typography><b>ID:</b> {sessionData.id}</Typography>
            <Typography><b>Day:</b> {sessionData.day}</Typography>
            <Typography><b>Time:</b> {sessionData.time}</Typography>
            <Typography>
              <b>Session Actual Start Time:</b> {sessionData.actualStart}
            </Typography>
            <Typography>
              <b>Trainer In Time:</b> {sessionData.trainerJoin}
            </Typography>
          </Grid> */}

          {/* <Grid item xs={12} md={6}>
            <Typography><b>Name:</b> {sessionData.name}</Typography>
            <Typography><b>Date:</b> {sessionData.date}</Typography>
            <Typography>
              <b>Topics Covered:</b> {sessionData.topics}
            </Typography>
            <Typography>
              <b>Session Actual End Time:</b> {sessionData.actualEnd}
            </Typography>
            <Typography>
              <b>Trainer Out Time:</b> {sessionData.trainerOut}
            </Typography>
          </Grid> */}
        </Grid>
      </Paper>

      {/* Recording */}
      <Box mt={4}>
        <Typography variant="subtitle1" fontWeight={600}>
          Session Recording
        </Typography>

        <Paper
          sx={{
            mt: 2,
            height: 320,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "#111",
            color: "#fff",
          }}
        >
          <Stack alignItems="center" spacing={1}>
            <PlayArrowIcon sx={{ fontSize: 60 }} />
            <Typography>Click to play recording</Typography>
          </Stack>
        </Paper>
      </Box>

      {/* Tabs */}
      <Box mt={4}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label="Content Mapped" />
          <Tab label="Assessment" />
          <Tab label="Attendance" />
          <Tab label="Comments (0)" />
          <Tab label="Trainer Chat (0)" />
        </Tabs>

        <Divider sx={{ mb: 2 }} />

        {/* Content Mapped */}
        {tab === 0 && (
          <Paper>
            <List>
              {contentList.map((item, index) => (
                <React.Fragment key={item.id}>
                  <ListItem>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Chip
                            label={item.duration}
                            size="small"
                            color="success"
                          />
                          <Typography fontWeight={600}>
                            {item.title}
                          </Typography>
                        </Box>
                      }
                      secondary={item.description}
                    />
                  </ListItem>
                  {index !== contentList.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        )}
      </Box>
    </Box>
  );
};

export default SessionView;
