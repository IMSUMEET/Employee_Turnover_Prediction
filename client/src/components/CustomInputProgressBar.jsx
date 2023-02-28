import ProgressBar from "./ProgressBar";

export default function CustomInputProgressBar({
  heading,
  name,
  exact = false,
}) {
  return (
    <div className="flex items-center justify-between my-4">
      <p className="font-bold text-teal-400">{heading}</p>
      <ProgressBar name={name} exact={exact} />
    </div>
  );
}
