import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const staticRoot = path.join(projectRoot, 'src/main/resources/static');
const dataPath = path.join(projectRoot, 'src/main/resources/data/allocations.json');
const port = Number(process.env.PORT || 4173);
const host = process.env.HOST || '127.0.0.1';

const subjects = [
  ['BS', 'Basic Science'],
  ['MAL', 'Malayalam'],
  ['HIN', 'Hindi'],
  ['SS', 'Social Science'],
  ['MAT', 'Maths'],
  ['ENG', 'English'],
  ['IT', 'Information Technology'],
  ['LIB', 'Library'],
  ['HE', 'Health Education'],
  ['WE', 'Work Education'],
  ['AE', 'Art Education'],
  ['ARA', 'Arabic'],
  ['SAN', 'Sanskrit']
].map(([code, name]) => ({ code, name }));

const subjectMap = Object.fromEntries(subjects.map((subject) => [subject.code, subject.name]));
const subjectPeriodWeights = {
  BS: 5,
  MAL: 5,
  HIN: 3,
  SS: 5,
  MAT: 5,
  ENG: 5,
  IT: 1,
  LIB: 1,
  HE: 1,
  WE: 1,
  AE: 1,
  ARA: 1,
  SAN: 1
};
const coreSubjects = new Set(['BS', 'MAL', 'HIN', 'SS', 'MAT', 'ENG']);
const schoolDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const assignablePeriods = [1, 2, 3, 4, 5, 6, 7];
const reservedPeriodNote = 'Period 8 is reserved for the respective class teachers and is not auto-assigned.';
const data = JSON.parse(await readFile(dataPath, 'utf8'));

createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://${request.headers.host}`);

    if (url.pathname.startsWith('/api/')) {
      return sendJson(response, routeApi(url));
    }

    const filePath = resolveStaticPath(url.pathname);
    const content = await readFile(filePath);
    response.writeHead(200, { 'Content-Type': contentType(filePath) });
    response.end(content);
  } catch (error) {
    response.writeHead(error.statusCode || 404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end(error.message || 'Not found');
  }
}).listen(port, host, () => {
  console.log(`Teacher allocation preview: http://${host}:${port}`);
});

function routeApi(url) {
  if (url.pathname === '/api/health') {
    return 'ok';
  }

  if (url.pathname === '/api/subjects') {
    return subjects;
  }

  if (url.pathname === '/api/classes') {
    return classList();
  }

  if (url.pathname === '/api/summary') {
    return summary();
  }

  if (url.pathname === '/api/timetables') {
    return data.teachers.map((teacher) => buildTeacherTimetable(teacher));
  }

  const timetableMatch = url.pathname.match(/^\/api\/timetables\/([^/]+)$/);
  if (timetableMatch) {
    const teacher = data.teachers.find((entry) => entry.code.toLowerCase() === timetableMatch[1].toLowerCase());
    if (!teacher) {
      const error = new Error('Teacher not found');
      error.statusCode = 404;
      throw error;
    }
    return buildTeacherTimetable(teacher);
  }

  if (url.pathname === '/api/allocations') {
    return filterTeachers(url.searchParams);
  }

  const teacherMatch = url.pathname.match(/^\/api\/allocations\/([^/]+)$/);
  if (teacherMatch) {
    const teacher = data.teachers.find((entry) => entry.code.toLowerCase() === teacherMatch[1].toLowerCase());
    if (!teacher) {
      const error = new Error('Teacher not found');
      error.statusCode = 404;
      throw error;
    }
    return teacher;
  }

  const error = new Error('API route not found');
  error.statusCode = 404;
  throw error;
}

function filterTeachers(searchParams) {
  const subject = searchParams.get('subject');
  const className = searchParams.get('class');
  const query = searchParams.get('q')?.trim().toLowerCase();

  return data.teachers.filter((teacher) => {
    const subjectMatch =
      !subject || teacher.assignments.some((assignment) => assignment.subjectCode === subject.toUpperCase());
    const classMatch =
      !className ||
      teacher.assignments.some((assignment) => assignment.classGroups.flat().includes(className.toUpperCase()));
    const queryMatch =
      !query ||
      [
        teacher.code,
        teacher.name,
        teacher.homeClass,
        teacher.gradeBand,
        ...teacher.assignments.flatMap((assignment) => [
          assignment.subjectCode,
          subjectMap[assignment.subjectCode],
          ...assignment.classGroups.flat()
        ])
      ]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query));

    return subjectMatch && classMatch && queryMatch;
  });
}

function classList() {
  return [
    ...new Set(
      data.teachers.flatMap((teacher) =>
        teacher.assignments.flatMap((assignment) => assignment.classGroups.flat())
      )
    )
  ].sort((left, right) => left.localeCompare(right, undefined, { numeric: true }));
}

function summary() {
  const highestLoad = data.teachers.reduce((highest, teacher) =>
    teacher.listedPeriods > highest.listedPeriods ? teacher : highest
  );

  return {
    teacherCount: data.teachers.length,
    totalListedPeriods: data.teachers.reduce((sum, teacher) => sum + teacher.listedPeriods, 0),
    subjectCount: subjects.length,
    classCount: classList().length,
    joinedLanguageGroupCount: data.teachers
      .flatMap((teacher) => teacher.assignments)
      .filter((assignment) => assignment.joinedClass)
      .reduce((sum, assignment) => sum + assignment.classGroups.length, 0),
    highestLoadTeacher: highestLoad.name,
    highestLoadPeriods: highestLoad.listedPeriods
  };
}

