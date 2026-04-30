import React, { useCallback } from "react";
import {
  Box, Typography, IconButton, TextField, Radio, Checkbox, Chip, Collapse, Paper, Tooltip,
} from "@mui/material";
import {
  ChevronDown, ChevronUp, Plus, Trash2, GripVertical,
  CheckSquare, Circle, AlignLeft, Hash, Copy, CheckCircle2,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type AnswerType = "single" | "multi" | "text" | "number" | "";

export interface Option { id: string; label: string; }

export interface CustomField {
  placeholder: string;
  helperText: string;
  required: boolean;
  minLength?: number;
  maxLength?: number;
}

export interface Question {
  id: string;
  title: string;
  answerType: AnswerType;
  options: Option[];
  correctAnswers: string[];
  customField: CustomField;
  expanded: boolean;
  marks: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const uid = () => Math.random().toString(36).slice(2, 9);

export const defaultCustomField = (): CustomField => ({
  placeholder: "", helperText: "", required: false,
  minLength: undefined, maxLength: undefined,
});

export const makeQuestion = (): Question => ({
  id: uid(), title: "", answerType: "", options: [],
  correctAnswers: [], customField: defaultCustomField(), expanded: true, marks: 1,
});

export const ANSWER_TYPES: { value: AnswerType; label: string; icon: React.ReactNode; color: string }[] = [
  { value: "single", label: "Single Choice", icon: <Circle size={13} />,      color: "var(--primary)" },
  { value: "multi",  label: "Multi Choice",  icon: <CheckSquare size={13} />, color: "var(--primary)" },
  // { value: "text",   label: "Text Answer",   icon: <AlignLeft size={13} />,   color: "var(--primary)" },
  // { value: "number", label: "Number",        icon: <Hash size={13} />,        color: "var(--primary)" },
];

export const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 1.5, fontSize: 13,
    "& fieldset": { borderColor: "#bbf7d0" },
    "&:hover fieldset": { borderColor: "#bbf7d0" },
    "&.Mui-focused fieldset": { borderColor: "#bbf7d0" },
  },
  "& .MuiInputLabel-root": { fontSize: 12 },
  "& .MuiInputLabel-root.Mui-focused": { color: "var(--primary)" },
};

// ─── AnswerTypeChip ───────────────────────────────────────────────────────────

export function AnswerTypeChip({ type, selected, onClick }: {
  type: (typeof ANSWER_TYPES)[0]; selected: boolean; onClick: () => void;
}) {
  return (
    <Box onClick={onClick} sx={{
      display: "flex", alignItems: "center", gap: 0.6, px: 1.4, py: 0.55,
      borderRadius: "20px", border: `1.5px solid ${selected ? type.color : "#e2e8f0"}`,
      background: selected ? `${type.color}18` : "transparent",
      color: selected ? type.color : "#64748b", cursor: "pointer",
      fontSize: 12, fontWeight: selected ? 600 : 400, transition: "all 0.15s", userSelect: "none",
      "&:hover": { borderColor: type.color, color: type.color, background: `${type.color}10` },
    }}>
      {type.icon}{type.label}
    </Box>
  );
}

// ─── OptionRow ────────────────────────────────────────────────────────────────

