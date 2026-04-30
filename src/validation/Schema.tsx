import { z } from "zod";

export const MicroLearningSchema = z.object({
  microLearnTitle: z
    .string()
    .min(1, "Title is required")
     .refine(
      (val) => val.trim().split(/\s+/).length <= 10,
      {
        message: "Title must not exceed 10 words",
      }
    ),
    

    category: z
    .string()
    .nullable()
    .refine(val => val !== null && val.trim() !== "", {
      message: "Please select a category",
    }),

  subCategory: z
    .array(z.string())
    .min(1, "Please select at least one subcategory"),

  duration: z
    .string()
    .min(1, "Duration is required")
    .regex(/^[0-9]+$/, "Only numbers are allowed"),

  shortDescription: z
    .string()
    .min(10, "Short description must be at least 10 characters")
    .max(250, "Short description must not exceed 250 characters"),

files: z
    .array(
      z.object({
        file: z.any(),
        description: z.string(),
        status: z.enum(["idle", "uploading", "success", "error"]).optional(),
      })
    )
    .superRefine((items, ctx) => {
      // Filter out completely empty items (no file AND no description)
      // These are likely the "new slot" at the end
      const validItems = items.filter(
        (item) =>
          item.file || (item.description && item.description.trim() !== "")
      );
 
      if (validItems.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "At least one file with description is required",
          path: ["root"], // Explicitly set path to root
        });
        return;
      }
 
      items.forEach((item, index) => {
        const hasFile = !!item.file;
        // Check if description is present and not just empty HTML tags from Quill
        const desc = item.description || "";
        const hasDesc = desc.trim() !== "" && desc !== "<p><br></p>";
       
        const isEmpty = !hasFile && !hasDesc;
 
        // If it's the last item and it's completely empty, we can ignore it (it's the "add new" slot)
        // UNLESS it's the ONLY item, which is handled by the validItems.length check above
        if (isEmpty && index === items.length - 1 && items.length > 1) {
            return;
        }
 
        // If it's not empty (or it's the only item), validate it fully
        if (!isEmpty || items.length === 1) {
          if (!hasFile) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "File is required",
              path: [index, "file"],
            });
          }
          if (!hasDesc) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Description is required",
              path: [index, "description"],
            });
          }
        }
      });
    }),
});
export const CourseSchema = z.object({
  courseTitle: z.string().min(1, "Title is required")
  .refine(
      (val) => val.trim().split(/\s+/).length <= 10,
      {
        message: "Title must not exceed 10 words",
      }
    ),
  courseCategory: z
    .string()
    .nullable()
    .refine((val) => val !== null && val.trim() !== "", {
      message: "Please select a category",
    }),
  // courseType: z.string()
  //   .nullable()
  //   .refine((val) => val !== null && val.trim() !== "", {
  //     message: "Course type is required",
  //   }),
  // promotionalContent: z.string().min(1, "Short FOMO Message is required"),
  // skillLevel: z.string()
  //   .nullable()
  //   .refine((val) => val !== null && val.trim() !== "", {
  //     message: "Skill level is required",
  //   }),
  // language: z.string()
  //   .nullable()
  //   .refine((val) => val !== null && val.trim() !== "", {
  //     message: "Language is required",
  //   }),
  // skillsYouGain: z.array(z.string()).min(1, "At least one skill is required"),
  // currentSkillInput: z.string().optional(),
  books: z.array(z.string()).min(1, "At least one book is required"),
    courseDuration: z
    .string()
    .min(1, "Duration is required")
    .regex(/^[0-9]+$/, "Only numbers are allowed"),
  // whatYouLearn: z.string().min(1, "What you learn is required"),
  durationType: z.string().nullable().refine((val) => val !== null && val.trim() !== "", {
    message: "Course duration is required",
  }),
  // bannerImage: z
  //   .any()
  //   .refine((file) => file !== undefined && file !== null, "Banner image is required")
  //   .refine((file) => file instanceof File && file.type.startsWith("image/"), "Must be a valid image file"),
  courseDescription: z
    .string()
    .min(10, "Short description must be at least 10 characters")
    .max(250, "Short description must not exceed 250 characters"),
});

