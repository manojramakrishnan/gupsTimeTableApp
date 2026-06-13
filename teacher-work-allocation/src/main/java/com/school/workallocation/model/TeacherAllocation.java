package com.school.workallocation.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public record TeacherAllocation(
        @NotBlank String code,
        @NotBlank String name,
        String homeClass,
        String gradeBand,
        int listedPeriods,
        String periodNote,
        @NotEmpty List<AssignmentGroup> assignments
) {
}
