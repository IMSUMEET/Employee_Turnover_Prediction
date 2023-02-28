
export default function DropdownBox({ name, options }) {
    return (<div>
      <select name={name} id="" defaultValue="" className='rounded-md text-white p-2 min-w-[240px]' >
        {options.map((val, ind) => (
          <option key={`input-options-${ind}`} value={val}>{val}</option>
        ))}
      </select>
    </div>)
  }