export const MicroLearningSchemaEdit = z.object({
  microLearnTitle: z
    .string()
    .min(1, "Title is required")
     .refine(
      (val) => val.trim().split(/\s+/).length <= 10,
      {
        message: "Title must not exceed 10 words",
      }
    ),

    category: z
    .string()
    .nullable()
    .refine(val => val !== null && val.trim() !== "", {
      message: "Please select a category",
    }),

  subCategory: z
    .array(z.string())
    .min(1, "Please select at least one subcategory"),

  duration: z
    .string()
    .min(1, "Duration is required")
    .regex(/^[0-9]+$/, "Only numbers are allowed"),

  shortDescription: z
    .string()
    .min(10, "Short description must be at least 10 characters")
    .max(250, "Short description must not exceed 250 characters"),


});

// export const GeneralDetailsSchema = z.object({
//   batchname: z.string().min(1, "Batch name is required"),

//   duration: z
//     .string()
//     .min(1, "Duration is required")
//     .regex(/^[0-9]+$/, "Only numbers allowed"),

//   startDate: z.string().min(1, "Start date is required"),
//   endDate: z.string().min(1, "End date is required"),

//   timezone: z.string().min(1, "Time zone is required"),

//   enrollmentLimit: z
//     .string()
//     .min(1, "Please enter minimum/maximum")
//     .regex(/^\d+\s*\/\s*\d+$/, "Format must be: min/max"),

//   enrollmentStart: z.string().min(1, "Enrollment start date required"),
//   enrollmentEnd: z.string().min(1, "Enrollment end date required"),

//   sessionFrom: z.string().min(1, "Session start time required"),
//   sessionTo: z.string().min(1, "Session end time required"),

//   days: z.array(z.string()).min(1, "Select at least one day"),
// });





export const GeneralDetailsSchema = z.object({
  batchname: z.string().min(1, "Batch name is required"),

  Duration: z
    .string()
    .min(1, "Duration is required")
    .regex(/^[0-9]+$/, "Duration must be a number only (e.g., 30)"),

  startDate: z
    .string()
    .min(1, "Start date is required")
    .refine((date) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return new Date(date) >= today;
    }, { message: "Start date cannot be in the past" }),

  endDate: z
    .string()
    .min(1, "End date is required")
    .refine((date) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return new Date(date) >= today;
    }, { message: "End date cannot be in the past" }),

  timezone: z.string().min(1, "Time zone is required"),

enrollmentLimit: z
  .string()
  .min(1, "Please enter the maximum enrollment")
  .regex(/^\d+$/, "Only numbers are allowed"),

  enrollmentStartDate: z.string().min(1, "Enrollment start date required")
    .refine((date) => new Date(date) >= new Date(), {
      message: "Enrollment start date cannot be in the past"
    }),

  enrollmentEndDate: z.string().min(1, "Enrollment end date required")
    .refine((date) => new Date(date) >= new Date(), {
      message: "Enrollment end date cannot be in the past"
    }),

  sessionFrom: z.string().min(1, "Session start time required"),
  sessionTo: z.string().min(1, "Session end time required"),

  batchDays: z.array(z.string()).min(1, "Select at least one day"),
}).superRefine((data, ctx) => {
  // Start Date <= End Date (Duration not involved)
  if (data.startDate && data.endDate && new Date(data.startDate) > new Date(data.endDate)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "End date must be after start date",
      path: ["endDate"],
    });
  }

  // Enrollment validations (unchanged)
  if (data.enrollmentStartDate && data.enrollmentEndDate && 
      new Date(data.enrollmentStartDate) > new Date(data.enrollmentEndDate)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Enrollment end must be after enrollment start",
      path: ["enrollmentEndDate"],
    });
  }

  // Session time validation
  if (data.sessionFrom && data.sessionTo && data.sessionFrom >= data.sessionTo) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Session end time must be after session start time",
      path: ["sessionTo"],
    });
  }
});

