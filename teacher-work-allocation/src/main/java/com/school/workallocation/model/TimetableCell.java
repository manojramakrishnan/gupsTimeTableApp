package com.school.workallocation.model;

import java.util.List;

public record TimetableCell(
        String day,
        int period,
        boolean assigned,
        String subjectCode,
        String subjectName,
        List<String> classGroup,
        boolean joinedClass,
        String label
) {
}
