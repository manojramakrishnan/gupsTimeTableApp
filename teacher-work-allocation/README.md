# Teacher Work Allocation

A Spring Boot + React timetable dashboard for school teachers and class divisions. The allocation data is transcribed from the uploaded image and stored in `src/main/resources/data/allocations.json`.

## Run With Docker

```bash
docker compose up --build
```

Open `http://localhost:8080`.

To stop it:

```bash
docker compose down
```

## What Is Included

- Spring Boot REST API with the uploaded teacher/class/subject allocation data.
- Vite React timetable dashboard source in `frontend/`.
- Teacher dropdown that shows the selected teacher's weekly timetable.
- Class division dropdown that shows the selected class timetable.
- Two dashboard tabs: one for teacher timetables and one for class timetables.
- PDF download button for the currently selected teacher timetable or class timetable.
- Rule-based timetable generation for Malayalam, English, Hindi, Basic Science, Social Science, Maths, Arabic/Sanskrit, WE, HE, LIB, AE, and IT.
- Period 1 assigns the class teacher's own subject for every division.
- Periods 2-7 are balanced automatically, with at least one free middle period for every teacher each day.
- Malayalam is scheduled as 6 weekly periods, with exactly one double-period day and no continuous Malayalam periods.
- English, Basic Science, Social Science, and Maths are scheduled as 5 weekly periods.
- Hindi is scheduled as 2 weekly periods for 5th standard and 3 weekly periods for 6th/7th standard.
- WE, HE, LIB, IT, and eligible AE classes are scheduled from the teacher allocation data as real class timetable entries.
- Arabic/Sanskrit for Anoopa SS and Naushad uses combined class groups: 5A+5B, 5C+5D, 6A+6B, 6C+6D, 7A+7B, 7C+7D, and 7E.
- Teacher and class timetables are generated from the same slots so the two dashboards match exactly.
- The dashboard shows unscheduled items only if all constraints cannot be satisfied.

## Development

```bash
cd frontend
npm install
npm run dev
```

For normal local use, prefer Docker because it builds the React app and packages it into Spring Boot automatically.

## API

- `GET /api/allocations`
- `GET /api/allocations?subject=MAT`
- `GET /api/allocations?class=7D`
- `GET /api/allocations/{code}`
- `GET /api/subjects`
- `GET /api/classes`
- `GET /api/summary`
- `GET /api/timetables`
- `GET /api/timetables/{teacherCode}`
