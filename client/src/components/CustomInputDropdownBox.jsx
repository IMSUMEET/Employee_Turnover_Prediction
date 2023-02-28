import DropdownBox from "./DropdownBox";


export default function CustomInputDropdownBox({ heading, options, name }) {
    return (<div className='flex items-center justify-between my-4'>
      <p className='font-bold text-teal-400'>{heading}</p>
      <DropdownBox options={options} name={name} />
    </div>)
  }