export function OptionRow({ option, index, answerType, isCorrect, onLabelChange, onCorrectToggle, onDelete, canDelete }: {
  option: Option; index: number; answerType: AnswerType; isCorrect: boolean;
  onLabelChange: (val: string) => void; onCorrectToggle: () => void;
  onDelete: () => void; canDelete: boolean;
}) {
  return (
    <Box sx={{
      display: "flex", alignItems: "center", gap: 1, mb: 0.8, px: 1, py: 0.5,
      borderRadius: 1.5, border: `1.5px solid ${isCorrect ? "#10b98140" : "transparent"}`,
      background: isCorrect ? "#f0fdf4" : "transparent", transition: "all 0.15s",
    }}>
      <Box sx={{ color: "#cbd5e1", cursor: "grab", flexShrink: 0 }}><GripVertical size={13} /></Box>
      <Tooltip title={isCorrect ? "Remove correct answer" : "Mark as correct answer"} placement="top">
        <Box onClick={onCorrectToggle} sx={{ flexShrink: 0, cursor: "pointer", display: "flex", alignItems: "center" }}>
          {answerType === "single" ? (
            <Radio checked={isCorrect} onChange={onCorrectToggle} size="small"
              sx={{ p: 0, color: isCorrect ? "#10b981" : "#cbd5e1", "&.Mui-checked": { color: "#10b981" } }} />
          ) : (
            <Checkbox checked={isCorrect} onChange={onCorrectToggle} size="small"
              sx={{ p: 0, color: isCorrect ? "#10b981" : "#cbd5e1", "&.Mui-checked": { color: "#10b981" } }} />
          )}
        </Box>
      </Tooltip>
      <TextField value={option.label} onChange={(e) => onLabelChange(e.target.value)}
        placeholder={`Option ${index + 1}`} variant="standard" size="small" fullWidth
        InputProps={{ disableUnderline: false, sx: { fontSize: 13, color: "#1e293b" } }}
        sx={{
          "& .MuiInput-underline:before": { borderBottomColor: "#e2e8f0" },
          "& .MuiInput-underline:hover:before": { borderBottomColor: "#6366f1" },
          "& .MuiInput-underline:after": { borderBottomColor: "#6366f1" },
        }}
      />
      {isCorrect && (
        <Chip label="Correct" size="small"
          sx={{ height: 18, fontSize: 10, fontWeight: 700, background: "#10b981", color: "#fff", flexShrink: 0 }} />
      )}
      {canDelete && (
        <IconButton size="small" onClick={onDelete}
          sx={{ color: "#cbd5e1", flexShrink: 0, "&:hover": { color: "#ef4444" } }}>
          <Trash2 size={13} />
        </IconButton>
      )}
    </Box>
  );
}

// ─── CustomFieldEditor ────────────────────────────────────────────────────────

export function CustomFieldEditor({ field, answerType, onChange }: {
  field: CustomField; answerType: AnswerType; onChange: (f: CustomField) => void;
}) {
  const set = (key: keyof CustomField, val: any) => onChange({ ...field, [key]: val });
  return (
    <Box sx={{ mt: 1.5, p: 1.5, borderRadius: 2, background: "#f8fafc", border: "1px dashed #cbd5e1" }}>
      <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", mb: 1.5, textTransform: "uppercase", letterSpacing: 0.5 }}>
        Field Settings
      </Typography>
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
        <TextField label="Placeholder" value={field.placeholder} onChange={(e) => set("placeholder", e.target.value)} size="small" fullWidth sx={fieldSx} />
        <TextField label="Hint / helper text" value={field.helperText} onChange={(e) => set("helperText", e.target.value)} size="small" fullWidth sx={fieldSx} />
        {(answerType === "text" || answerType === "number") && (<>
          <TextField label={answerType === "number" ? "Min value" : "Min length"} type="number"
            value={field.minLength ?? ""} onChange={(e) => set("minLength", e.target.value ? Number(e.target.value) : undefined)}
            size="small" fullWidth sx={fieldSx} />
          <TextField label={answerType === "number" ? "Max value" : "Max length"} type="number"
            value={field.maxLength ?? ""} onChange={(e) => set("maxLength", e.target.value ? Number(e.target.value) : undefined)}
            size="small" fullWidth sx={fieldSx} />
        </>)}
      </Box>
      <Box onClick={() => set("required", !field.required)}
        sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1.5, cursor: "pointer", width: "fit-content" }}>
        <Box sx={{ width: 36, height: 20, borderRadius: 10, background: field.required ? "var(--primary)" : "#e2e8f0", position: "relative", transition: "0.2s", flexShrink: 0 }}>
          <Box sx={{ position: "absolute", top: 2, left: field.required ? 18 : 2, width: 16, height: 16, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.2)", transition: "0.2s" }} />
        </Box>
        <Typography sx={{ fontSize: 12, color: "#475569" }}>Required field</Typography>
      </Box>
      <Box sx={{ mt: 1.5 }}>
        <Typography sx={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", mb: 0.8 }}>Preview</Typography>
        <TextField placeholder={field.placeholder || "Answer here..."} helperText={field.helperText || undefined}
          type={answerType === "number" ? "number" : "text"} multiline={answerType === "text"}
          rows={answerType === "text" ? 2 : 1} size="small" fullWidth disabled
          sx={{ ...fieldSx, "& .MuiInputBase-root": { background: "#fff" } }} />
      </Box>
    </Box>
  );
}

