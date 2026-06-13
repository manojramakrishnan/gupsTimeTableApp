import React from 'react';
import { createRoot } from 'react-dom/client';
import { AlertTriangle, Download, RotateCcw, Table2, Users } from 'lucide-react';
import './styles.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const PERIODS = [1, 2, 3, 4, 5, 6, 7];
const MIDDLE_PERIODS = new Set([2, 3, 4, 5, 6]);
const CORE_SUBJECT_CODES = new Set(['BS', 'ENG', 'HIN', 'SS', 'MAT']);
const SUPPORT_SUBJECT_CODES = new Set(['IT', 'HE', 'WE', 'LIB', 'AE']);

const CLASS_TEACHER_CODES = {
  '5A': 'PKN',
  '5B': 'AVR',
  '5C': 'ASR',
  '5D': 'DPS',
  '6A': 'AMV',
  '6B': 'BVO',
  '6C': 'SKC',
  '6D': 'DML',
  '7A': 'ASN',
  '7B': 'SKS',
  '7C': 'MMZ',
  '7D': 'AAC',
  '7E': 'SR'
};

const CLASS_TEACHER_SUBJECTS = {
  '5A': 'BS',
  '5B': 'ENG',
  '5C': 'MAL',
  '5D': 'MAT',
  '6A': 'MAT',
  '6B': 'ENG',
  '6C': 'SS',
  '6D': 'SS',
  '7A': 'BS',
  '7B': 'SS',
  '7C': 'ENG',
  '7D': 'MAL',
  '7E': 'ENG'
};

const RESERVED_TEACHER_SUBJECTS = {
  PKN: ['AE', 'HE'],
  AVR: ['HE', 'AE', 'WE', 'LIB', 'AE'],
  ASR: ['WE', 'LIB'],
  DPS: ['IT', 'HE', 'AE', 'WE', 'LIB'],
  AMV: ['IT', 'HE', 'WE', 'LIB'],
  BVO: ['IT', 'HE', 'WE', 'LIB'],
  SKC: ['IT', 'HE', 'WE', 'LIB'],
  DML: ['LIB'],
  ASN: ['IT', 'HE', 'WE', 'LIB'],
  SKS: ['IT', 'HE', 'WE', 'LIB'],
  MMZ: ['IT', 'HE', 'WE', 'LIB'],
  SR: ['IT', 'HE', 'WE', 'LIB']
};

const FORCED_WEEKLY_SESSIONS = [
  {
    teacherCode: 'AVR',
    subjectCode: 'BS',
    classGroup: ['6D'],
    periodsByDay: {
      Monday: 2,
      Tuesday: 3,
      Wednesday: 4,
      Thursday: 5,
      Friday: 6
    }
  }
];

const TEACHER_DUTY_OVERRIDES = [
  {
    teacherCode: 'AVR',
    day: 'Thursday',
    subjectCode: 'LIB'
  }
];

const ASR_MATH_OVERRIDES = [
  { day: 'Thursday', mode: 'replace-subject', replaceSubjectCode: 'WE' },
  { day: 'Friday', mode: 'fill-free' },
  { day: 'Tuesday', mode: 'fill-free' }
];

const DPS_DUTY_OVERRIDES = [
  { day: 'Wednesday', subjectCode: 'LIB' },
  { day: 'Thursday', subjectCode: 'AE' }
];

const LANGUAGE_COMBINED_GROUPS = [
  ['5A', '5B'],
  ['5C', '5D'],
  ['6A', '6B'],
  ['6C', '6D'],
  ['7A', '7B'],
  ['7C', '7D'],
  ['7E']
];

const TARGETED_TEACHER_CORRECTIONS = [
  { action: 'replace-any', teacherCode: 'AMV', from: 'IT', to: 'WE' },
  { action: 'fill-free', teacherCode: 'AMV', day: 'Monday', subjectCode: 'HE' },
  { action: 'fill-free', teacherCode: 'AMV', day: 'Wednesday', subjectCode: 'LIB' },

  { action: 'remove-on-day', teacherCode: 'BVO', day: 'Wednesday', subjectCode: 'IT' },
  { action: 'replace-any', teacherCode: 'BVO', from: 'HE', to: 'LIB' },

  { action: 'fill-free', teacherCode: 'SKC', day: 'Friday', subjectCode: 'LIB' },

  { action: 'fill-free', teacherCode: 'DML', day: 'Tuesday', subjectCode: 'MAL', classGroup: ['7A'] },
  { action: 'fill-free', teacherCode: 'DML', day: 'Thursday', subjectCode: 'MAL', classGroup: ['7A'] },

  { action: 'replace-on-day', teacherCode: 'ASN', day: 'Thursday', from: 'IT', to: 'LIB' },
  { action: 'fill-free', teacherCode: 'ASN', day: 'Friday', subjectCode: 'WE' },

  { action: 'replace-any', teacherCode: 'SKS', from: 'IT', to: 'LIB' },
  { action: 'fill-free', teacherCode: 'SKS', day: 'Wednesday', subjectCode: 'HE' },
  { action: 'fill-free', teacherCode: 'SKS', day: 'Monday', subjectCode: 'WE' },

  { action: 'replace-on-day', teacherCode: 'MMZ', day: 'Wednesday', from: 'IT', to: 'LIB' },
  { action: 'fill-free-any', teacherCode: 'MMZ', subjectCode: 'HE' },

  { action: 'replace-on-day', teacherCode: 'SR', day: 'Friday', from: 'IT', to: 'HE' },
  { action: 'fill-free', teacherCode: 'SR', day: 'Thursday', subjectCode: 'LIB' },

  { action: 'fill-free', teacherCode: 'LA', day: 'Tuesday', subjectCode: 'HIN', classGroup: ['7A'] },
  { action: 'fill-free', teacherCode: 'LA', day: 'Tuesday', subjectCode: 'WE', classGroup: ['6D'] },

  { action: 'fill-nth-free', teacherCode: 'H1', nth: 3, subjectCode: 'HE', classGroup: ['6D'] }
];

const subjectTone = {
  CT: 'tone-gray',
  BS: 'tone-green',
  MAL: 'tone-coral',
  HIN: 'tone-amber',
  SS: 'tone-blue',
  MAT: 'tone-teal',
  ENG: 'tone-ink',
  IT: 'tone-violet',
  LIB: 'tone-gray',
  HE: 'tone-mint',
  WE: 'tone-orange',
  AE: 'tone-pink',
  'ARA/SAN': 'tone-sky'
};

