const subjectTone = {
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
  ARA: 'tone-sky',
  SAN: 'tone-plum'
};

const state = {
  teachers: [],
  subjects: [],
  classes: [],
  summary: null,
  selectedCode: '',
  subjectFilter: 'ALL',
  classFilter: 'ALL',
  query: '',
  timetable: null,
  timetableError: ''
};

const root = document.getElementById('app');

load();

async function load() {
  try {
    const [teachers, subjects, classes, summary] = await Promise.all([
      getJson('/api/allocations'),
      getJson('/api/subjects'),
      getJson('/api/classes'),
      getJson('/api/summary')
    ]);
    state.teachers = teachers;
    state.subjects = subjects;
    state.classes = classes;
    state.summary = summary;
    state.selectedCode = teachers[0]?.code || '';
    if (state.selectedCode) {
      state.timetable = await getJson(`/api/timetables/${state.selectedCode}`);
    }
    render();
  } catch (error) {
    root.replaceChildren(
      node('main', { className: 'app-shell' },
        node('p', { className: 'error-state' }, 'Unable to load allocation data.')
      )
    );
  }
}

async function getJson(path) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(path);
  }
  return response.json();
}

function render() {
  const subjectMap = Object.fromEntries(state.subjects.map((subject) => [subject.code, subject.name]));
  const visibleTeachers = filterTeachers(subjectMap);
  if (state.teachers.length > 0 && !state.teachers.some((teacher) => teacher.code === state.selectedCode)) {
    state.selectedCode = state.teachers[0].code;
  }
  const selectedTeacher = state.teachers.find((teacher) => teacher.code === state.selectedCode);

  root.replaceChildren(
    node('main', { className: 'app-shell' },
      renderHeader(),
      renderMetrics(),
      renderControls(),
      node('section', { className: 'language-rule' },
        node('span', { className: 'rule-icon' }, '↔'),
        node('span', {}, 'Periods 1-7 are auto-assigned from teacher availability. Period 8 stays with the respective class teachers.')
      ),
      renderTimetablePanel(),
      node('section', { className: 'workspace-grid' },
        node('div', { className: 'teacher-list', 'aria-label': 'Teacher list' },
          ...visibleTeachers.map((teacher) => renderTeacherCard(teacher, subjectMap, teacher.code === selectedTeacher?.code))
        ),
        node('aside', { className: 'detail-panel', 'aria-label': 'Teacher details' },
          selectedTeacher
            ? renderTeacherDetail(selectedTeacher, subjectMap)
            : node('p', { className: 'empty-state' }, 'No allocation matches the selected filters.')
        )
      ),
      node('section', { className: 'legend-grid', 'aria-label': 'Subject legend' },
        ...state.subjects.map((subject) =>
          node('div', { className: 'legend-item' },
            node('span', { className: `subject-dot ${subjectTone[subject.code] || 'tone-gray'}` }, subject.code),
            node('span', {}, subject.name)
          )
        )
      )
    )
  );
}

function renderHeader() {
  return node('header', { className: 'topbar' },
    node('div', {},
      node('p', { className: 'eyebrow' }, 'School planner'),
      node('h1', {}, 'Teacher Work Allocation')
    ),
    node('div', { className: 'topbar-actions' },
      node('button', {
        className: 'icon-button',
        type: 'button',
        title: 'Reset filters',
        onclick: () => {
          state.subjectFilter = 'ALL';
          state.classFilter = 'ALL';
          state.query = '';
          render();
        }
      }, '↺')
    )
  );
}

function renderTimetablePanel() {
  return node('section', { className: 'timetable-panel', 'aria-label': 'Automatic weekly timetable' },
    node('div', { className: 'timetable-head' },
      node('div', {},
        node('p', { className: 'eyebrow' }, 'Automatic weekly timetable'),
        node('h2', {}, 'Teacher period view')
      ),
      node('label', { className: 'teacher-select' },
        node('span', {}, 'T'),
        node('select', {
          value: state.selectedCode,
          onchange: (event) => selectTeacher(event.target.value)
        },
          ...state.teachers.map((teacher) =>
            node('option', { value: teacher.code }, `${teacher.name} (${teacher.code})`)
          )
        )
      )
    ),
    state.timetableError ? node('p', { className: 'error-state' }, state.timetableError) : '',
    state.timetable ? renderTimetableGrid() : ''
  );
}

