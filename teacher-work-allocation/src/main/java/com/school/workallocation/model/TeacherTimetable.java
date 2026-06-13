package com.school.workallocation.model;

import java.util.List;

public record TeacherTimetable(
        String teacherCode,
        String teacherName,
        List<String> days,
        List<Integer> periods,
        int assignedPeriods,
        int freePeriods,
        String reservedPeriodNote,
        List<TimetableCell> cells
) {
}