// ─── CorrectAnswerInput ───────────────────────────────────────────────────────

export function CorrectAnswerInput({ answerType, correctAnswers, onChange }: {
  answerType: AnswerType; correctAnswers: string[]; onChange: (val: string[]) => void;
}) {
  const value = correctAnswers[0] ?? "";
  return (
    <Box sx={{ mt: 1.5, p: 1.5, borderRadius: 2, background: "#f0fdf4", border: "1.5px solid #10b98130" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.6, mb: 1 }}>
        <CheckCircle2 size={13} color="#10b981" />
        <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#10b981", textTransform: "uppercase", letterSpacing: 0.5 }}>
          Correct Answer
        </Typography>
      </Box>
      <TextField label={answerType === "number" ? "Expected number" : "Expected text answer"}
        type={answerType === "number" ? "number" : "text"} value={value}
        onChange={(e) => onChange(e.target.value ? [e.target.value] : [])}
        size="small" fullWidth placeholder={answerType === "number" ? "e.g. 42" : "e.g. photosynthesis"} sx={fieldSx} />
    </Box>
  );
}

// ─── QuestionCard ─────────────────────────────────────────────────────────────

export function QuestionCard({ question, index, onChange, onDelete, onDuplicate, canDelete, readOnly = false }: {
  question: Question; index: number; onChange: (q: Question) => void;
  onDelete: () => void; onDuplicate: () => void; canDelete: boolean; readOnly?: boolean;
}) {
  const set = useCallback((patch: Partial<Question>) => onChange({ ...question, ...patch }), [question, onChange]);

  const handleTypeSelect = (val: AnswerType) => {
    const newType: AnswerType = val === question.answerType ? "" : val;
    const options = newType === "single" || newType === "multi"
      ? [{ id: uid(), label: "" }, { id: uid(), label: "" }] : [];
    onChange({ ...question, answerType: newType, options, correctAnswers: [], customField: defaultCustomField() });
  };

  const addOption = () => set({ options: [...question.options, { id: uid(), label: "" }] });
  const updateOptionLabel = (optId: string, label: string) =>
    set({ options: question.options.map((o) => (o.id === optId ? { ...o, label } : o)) });
  const deleteOption = (optId: string) =>
    onChange({ ...question, options: question.options.filter((o) => o.id !== optId), correctAnswers: question.correctAnswers.filter((c) => c !== optId) });
  const toggleCorrect = (optId: string) => {
    if (question.answerType === "single") {
      set({ correctAnswers: question.correctAnswers[0] === optId ? [] : [optId] });
    } else {
      const already = question.correctAnswers.includes(optId);
      set({ correctAnswers: already ? question.correctAnswers.filter((c) => c !== optId) : [...question.correctAnswers, optId] });
    }
  };

  const typeInfo = ANSWER_TYPES.find((t) => t.value === question.answerType);
  const hasType = question.answerType !== "";
  const isChoice = question.answerType === "single" || question.answerType === "multi";

  return (
    <Paper elevation={0} sx={{
      border: "1.5px solid", borderColor: question.expanded ? "#6366f120" : "#e2e8f0",
      borderRadius: 2.5, mb: 1.5, overflow: "hidden", transition: "border-color 0.2s, box-shadow 0.2s",
      "&:hover": { borderColor: "#6366f135", boxShadow: "0 2px 12px rgba(99,102,241,0.07)" },
    }}>
      {/* Header */}
      <Box onClick={() => set({ expanded: !question.expanded })} sx={{
        display: "flex", alignItems: "center", gap: 1, px: 2, py: 1.2,
        background: question.expanded ? "#fafafe" : "transparent", cursor: "pointer", userSelect: "none",
      }}>
        <Box sx={{ color: "#cbd5e1", cursor: "grab", flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
          <GripVertical size={14} />
        </Box>
        <Box sx={{ width: 22, height: 22, borderRadius: "50%", background: "var(--primary)", color: "#fff", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          {index + 1}
        </Box>
        <Typography sx={{ flex: 1, fontSize: 13, color: question.title ? "#1e293b" : "#94a3b8", fontWeight: question.title ? 500 : 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {question.title || "Untitled question"}
        </Typography>
        {typeInfo && (
          <Chip label={typeInfo.label} size="small" sx={{ height: 20, fontSize: 10, fontWeight: 600, background: `${typeInfo.color}18`, color: typeInfo.color, border: `1px solid ${typeInfo.color}30`, flexShrink: 0 }} />
        )}
        {question.correctAnswers.length > 0 && (
          <Chip icon={<CheckCircle2 size={10} />} label={`${question.correctAnswers.length} correct`} size="small"
            sx={{ height: 20, fontSize: 10, fontWeight: 600, background: "#f0fdf4", color: "#10b981", border: "1px solid #10b98130", flexShrink: 0, "& .MuiChip-icon": { color: "#10b981", ml: 0.5 } }} />
        )}
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.3, flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
          <Tooltip title="Duplicate">
            <IconButton size="small" onClick={onDuplicate} sx={{ color: "#94a3b8", "&:hover": { color: "var(--primary)" } }}>
              <Copy size={13} />
            </IconButton>
          </Tooltip>
          {canDelete && (
            <Tooltip title="Delete">
              <IconButton size="small" onClick={onDelete} sx={{ color: "#94a3b8", "&:hover": { color: "#ef4444" } }}>
                <Trash2 size={13} />
              </IconButton>
            </Tooltip>
          )}
          <IconButton size="small" sx={{ color: "#94a3b8" }}>
            {question.expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </IconButton>
        </Box>
      </Box>

      {/* Body */}
      <Collapse in={question.expanded}>
        <Box sx={{ px: 2, pb: 2, pt: 0.5 }}>
          <Box sx={{ display: "flex", gap: 1.5, mb: 1.5 }}>
            <TextField label="Question" placeholder="Type your question here..." value={question.title}
              onChange={(e) => set({ title: e.target.value })} size="small" fullWidth multiline maxRows={3} sx={fieldSx} />
            <TextField label="Marks" type="number" value={question.marks}
              onChange={(e) => set({ marks: Math.max(0, Number(e.target.value) || 0) })}
              size="small" sx={{ ...fieldSx, width: 90, flexShrink: 0 }} inputProps={{ min: 0 }} />
          </Box>

          <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", mb: 0.8, textTransform: "uppercase", letterSpacing: 0.5 }}>
            Answer Type
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.8, mb: hasType ? 1.5 : 0 }}>
            {ANSWER_TYPES.map((t) => (
              <AnswerTypeChip key={t.value} type={t} selected={question.answerType === t.value} onClick={() => handleTypeSelect(t.value)} />
            ))}
          </Box>

          {isChoice && (
            <Box sx={{ mt: 0.5 }}>
              <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.5, mb: 0.8 }}>
                Options{" "}
                <Box component="span" sx={{ color: "#10b981", fontWeight: 500, textTransform: "none" }}>
                  — click radio/checkbox to mark correct answer
                </Box>
              </Typography>
              {question.options.map((opt, i) => (
                <OptionRow key={opt.id} option={opt} index={i} answerType={question.answerType} isCorrect={question.correctAnswers.includes(opt.id)}
                  onLabelChange={(val) => updateOptionLabel(opt.id, val)} onCorrectToggle={() => toggleCorrect(opt.id)}
                  onDelete={() => deleteOption(opt.id)} canDelete={question.options.length > 1} />
              ))}
              <Box onClick={addOption} sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, mt: 0.5, ml: 1, cursor: "pointer", color: "var(--primary)", fontSize: 12, fontWeight: 500 }}>
                <Plus size={13} />Add option
              </Box>
            </Box>
          )}

          {(question.answerType === "text" || question.answerType === "number") && (
            <CorrectAnswerInput answerType={question.answerType} correctAnswers={question.correctAnswers} onChange={(val) => set({ correctAnswers: val })} />
          )}

          {/* {hasType && (
            <CustomFieldEditor field={question.customField} answerType={question.answerType} onChange={(f) => set({ customField: f })} />
          )} */}
        </Box>
      </Collapse>
    </Paper>
  );
}
