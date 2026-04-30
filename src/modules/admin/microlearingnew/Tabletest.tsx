import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  IconButton,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { Add, Delete, Edit, Remove } from "@mui/icons-material";
import { useDispatch } from "react-redux";
import { useAppSelector } from "../../../app/hook";
import {
  clearModules,
  fetchAllModules,
  sessionCourseMappingThunk,
} from "../../../features/batchSlice";
import CustomButton from "../../../components/custom/CustomButton";
import { deleteSessionThunk, getSessionByBatchId } from "../../../features/sessionSlice";

/* ------------------ CONSTANTS ------------------ */
const cellSx = {
  fontSize: 12,
  padding: "6px 10px",
  border: "1px solid #e0e0e0",
  borderLeft: 0,
  borderTop: 0,
};

const headSx = {
  ...cellSx,
  fontWeight: 600,
  backgroundColor: "#fafafa",
  fontSize: 11,
};

const commonTableCellSx = {
  whiteSpace: "nowrap",
  fontFamily: "DM-Medium !important",
  fontSize: "12px",
  padding: "6px 16px",
  // border: "solid 1px var(--greybordertwo)",
  borderLeft: "0",
  borderTop: "0",
  color: "var(--text)",
  "&:last-child": {
    borderRight: "0",
  },
};

/* ------------------ COMPONENT ------------------ */
const SessionMappingTable = ({ batchId }: any) => {
  const dispatch = useDispatch();
  const { modules = [],batchedit } = useAppSelector((state: any) => state.batch);
  const { sessions } = useAppSelector((state: any) => state.session);



  /* ---------- FETCH DATA ---------- */
  useEffect(() => {
    if (batchedit?.courseId) {
       
      dispatch(
        fetchAllModules({
          courseIds: batchedit.courseId
        }) as any
      );
    }
  }, [dispatch, batchedit?.courseId]);
//   useEffect(() => {
//   dispatch(clearModules());

//   return () => {
//     dispatch(clearModules()); // also clear on unmount
//   };
// }, []);

  // Refetch sessions whenever batchId changes or component mounts
  useEffect(() => {
    if (batchId) {
      dispatch(
        getSessionByBatchId({
          batchId,
          page: 0,
          size: 100,
        }) as any
      );
    }
  }, [dispatch, batchId]);

  /* ---------- EXPAND STATE ---------- */
  const [openCourseId, setOpenCourseId] = useState<string | null>(null);
  const [openBookId, setOpenBookId] = useState<string | null>(null);
  const [openChapterId, setOpenChapterId] = useState<string | null>(null);

  /* ---------- MAP STATE ---------- */
  const [selectedSessions, setSelectedSessions] = useState<any>({});
  const [mappedSessions, setMappedSessions] = useState<any>({});
  const [editMode, setEditMode] = useState<any>({});

  // Clear local state when component unmounts
  useEffect(() => {
    return () => {
      setSelectedSessions({});
      setMappedSessions({});
      setEditMode({});
      setOpenCourseId(null);
      setOpenBookId(null);
      setOpenChapterId(null);
    };
  }, []);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogAction, setDialogAction] =
    useState<"MAP" | "UPDATE" | "UNMAP">("MAP");
  const [activeKey, setActiveKey] = useState("");

  const getKey = (...args: string[]) => args.join("-");

  const getPayloadFromKey = (key: string) => {
    const [type, courseId, bookId, thirdId] = key.split("-");

    const payload: any = {
      courseId,
      bookIds: [],
      chapterIds: [],
      microLearningIds: [],
    };

    if (type === "BOOK") payload.bookIds = [bookId];
    if (type === "CH") {
      payload.bookIds = [bookId];
      payload.chapterIds = [thirdId];
    }
    if (type === "ML") {
      payload.bookIds = [bookId];
      payload.microLearningIds = [thirdId];
    }

    return payload;
  };

  const getKeyFromResponse = (res: any) => {
    const { courseId, bookIds, chapterIds, microLearningIds } = res;

    if (microLearningIds?.length)
      return getKey("ML", courseId, bookIds[0], microLearningIds[0]);
    if (chapterIds?.length)
      return getKey("CH", courseId, bookIds[0], chapterIds[0]);
    if (bookIds?.length) return getKey("BOOK", courseId, bookIds[0]);

    return getKey("COURSE", courseId);
  };

  /* ---------- PRE-FILL MAPPED ---------- */
  useEffect(() => {
    if (sessions?.length) {
      const mapped: any = {};
      sessions.forEach((s: any) => {
        const key = getKeyFromResponse(s);
        mapped[key] = s.id;
      });
      setMappedSessions(mapped);
      
      // Always sync selectedSessions with mappedSessions
      setSelectedSessions((prev: any) => {
        const updated = { ...prev };
        Object.keys(mapped).forEach(key => {
          if (!updated[key]) {
            updated[key] = mapped[key];
          }
        });
        return updated;
      });
    }
  }, [sessions]);


  const handleDialogCancel = () => {
  // rollback edit mode
  if (dialogAction === "UPDATE") {
    setEditMode((p: any) => ({ ...p, [activeKey]: false }));
  }

  // optional: clear selection made during edit
  setSelectedSessions((p: any) => {
    const n = { ...p };
    delete n[activeKey];
    return n;
  });

  setDialogOpen(false);
};