function App() {
  const [teachers, setTeachers] = React.useState([]);
  const [subjects, setSubjects] = React.useState([]);
  const [activeTab, setActiveTab] = React.useState('teacher');
  const [selectedTeacher, setSelectedTeacher] = React.useState('');
  const [selectedClass, setSelectedClass] = React.useState('');
  const [loadError, setLoadError] = React.useState('');

  React.useEffect(() => {
    Promise.all([getJson('/api/allocations'), getJson('/api/subjects')])
      .then(([teacherData, subjectData]) => {
        const classList = getClasses(teacherData);
        setTeachers(teacherData);
        setSubjects(subjectData);
        setSelectedTeacher(teacherData[0]?.code || '');
        setSelectedClass(classList[0] || '');
      })
      .catch(() => setLoadError('Unable to load timetable data.'));
  }, []);

  const subjectMap = React.useMemo(
    () => ({
      ...Object.fromEntries(subjects.map((subject) => [subject.code, subject.name])),
      CT: 'Class Teacher',
      'ARA/SAN': 'Arabic / Sanskrit'
    }),
    [subjects]
  );

  const classList = React.useMemo(() => getClasses(teachers), [teachers]);
  const classTeachers = React.useMemo(() => resolveClassTeachers(teachers), [teachers]);
  const plan = React.useMemo(
    () => generatePlan(teachers, subjectMap, classTeachers),
    [teachers, subjectMap, classTeachers]
  );
  const selectedTeacherRecord = teachers.find((entry) => entry.code === selectedTeacher);

  function resetSelection() {
    setActiveTab('teacher');
    setSelectedTeacher(teachers[0]?.code || '');
    setSelectedClass(classList[0] || '');
  }

  function downloadCurrentPdf() {
    const isTeacher = activeTab === 'teacher';
    const title = isTeacher
      ? `${selectedTeacherRecord?.name || 'Teacher'} (${selectedTeacher || ''})`
      : `${selectedClass} Class Timetable`;
    const schedule = isTeacher ? plan.teacherSchedules[selectedTeacher] : plan.classSchedules[selectedClass];
    openPrintableTimetable({
      title,
      subtitle: isTeacher ? 'Teacher timetable' : 'Class timetable',
      type: isTeacher ? 'teacher' : 'class',
      schedule
    });
  }

  if (loadError) {
    return <main className="app-shell"><p className="error-state">{loadError}</p></main>;
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">School timetable</p>
          <h1>Teacher & Class Timetable</h1>
        </div>
        <div className="topbar-actions">
          <button className="icon-button" type="button" title="Download PDF" onClick={downloadCurrentPdf}>
            <Download size={18} />
          </button>
          <button className="icon-button" type="button" title="Reset selection" onClick={resetSelection}>
            <RotateCcw size={18} />
          </button>
        </div>
      </header>

      <section className="tab-bar" aria-label="Timetable dashboards">
        <button className={activeTab === 'teacher' ? 'tab-button active' : 'tab-button'} onClick={() => setActiveTab('teacher')} type="button">
          <Users size={18} />
          Teacher timetable
        </button>
        <button className={activeTab === 'class' ? 'tab-button active' : 'tab-button'} onClick={() => setActiveTab('class')} type="button">
          <Table2 size={18} />
          Class timetable
        </button>
      </section>

      {activeTab === 'teacher' ? (
        <DashboardPanel
          title={selectedTeacherRecord ? `${selectedTeacherRecord.name} (${selectedTeacherRecord.code})` : 'Teacher'}
          subtitle="Teacher weekly timetable"
          type="teacher"
          schedule={plan.teacherSchedules[selectedTeacher]}
          selector={(
            <label className="teacher-select">
              <Users size={18} />
              <select value={selectedTeacher} onChange={(event) => setSelectedTeacher(event.target.value)}>
                {teachers.map((entry) => (
                  <option value={entry.code} key={entry.code}>{entry.name} ({entry.code})</option>
                ))}
              </select>
            </label>
          )}
        />
      ) : (
        <DashboardPanel
          title={`${selectedClass} Class Timetable`}
          subtitle="Class division timetable"
          type="class"
          schedule={plan.classSchedules[selectedClass]}
          selector={(
            <label className="teacher-select">
              <Table2 size={18} />
              <select value={selectedClass} onChange={(event) => setSelectedClass(event.target.value)}>
                {classList.map((className) => (
                  <option value={className} key={className}>{className}</option>
                ))}
              </select>
            </label>
          )}
        />
      )}

      {plan.unassigned.length > 0 && (
        <section className="issue-panel">
          <div className="assignment-title">
            <AlertTriangle size={18} />
            <strong>Unscheduled items</strong>
            <em>{plan.unassigned.length}</em>
          </div>
          <div className="issue-list">
            {plan.unassigned.slice(0, 24).map((item, index) => (
              <span key={`${item.subjectCode}-${item.classGroup.join('-')}-${index}`}>
                {item.subjectName} · {item.classGroup.join(' + ')} · {item.teacherNames.join(' / ')}
              </span>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

function DashboardPanel({ title, subtitle, type, schedule = {}, selector }) {
  return (
    <section className="timetable-panel">
      <div className="timetable-head">
        <div>
          <p className="eyebrow">{subtitle}</p>
          <h2>{title}</h2>
        </div>
        {selector}
      </div>
      <TimetableGrid schedule={schedule} type={type} />
    </section>
  );
}

function TimetableGrid({ schedule = {}, type }) {
  return (
    <div className="timetable-scroll">
      <table className="timetable-table">
        <thead>
          <tr>
            <th>Day</th>
            {PERIODS.map((period) => <th key={period}>P{period}</th>)}
          </tr>
        </thead>
        <tbody>
          {DAYS.map((day) => (
            <tr key={day}>
              <th>{day}</th>
              {PERIODS.map((period) => (
                <td key={`${day}-${period}`}>
                  <ScheduleCell entry={schedule[slotKey(day, period)]} period={period} type={type} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ScheduleCell({ entry, period, type }) {
  const entries = getCellEntries(entry);
  if (entries.length === 0) {
    return (
      <div className={type === 'teacher' ? 'timetable-cell free' : 'timetable-cell open'}>
        <span>{type === 'teacher' ? 'Free' : 'Open'}</span>
      </div>
    );
  }

  if (entries.length > 1) {
    return (
      <div className="timetable-cell-stack">
        {entries.map((cellEntry, index) => (
          <ScheduleEntryCard entry={cellEntry} type={type} key={`${cellEntry.subjectCode}-${cellEntry.teacherCodes?.join('-')}-${index}`} />
        ))}
      </div>
    );
  }

  return <ScheduleEntryCard entry={entries[0]} type={type} />;
}

function ScheduleEntryCard({ entry, type }) {
  return (
    <div className={entry.joinedClass ? 'timetable-cell joined' : 'timetable-cell'}>
      <span className={`subject-pill ${subjectTone[entry.subjectCode] || 'tone-gray'}`}>{entry.subjectCode}</span>
      <strong>{entry.classGroup?.join(' + ') || entry.label}</strong>
      <small>{type === 'teacher' ? entry.classLabel : entry.teacherNames.join(' / ')}</small>
    </div>
  );
}

function getCellEntries(entry) {
  return entry ? [entry, ...(entry.additionalEntries || [])] : [];
}

function generatePlan(teachers, subjectMap, classTeachers) {
  const classList = getClasses(teachers);
  const classSchedules = Object.fromEntries(classList.map((className) => [className, {}]));
  const unassigned = [];

  for (const className of classList) {
    for (const day of DAYS) {
      const homeTeacher = classTeachers[className];
      const subjectCode = CLASS_TEACHER_SUBJECTS[className] || 'CT';
      const entry = {
        subjectCode,
        subjectName: subjectMap[subjectCode] || 'Class Teacher',
        classGroup: [className],
        classLabel: className,
        teacherCodes: homeTeacher ? [homeTeacher.code] : [],
        teacherNames: homeTeacher ? [homeTeacher.name] : ['Class Teacher'],
        joinedClass: false,
        label: subjectMap[subjectCode] || 'Class Teacher'
      };
      classSchedules[className][slotKey(day, 1)] = entry;
    }
  }

  const dayPlan = buildBalancedDayPlan(teachers, subjectMap, classList);
  unassigned.push(...dayPlan.unassigned);

  for (const day of DAYS) {
    const placedSessions = scheduleDayPeriods(day, dayPlan.byDay[day], teachers, classList);
    if (!placedSessions) {
      unassigned.push(...dayPlan.byDay[day]);
      continue;
    }

    for (const session of placedSessions) {
      const key = slotKey(day, session.period);
      const entry = timetableEntryFromSession(session, subjectMap);
      for (const className of session.classGroup) {
        classSchedules[className][key] = entry;
      }
    }
  }

  return {
    teacherSchedules: buildTeacherSchedulesFromClassSchedules(teachers, classSchedules),
    classSchedules,
    unassigned
  };
}

function buildBalancedDayPlan(teachers, subjectMap, classList) {
  for (let seed = 0; seed < 128; seed++) {
    const plan = distributeWeeklySessionsByDay(teachers, subjectMap, classList, seed);
    if (plan.ok) {
      return plan;
    }
  }

  return distributeWeeklySessionsByDay(teachers, subjectMap, classList, 2);
}

function distributeWeeklySessionsByDay(teachers, subjectMap, classList, seed) {
  const byDay = Object.fromEntries(DAYS.map((day) => [day, []]));
  const classDayCount = Object.fromEntries(
    classList.map((className) => [
      className,
      Object.fromEntries(DAYS.map((day) => [day, 0]))
    ])
  );
  const teacherDayCount = Object.fromEntries(
    teachers.map((teacher) => [
      teacher.code,
      Object.fromEntries(DAYS.map((day) => [day, 0]))
    ])
  );
  const occurrences = [];
  const unassigned = [];
  let sessionId = 0;

  function addFixedSession(day, session) {
    byDay[day].push({ ...session, id: sessionId++, fixedDay: true });
    for (const className of session.classGroup) {
      classDayCount[className][day]++;
    }
    for (const teacherCode of session.teacherCodes) {
      teacherDayCount[teacherCode][day]++;
    }
  }

  function addOccurrence(session, occurrenceIndex, totalOccurrences) {
    occurrences.push({
      ...session,
      id: sessionId++,
      occurrenceIndex,
      totalOccurrences,
      demandKey: `${session.teacherCodes.join('+')}-${session.subjectCode}-${session.classGroup.join('+')}`
    });
  }

  for (const teacher of teachers) {
    for (const assignment of teacher.assignments) {
      if (assignment.subjectCode === 'ARA' || assignment.subjectCode === 'SAN') {
        continue;
      }

      for (const classGroup of assignment.classGroups) {
        const requiredPeriods = periodsFor(assignment.subjectCode, classGroup);
        if (requiredPeriods <= 0) {
          continue;
        }

        const preassignedPeriods = classTeacherPreassignedPeriods(teacher.code, assignment.subjectCode, classGroup);
        const remainingPeriods = Math.max(0, requiredPeriods - preassignedPeriods);
        if (remainingPeriods === 0) {
          continue;
        }

        const session = {
          subjectCode: assignment.subjectCode,
          subjectName: subjectMap[assignment.subjectCode] || assignment.subjectCode,
          classGroup,
          classLabel: classGroup.join(' + '),
          teacherCodes: [teacher.code],
          teacherNames: [teacher.name],
          joinedClass: assignment.joinedClass
        };

        if (assignment.subjectCode === 'MAL') {
          if (preassignedPeriods === 0) {
            for (const day of DAYS) {
              addFixedSession(day, session);
            }
          }
          addOccurrence(session, 0, 1);
          continue;
        }

        if (['ENG', 'BS', 'SS', 'MAT'].includes(assignment.subjectCode)) {
          for (const day of DAYS) {
            addFixedSession(day, session);
          }
          continue;
        }

        for (let index = 0; index < remainingPeriods; index++) {
          addOccurrence(session, index, remainingPeriods);
        }
      }
    }
  }

  const arabicTeacher = teachers.find((teacher) =>
    teacher.assignments.some((assignment) => assignment.subjectCode === 'ARA')
  );
  const sanskritTeacher = teachers.find((teacher) =>
    teacher.assignments.some((assignment) => assignment.subjectCode === 'SAN')
  );

  if (arabicTeacher && sanskritTeacher) {
    for (const classGroup of LANGUAGE_COMBINED_GROUPS) {
      const session = {
        subjectCode: 'ARA/SAN',
        subjectName: subjectMap['ARA/SAN'] || 'Arabic / Sanskrit',
        classGroup,
        classLabel: classGroup.join(' + '),
        teacherCodes: [arabicTeacher.code, sanskritTeacher.code],
        teacherNames: [arabicTeacher.name, sanskritTeacher.name],
        joinedClass: classGroup.length > 1
      };
      addOccurrence(session, 0, 2);
      addOccurrence(session, 1, 2);
    }
  }

  const usedDaysByDemand = {};
  occurrences.sort((left, right) =>
    right.classGroup.length - left.classGroup.length ||
    combinedPriority(left.subjectCode) - combinedPriority(right.subjectCode) ||
    right.totalOccurrences - left.totalOccurrences ||
    stableHash(`${seed}-${left.demandKey}`) - stableHash(`${seed}-${right.demandKey}`)
  );

  for (const occurrence of occurrences) {
    const usedDays = usedDaysByDemand[occurrence.demandKey] || new Set();
    const dayOptions = DAYS
      .filter((day) =>
        !usedDays.has(day) &&
        occurrence.classGroup.every((className) => classDayCount[className][day] < 6) &&
        occurrence.teacherCodes.every((teacherCode) => teacherDayCount[teacherCode][day] < 5)
      )
      .sort((left, right) =>
        scoreDayOption(occurrence, left, classDayCount, teacherDayCount, seed) -
        scoreDayOption(occurrence, right, classDayCount, teacherDayCount, seed)
      );

    const selectedDay = dayOptions[0];
    if (!selectedDay) {
      unassigned.push(occurrence);
      continue;
    }

    byDay[selectedDay].push(occurrence);
    for (const className of occurrence.classGroup) {
      classDayCount[className][selectedDay]++;
    }
    for (const teacherCode of occurrence.teacherCodes) {
      teacherDayCount[teacherCode][selectedDay]++;
    }
    usedDaysByDemand[occurrence.demandKey] = usedDays;
    usedDays.add(selectedDay);
  }

  const ok = classList.every((className) =>
    DAYS.every((day) => classDayCount[className][day] === 6)
  ) && teachers.every((teacher) =>
    DAYS.every((day) => teacherDayCount[teacher.code][day] <= 5)
  ) && unassigned.length === 0;

  return { byDay, unassigned, ok };
}

function scheduleDayPeriods(day, sessions, teachers, classList) {
  const classUsed = Object.fromEntries(classList.map((className) => [className, {}]));
  const teacherUsed = Object.fromEntries(teachers.map((teacher) => [teacher.code, {}]));
  const teacherMiddleLoad = Object.fromEntries(teachers.map((teacher) => [teacher.code, 0]));
  const malayalamPeriods = {};

  function canUsePeriod(session, period) {
    if (session.classGroup.some((className) => classUsed[className][period])) {
      return false;
    }
    if (session.teacherCodes.some((teacherCode) => teacherUsed[teacherCode][period])) {
      return false;
    }
    if (MIDDLE_PERIODS.has(period) && session.teacherCodes.some((teacherCode) => teacherMiddleLoad[teacherCode] >= 4)) {
      return false;
    }
    if (session.subjectCode === 'MAL') {
      return session.classGroup.every((className) => {
        const usedPeriods = malayalamPeriods[className] || [];
        if (usedPeriods.some((usedPeriod) => Math.abs(usedPeriod - period) <= 1)) {
          return false;
        }
        return !(CLASS_TEACHER_SUBJECTS[className] === 'MAL' && usedPeriods.length === 0 && period === 2);
      });
    }
    return true;
  }

  function placeInPeriod(session, period) {
    session.period = period;
    for (const className of session.classGroup) {
      classUsed[className][period] = session;
    }
    for (const teacherCode of session.teacherCodes) {
      teacherUsed[teacherCode][period] = session;
      if (MIDDLE_PERIODS.has(period)) {
        teacherMiddleLoad[teacherCode]++;
      }
    }
    if (session.subjectCode === 'MAL') {
      for (const className of session.classGroup) {
        malayalamPeriods[className] = [...(malayalamPeriods[className] || []), period];
      }
    }
  }

  function removeFromPeriod(session, period) {
    delete session.period;
    for (const className of session.classGroup) {
      delete classUsed[className][period];
    }
    for (const teacherCode of session.teacherCodes) {
      delete teacherUsed[teacherCode][period];
      if (MIDDLE_PERIODS.has(period)) {
        teacherMiddleLoad[teacherCode]--;
      }
    }
    if (session.subjectCode === 'MAL') {
      for (const className of session.classGroup) {
        malayalamPeriods[className] = (malayalamPeriods[className] || []).filter((usedPeriod) => usedPeriod !== period);
      }
    }
  }

  function periodOptions(session) {
    return [2, 3, 4, 5, 6, 7]
      .filter((period) => canUsePeriod(session, period))
      .sort((left, right) =>
        scorePeriodOption(session, day, left, sessions) -
        scorePeriodOption(session, day, right, sessions)
      );
  }

  function placeRemaining(remainingSessions) {
    if (remainingSessions.length === 0) {
      return true;
    }

    let bestIndex = -1;
    let bestOptions = undefined;
    for (let index = 0; index < remainingSessions.length; index++) {
      const options = periodOptions(remainingSessions[index]);
      if (!bestOptions || options.length < bestOptions.length) {
        bestIndex = index;
        bestOptions = options;
        if (options.length === 0) {
          break;
        }
      }
    }

    if (!bestOptions?.length) {
      return false;
    }

    const [session] = remainingSessions.splice(bestIndex, 1);
    for (const period of bestOptions) {
      placeInPeriod(session, period);
      if (placeRemaining(remainingSessions)) {
        return true;
      }
      removeFromPeriod(session, period);
    }
    remainingSessions.splice(bestIndex, 0, session);
    return false;
  }

  const placedSessions = sessions.map((session) => ({ ...session }));
  const remainingSessions = placedSessions
    .slice()
    .sort((left, right) => right.classGroup.length - left.classGroup.length);

  return placeRemaining(remainingSessions) ? placedSessions : undefined;
}

function classTeacherPreassignedPeriods(teacherCode, subjectCode, classGroup) {
  if (classGroup.length !== 1) {
    return 0;
  }
  const className = classGroup[0];
  return CLASS_TEACHER_CODES[className] === teacherCode && CLASS_TEACHER_SUBJECTS[className] === subjectCode
    ? DAYS.length
    : 0;
}

function combinedPriority(subjectCode) {
  return subjectCode === 'ARA/SAN' ? 0 : 1;
}

function scoreDayOption(session, day, classDayCount, teacherDayCount, seed) {
  const classNeed = session.classGroup.reduce((sum, className) => sum + (6 - classDayCount[className][day]), 0);
  const teacherLoad = session.teacherCodes.reduce((sum, teacherCode) => sum + teacherDayCount[teacherCode][day], 0);
  return -classNeed * 50 +
    teacherLoad * 10 +
    (stableHash(`${seed}-${session.demandKey}-${day}`) % 17);
}

function scorePeriodOption(session, day, period, daySessions) {
  const preferredPeriod = [2, 3, 4, 5, 6, 7][
    (stableHash(`${day}-${session.demandKey || session.id}-${session.occurrenceIndex || 0}`) + DAYS.indexOf(day)) % 6
  ];
  const teacherNeedsPeriodSeven = session.teacherCodes.some((teacherCode) =>
    daySessions.filter((entry) => entry.teacherCodes.includes(teacherCode)).length >= 5
  );
  return (teacherNeedsPeriodSeven && period !== 7 ? 30 : 0) +
    (period === 7 ? 5 : 0) +
    Math.abs(period - preferredPeriod) * 3 +
    (stableHash(`${session.id}-${period}`) % 5);
}

function timetableEntryFromSession(session, subjectMap) {
  return {
    subjectCode: session.subjectCode,
    subjectName: subjectMap[session.subjectCode] || session.subjectName || session.subjectCode,
    classGroup: session.classGroup,
    classLabel: session.classLabel || session.classGroup.join(' + '),
    teacherCodes: session.teacherCodes,
    teacherNames: session.teacherNames,
    joinedClass: session.joinedClass,
    label: subjectMap[session.subjectCode] || session.subjectName || session.subjectCode
  };
}

function buildSessions(teachers, subjectMap, preassignedCounts = {}) {
  const sessions = [];
  const languageTeachers = {
    ARA: teachers.find((teacher) => teacher.assignments.some((assignment) => assignment.subjectCode === 'ARA')),
    SAN: teachers.find((teacher) => teacher.assignments.some((assignment) => assignment.subjectCode === 'SAN'))
  };

  for (const teacher of teachers) {
    for (const assignment of teacher.assignments) {
      if (assignment.subjectCode === 'ARA' || assignment.subjectCode === 'SAN') {
        continue;
      }

      for (const classGroup of assignment.classGroups) {
        const teacherCode = teacher.code;
        const weeklyPeriods = Math.max(
          0,
          periodsFor(assignment.subjectCode, classGroup) -
            (preassignedCounts[demandCountKey(teacherCode, assignment.subjectCode, classGroup)] || 0)
        );
        if (weeklyPeriods === 0) {
          continue;
        }
        sessions.push({
          subjectCode: assignment.subjectCode,
          subjectName: subjectMap[assignment.subjectCode] || assignment.subjectCode,
          classGroup,
          classLabel: classGroup.join(' + '),
          teacherCodes: [teacherCode],
          teacherNames: [teacher.name],
          joinedClass: assignment.joinedClass,
          weeklyPeriods
        });
      }
    }
  }

  if (languageTeachers.ARA && languageTeachers.SAN) {
    for (const classGroup of LANGUAGE_COMBINED_GROUPS) {
      sessions.push({
        subjectCode: 'ARA/SAN',
        subjectName: 'Arabic / Sanskrit',
        classGroup,
        classLabel: classGroup.join(' + '),
        teacherCodes: [languageTeachers.ARA.code, languageTeachers.SAN.code],
        teacherNames: [languageTeachers.ARA.name, languageTeachers.SAN.name],
        joinedClass: classGroup.length > 1,
        weeklyPeriods: 2
      });
    }
  }

  return sessions;
}

function buildTeacherSchedulesFromClassSchedules(teachers, classSchedules) {
  const teacherSchedules = Object.fromEntries(teachers.map((teacher) => [teacher.code, {}]));

  for (const schedule of Object.values(classSchedules)) {
    for (const [key, entry] of Object.entries(schedule)) {
      for (const teacherCode of entry.teacherCodes || []) {
        if (teacherSchedules[teacherCode]) {
          teacherSchedules[teacherCode][key] = entry;
        }
      }
    }
  }

  return teacherSchedules;
}

function applyForcedWeeklySessions(
  teachers,
  subjectMap,
  teacherSchedules,
  classSchedules,
  teacherMiddleLoad,
  subjectDayPeriods,
  preassignedCounts,
  unassigned
) {
  for (const forcedSession of FORCED_WEEKLY_SESSIONS) {
    const teacher = teachers.find((entry) => entry.code === forcedSession.teacherCode);
    if (!teacher) {
      continue;
    }

    for (const [day, period] of Object.entries(forcedSession.periodsByDay)) {
      const key = slotKey(day, period);
      const classFree = forcedSession.classGroup.every((className) => !classSchedules[className]?.[key]);
      const teacherFree = !teacherSchedules[teacher.code]?.[key];
      const entry = {
        subjectCode: forcedSession.subjectCode,
        subjectName: subjectMap[forcedSession.subjectCode] || forcedSession.subjectCode,
        classGroup: forcedSession.classGroup,
        classLabel: forcedSession.classGroup.join(' + '),
        teacherCodes: [teacher.code],
        teacherNames: [teacher.name],
        joinedClass: forcedSession.classGroup.length > 1,
        label: subjectMap[forcedSession.subjectCode] || forcedSession.subjectCode,
        fixedSession: true
      };

      if (!classFree || !teacherFree) {
        unassigned.push(entry);
        continue;
      }

      teacherSchedules[teacher.code][key] = entry;
      for (const className of forcedSession.classGroup) {
        classSchedules[className][key] = entry;
        const dayKey = subjectDayKey(className, day, forcedSession.subjectCode);
        subjectDayPeriods[dayKey] = [...(subjectDayPeriods[dayKey] || []), period];
      }
      if (MIDDLE_PERIODS.has(period)) {
        teacherMiddleLoad[`${teacher.code}-${day}`] = (teacherMiddleLoad[`${teacher.code}-${day}`] || 0) + 1;
      }
      preassignedCounts[demandCountKey(teacher.code, forcedSession.subjectCode, forcedSession.classGroup)] =
        (preassignedCounts[demandCountKey(teacher.code, forcedSession.subjectCode, forcedSession.classGroup)] || 0) + 1;
    }
  }
}

function findSlot(session, teacherSchedules, classSchedules, teacherMiddleLoad, subjectDayPeriods, patternPeriodLoad) {
  const options = [];
  for (const day of DAYS) {
    for (const period of PERIODS.slice(1)) {
      if (!isAvailable(session, day, period, teacherSchedules, classSchedules, teacherMiddleLoad, subjectDayPeriods)) {
        continue;
      }
      options.push({
        day,
        period,
        score: scoreSlot(session, day, period, teacherSchedules, classSchedules, teacherMiddleLoad, subjectDayPeriods, patternPeriodLoad)
      });
    }
  }
  return options.sort((left, right) => left.score - right.score)[0];
}

function isAvailable(session, day, period, teacherSchedules, classSchedules, teacherMiddleLoad, subjectDayPeriods) {
  const key = slotKey(day, period);
  const classFree = session.classGroup.every((className) => !classSchedules[className]?.[key]);
  const teacherFree = session.teacherCodes.every((code) => !teacherSchedules[code]?.[key]);
  if (!classFree || !teacherFree) {
    return false;
  }

  if (MIDDLE_PERIODS.has(period)) {
    const leavesMiddleFree = session.teacherCodes.every((code) =>
      (teacherMiddleLoad[`${code}-${day}`] || 0) < 4
    );
    if (!leavesMiddleFree) {
      return false;
    }
  }

  return session.classGroup.every((className) => {
    const usedPeriods = subjectDayPeriods[subjectDayKey(className, day, session.subjectCode)] || [];
    const maxDaily = session.subjectCode === 'MAL' ? 2 : 1;
    if (usedPeriods.length >= maxDaily) {
      return false;
    }
    if (session.subjectCode === 'MAL' && usedPeriods.length > 0) {
      const malDaysUsed = DAYS.filter((schoolDay) =>
        (subjectDayPeriods[subjectDayKey(className, schoolDay, session.subjectCode)] || []).length > 0
      ).length;
      if (malDaysUsed < DAYS.length) {
        return false;
      }
    }
    if (session.subjectCode === 'MAL' && usedPeriods.some((usedPeriod) => Math.abs(usedPeriod - period) <= 1)) {
      return false;
    }
    return true;
  });
}

function scoreSlot(session, day, period, teacherSchedules, classSchedules, teacherMiddleLoad, subjectDayPeriods, patternPeriodLoad) {
  const teacherLoad = session.teacherCodes.reduce((sum, code) => sum + dayLoad(teacherSchedules[code], day), 0);
  const classLoad = session.classGroup.reduce((sum, className) => sum + dayLoad(classSchedules[className], day), 0);
  const subjectLoad = session.classGroup.reduce(
    (sum, className) => sum + (subjectDayPeriods[subjectDayKey(className, day, session.subjectCode)] || []).length,
    0
  );
  const middleLoad = session.teacherCodes.reduce((sum, code) => sum + (teacherMiddleLoad[`${code}-${day}`] || 0), 0);
  const repeatedPeriod = patternPeriodLoad[patternPeriodKey(session, period)] || 0;
  const preferredPeriod = preferredRotatedPeriod(session, day);
  const rotationDistance = Math.abs(preferredPeriod - period);
  const malayalamRotationPenalty = session.subjectCode === 'MAL' ? rotationDistance * 18 : rotationDistance * 5;

  return teacherLoad * 18
    + classLoad * 12
    + subjectLoad * 45
    + middleLoad * 8
    + repeatedPeriod * 90
    + malayalamRotationPenalty
    + (period === 7 ? 10 : period);
}

function placeSession(session, slot, teacherSchedules, classSchedules, teacherMiddleLoad, subjectDayPeriods, patternPeriodLoad) {
  const key = slotKey(slot.day, slot.period);
  const entry = { ...session, label: session.subjectName };
  for (const className of session.classGroup) {
    classSchedules[className][key] = entry;
    const dayKey = subjectDayKey(className, slot.day, session.subjectCode);
    subjectDayPeriods[dayKey] = [...(subjectDayPeriods[dayKey] || []), slot.period];
  }
  for (const code of session.teacherCodes) {
    teacherSchedules[code][key] = entry;
    if (MIDDLE_PERIODS.has(slot.period)) {
      teacherMiddleLoad[`${code}-${slot.day}`] = (teacherMiddleLoad[`${code}-${slot.day}`] || 0) + 1;
    }
  }
  patternPeriodLoad[patternPeriodKey(session, slot.period)] = (patternPeriodLoad[patternPeriodKey(session, slot.period)] || 0) + 1;
}

function periodsFor(subjectCode, classGroup) {
  if (subjectCode === 'MAL') return 6;
  if (subjectCode === 'ENG') return 5;
  if (subjectCode === 'BS') return 5;
  if (subjectCode === 'SS') return 5;
  if (subjectCode === 'MAT') return 5;
  if (subjectCode === 'HIN') return classGroup.some((className) => gradeOf(className) === 5) ? 2 : 3;
  if (subjectCode === 'AE') return classGroup.some((className) => gradeOf(className) === 5) ? 1 : 0;
  if (['WE', 'HE', 'LIB', 'IT'].includes(subjectCode)) return 1;
  return 0;
}

function priority(subjectCode) {
  return {
    MAL: 1,
    ENG: 2,
    BS: 3,
    SS: 4,
    MAT: 5,
    HIN: 6,
    'ARA/SAN': 7,
    IT: 8,
    WE: 9,
    HE: 10,
    LIB: 11,
    AE: 12
  }[subjectCode] || 20;
}

function applyReservedTeacherDuties(teachers, subjectMap, teacherSchedules) {
  for (const teacher of teachers) {
    const dutySubjects = RESERVED_TEACHER_SUBJECTS[teacher.code];
    if (!dutySubjects?.length) {
      continue;
    }

    let dutyIndex = 0;
    for (const day of DAYS) {
      const key = slotKey(day, 7);
      if (teacherSchedules[teacher.code]?.[key]) {
        continue;
      }

      const subjectCode = dutySubjects[dutyIndex % dutySubjects.length];
      dutyIndex++;
      teacherSchedules[teacher.code][key] = {
        subjectCode,
        subjectName: subjectMap[subjectCode] || subjectCode,
        classGroup: [],
        classLabel: 'Reserved duty',
        teacherCodes: [teacher.code],
        teacherNames: [teacher.name],
        joinedClass: false,
        label: subjectMap[subjectCode] || subjectCode,
        reservedDuty: true
      };
    }
  }
}

function applyTeacherDutyOverrides(teachers, subjectMap, teacherSchedules) {
  for (const duty of TEACHER_DUTY_OVERRIDES) {
    const teacher = teachers.find((entry) => entry.code === duty.teacherCode);
    if (!teacher) {
      continue;
    }

    const freePeriods = [6, 5, 4, 3, 2].filter((period) =>
      !teacherSchedules[teacher.code]?.[slotKey(duty.day, period)]
    );
    if (freePeriods.length < 2) {
      continue;
    }

    const period = freePeriods[0];
    teacherSchedules[teacher.code][slotKey(duty.day, period)] = {
      subjectCode: duty.subjectCode,
      subjectName: subjectMap[duty.subjectCode] || duty.subjectCode,
      classGroup: [],
      classLabel: 'Reserved duty',
      teacherCodes: [teacher.code],
      teacherNames: [teacher.name],
      joinedClass: false,
      label: subjectMap[duty.subjectCode] || duty.subjectCode,
      reservedDuty: true
    };
  }
}

function normalizeAvrArtEducation(subjectMap, teacherSchedules) {
  const avrSchedule = teacherSchedules.AVR;
  if (!avrSchedule) {
    return;
  }

  const heEntries = DAYS.flatMap((day) =>
    PERIODS.map((period) => ({ day, period, key: slotKey(day, period), entry: avrSchedule[slotKey(day, period)] }))
  ).filter((slot) => slot.entry?.subjectCode === 'HE');

  if (heEntries.length <= 1) {
    return;
  }

  const target = heEntries.find((slot) => slot.entry.reservedDuty) || heEntries[heEntries.length - 1];
  avrSchedule[target.key] = {
    ...target.entry,
    subjectCode: 'AE',
    subjectName: subjectMap.AE || 'Art Education',
    label: subjectMap.AE || 'Art Education',
    classLabel: target.entry.reservedDuty ? 'Reserved duty' : target.entry.classLabel
  };
}

function normalizeDpsDuties(teachers, subjectMap, teacherSchedules) {
  const teacher = teachers.find((entry) => entry.code === 'DPS');
  const schedule = teacherSchedules.DPS;
  if (!teacher || !schedule) {
    return;
  }

  const itEntries = DAYS.flatMap((day) =>
    PERIODS.map((period) => ({ day, period, key: slotKey(day, period), entry: schedule[slotKey(day, period)] }))
  ).filter((slot) => slot.entry?.subjectCode === 'IT');

  if (itEntries.length > 1) {
    const target = itEntries.find((slot) => slot.entry.reservedDuty) || itEntries[itEntries.length - 1];
    schedule[target.key] = {
      ...target.entry,
      subjectCode: 'WE',
      subjectName: subjectMap.WE || 'Work Education',
      label: subjectMap.WE || 'Work Education',
      classLabel: target.entry.reservedDuty ? 'Reserved duty' : target.entry.classLabel
    };
  }

  for (const duty of DPS_DUTY_OVERRIDES) {
    const targetSlot = findTeacherFreeSlot(schedule, duty.day);
    if (!targetSlot) {
      continue;
    }

    schedule[targetSlot.key] = {
      subjectCode: duty.subjectCode,
      subjectName: subjectMap[duty.subjectCode] || duty.subjectCode,
      classGroup: [],
      classLabel: 'Reserved duty',
      teacherCodes: [teacher.code],
      teacherNames: [teacher.name],
      joinedClass: false,
      label: subjectMap[duty.subjectCode] || duty.subjectCode,
      reservedDuty: true
    };
  }
}

function applyTargetedTeacherCorrections(teachers, subjectMap, teacherSchedules, classSchedules, unassigned) {
  for (const correction of TARGETED_TEACHER_CORRECTIONS) {
    const teacher = teachers.find((entry) => entry.code === correction.teacherCode);
    const schedule = teacherSchedules[correction.teacherCode];
    if (!teacher || !schedule) {
      continue;
    }

    if (correction.action === 'replace-any') {
      const slot = findTeacherSubjectSlotAnyDay(schedule, correction.from);
      if (slot) {
        replaceSlotSubject(teacher, subjectMap, teacherSchedules, classSchedules, slot, correction.to);
      } else {
        addUnassignedCorrection(teacher, subjectMap, correction.to, correction.classGroup, unassigned);
      }
      continue;
    }

    if (correction.action === 'replace-on-day') {
      const slot = findTeacherSubjectSlot(schedule, correction.day, correction.from);
      if (slot) {
        replaceSlotSubject(teacher, subjectMap, teacherSchedules, classSchedules, slot, correction.to);
      } else {
        addUnassignedCorrection(teacher, subjectMap, correction.to, correction.classGroup, unassigned);
      }
      continue;
    }

    if (correction.action === 'remove-on-day') {
      const slot = findTeacherSubjectSlot(schedule, correction.day, correction.subjectCode);
      if (slot) {
        removeEntryAtSlot(teacherSchedules, classSchedules, correction.teacherCode, slot.day, slot.period);
      }
      continue;
    }

    if (correction.action === 'fill-free') {
      if (isCorrectionAlreadySatisfied(schedule, correction)) {
        continue;
      }
      const slot = findTeacherFreeSlot(schedule, correction.day);
      if (slot) {
        forceSubjectAtSlot(teacher, subjectMap, teacherSchedules, classSchedules, slot.day, slot.period, correction.subjectCode, correction.classGroup);
      } else {
        addUnassignedCorrection(teacher, subjectMap, correction.subjectCode, correction.classGroup, unassigned);
      }
      continue;
    }

    if (correction.action === 'fill-free-any') {
      if (isCorrectionAlreadySatisfied(schedule, correction)) {
        continue;
      }
      const slot = findTeacherFreeSlotAnyDay(schedule);
      if (slot) {
        forceSubjectAtSlot(teacher, subjectMap, teacherSchedules, classSchedules, slot.day, slot.period, correction.subjectCode, correction.classGroup);
      } else {
        addUnassignedCorrection(teacher, subjectMap, correction.subjectCode, correction.classGroup, unassigned);
      }
      continue;
    }

    if (correction.action === 'fill-nth-free') {
      if (isCorrectionAlreadySatisfied(schedule, correction)) {
        continue;
      }
      const slot = findNthTeacherFreeSlot(schedule, correction.nth);
      if (slot) {
        forceSubjectAtSlot(teacher, subjectMap, teacherSchedules, classSchedules, slot.day, slot.period, correction.subjectCode, correction.classGroup);
      } else {
        addUnassignedCorrection(teacher, subjectMap, correction.subjectCode, correction.classGroup, unassigned);
      }
    }
  }
}

function normalizeMalayalamWeeklyPeriods(teachers, subjectMap, teacherSchedules, classSchedules, unassigned) {
  for (const teacher of teachers) {
    const malayalamAssignments = teacher.assignments.filter((assignment) => assignment.subjectCode === 'MAL');
    for (const assignment of malayalamAssignments) {
      for (const classGroup of assignment.classGroups) {
        let weeklyCount = countTeacherSubjectForClass(teacherSchedules[teacher.code], 'MAL', classGroup);
        while (weeklyCount < 6) {
          const slot = findMalayalamFillSlot(teacher.code, classGroup, teacherSchedules, classSchedules);
          if (!slot) {
            addUnassignedCorrection(teacher, subjectMap, 'MAL', classGroup, unassigned);
            break;
          }

          forceSubjectAtSlot(teacher, subjectMap, teacherSchedules, classSchedules, slot.day, slot.period, 'MAL', classGroup);
          removeOneUnassigned(unassigned, teacher.code, 'MAL', classGroup);
          weeklyCount++;
        }
      }
    }
  }
}

function normalizeNonMalayalamWeeklyPeriods(teachers, subjectMap, teacherSchedules, classSchedules, unassigned) {
  for (const teacher of teachers) {
    const subjectAssignments = teacher.assignments.filter((assignment) =>
      CORE_SUBJECT_CODES.has(assignment.subjectCode)
    );
    for (const assignment of subjectAssignments) {
      for (const classGroup of assignment.classGroups) {
        const requiredPeriods = periodsFor(assignment.subjectCode, classGroup);
        if (requiredPeriods <= 0) {
          continue;
        }

        let weeklyCount = countTeacherSubjectForClass(teacherSchedules[teacher.code], assignment.subjectCode, classGroup);
        while (weeklyCount < requiredPeriods) {
          const slot = findSubjectFillSlot(assignment.subjectCode, teacher.code, classGroup, teacherSchedules, classSchedules);
          if (!slot) {
            addUnassignedCorrection(teacher, subjectMap, assignment.subjectCode, classGroup, unassigned);
            break;
          }

          if (slot.teacherOnly) {
            placeTeacherOnlySubjectAtSlot(teacher, subjectMap, teacherSchedules, slot.day, slot.period, assignment.subjectCode, classGroup);
          } else {
            forceSubjectAtSlot(teacher, subjectMap, teacherSchedules, classSchedules, slot.day, slot.period, assignment.subjectCode, classGroup);
          }
          removeOneUnassigned(unassigned, teacher.code, assignment.subjectCode, classGroup);
          weeklyCount++;
        }
      }
    }
  }
}

function normalizeVisibleSupportDuties(teachers, subjectMap, teacherSchedules, unassigned) {
  for (const teacher of teachers) {
    const supportAssignments = teacher.assignments.filter((assignment) =>
      SUPPORT_SUBJECT_CODES.has(assignment.subjectCode) &&
        assignment.classGroups.some((classGroup) => periodsFor(assignment.subjectCode, classGroup) > 0)
    );
    const supportSubjects = [...new Set(supportAssignments.map((assignment) => assignment.subjectCode))];

    for (const subjectCode of supportSubjects) {
      const alreadyVisible = Object.values(teacherSchedules[teacher.code] || {})
        .some((entry) => entry.subjectCode === subjectCode);
      if (alreadyVisible) {
        continue;
      }

      const slot = findVisibleSupportDutySlot(teacherSchedules[teacher.code] || {});
      const classGroup = supportAssignments.find((assignment) => assignment.subjectCode === subjectCode)?.classGroups[0] || [];
      if (!slot) {
        addUnassignedCorrection(teacher, subjectMap, subjectCode, classGroup, unassigned);
        continue;
      }

      placeTeacherOnlySubjectAtSlot(teacher, subjectMap, teacherSchedules, slot.day, slot.period, subjectCode, classGroup);
      removeOneUnassigned(unassigned, teacher.code, subjectCode, classGroup);
    }
  }
}

function findVisibleSupportDutySlot(teacherSchedule) {
  for (const day of DAYS) {
    for (const period of [6, 5, 4, 3, 2]) {
      const key = slotKey(day, period);
      if (!teacherSchedule[key] && teacherHasFreeMiddleAfterFill(teacherSchedule, day, period)) {
        return { day, period, key };
      }
    }
  }
  return undefined;
}

function normalizeCombinedLanguageSlots(teachers, teacherSchedules, classSchedules, unassigned) {
  const arabicTeacher = teachers.find((teacher) =>
    teacher.assignments.some((assignment) => assignment.subjectCode === 'ARA')
  );
  const sanskritTeacher = teachers.find((teacher) =>
    teacher.assignments.some((assignment) => assignment.subjectCode === 'SAN')
  );

  if (!arabicTeacher || !sanskritTeacher) {
    return;
  }

  for (const classGroup of LANGUAGE_COMBINED_GROUPS) {
    let weeklyCount = countTeacherSubjectForClass(teacherSchedules[arabicTeacher.code], 'ARA/SAN', classGroup);
    while (weeklyCount < 2) {
      const slot = findCombinedLanguageSlot(arabicTeacher.code, sanskritTeacher.code, classGroup, teacherSchedules, classSchedules);
      if (!slot) {
        addCombinedLanguageUnassigned(arabicTeacher, sanskritTeacher, classGroup, unassigned);
        break;
      }

      placeCombinedLanguageAtSlot(arabicTeacher, sanskritTeacher, classGroup, teacherSchedules, classSchedules, slot);
      removeOneUnassigned(unassigned, arabicTeacher.code, 'ARA/SAN', classGroup);
      weeklyCount++;
    }
  }
}

function findCombinedLanguageSlot(arabicCode, sanskritCode, classGroup, teacherSchedules, classSchedules) {
  const usedDays = new Set(
    Object.entries(teacherSchedules[arabicCode] || {})
      .filter(([, entry]) => entry.subjectCode === 'ARA/SAN' && entryMatchesClassGroup(entry, classGroup))
      .map(([key]) => key.split('-')[0])
  );

  const realClassSlots = [];

  for (const day of DAYS) {
    if (usedDays.has(day) && usedDays.size < 2) {
      continue;
    }

    for (const period of [2, 3, 4, 5, 6, 7]) {
      const key = slotKey(day, period);
      const teachersFree = !teacherSchedules[arabicCode]?.[key] && !teacherSchedules[sanskritCode]?.[key];
      if (!teachersFree) {
        continue;
      }

      const preservesFree = period === 7 ||
        (
          teacherHasFreeMiddleAfterFill(teacherSchedules[arabicCode] || {}, day, period) &&
          teacherHasFreeMiddleAfterFill(teacherSchedules[sanskritCode] || {}, day, period)
        );
      if (!preservesFree) {
        continue;
      }

      const slot = { day, period, key };
      if (classGroupCanUseSlotForAcademic(classSchedules, classGroup, key)) {
        realClassSlots.push(slot);
      }
    }
  }

  return realClassSlots[0];
}

function placeCombinedLanguageAtSlot(arabicTeacher, sanskritTeacher, classGroup, teacherSchedules, classSchedules, slot) {
  const entry = {
    subjectCode: 'ARA/SAN',
    subjectName: 'Arabic / Sanskrit',
    classGroup,
    classLabel: classGroup.join(' + '),
    teacherCodes: [arabicTeacher.code, sanskritTeacher.code],
    teacherNames: [arabicTeacher.name, sanskritTeacher.name],
    joinedClass: classGroup.length > 1,
    label: 'Arabic / Sanskrit',
    fixedSession: true,
    teacherOnlyAdjustment: Boolean(slot.teacherOnly)
  };

  teacherSchedules[arabicTeacher.code][slot.key] = entry;
  teacherSchedules[sanskritTeacher.code][slot.key] = entry;

  if (!slot.teacherOnly) {
    for (const className of classGroup) {
      classSchedules[className][slot.key] = entry;
    }
  }
}

function addCombinedLanguageUnassigned(arabicTeacher, sanskritTeacher, classGroup, unassigned) {
  unassigned.push({
    subjectCode: 'ARA/SAN',
    subjectName: 'Arabic / Sanskrit',
    classGroup,
    classLabel: classGroup.join(' + '),
    teacherCodes: [arabicTeacher.code, sanskritTeacher.code],
    teacherNames: [arabicTeacher.name, sanskritTeacher.name],
    joinedClass: classGroup.length > 1,
    weeklyPeriods: 1
  });
}

function attachClasslessTeacherEntriesToAssignments(teachers, teacherSchedules) {
  for (const teacher of teachers) {
    const schedule = teacherSchedules[teacher.code] || {};
    for (const [key, entry] of Object.entries(schedule)) {
      if (entry.classGroup?.length) {
        continue;
      }

      const classGroup = teacher.assignments
        .find((assignment) => assignment.subjectCode === entry.subjectCode)
        ?.classGroups?.[0];
      if (!classGroup?.length) {
        continue;
      }

      schedule[key] = {
        ...entry,
        classGroup,
        classLabel: classGroup.join(' + '),
        joinedClass: classGroup.length > 1,
        fixedSession: true
      };
    }
  }
}

function reconcileTeacherAndClassSchedules(teacherSchedules, classSchedules) {
  removeUnsyncableTeacherOnlyEntries(teacherSchedules, classSchedules);

  const entries = Object.entries(teacherSchedules)
    .flatMap(([teacherCode, schedule]) =>
      Object.entries(schedule).map(([key, entry]) => ({ teacherCode, key, entry }))
    )
    .filter(({ entry }) => entry.classGroup?.length)
    .sort((left, right) => reconciliationPriority(left.entry) - reconciliationPriority(right.entry));

  for (const { teacherCode, key, entry } of entries) {
    if (teacherSchedules[teacherCode]?.[key] !== entry) {
      continue;
    }

    for (const className of entry.classGroup) {
      const current = classSchedules[className]?.[key];
      if (current?.subjectCode === entry.subjectCode && current.teacherCodes?.includes(teacherCode)) {
        continue;
      }

      removeDisplacedClassEntry(teacherSchedules, classSchedules, className, key, entry);
      classSchedules[className][key] = withoutAdditionalEntries(entry);
    }
  }
}

function removeUnsyncableTeacherOnlyEntries(teacherSchedules, classSchedules) {
  for (const [teacherCode, schedule] of Object.entries(teacherSchedules)) {
    for (const [key, entry] of Object.entries(schedule)) {
      if (!entry.teacherOnlyAdjustment || !entry.classGroup?.length) {
        continue;
      }

      const canSync = entry.classGroup.every((className) => !classSchedules[className]?.[key]);
      if (canSync) {
        continue;
      }

      delete teacherSchedules[teacherCode][key];
    }
  }
}

function removeDisplacedClassEntry(teacherSchedules, classSchedules, className, key, incomingEntry) {
  const current = classSchedules[className]?.[key];
  if (!current || current === incomingEntry) {
    return;
  }

  for (const teacherCode of current.teacherCodes || []) {
    const teacherEntry = teacherSchedules[teacherCode]?.[key];
    if (!teacherEntry || teacherEntry === incomingEntry) {
      continue;
    }

    for (const affectedClass of teacherEntry.classGroup || []) {
      if (classSchedules[affectedClass]?.[key] === teacherEntry) {
        delete classSchedules[affectedClass][key];
      }
    }
    delete teacherSchedules[teacherCode][key];
  }
}

function reconciliationPriority(entry) {
  if (entry.reservedDuty || SUPPORT_SUBJECT_CODES.has(entry.subjectCode)) {
    return 3;
  }
  if (entry.fixedSession) {
    return 2;
  }
  return 1;
}

function withoutAdditionalEntries(entry) {
  const { additionalEntries, ...singleEntry } = entry;
  return singleEntry;
}

function findSubjectFillSlot(subjectCode, teacherCode, classGroup, teacherSchedules, classSchedules) {
  const teacherSchedule = teacherSchedules[teacherCode] || {};
  const middleFreeSlots = [];
  const periodSevenFreeSlots = [];

  for (const day of DAYS) {
    if (classSubjectPeriods(classSchedules, classGroup, day, subjectCode).length > 0) {
      continue;
    }

    for (const period of [2, 3, 4, 5, 6, 7]) {
      const key = slotKey(day, period);
      const teacherEntry = teacherSchedule[key];
      const classSlotAvailable = classGroupCanUseSlotForAcademic(classSchedules, classGroup, key);

      const slot = { day, period, key };
      if (!teacherEntry && classSlotAvailable) {
        if (period === 7) {
          periodSevenFreeSlots.push(slot);
        } else if (teacherHasFreeMiddleAfterFill(teacherSchedule, day, period)) {
          middleFreeSlots.push(slot);
        }
      }
    }
  }

  return middleFreeSlots[0] || periodSevenFreeSlots[0];
}

function placeTeacherOnlySubjectAtSlot(teacher, subjectMap, teacherSchedules, day, period, subjectCode, classGroup = []) {
  teacherSchedules[teacher.code][slotKey(day, period)] = {
    subjectCode,
    subjectName: subjectMap[subjectCode] || subjectCode,
    classGroup,
    classLabel: classGroup.join(' + '),
    teacherCodes: [teacher.code],
    teacherNames: [teacher.name],
    joinedClass: classGroup.length > 1,
    label: subjectMap[subjectCode] || subjectCode,
    fixedSession: true,
    teacherOnlyAdjustment: true
  };
}

function findMalayalamFillSlot(teacherCode, classGroup, teacherSchedules, classSchedules) {
  const teacherSchedule = teacherSchedules[teacherCode] || {};
  const zeroMalayalamDays = [];
  const doubleMalayalamDays = [];

  for (const day of DAYS) {
    const dayMalayalamPeriods = classSubjectPeriods(classSchedules, classGroup, day, 'MAL');
    if (dayMalayalamPeriods.length >= 2) {
      continue;
    }

    for (const period of [2, 3, 4, 5, 6]) {
      const key = slotKey(day, period);
      const classSlotAvailable = classGroupCanUseSlotForAcademic(classSchedules, classGroup, key);
      if (teacherSchedule[key] || !classSlotAvailable) {
        continue;
      }
      if (!teacherHasFreeMiddleAfterFill(teacherSchedule, day, period)) {
        continue;
      }
      if (dayMalayalamPeriods.some((usedPeriod) => Math.abs(usedPeriod - period) <= 1)) {
        continue;
      }

      const slot = { day, period, key };
      if (dayMalayalamPeriods.length === 0) {
        zeroMalayalamDays.push(slot);
      } else {
        doubleMalayalamDays.push(slot);
      }
    }
  }

  return zeroMalayalamDays[0] || doubleMalayalamDays[0];
}

function classSubjectPeriods(classSchedules, classGroup, day, subjectCode) {
  return PERIODS.filter((period) => {
    const key = slotKey(day, period);
    return classGroup.every((className) => {
      const entry = classSchedules[className]?.[key];
      return entry?.subjectCode === subjectCode && entryMatchesClassGroup(entry, classGroup);
    });
  });
}

function classGroupCanUseSlotForAcademic(classSchedules, classGroup, key) {
  return classGroup.every((className) => {
    const entry = classSchedules[className]?.[key];
    return !entry || SUPPORT_SUBJECT_CODES.has(entry.subjectCode);
  });
}

function teacherHasFreeMiddleAfterFill(teacherSchedule, day, filledPeriod) {
  return [2, 3, 4, 5, 6].some((period) =>
    period !== filledPeriod && !teacherSchedule[slotKey(day, period)]
  );
}

function countTeacherSubjectForClass(teacherSchedule = {}, subjectCode, classGroup) {
  return Object.values(teacherSchedule).filter((entry) =>
    entry?.subjectCode === subjectCode && entryMatchesClassGroup(entry, classGroup)
  ).length;
}

function entryMatchesClassGroup(entry, classGroup) {
  return classGroup.every((className) => entry?.classGroup?.includes(className));
}

function removeOneUnassigned(unassigned, teacherCode, subjectCode, classGroup) {
  const index = unassigned.findIndex((entry) =>
    entry.subjectCode === subjectCode &&
      entry.teacherCodes?.includes(teacherCode) &&
      classGroup.every((className) => entry.classGroup?.includes(className))
  );
  if (index >= 0) {
    unassigned.splice(index, 1);
  }
}

function isCorrectionAlreadySatisfied(schedule, correction) {
  const daysToCheck = correction.day ? [correction.day] : DAYS;
  const classGroup = correction.classGroup || [];

  return daysToCheck.some((day) =>
    PERIODS.some((period) => {
      const entry = schedule[slotKey(day, period)];
      if (entry?.subjectCode !== correction.subjectCode) {
        return false;
      }
      return classGroup.length === 0 || classGroup.every((className) => entry.classGroup?.includes(className));
    })
  );
}

function replaceSlotSubject(teacher, subjectMap, teacherSchedules, classSchedules, slot, subjectCode) {
  const classGroup = slot.entry?.classGroup || [];
  forceSubjectAtSlot(teacher, subjectMap, teacherSchedules, classSchedules, slot.day, slot.period, subjectCode, classGroup);
}

function forceSubjectAtSlot(teacher, subjectMap, teacherSchedules, classSchedules, day, period, subjectCode, classGroup = []) {
  const key = slotKey(day, period);
  removeEntryAtSlot(teacherSchedules, classSchedules, teacher.code, day, period);
  for (const className of classGroup) {
    const existingClassEntry = classSchedules[className]?.[key];
    if (!existingClassEntry) {
      continue;
    }
    for (const teacherCode of existingClassEntry.teacherCodes || []) {
      if (teacherSchedules[teacherCode]?.[key]?.classGroup?.includes(className)) {
        delete teacherSchedules[teacherCode][key];
      }
    }
    delete classSchedules[className][key];
  }

  const entry = {
    subjectCode,
    subjectName: subjectMap[subjectCode] || subjectCode,
    classGroup,
    classLabel: classGroup.length ? classGroup.join(' + ') : 'Reserved duty',
    teacherCodes: [teacher.code],
    teacherNames: [teacher.name],
    joinedClass: classGroup.length > 1,
    label: subjectMap[subjectCode] || subjectCode,
    reservedDuty: classGroup.length === 0,
    fixedSession: true
  };

  teacherSchedules[teacher.code][key] = entry;
  for (const className of classGroup) {
    classSchedules[className][key] = entry;
  }
}

function removeEntryAtSlot(teacherSchedules, classSchedules, teacherCode, day, period) {
  const key = slotKey(day, period);
  const entry = teacherSchedules[teacherCode]?.[key];
  if (!entry) {
    return;
  }
  for (const className of entry.classGroup || []) {
    if (classSchedules[className]?.[key]?.teacherCodes?.includes(teacherCode)) {
      delete classSchedules[className][key];
    }
  }
  delete teacherSchedules[teacherCode][key];
}

function addUnassignedCorrection(teacher, subjectMap, subjectCode, classGroup = [], unassigned) {
  unassigned.push({
    subjectCode,
    subjectName: subjectMap[subjectCode] || subjectCode,
    classGroup,
    classLabel: classGroup.join(' + '),
    teacherCodes: [teacher.code],
    teacherNames: [teacher.name],
    joinedClass: classGroup.length > 1,
    weeklyPeriods: 1
  });
}

function applyAsrMathOverrides(teachers, subjectMap, teacherSchedules, classSchedules, unassigned) {
  const teacher = teachers.find((entry) => entry.code === 'ASR');
  const schedule = teacherSchedules.ASR;
  if (!teacher || !schedule) {
    return;
  }

  for (const override of ASR_MATH_OVERRIDES) {
    const targetSlot = override.mode === 'replace-subject'
      ? findTeacherSubjectSlot(schedule, override.day, override.replaceSubjectCode)
      : findTeacherFreeSlot(schedule, override.day);

    if (!targetSlot) {
      unassigned.push({
        subjectCode: 'MAT',
        subjectName: subjectMap.MAT || 'Maths',
        classGroup: ['7A'],
        classLabel: '7A',
        teacherCodes: ['ASR'],
        teacherNames: [teacher.name],
        joinedClass: false,
        weeklyPeriods: 1
      });
      continue;
    }

    forceAsrMathAtSlot(teacher, subjectMap, teacherSchedules, classSchedules, override.day, targetSlot.period);
  }
}

function forceAsrMathAtSlot(teacher, subjectMap, teacherSchedules, classSchedules, day, period) {
  const key = slotKey(day, period);
  const previousTeacherEntry = teacherSchedules.ASR[key];
  if (previousTeacherEntry?.teacherCodes?.includes('ASR')) {
    for (const className of previousTeacherEntry.classGroup || []) {
      if (classSchedules[className]?.[key]?.teacherCodes?.includes('ASR')) {
        delete classSchedules[className][key];
      }
    }
  }

  const previousClassEntry = classSchedules['7A']?.[key];
  if (previousClassEntry?.teacherCodes) {
    for (const teacherCode of previousClassEntry.teacherCodes) {
      const teacherEntry = teacherSchedules[teacherCode]?.[key];
      if (teacherEntry?.classGroup?.includes('7A')) {
        delete teacherSchedules[teacherCode][key];
      }
    }
  }

  const entry = {
    subjectCode: 'MAT',
    subjectName: subjectMap.MAT || 'Maths',
    classGroup: ['7A'],
    classLabel: '7A',
    teacherCodes: ['ASR'],
    teacherNames: [teacher.name],
    joinedClass: false,
    label: subjectMap.MAT || 'Maths',
    fixedSession: true
  };

  teacherSchedules.ASR[key] = entry;
  classSchedules['7A'][key] = entry;
}

function findTeacherSubjectSlot(schedule, day, subjectCode) {
  return PERIODS
    .map((period) => ({ day, period, key: slotKey(day, period), entry: schedule[slotKey(day, period)] }))
    .find((slot) => slot.entry?.subjectCode === subjectCode);
}

function findTeacherSubjectSlotAnyDay(schedule, subjectCode) {
  const matchingSlots = DAYS.flatMap((day) =>
    PERIODS.map((period) => ({ day, period, key: slotKey(day, period), entry: schedule[slotKey(day, period)] }))
  ).filter((slot) => slot.entry?.subjectCode === subjectCode);

  return matchingSlots.find((slot) => slot.entry.reservedDuty) || matchingSlots[0];
}

function findTeacherFreeSlot(teacherSchedule, day) {
  return [6, 5, 4, 3, 2]
    .map((period) => ({ day, period, key: slotKey(day, period) }))
    .find((slot) => !teacherSchedule[slot.key]);
}

function findTeacherFreeSlotAnyDay(teacherSchedule) {
  for (const day of DAYS) {
    const slot = findTeacherFreeSlot(teacherSchedule, day);
    if (slot) {
      return slot;
    }
  }
  return undefined;
}

function findNthTeacherFreeSlot(teacherSchedule, nth) {
  let freeCount = 0;
  for (const day of DAYS) {
    for (const period of [2, 3, 4, 5, 6]) {
      const key = slotKey(day, period);
      if (!teacherSchedule[key] && teacherHasFreeMiddleAfterFill(teacherSchedule, day, period)) {
        freeCount++;
        if (freeCount === nth) {
          return { day, period, key };
        }
      }
    }
  }
  return undefined;
}

function preferredRotatedPeriod(session, day) {
  const usablePeriods = [2, 3, 4, 5, 6, 7];
  const seed = stableHash(`${session.demandKey}-${session.occurrenceIndex || 0}`);
  const offset = (DAYS.indexOf(day) + seed) % usablePeriods.length;
  return usablePeriods[offset];
}

function patternPeriodKey(session, period) {
  return `${session.demandKey}-${period}`;
}

function demandCountKey(teacherCode, subjectCode, classGroup) {
  return `${teacherCode}-${subjectCode}-${classGroup.join('+')}`;
}

function stableHash(value) {
  return [...String(value)].reduce((hash, character) => {
    return (hash * 31 + character.charCodeAt(0)) % 997;
  }, 7);
}

function resolveClassTeachers(teachers) {
  return Object.fromEntries(
    Object.entries(CLASS_TEACHER_CODES).map(([className, teacherCode]) => [
      className,
      teachers.find((teacher) => teacher.code === teacherCode)
    ])
  );
}

function openPrintableTimetable({ title, subtitle, type, schedule = {} }) {
  const printablePeriods = [...PERIODS, 8];
  const tableRows = DAYS.map((day) => `
    <tr>
      <th>${escapeHtml(day)}</th>
      ${printablePeriods.map((period) => `<td>${printCell(schedule[slotKey(day, period)], period, type)}</td>`).join('')}
    </tr>
  `).join('');

  const html = `
    <!doctype html>
    <html>
      <head>
        <title>${escapeHtml(title)}</title>
        <style>
          body { font-family: Arial, sans-serif; color: #17262f; margin: 24px; }
          h1 { margin: 0; font-size: 22px; }
          p { margin: 4px 0 18px; color: #65727e; font-weight: 700; }
          table { width: 100%; border-collapse: collapse; table-layout: fixed; }
          th, td { border: 1px solid #cfdbe0; padding: 8px; vertical-align: top; height: 76px; }
          th { background: #edf5f5; text-align: left; }
          .code { display: inline-block; padding: 3px 6px; margin-bottom: 5px; color: white; background: #087f7b; border-radius: 4px; font-weight: 700; }
          .print-entry + .print-entry { margin-top: 8px; padding-top: 8px; border-top: 1px solid #dbe6ea; }
          strong, small { display: block; }
          small { color: #65727e; margin-top: 4px; }
        </style>
      </head>
      <body>
        <h1>${escapeHtml(title)}</h1>
        <p>${escapeHtml(subtitle)}</p>
        <table>
          <thead><tr><th>Day</th>${printablePeriods.map((period) => `<th>P${period}</th>`).join('')}</tr></thead>
          <tbody>${tableRows}</tbody>
        </table>
        <script>window.addEventListener('load', () => window.print());</script>
      </body>
    </html>
  `;
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
  }
}

function printCell(entry, period, type) {
  if (period === 8) {
    return '';
  }
  const entries = getCellEntries(entry);
  if (entries.length === 0) {
    return `<small>${type === 'teacher' ? 'Free' : 'Open'}</small>`;
  }
  return entries.map((cellEntry) => `
    <div class="print-entry">
      <span class="code">${escapeHtml(cellEntry.subjectCode)}</span>
      <strong>${escapeHtml(cellEntry.classGroup?.join(' + ') || cellEntry.label)}</strong>
      <small>${escapeHtml(type === 'teacher' ? cellEntry.classLabel : cellEntry.teacherNames.join(' / '))}</small>
    </div>
  `).join('');
}

function dayLoad(schedule = {}, day) {
  return PERIODS.filter((period) => schedule[slotKey(day, period)]).length;
}

function getClasses(teachers) {
  return [
    ...new Set(teachers.flatMap((teacher) =>
      teacher.assignments.flatMap((assignment) => assignment.classGroups.flat())
    ))
  ].sort((left, right) => left.localeCompare(right, undefined, { numeric: true }));
}

function gradeOf(className) {
  return Number.parseInt(className, 10);
}

function subjectDayKey(className, day, subjectCode) {
  return `${className}-${day}-${subjectCode}`;
}

function slotKey(day, period) {
  return `${day}-${period}`;
}

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

async function getJson(path) {
  const response = await fetch(`${API_BASE}${path}`);
  if (!response.ok) {
    throw new Error(`Request failed: ${path}`);
  }
  return response.json();
}

createRoot(document.getElementById('root')).render(<App />);
