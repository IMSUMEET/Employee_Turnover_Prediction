import Heading from "../components/Heading";

function EvalCard({ willLeave }) {
  return (
    <div
      className={`w-full h-full rounded-xl ${
        willLeave ? "bg-cyan-600" : "bg-emerald-600"
      } text-white flex flex-col items-center justify-center gap-8 p-8`}
    >
      {willLeave && (
        <>
          <img
            alt="false employee"
            src="/images/false_employee.jpg"
            className="h-[320px] rounded-xl"
          />
          <p className="text-center">
            The employee may leave in the future. Please Look after it's
            conditions for better chances.
          </p>
        </>
      )}
      {!willLeave && (
        <>
          <img
            alt="true employee"
            src="/images/true_employee.jpg"
            className="h-[320px] rounded-xl"
          />
          <p className="text-center px-8">
            The employee have no tendency toward leaving the organization.
            Please Look after it's conditions for better chances.
          </p>
        </>
      )}
    </div>
  );
}

function DataEntry({ title, data }) {
  return (
    <div className="w-full grid grid-cols-[2fr_1fr] gap-2 p-2 rounded-xl border hover:border-teal-400 border-transparent ">
      <p className="font-bold text-teal-400">{title}</p>
      <p className="text-gray-400 text-end">{data}</p>
    </div>
  );
}

export default function IndividualEval({ res, onEnd, onBack }) {
  const { data, result } = res;
  const {
    satisfactionLevel,
    performanceEval,
    noOfProjects,
    avgMonthlyHours,
    noOfEmployeementYears,
    bonusReceived,
    promotionsIn5yrs,
    department,
    salaryLevel,
    name,
  } = data;
  return (
    <div className="w-full px-40 py-10 bg-black text-teal-600 min-h-screen">
      <div className="w-full p-8 bg-white border-teal-600 border rounded-lg shadow shadow-teal-600">
        <div className="w-full flex items-center justify-end gap-8 pb-8">
          <Heading heading="Employee Turnover Prediction" />
          <button
            className="outline-none rounded-lg px-4 py-2 bg-teal-600 text-white ml-auto"
            onClick={onEnd}
          >
            Home
          </button>
          <button
            className="outline-none rounded-lg px-4 py-2 bg-teal-600 text-white"
            onClick={onBack}
          >
            Back
          </button>
        </div>
        <div className="w-full grid grid-cols-2 gap-16">
          <div className="flex flex-col gap-2">
            {name && <DataEntry title="Name" data={name} />}
            <DataEntry
              title="Satisfation Index of Employee"
              data={satisfactionLevel}
            />
            <DataEntry title="Performance Index" data={performanceEval} />
            <DataEntry
              title="Number of projects handled by employee"
              data={noOfProjects}
            />
            <DataEntry
              title="Average Monthly Hours Worked"
              data={avgMonthlyHours}
            />
            <DataEntry
              title="Tenure of Employee"
              data={noOfEmployeementYears}
            />
            <DataEntry
              title="Bonuse Received by Employee"
              data={bonusReceived}
            />
            <DataEntry title="promoted in last 5yrs" data={promotionsIn5yrs} />
            <DataEntry title="Department" data={department.toUpperCase()} />
            <DataEntry title="Salary Level" data={salaryLevel.toUpperCase()} />
          </div>
          <EvalCard willLeave={result} />
        </div>
      </div>
    </div>
  );
}
