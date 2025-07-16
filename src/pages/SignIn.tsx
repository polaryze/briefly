import { SignIn } from '@clerk/clerk-react'

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <SignIn />
    </div>
  )
} 