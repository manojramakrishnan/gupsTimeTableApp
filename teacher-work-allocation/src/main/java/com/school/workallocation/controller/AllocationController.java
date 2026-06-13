package com.school.workallocation.controller;

import com.school.workallocation.model.DashboardSummary;
import com.school.workallocation.model.SubjectLegend;
import com.school.workallocation.model.TeacherAllocation;
import com.school.workallocation.model.TeacherTimetable;
import com.school.workallocation.service.AllocationService;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@CrossOrigin
@RestController
@RequestMapping("/api")
public class AllocationController {
    private final AllocationService allocationService;

    public AllocationController(AllocationService allocationService) {
        this.allocationService = allocationService;
    }

    @GetMapping("/health")
    public String health() {
        return "ok";
    }

    @GetMapping("/allocations")
    public List<TeacherAllocation> allocations(@RequestParam Optional<String> subject,
                                               @RequestParam(name = "class") Optional<String> className,
                                               @RequestParam Optional<String> q) {
        return allocationService.findAllocations(subject, className, q);
    }

    @GetMapping("/allocations/{code}")
    public ResponseEntity<TeacherAllocation> allocation(@PathVariable String code) {
        return allocationService.findByCode(code)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/subjects")
    public List<SubjectLegend> subjects() {
        return allocationService.subjects();
    }

    @GetMapping("/classes")
    public Set<String> classes() {
        return allocationService.classes();
    }

    @GetMapping("/summary")
    public DashboardSummary summary() {
        return allocationService.summary();
    }

    @GetMapping("/timetables")
    public List<TeacherTimetable> timetables() {
        return allocationService.timetables();
    }

    @GetMapping("/timetables/{code}")
    public ResponseEntity<TeacherTimetable> timetable(@PathVariable String code) {
        return allocationService.timetableFor(code)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
