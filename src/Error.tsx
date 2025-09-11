import { CircleAlert } from 'lucide-react'

export function Error() {
  return (
    <div className="grid h-screen place-items-center">
      {' '}
      <div className="flex flex-col place-items-center gap-4">
        <CircleAlert size={64} />
        <h1 className="text-4xl">Oops...Something when wrong. Please refresh your browser and try again</h1>
      </div>
    </div>
  )
}
