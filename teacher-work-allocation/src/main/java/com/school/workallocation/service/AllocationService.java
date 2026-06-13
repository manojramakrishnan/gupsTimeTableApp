package com.school.workallocation.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.school.workallocation.model.AllocationData;
import com.school.workallocation.model.AssignmentGroup;
import com.school.workallocation.model.DashboardSummary;
import com.school.workallocation.model.SubjectLegend;
import com.school.workallocation.model.TeacherAllocation;
import com.school.workallocation.model.TeacherTimetable;
import com.school.workallocation.model.TimetableCell;
import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.TreeSet;
import java.util.stream.Collectors;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

@Service
public class AllocationService {
    private static final String DATA_PATH = "data/allocations.json";
    private static final List<String> SCHOOL_DAYS = List.of("Monday", "Tuesday", "Wednesday", "Thursday", "Friday");
    private static final List<Integer> ASSIGNABLE_PERIODS = List.of(1, 2, 3, 4, 5, 6, 7);
    private static final String RESERVED_PERIOD_NOTE = "Period 8 is reserved for the respective class teachers and is not auto-assigned.";

    private final ObjectMapper objectMapper;
    private List<TeacherAllocation> teachers = List.of();
    private final Map<String, String> subjects = new LinkedHashMap<>();
    private final Map<String, Integer> subjectPeriodWeights = new LinkedHashMap<>();

