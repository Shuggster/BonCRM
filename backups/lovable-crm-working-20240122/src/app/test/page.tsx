import Test from '../test'

export default function TestPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-900 p-8">
      <h1 className="text-4xl font-bold text-red-500 mb-4">Test Page</h1>
      <p className="text-xl text-blue-500 mb-4">If you can see this in blue, Tailwind is working!</p>
      <p className="text-white">And this should be white text on dark background</p>
    </div>
  )
}