function renderTimetableGrid() {
  const cellsBySlot = Object.fromEntries(
    state.timetable.cells.map((cell) => [`${cell.day}-${cell.period}`, cell])
  );

  return [
    node('div', { className: 'timetable-stats' },
      node('span', {}, `${state.timetable.assignedPeriods} assigned`),
      node('span', {}, `${state.timetable.freePeriods} available`),
      node('span', {}, state.timetable.reservedPeriodNote)
    ),
    node('div', { className: 'timetable-scroll' },
      node('table', { className: 'timetable-table' },
        node('thead', {},
          node('tr', {},
            node('th', {}, 'Day'),
            ...state.timetable.periods.map((period) => node('th', {}, `P${period}`))
          )
        ),
        node('tbody', {},
          ...state.timetable.days.map((day) =>
            node('tr', {},
              node('th', {}, day),
              ...state.timetable.periods.map((period) =>
                node('td', {}, renderTimetableCell(cellsBySlot[`${day}-${period}`]))
              )
            )
          )
        )
      )
    )
  ];
}

function renderTimetableCell(cell) {
  if (!cell || !cell.assigned) {
    return node('div', { className: 'timetable-cell free' }, node('span', {}, 'Available'));
  }

  return node('div', { className: cell.joinedClass ? 'timetable-cell joined' : 'timetable-cell' },
    node('span', { className: `subject-pill ${subjectTone[cell.subjectCode] || 'tone-gray'}` }, cell.subjectCode),
    node('strong', {}, cell.classGroup.join(' + ')),
    node('small', {}, cell.subjectName)
  );
}

function renderMetrics() {
  return node('section', { className: 'summary-grid', 'aria-label': 'Allocation summary' },
    metric('Teachers', state.summary?.teacherCount || 0, 'T'),
    metric('Listed periods', state.summary?.totalListedPeriods || 0, 'P'),
    metric('Subjects', state.summary?.subjectCount || 0, 'S'),
    metric('Classes', state.summary?.classCount || 0, 'C')
  );
}

function metric(label, value, icon) {
  return node('article', { className: 'metric-card' },
    node('span', { className: 'metric-icon' }, icon),
    node('div', {},
      node('strong', {}, value),
      node('span', {}, label)
    )
  );
}

function renderControls() {
  const searchInput = node('input', {
    value: state.query,
    placeholder: 'Search teacher, class, or subject',
    oninput: (event) => {
      state.query = event.target.value;
      render();
    }
  });

  return node('section', { className: 'control-band', 'aria-label': 'Filters' },
    node('label', { className: 'search-box' },
      node('span', {}, '⌕'),
      searchInput
    ),
    node('div', { className: 'filter-group', 'aria-label': 'Subject filter' },
      subjectButton('ALL', 'All'),
      ...state.subjects.map((subject) => subjectButton(subject.code, subject.code, subject.name))
    ),
    node('select', {
      value: state.classFilter,
      onchange: (event) => {
        state.classFilter = event.target.value;
        render();
      }
    },
      node('option', { value: 'ALL' }, 'All classes'),
      ...state.classes.map((className) => node('option', { value: className }, className))
    )
  );
}

function subjectButton(value, label, title = '') {
  return node('button', {
    type: 'button',
    title,
    className: state.subjectFilter === value ? 'chip active' : 'chip',
    onclick: () => {
      state.subjectFilter = value;
      render();
    }
  }, label);
}