    public AllocationService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        loadSubjectLegend();
        loadSubjectPeriodWeights();
    }

    @PostConstruct
    public void loadAllocations() throws IOException {
        try (InputStream stream = new ClassPathResource(DATA_PATH).getInputStream()) {
            AllocationData data = objectMapper.readValue(stream, AllocationData.class);
            teachers = List.copyOf(data.teachers());
        }
    }

    public List<TeacherAllocation> findAllocations(Optional<String> subject,
                                                   Optional<String> className,
                                                   Optional<String> query) {
        return teachers.stream()
                .filter(teacher -> subject.map(value -> teachesSubject(teacher, value)).orElse(true))
                .filter(teacher -> className.map(value -> teachesClass(teacher, value)).orElse(true))
                .filter(teacher -> query.map(value -> matchesQuery(teacher, value)).orElse(true))
                .toList();
    }

    public Optional<TeacherAllocation> findByCode(String code) {
        String normalizedCode = code.toUpperCase(Locale.ROOT);
        return teachers.stream()
                .filter(teacher -> teacher.code().equalsIgnoreCase(normalizedCode))
                .findFirst();
    }

    public List<SubjectLegend> subjects() {
        return subjects.entrySet().stream()
                .map(entry -> new SubjectLegend(entry.getKey(), entry.getValue()))
                .toList();
    }

    public Set<String> classes() {
        return teachers.stream()
                .flatMap(teacher -> teacher.assignments().stream())
                .flatMap(assignment -> assignment.classGroups().stream())
                .flatMap(List::stream)
                .collect(Collectors.toCollection(TreeSet::new));
    }

    public DashboardSummary summary() {
        TeacherAllocation highestLoad = teachers.stream()
                .max(Comparator.comparingInt(TeacherAllocation::listedPeriods))
                .orElse(null);

        int joinedLanguageGroups = teachers.stream()
                .flatMap(teacher -> teacher.assignments().stream())
                .filter(AssignmentGroup::joinedClass)
                .mapToInt(AssignmentGroup::groupCount)
                .sum();

        return new DashboardSummary(
                teachers.size(),
                teachers.stream().mapToInt(TeacherAllocation::listedPeriods).sum(),
                subjects.size(),
                classes().size(),
                joinedLanguageGroups,
                highestLoad == null ? "" : highestLoad.name(),
                highestLoad == null ? 0 : highestLoad.listedPeriods()
        );
    }

    public String subjectName(String code) {
        return subjects.getOrDefault(code.toUpperCase(Locale.ROOT), code);
    }

    public Optional<TeacherTimetable> timetableFor(String code) {
        return findByCode(code).map(this::buildTeacherTimetable);
    }

    public List<TeacherTimetable> timetables() {
        return teachers.stream()
                .map(this::buildTeacherTimetable)
                .toList();
    }

    private boolean teachesSubject(TeacherAllocation teacher, String subjectCode) {
        String normalized = subjectCode.toUpperCase(Locale.ROOT);
        return teacher.assignments().stream()
                .anyMatch(assignment -> assignment.subjectCode().equalsIgnoreCase(normalized));
    }

    private boolean teachesClass(TeacherAllocation teacher, String className) {
        String normalized = className.toUpperCase(Locale.ROOT).replace(" ", "");
        return teacher.assignments().stream()
                .flatMap(assignment -> assignment.classGroups().stream())
                .flatMap(List::stream)
                .map(value -> value.toUpperCase(Locale.ROOT).replace(" ", ""))
                .anyMatch(normalized::equals);
    }

    private boolean matchesQuery(TeacherAllocation teacher, String query) {
        String normalized = query.toLowerCase(Locale.ROOT);
        List<String> haystack = new ArrayList<>();
        haystack.add(teacher.code());
        haystack.add(teacher.name());
        haystack.add(teacher.homeClass());
        haystack.add(teacher.gradeBand());
        teacher.assignments().forEach(assignment -> {
            haystack.add(assignment.subjectCode());
            haystack.add(subjectName(assignment.subjectCode()));
            assignment.classGroups().forEach(haystack::addAll);
        });

        return haystack.stream()
                .filter(value -> value != null)
                .map(value -> value.toLowerCase(Locale.ROOT))
                .anyMatch(value -> value.contains(normalized));
    }

    private void loadSubjectLegend() {
        subjects.put("BS", "Basic Science");
        subjects.put("MAL", "Malayalam");
        subjects.put("HIN", "Hindi");
        subjects.put("SS", "Social Science");
        subjects.put("MAT", "Maths");
        subjects.put("ENG", "English");
        subjects.put("IT", "Information Technology");
        subjects.put("LIB", "Library");
        subjects.put("HE", "Health Education");
        subjects.put("WE", "Work Education");
        subjects.put("AE", "Art Education");
        subjects.put("ARA", "Arabic");
        subjects.put("SAN", "Sanskrit");
    }

    private void loadSubjectPeriodWeights() {
        subjectPeriodWeights.put("BS", 5);
        subjectPeriodWeights.put("MAL", 5);
        subjectPeriodWeights.put("HIN", 3);
        subjectPeriodWeights.put("SS", 5);
        subjectPeriodWeights.put("MAT", 5);
        subjectPeriodWeights.put("ENG", 5);
        subjectPeriodWeights.put("IT", 1);
        subjectPeriodWeights.put("LIB", 1);
        subjectPeriodWeights.put("HE", 1);
        subjectPeriodWeights.put("WE", 1);
        subjectPeriodWeights.put("AE", 1);
        subjectPeriodWeights.put("ARA", 1);
        subjectPeriodWeights.put("SAN", 1);
    }

    private TeacherTimetable buildTeacherTimetable(TeacherAllocation teacher) {
        List<TimetableSession> sessions = expandWeeklySessions(teacher);
        Map<String, TimetableSession> placedSessions = new HashMap<>();
        Map<String, Integer> dayLoad = new HashMap<>();
        Map<Integer, Integer> periodLoad = new HashMap<>();
        Map<String, Integer> subjectDayLoad = new HashMap<>();
        Map<String, Integer> classDayLoad = new HashMap<>();

        for (String day : SCHOOL_DAYS) {
            dayLoad.put(day, 0);
        }
        for (Integer period : ASSIGNABLE_PERIODS) {
            periodLoad.put(period, 0);
        }

        sessions.stream()
                .sorted(Comparator
                        .comparing((TimetableSession session) -> session.classGroup().size()).reversed()
                        .thenComparing(TimetableSession::subjectCode)
                        .thenComparing(TimetableSession::classKey))
                .forEach(session -> {
                    TimetableSlot bestSlot = findBestSlot(session, placedSessions, dayLoad, periodLoad, subjectDayLoad, classDayLoad);
                    if (bestSlot != null) {
                        placedSessions.put(slotKey(bestSlot.day(), bestSlot.period()), session);
                        dayLoad.compute(bestSlot.day(), (key, value) -> value == null ? 1 : value + 1);
                        periodLoad.compute(bestSlot.period(), (key, value) -> value == null ? 1 : value + 1);
                        subjectDayLoad.merge(subjectDayKey(session, bestSlot.day()), 1, Integer::sum);
                        session.classGroup().forEach(className ->
                                classDayLoad.merge(classDayKey(className, bestSlot.day()), 1, Integer::sum));
                    }
                });

        List<TimetableCell> cells = new ArrayList<>();
        for (String day : SCHOOL_DAYS) {
            for (Integer period : ASSIGNABLE_PERIODS) {
                TimetableSession session = placedSessions.get(slotKey(day, period));
                if (session == null) {
                    cells.add(new TimetableCell(day, period, false, "", "", List.of(), false, "Available"));
                } else {
                    cells.add(new TimetableCell(
                            day,
                            period,
                            true,
                            session.subjectCode(),
                            subjectName(session.subjectCode()),
                            session.classGroup(),
                            session.joinedClass(),
                            session.subjectCode() + " - " + String.join(" + ", session.classGroup())
                    ));
                }
            }
        }

        int assignedPeriods = (int) cells.stream().filter(TimetableCell::assigned).count();
        return new TeacherTimetable(
                teacher.code(),
                teacher.name(),
                SCHOOL_DAYS,
                ASSIGNABLE_PERIODS,
                assignedPeriods,
                SCHOOL_DAYS.size() * ASSIGNABLE_PERIODS.size() - assignedPeriods,
                RESERVED_PERIOD_NOTE,
                cells
        );
    }

    private List<TimetableSession> expandWeeklySessions(TeacherAllocation teacher) {
        List<TimetableUnit> units = teacher.assignments().stream()
                .flatMap(assignment -> assignment.classGroups().stream()
                        .map(classGroup -> new TimetableUnit(
                                assignment.subjectCode(),
                                classGroup,
                                assignment.joinedClass(),
                                subjectPeriodWeights.getOrDefault(assignment.subjectCode(), 1)
                        )))
                .collect(Collectors.toCollection(ArrayList::new));

        int currentTotal = units.stream().mapToInt(TimetableUnit::count).sum();
        Comparator<TimetableUnit> addPriority = Comparator
                .comparing((TimetableUnit unit) -> isCoreSubject(unit.subjectCode()) ? 0 : 1)
                .thenComparing(TimetableUnit::count, Comparator.reverseOrder())
                .thenComparing(TimetableUnit::classKey);

        while (currentTotal < teacher.listedPeriods() && !units.isEmpty()) {
            TimetableUnit target = units.stream().min(addPriority).orElse(units.get(0));
            target.increment();
            currentTotal++;
        }

        Comparator<TimetableUnit> removePriority = Comparator
                .comparing((TimetableUnit unit) -> isCoreSubject(unit.subjectCode()) ? 0 : 1)
                .thenComparing(TimetableUnit::count, Comparator.reverseOrder())
                .thenComparing(TimetableUnit::classKey);

        while (currentTotal > teacher.listedPeriods() && !units.isEmpty()) {
            Optional<TimetableUnit> target = units.stream()
                    .filter(unit -> unit.count() > 1)
                    .min(removePriority);
            if (target.isEmpty()) {
                break;
            }
            target.get().decrement();
            currentTotal--;
        }

        List<TimetableSession> sessions = new ArrayList<>();
        for (TimetableUnit unit : units) {
            for (int index = 0; index < unit.count(); index++) {
                sessions.add(new TimetableSession(unit.subjectCode(), unit.classGroup(), unit.joinedClass()));
            }
        }
        return sessions;
    }

    private TimetableSlot findBestSlot(TimetableSession session,
                                       Map<String, TimetableSession> placedSessions,
                                       Map<String, Integer> dayLoad,
                                       Map<Integer, Integer> periodLoad,
                                       Map<String, Integer> subjectDayLoad,
                                       Map<String, Integer> classDayLoad) {
        TimetableSlot bestSlot = null;
        int bestScore = Integer.MAX_VALUE;

        for (String day : SCHOOL_DAYS) {
            for (Integer period : ASSIGNABLE_PERIODS) {
                TimetableSlot slot = new TimetableSlot(day, period);
                if (placedSessions.containsKey(slotKey(day, period))) {
                    continue;
                }

                int score = dayLoad.getOrDefault(day, 0) * 12
                        + periodLoad.getOrDefault(period, 0) * 3
                        + subjectDayLoad.getOrDefault(subjectDayKey(session, day), 0) * 25
                        + session.classGroup().stream()
                        .mapToInt(className -> classDayLoad.getOrDefault(classDayKey(className, day), 0) * 4)
                        .sum()
                        + period;

                if (score < bestScore) {
                    bestScore = score;
                    bestSlot = slot;
                }
            }
        }

        return bestSlot;
    }

    private boolean isCoreSubject(String subjectCode) {
        return Set.of("BS", "MAL", "HIN", "SS", "MAT", "ENG").contains(subjectCode);
    }

    private String slotKey(String day, int period) {
        return day + "-" + period;
    }

    private String subjectDayKey(TimetableSession session, String day) {
        return session.subjectCode() + "-" + day;
    }

    private String classDayKey(String className, String day) {
        return className + "-" + day;
    }

    private record TimetableSlot(String day, int period) {
    }

    private record TimetableSession(String subjectCode, List<String> classGroup, boolean joinedClass) {
        private String classKey() {
            return String.join("+", classGroup);
        }
    }

    private static class TimetableUnit {
        private final String subjectCode;
        private final List<String> classGroup;
        private final boolean joinedClass;
        private int count;

        TimetableUnit(String subjectCode, List<String> classGroup, boolean joinedClass, int count) {
            this.subjectCode = subjectCode;
            this.classGroup = classGroup;
            this.joinedClass = joinedClass;
            this.count = count;
        }

        String subjectCode() {
            return subjectCode;
        }

        List<String> classGroup() {
            return classGroup;
        }

        boolean joinedClass() {
            return joinedClass;
        }

        int count() {
            return count;
        }

        String classKey() {
            return String.join("+", classGroup);
        }

        void increment() {
            count++;
        }

        void decrement() {
            count--;
        }
    }
}
