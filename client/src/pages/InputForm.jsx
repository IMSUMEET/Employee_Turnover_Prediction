import { useState } from "react";
import Heading from "../components/Heading";
import CustomInputProgressBar from "../components/CustomInputProgressBar";
import CustomInputNumberRow from "../components/CustomInputNumberRow";
import CustomInputDropdownBox from "../components/CustomInputDropdownBox";
import Divider from "../components/Divider";
import FileSelector from "../components/FileSelector";
import SubmitButton from "../components/SubmitButton";
import wwwFormURLencode from "../utils/urlencode";
import validate from "validate.js";

const salaryOptions = ["high", "medium", "low"];
const departmentOptions = [
  "IT",
  "engineering",
  "logistics",
  "admin",
  "finance",
  "support",
  "operations",
  "marketing",
];

const constraint = {
  performanceEval: {
    presence: { allowEmpty: false },
    numericality: {
      onlyInteger: false,
      greaterThanOrEqualTo: 0,
      lessThanOrEqualTo: 1,
    },
  },
  noOfProjects: {
    presence: { allowEmpty: false },
    numericality: {
      onlyInteger: true,
      greaterThanOrEqualTo: 0,
    },
  },
  avgMonthlyHours: {
    presence: { allowEmpty: false },
    numericality: {
      onlyInteger: true,
      greaterThanOrEqualTo: 0,
      lessThanOrEqualTo: 744,
    },
  },
  noOfEmployeementYears: {
    presence: { allowEmpty: false },
    numericality: {
      onlyInteger: true,
      greaterThanOrEqualTo: 0,
    },
  },
  bonusReceived: {
    presence: { allowEmpty: false },
    inclusion: {
      within: ["1", "0"],
      message: "^Select either 1 or 0 for bonus received",
    },
  },
  promotionsIn5yrs: {
    presence: { allowEmpty: false },
    inclusion: {
      within: ["1", "0"],
      message: "^Select either 1 or 0 for promoted in last 5 yrs",
    },
  },
  department: {
    presence: { allowEmpty: false },
    inclusion: {
      within: departmentOptions,
      message: "^Select from department options",
    },
  },
  salaryLevel: {
    presence: { allowEmpty: false },
    inclusion: {
      within: salaryOptions,
      message: "^Select from salary options",
    },
  },
  satisfactionLevel: {
    presence: { allowEmpty: false },
    numericality: {
      onlyInteger: false,
      greaterThanOrEqualTo: 0,
      lessThanOrEqualTo: 1,
    },
  },
};

export default function InputForm({ onSubmit, onAuthFail, token }) {
  const [file, setFile] = useState();
  const [message, setMessage] = useState("");
  //Handle form submittion
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("submitted!");
    const formData = new FormData(e.target);
    if (file) {
      try {
        const form = new FormData();
        form.append("employees", file);
        const res = await fetch("http://127.0.0.1:5001/predictions", {
          method: "POST",
          headers: {
            "x-access-token": token,
          },
          body: form,
        });
        const data = await res.json();
        console.log(data);
        onSubmit({
          file: true,
          res: data.prediction.map((val) => {
            const values = {
              name: val.name,
              satisfactionLevel: val.satisfaction,
              performanceEval: val.review,
              noOfProjects: val.projects,
              avgMonthlyHours: val.avg_hrs_month,
              noOfEmployeementYears: val.tenure,
              bonusReceived: val.bonus,
              promotionsIn5yrs: val.promoted,
              department: val.department,
              salaryLevel: val.salary,
            };
            return {
              data: values,
              result: val.result === 1,
            };
          }),
        });
      } catch (e) {
        console.log(e);
        onAuthFail();
      }
      return;
    }
    const values = {
      satisfactionLevel: formData.get("sl"),
      performanceEval: formData.get("pe"),
      noOfProjects: formData.get("nProject"),
      avgMonthlyHours: formData.get("avgMonthlyHrs"),
      noOfEmployeementYears: formData.get("ey"),
      bonusReceived: formData.get("bonus"),
      promotionsIn5yrs: formData.get("promp"),
      department: formData.get("dept"),
      salaryLevel: formData.get("sal"),
    };
    console.log(values);
    const validation = validate(values, constraint, { format: "flat" });
    if (validation && validation.length !== 0) {
      setMessage(validation[0]);
      return;
    }
    setMessage("");
    try {
      const form = {
        avg_hrs_month: values.avgMonthlyHours,
        bonus: values.bonusReceived,
        department: values.department,
        projects: values.noOfProjects,
        promoted: values.promotionsIn5yrs,
        review: values.performanceEval,
        salary: values.salaryLevel,
        satisfaction: values.satisfactionLevel,
        tenure: values.noOfEmployeementYears,
      };
      const res = await fetch("http://127.0.0.1:5001/predict", {
        method: "POST",
        headers: {
          "x-access-token": token,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: wwwFormURLencode(form),
      });
      console.log(res);
      const data = await res.json();
      console.log(data);
      onSubmit({
        file: false,
        res: [{ data: values, result: data.prediction === 1 }],
      });
    } catch (e) {
      console.log(e);
      onAuthFail();
    }
  };
  return (
    <div className="w-full px-40 py-10 bg-black text-teal-600">
      {message !== "" && (
        <div className="fixed w-screen top-0 left-0 p-4 flex justify-center">
          <div className="rounded-lg bg-rose-600 text-white w-full max-w-[480px] py-2 px-4 flex justify-between items-center">
            <p>{message}</p>
            <div
              className="w-[20px] h-[20px] rounded-full border border-white  relative cursor-pointer"
              onClick={() => {
                setMessage("");
              }}
            >
              <div className="w-[2px] h-4/6 absolute top-1/2 left-1/2 bg-white -translate-y-1/2 -translate-x-1/2 rotate-45"></div>
              <div className="w-[2px] h-4/6 absolute top-1/2 left-1/2 bg-white -translate-y-1/2 -translate-x-1/2 -rotate-45"></div>
            </div>
          </div>
        </div>
      )}
      <form className="w-full" noValidate onSubmit={handleSubmit}>
        <div className="w-full p-8 bg-white border-teal-600 border rounded-lg shadow shadow-teal-600">
          <Heading heading="Individual Evaluation" />
          <div className="py-4" />
          <CustomInputProgressBar heading="Satisfaction Level" name="sl" />
          <CustomInputProgressBar
            heading="Last Performed Evaluation"
            name="pe"
          />
          <CustomInputNumberRow heading="Number of Projects" name="nProject" />
          <CustomInputNumberRow
            heading="Average Monthly Hours"
            name="avgMonthlyHrs"
          />
          <CustomInputNumberRow heading="Employeement Years" name="ey" />
          <CustomInputProgressBar
            heading="Bonus Received"
            name="bonus"
            exact={true}
          />
          <CustomInputProgressBar
            heading="Promoted In Last 5 Years"
            name="promp"
            exact={true}
          />
          <CustomInputDropdownBox
            heading="Department"
            name="dept"
            options={departmentOptions}
          />
          <CustomInputDropdownBox
            heading="Salary Level"
            name="sal"
            options={salaryOptions}
          />
        </div>

        <Divider />
        <div className="w-full p-8 bg-white border-teal-600 border rounded-lg shadow shadow-teal-600">
          <Heading heading="Cumulative Evaluation" />
          <div className="py-4" />
          <FileSelector setFile={setFile} name="employees" />
        </div>

        <SubmitButton />
      </form>
    </div>
  );
}
