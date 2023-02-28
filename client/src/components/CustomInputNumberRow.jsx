import CustomNumberBox from "./CustomNumberBox"

export default function CustomInputNumberRow({ heading, name }) {
    return (<div className='flex items-center justify-between my-4'>
      <p className='font-bold text-teal-400'>{heading}</p>
      <CustomNumberBox name={name} />
    </div>)
  }