function renderTeacherCard(teacher, subjectMap, active) {
  const subjectCodes = [...new Set(teacher.assignments.map((assignment) => assignment.subjectCode))];
  return node('button', {
    type: 'button',
    className: active ? 'teacher-card active' : 'teacher-card',
    onclick: () => selectTeacher(teacher.code)
  },
    node('span', { className: 'teacher-code' }, teacher.code),
    node('span', { className: 'teacher-copy' },
      node('strong', {}, teacher.name),
      node('small', {}, [teacher.homeClass, teacher.gradeBand].filter(Boolean).join(' | '))
    ),
    node('span', { className: 'period-pill' }, `${teacher.listedPeriods} periods`),
    node('span', { className: 'subject-row' },
      ...subjectCodes.map((code) =>
        node('span', {
          className: `subject-pill ${subjectTone[code] || 'tone-gray'}`,
          title: subjectMap[code] || code
        }, code)
      )
    )
  );
}

async function selectTeacher(code) {
  state.selectedCode = code;
  state.timetable = null;
  state.timetableError = '';
  render();

  try {
    state.timetable = await getJson(`/api/timetables/${code}`);
  } catch (error) {
    state.timetableError = 'Unable to generate timetable for this teacher.';
  }
  render();
}

function renderTeacherDetail(teacher, subjectMap) {
  return node('div', {},
    node('div', { className: 'detail-head' },
      node('div', {},
        node('p', { className: 'eyebrow' }, 'Selected teacher'),
        node('h2', {}, teacher.name),
        node('span', {}, [teacher.code, teacher.homeClass, teacher.gradeBand].filter(Boolean).join(' | '))
      ),
      node('div', { className: 'detail-periods' },
        node('strong', {}, teacher.listedPeriods),
        node('span', {}, 'periods')
      )
    ),
    node('div', { className: 'note-line' },
      node('span', {}, '▣'),
      node('span', {}, teacher.periodNote)
    ),
    node('div', { className: 'assignment-list' },
      ...teacher.assignments.map((assignment) => renderAssignment(teacher, assignment, subjectMap))
    )
  );
}

function renderAssignment(teacher, assignment, subjectMap) {
  return node('article', { className: 'assignment-row' },
    node('div', { className: 'assignment-title' },
      node('span', { className: `subject-dot ${subjectTone[assignment.subjectCode] || 'tone-gray'}` }, assignment.subjectCode),
      node('strong', {}, subjectMap[assignment.subjectCode] || assignment.subjectCode),
      assignment.joinedClass ? node('em', {}, 'combined') : ''
    ),
    node('div', { className: 'class-chip-row' },
      ...assignment.classGroups.map((group) =>
        node('span', { className: group.length > 1 ? 'class-chip joined' : 'class-chip' }, group.join(' + '))
      )
    ),
    assignment.note ? node('p', {}, assignment.note) : ''
  );
}

function filterTeachers(subjectMap) {
  const normalizedQuery = state.query.trim().toLowerCase();
  return state.teachers.filter((teacher) => {
    const subjectMatch =
      state.subjectFilter === 'ALL' ||
      teacher.assignments.some((assignment) => assignment.subjectCode === state.subjectFilter);
    const classMatch =
      state.classFilter === 'ALL' ||
      teacher.assignments.some((assignment) =>
        assignment.classGroups.flat().includes(state.classFilter)
      );
    const queryMatch =
      normalizedQuery.length === 0 ||
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
        .some((value) => value.toLowerCase().includes(normalizedQuery));

    return subjectMatch && classMatch && queryMatch;
  });
}

function node(tagName, attributes = {}, ...children) {
  const element = document.createElement(tagName);
  Object.entries(attributes).forEach(([key, value]) => {
    if (key === 'className') {
      element.className = value;
    } else if (key.startsWith('on')) {
      element.addEventListener(key.slice(2), value);
    } else if (value !== undefined && value !== null) {
      element.setAttribute(key, value);
    }
  });
  children.flat().forEach((child) => {
    if (child === undefined || child === null || child === '') {
      return;
    }
    element.append(child instanceof Node ? child : document.createTextNode(String(child)));
  });
  return element;
}
