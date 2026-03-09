interface LoadingSpinnerProps {
  message?: string
}

export default function LoadingSpinner({ message = "Loading..." }: LoadingSpinnerProps) {
  return (
    <div className="w-full h-full min-h-[400px] flex flex-col items-center justify-center space-y-4">
      <div className="w-10 h-10 border-4 border-purple-900/30 border-t-purple-500 rounded-full animate-spin" />
      <p className="text-gray-400 text-sm">{message}</p>
    </div>
  )
}
