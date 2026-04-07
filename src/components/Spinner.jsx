const Spinner = ({ color = 'border-zinc-900' }) => (
  <span
    aria-hidden="true"
    className={`inline-block h-4 w-4 animate-spin rounded-full border-t-2 ${color}`}
  />
)

export default Spinner
