

export default function CustomNumberBox({ name }) {
    return (<input type="text" pattern="[0-9]" name={name} className="outline-none border-2 border-teal-200 hover:border-teal-400 focus:border-teal-600 rounded-md bg-transparent px-2 py-1 text-teal-600 min-w-[240px]" />)
  }