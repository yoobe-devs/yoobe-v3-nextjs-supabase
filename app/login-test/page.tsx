import { redirect } from 'next/navigation'

export default function LoginTestRedirect() {
  redirect('/auth/login')
}