function buildTeacherTimetable(teacher) {
  const sessions = expandWeeklySessions(teacher).sort((left, right) =>
    right.classGroup.length - left.classGroup.length ||
    left.subjectCode.localeCompare(right.subjectCode) ||
    left.classGroup.join('+').localeCompare(right.classGroup.join('+'))
  );
  const placed = new Map();
  const dayLoad = Object.fromEntries(schoolDays.map((day) => [day, 0]));
  const periodLoad = Object.fromEntries(assignablePeriods.map((period) => [period, 0]));
  const subjectDayLoad = {};
  const classDayLoad = {};

  for (const session of sessions) {
    const slot = findBestSlot(session, placed, dayLoad, periodLoad, subjectDayLoad, classDayLoad);
    if (!slot) {
      continue;
    }

    placed.set(slotKey(slot.day, slot.period), session);
    dayLoad[slot.day] += 1;
    periodLoad[slot.period] += 1;
    subjectDayLoad[subjectDayKey(session, slot.day)] = (subjectDayLoad[subjectDayKey(session, slot.day)] || 0) + 1;
    for (const className of session.classGroup) {
      classDayLoad[classDayKey(className, slot.day)] = (classDayLoad[classDayKey(className, slot.day)] || 0) + 1;
    }
  }

  const cells = schoolDays.flatMap((day) =>
    assignablePeriods.map((period) => {
      const session = placed.get(slotKey(day, period));
      if (!session) {
        return {
          day,
          period,
          assigned: false,
          subjectCode: '',
          subjectName: '',
          classGroup: [],
          joinedClass: false,
          label: 'Available'
        };
      }

      return {
        day,
        period,
        assigned: true,
        subjectCode: session.subjectCode,
        subjectName: subjectMap[session.subjectCode] || session.subjectCode,
        classGroup: session.classGroup,
        joinedClass: session.joinedClass,
        label: `${session.subjectCode} - ${session.classGroup.join(' + ')}`
      };
    })
  );
  const assignedPeriods = cells.filter((cell) => cell.assigned).length;

  return {
    teacherCode: teacher.code,
    teacherName: teacher.name,
    days: schoolDays,
    periods: assignablePeriods,
    assignedPeriods,
    freePeriods: schoolDays.length * assignablePeriods.length - assignedPeriods,
    reservedPeriodNote,
    cells
  };
}

function expandWeeklySessions(teacher) {
  const units = teacher.assignments.flatMap((assignment) =>
    assignment.classGroups.map((classGroup) => ({
      subjectCode: assignment.subjectCode,
      classGroup,
      joinedClass: assignment.joinedClass,
      count: subjectPeriodWeights[assignment.subjectCode] || 1
    }))
  );

  let currentTotal = units.reduce((sum, unit) => sum + unit.count, 0);
  while (currentTotal < teacher.listedPeriods && units.length > 0) {
    const target = [...units].sort(addPriority)[0];
    target.count += 1;
    currentTotal += 1;
  }

  while (currentTotal > teacher.listedPeriods && units.length > 0) {
    const target = [...units].filter((unit) => unit.count > 1).sort(removePriority)[0];
    if (!target) {
      break;
    }
    target.count -= 1;
    currentTotal -= 1;
  }

  return units.flatMap((unit) =>
    Array.from({ length: unit.count }, () => ({
      subjectCode: unit.subjectCode,
      classGroup: unit.classGroup,
      joinedClass: unit.joinedClass
    }))
  );
}

function addPriority(left, right) {
  return Number(!coreSubjects.has(left.subjectCode)) - Number(!coreSubjects.has(right.subjectCode)) ||
    right.count - left.count ||
    left.classGroup.join('+').localeCompare(right.classGroup.join('+'));
}

function removePriority(left, right) {
  return Number(!coreSubjects.has(left.subjectCode)) - Number(!coreSubjects.has(right.subjectCode)) ||
    right.count - left.count ||
    left.classGroup.join('+').localeCompare(right.classGroup.join('+'));
}

function findBestSlot(session, placed, dayLoad, periodLoad, subjectDayLoad, classDayLoad) {
  let bestSlot = null;
  let bestScore = Number.POSITIVE_INFINITY;

  for (const day of schoolDays) {
    for (const period of assignablePeriods) {
      if (placed.has(slotKey(day, period))) {
        continue;
      }

      const score = dayLoad[day] * 12 +
        periodLoad[period] * 3 +
        (subjectDayLoad[subjectDayKey(session, day)] || 0) * 25 +
        session.classGroup.reduce((sum, className) => sum + (classDayLoad[classDayKey(className, day)] || 0) * 4, 0) +
        period;

      if (score < bestScore) {
        bestScore = score;
        bestSlot = { day, period };
      }
    }
  }

  return bestSlot;
}

function slotKey(day, period) {
  return `${day}-${period}`;
}

function subjectDayKey(session, day) {
  return `${session.subjectCode}-${day}`;
}

function classDayKey(className, day) {
  return `${className}-${day}`;
}

function resolveStaticPath(requestPath) {
  const cleanPath = decodeURIComponent(requestPath.split('?')[0]);
  const relativePath = cleanPath === '/' ? 'index.html' : cleanPath.replace(/^\/+/, '');
  const resolvedPath = path.resolve(staticRoot, relativePath);

  if (!resolvedPath.startsWith(staticRoot)) {
    const error = new Error('Path is outside static root');
    error.statusCode = 403;
    throw error;
  }

  return resolvedPath;
}

function sendJson(response, body) {
  response.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(body));
}

function contentType(filePath) {
  if (filePath.endsWith('.html')) return 'text/html; charset=utf-8';
  if (filePath.endsWith('.css')) return 'text/css; charset=utf-8';
  if (filePath.endsWith('.js')) return 'text/javascript; charset=utf-8';
  if (filePath.endsWith('.json')) return 'application/json; charset=utf-8';
  return 'application/octet-stream';
}
