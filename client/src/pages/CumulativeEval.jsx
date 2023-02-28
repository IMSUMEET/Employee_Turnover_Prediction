import { useState } from "react";
import Heading from "../components/Heading";

function SelectorCard({ employeeName, onClick }) {
  return (
    <div
      onClick={onClick}
      className="w-full cursor-pointer grid grid-cols-[2fr_1fr] gap-2 p-2 rounded-xl border border-teal-400 ease-in duration-300 hover:scale-[1.02] "
    >
      <p className="font-bold text-teal-400 px-8">{employeeName}</p>
    </div>
  );
}

function SwitchBtn({ value, onChange, title }) {
  return (
    <div className="flex items-center gap-8">
      <p className="text-gray-400">{title}</p>
      <div
        className="rounded-full w-[80px] border border-teal-200 p-1 overflow-hidden"
        onClick={() => onChange(!value)}
      >
        <div
          className={`w-full h-[20px] ${
            value ? "translate-x-0" : "translate-x-full"
          } ease-in duration-500`}
        >
          <div
            className={`w-[20px] h-[20px] rounded-full ease-linear duration-500 ${
              value
                ? "bg-teal-400 translate-x-0"
                : "bg-rose-400 -translate-x-full"
            }`}
          ></div>
        </div>
      </div>
    </div>
  );
}

export default function CumulativeEval({ results, setSelected, onEnd }) {
  const wholeResult = results.map((data, index) => ({ ...data, index }));
  const [falseList, setFalseList] = useState(true);
  const list = wholeResult.filter(({ result }) => result === falseList);
  return (
    <div className="w-full px-40 py-10 bg-black text-teal-600 min-h-screen">
      <div className="w-full p-8 bg-white border-teal-600 border rounded-lg shadow shadow-teal-600">
        <div className="w-full flex items-center justify-end gap-8 pb-8">
          <Heading heading="Employees Turnover Prediction" />
          <button
            className="outline-none rounded-lg px-4 py-2 bg-teal-600 text-white ml-auto"
            onClick={onEnd}
          >
            Home
          </button>
        </div>
        <div className="w-full flex items-center justify-end gap-8 pb-8">
          <h1 className="font-bold text-gray-600 text-xl mr-auto pl-1">
            {falseList ? "Potential Leaving Employees" : "Stable Employees"}
          </h1>
          <SwitchBtn
            value={falseList}
            onChange={(val) => {
              setFalseList(val);
            }}
            title={
              falseList
                ? "Show Potential Stable Employees"
                : "Show Potential Leaving Employees"
            }
          />
          <div className="rounded-full px-2 py-1 bg-teal-200">
            <div className="rounded-full px-2 py-1 bg-white min-w-[90px]">
              <p className="text-teal-600 text-center">
                {`${list.length}  /  `}
                <span className="font-bold text-gray-400">
                  {wholeResult.length}
                </span>
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          {list.map((data, ind) => (
            <SelectorCard
              employeeName={data.data.name}
              key={`employee_no_${ind}`}
              onClick={() => {
                setSelected(data.index);
              }}
            />
          ))}
          {list.length === 0 && (
            <p className="text-gray-400">* No such employees is predicted.</p>
          )}
        </div>
      </div>
    </div>
  );
}
