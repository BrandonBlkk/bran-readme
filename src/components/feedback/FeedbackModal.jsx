import { AnimatePresence, motion } from 'framer-motion'
import { Check, Star, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { submitFeedback } from '../../services/feedbackService'
import { toast } from 'sonner'
import Spinner from '../Spinner'

const MotionDiv = motion.div

const FeedbackModal = ({ isOpen, onClose }) => {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const closeTimeoutRef = useRef(null)

  const resetFeedbackState = () => {
    setRating(0)
    setComment('')
    setIsSubmitting(false)
    setIsSuccess(false)
  }

  const handleClose = () => {
    if (closeTimeoutRef.current) {
      window.clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }

    resetFeedbackState()
    onClose()
  }

  useEffect(() => {
    if (!isOpen) {
      resetFeedbackState()
    }
  }, [isOpen])

  useEffect(() => () => {
    if (closeTimeoutRef.current) {
      window.clearTimeout(closeTimeoutRef.current)
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (rating === 0) {
      toast.error('Please select a rating.')
      return
    }

    setIsSubmitting(true)
    try {
      await submitFeedback({ rating, comment })
      setIsSuccess(true)
      closeTimeoutRef.current = window.setTimeout(() => {
        closeTimeoutRef.current = null
        handleClose()
      }, 2000)
    } catch (error) {
      toast.error('Submission failed: ' + error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <MotionDiv
          className="fixed inset-0 z-70 flex items-center justify-center px-4 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <MotionDiv
            className="absolute inset-0 bg-black/60"
            onClick={handleClose}
          />
          <MotionDiv
            className="relative w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl"
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          >
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 rounded-full p-2 text-zinc-500 hover:bg-zinc-900 hover:text-zinc-200 cursor-pointer"
            >
              <X size={18} />
            </button>

            {isSuccess ? (
              <div className="flex flex-col items-center py-8 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                  <Check size={32} />
                </div>
                <h2 className="text-xl font-bold text-zinc-50">Thank you!</h2>
                <p className="mt-2 text-sm text-zinc-400">
                  Your feedback helps us build a better tool for everyone.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <h2 className="text-xl font-bold text-zinc-50 tracking-tight">How's it going?</h2>
                <p className="mt-1 text-sm text-zinc-400">
                  Share your thoughts on BranReadme.
                </p>

                <div className="mt-6 flex justify-between px-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`transition-all hover:scale-110 cursor-pointer ${
                        rating >= star ? 'text-amber-400 fill-amber-400' : 'text-zinc-700'
                      }`}
                    >
                      <Star size={24} />
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-center text-xs font-mono uppercase tracking-[0.16em] text-zinc-600">
                  {rating === 0 ? 'Select a rating' : `${rating} / 5 stars`}
                </p>

                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="What can we improve? (Optional)"
                  className="mt-6 h-32 w-full resize-none rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-700"
                />

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-6 flex w-full items-center justify-center gap-3 rounded-xl bg-zinc-100 px-5 py-3 text-sm font-semibold text-zinc-950 transition-opacity hover:opacity-90 disabled:opacity-50 select-none cursor-pointer"
                >
                  {isSubmitting ? <Spinner color="border-zinc-900" /> : null}
                  {isSubmitting ? 'Sending...' : 'Submit Feedback'}
                </button>
              </form>
            )}
          </MotionDiv>
        </MotionDiv>
      )}
    </AnimatePresence>
  )
}

export default FeedbackModal
