package com.school.workallocation.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public record AssignmentGroup(
        @NotBlank String subjectCode,
        boolean joinedClass,
        @NotEmpty List<List<String>> classGroups,
        String note
) {
    public int groupCount() {
        return classGroups == null ? 0 : classGroups.size();
    }
}