const getSessionNameFromKey = (key: string) => {
  const sessionId =
    mappedSessions[key] || selectedSessions[key];

  if (!sessionId) return "";

  const session = sessions?.find((s: any) => s.id === sessionId);
  return session?.sessionName || "";
};

  /* ---------- DATA ---------- */
const data = modules.map((c: any) => ({
  id: c.id,
  name: c.courseName,
  books: c.book.map((b: any) => ({
    id: b.id,
    name: b.bookName,
    chapters: (b.chapters ?? []).map((ch: any) => ({   // ✅ book level
      id: ch.id,
      name: ch.chapterName,
    })),
    microLearn: (b.chapters ?? []).flatMap((ch: any) => // ✅ from chapters
      (ch.microLearn ?? []).map((ml: any) => ({
        id: ml.id,
        name: ml.microLearnName,
      }))
    ),
  })),
}));

  /* ---------- SESSION CELL ---------- */
  const renderSessionCell = (key: string) => {
    const value = selectedSessions[key] ?? mappedSessions[key] ?? "";
    const isMapped = !!mappedSessions[key];
    const isEditing = !!editMode[key];

    return (
      <Select
        size="small"
        fullWidth
        value={value}
        displayEmpty
        disabled={isMapped && !isEditing}
        onChange={(e) =>
          setSelectedSessions((p: any) => ({
            ...p,
            [key]: e.target.value,
          }))
        }
        MenuProps={{ disablePortal: true }}
        sx={{
          width:"160px",
    backgroundColor: "#f2f2f2",
    borderRadius: "999px",
    height: 42,
    px: 1.5,

    "& .MuiOutlinedInput-notchedOutline": {
      border: "none",
    },

    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      border: "none",
    },

    "& .MuiSelect-select": {
      display: "flex",
      alignItems: "center",
      fontWeight: 500,
      paddingLeft: "12px",
    },

    "& .MuiSelect-icon": {
      right: 12,
      color: "#333",
    },

    "&.Mui-disabled": {
      backgroundColor: "#e6e6e6",
    },
  }}
      >
        <MenuItem value="" disabled>
          Select Session
        </MenuItem>
        {sessions?.map((s: any) => (
          <MenuItem key={s.id} value={s.id}>
            {s.sessionName}
          </MenuItem>
        ))}
      </Select>
    );
  };

  /* ---------- ACTION CELL ---------- */
  const renderActionCell = (key: string) => {
    const mapped = mappedSessions[key];
    const editing = editMode[key];
    const selected = selectedSessions[key];

    if (!mapped || editing) {
      return (
        <CustomButton
          label={mapped ? "Update" : "Map"}
          size="small"
          variant="contained"
          disabled={!selected}
          onClick={() => {
            setActiveKey(key);
            setDialogAction(mapped ? "UPDATE" : "MAP");
            setDialogOpen(true);
          } } type={"button"}        />
      );
    }

   return (
  <Box display="flex" gap={1}>
    {/* EDIT (PENCIL ICON) */}
    <IconButton
      size="small"
      onClick={() =>
        setEditMode((p: any) => ({ ...p, [key]: true }))
      }
    >
      <Edit />
    </IconButton>

    {/* DELETE (TRASH ICON) */}
    <IconButton
      size="small"
      onClick={() => {
        setActiveKey(key);
        setDialogAction("UNMAP");
        setDialogOpen(true);
      }}
    >
      <Delete />
    </IconButton>
  </Box>
);

  };
