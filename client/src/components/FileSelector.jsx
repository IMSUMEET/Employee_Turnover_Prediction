


export default function FileSelector({name, setFile}) {
    return (<div className='border-dashed border-4 border-teal-400 rounded-lg w-full p-16 flex justify-center' onDrop={(e) => {e.preventDefault();console.log("a"); e.stopPropagation();setFile(e.dataTransfer.files[0])}} onDrag={(e)=>{e.preventDefault(); e.stopPropagation(); console.log("a")}}>
      <div className='flex w-[320px] flex-col gap-8 items-start'>
      <p className='p-4 bg-gray-200 rounded-lg text-teal-600 w-full'>Drag and Drop the csv file.</p>
      <input type="file" name={name} onChange={(e)=>{setFile(e.target.files[0])}} accept=".csv"/>    
      </div>
  
       </div>)
  }