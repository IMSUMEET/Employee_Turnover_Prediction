import { useState } from "react";

export default function ProgressBar({ name, exact }) {
  const [progress, setProgress] = useState(0);
  return (
    <div className="flex gap-4 w-[240px]">
      <input
        className="grow h-[24px]"
        type="range"
        min={"0"}
        max={exact ? "1" : "100"}
        value={progress}
        onChange={(e) => {
          setProgress(e.target.value);
        }}
      />
      <p className="text-gray-600 w-[40px] text-end">
        {exact ? progress : progress / 100}
      </p>
      <input
        value={exact ? progress : progress / 100}
        type="hidden"
        name={name}
      />
    </div>
  );
}