const getCourseIdFromKey = (key: string) => {
  const [, courseId] = key.split("-");
  return courseId;
};

  /* ---------- CONFIRM ---------- */
  const handleSessionCourseMapping = async () => {
   if (dialogAction === "UNMAP") {
  const sessionId = mappedSessions[activeKey]; // 👈 session id
  const courseId = getCourseIdFromKey(activeKey); // 👈 course id

  if (!sessionId || !courseId) return;

  const res: any = await dispatch(
    deleteSessionThunk({
      id: sessionId,
      courseId,
    }) as any
  );

  if (res?.payload?.success === 200) {
    // remove locally only after API success
    setMappedSessions((p: any) => {
      const n = { ...p };
      delete n[activeKey];
      return n;
    });

    setSelectedSessions((p: any) => {
      const n = { ...p };
      delete n[activeKey];
      return n;
    });
  }

  setDialogOpen(false);
  return;
}
const getSessionNameFromKey = (key: string) => {
  const sessionId =
    mappedSessions[key] || selectedSessions[key];

  if (!sessionId) return "";

  const session = sessions?.find((s: any) => s.id === sessionId);
  return session?.sessionName || "";
};


    const sessionId = selectedSessions[activeKey];
    const input = getPayloadFromKey(activeKey);

    const res: any = await dispatch(
      sessionCourseMappingThunk({
        id: sessionId,
        //  batchId: batchId,
        input,
      }) as any
    );

    const responseData = res?.payload?.data;

    if (responseData) {
      const key = getKeyFromResponse(responseData);
      setMappedSessions((p: any) => ({
        ...p,
        [key]: responseData.sessionId,
      }));
    }

    setEditMode((p: any) => ({ ...p, [activeKey]: false }));
    setDialogOpen(false);
  };

  /* ---------- RENDER ---------- */
  return (
    <Box p={2} className="CustomTable">
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={commonTableCellSx} >S.No</TableCell>
              <TableCell sx={commonTableCellSx} >Course</TableCell>
              <TableCell sx={commonTableCellSx} >Book</TableCell>
              <TableCell sx={commonTableCellSx} >Chapter</TableCell>
              <TableCell sx={commonTableCellSx} >ML</TableCell>
              <TableCell sx={commonTableCellSx} >Session</TableCell>
              <TableCell sx={commonTableCellSx} >Action</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
                     {data.map((course: any, i: number) => (
                       <React.Fragment key={course.id}>
                         {/* COURSE */}
                         <TableRow>
                           <TableCell sx={cellSx}>{i + 1}</TableCell>
                           <TableCell sx={cellSx}>
                             {course.name}
                             <IconButton
                               size="small"
                               onClick={() =>
                                 setOpenCourseId(openCourseId === course.id ? null : course.id)
                               }
                             >
                               {openCourseId === course.id ? <Remove /> : <Add />}
                             </IconButton>
                           </TableCell>
                           <TableCell sx={cellSx} />
                           <TableCell sx={cellSx} />
                           <TableCell sx={cellSx} />
                           <TableCell sx={cellSx}>
                             {renderSessionCell(getKey("COURSE", course.id))}
                           </TableCell>
                           <TableCell sx={cellSx}>
                             {renderActionCell(getKey("COURSE", course.id))}
                           </TableCell>
                         </TableRow>
         
                         {/* BOOK */}
                         {openCourseId === course.id &&
                           course.books.map((book: any) => (
                             <React.Fragment key={book.id}>
                               <TableRow>
                                 <TableCell sx={cellSx} />
                                 <TableCell sx={cellSx} />
                                 <TableCell sx={cellSx}>
                                   {book.name}
                                   <IconButton
                                     size="small"
                                     onClick={() =>
                                       setOpenBookId(openBookId === book.id ? null : book.id)
                                     }
                                   >
                                     {openBookId === book.id ? <Remove /> : <Add />}
                                   </IconButton>
                                 </TableCell>
                                 <TableCell sx={cellSx} />
                                 <TableCell sx={cellSx} />
                                 <TableCell sx={cellSx}>
                                   {renderSessionCell(getKey("BOOK", course.id, book.id))}
                                 </TableCell>
                                 <TableCell sx={cellSx}>
                                   {renderActionCell(getKey("BOOK", course.id, book.id))}
                                 </TableCell>
                               </TableRow>
         
                               {/* CHAPTER */}
                               {openBookId === book.id &&
                                 book.chapters.map((ch: any) => (
                                   <TableRow key={ch.id}>
                                     <TableCell sx={cellSx} />
                                     <TableCell sx={cellSx} />
                                     <TableCell sx={cellSx} />
                                     <TableCell sx={cellSx}>
                                       {ch.name}
                                       <IconButton
                                         size="small"
                                         onClick={() =>
                                           setOpenChapterId(openChapterId === ch.id ? null : ch.id)
                                         }
                                       >
                                         {openChapterId === ch.id ? <Remove /> : <Add />}
                                       </IconButton>
                                     </TableCell>
                                     <TableCell sx={cellSx} />
                                     <TableCell sx={cellSx}>
                                       {renderSessionCell(
                                         getKey("CH", course.id, book.id, ch.id)
                                       )}
                                     </TableCell>
                                     <TableCell sx={cellSx}>
                                       {renderActionCell(
                                         getKey("CH", course.id, book.id, ch.id)
                                       )}
                                     </TableCell>
                                   </TableRow>
                                 ))}
         
                               {/* MICRO LEARN */}
                               {openChapterId === book.chapters[0]?.id &&
                                 book.microLearn.map((ml: any) => (
                                   <TableRow key={ml.id}>
                                     <TableCell sx={cellSx} />
                                     <TableCell sx={cellSx} />
                                     <TableCell sx={cellSx} />
                                     <TableCell sx={cellSx} />
                                     {/* ML Column */}
                                     <TableCell sx={cellSx} style={{ paddingLeft: 30 }}>
                                       {ml.name || "-"}
                                     </TableCell>
                                     {/* Session Column */}
                                     <TableCell sx={cellSx}>
                                       {renderSessionCell(
                                         getKey("ML", course.id, book.id, ml.id)
                                       )}
                                     </TableCell>
                                     {/* Action Column */}
                                     <TableCell sx={cellSx}>
                                       {renderActionCell(
                                         getKey("ML", course.id, book.id, ml.id)
                                       )}
                                     </TableCell>
                                   </TableRow>
                                 ))}
                             </React.Fragment>
                           ))}
                       </React.Fragment>
                     ))}
                   </TableBody>
        </Table>
      </TableContainer>

   <Dialog
  open={dialogOpen}
  onClose={handleDialogCancel}
  disablePortal
>

  <DialogTitle>Confirm</DialogTitle>

  <DialogContent>
    <Typography>
      Are you sure you want to {dialogAction.toLowerCase()}
      {getSessionNameFromKey(activeKey) && (
        <> <strong>"{getSessionNameFromKey(activeKey)}"</strong></>
      )}
      ?
    </Typography>
  </DialogContent>

  <DialogActions>
    <CustomButton
            label="No"
            variant="outlined"
            onClick={handleDialogCancel} type={"button"}    />
    <CustomButton
      label="Yes"
      variant="contained"
      onClick={handleSessionCourseMapping}
      type={"button"}  
    />
  </DialogActions>
</Dialog>

    </Box>
  );
};

export default SessionMappingTable;
