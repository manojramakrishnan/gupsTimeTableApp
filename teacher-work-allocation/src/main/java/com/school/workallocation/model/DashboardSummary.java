package com.school.workallocation.model;

public record DashboardSummary(
        int teacherCount,
        int totalListedPeriods,
        int subjectCount,
        int classCount,
        int joinedLanguageGroupCount,
        String highestLoadTeacher,
        int highestLoadPeriods
) {
}
