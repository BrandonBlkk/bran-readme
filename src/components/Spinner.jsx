import React from 'react'

const Spinner = (color) => {
  return (
    <p className={`w-4 h-4 animate-spin rounded-full border-t-2 ${color}`}></p>
  )
}

export default Spinner
