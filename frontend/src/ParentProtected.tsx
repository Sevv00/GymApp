import { Navigate, Outlet, useOutletContext } from "react-router"

export function ParentProtected() {
  const { isLoggedIn, setIsLoggedIn } = useOutletContext<{
    isLoggedIn: boolean
    setIsLoggedIn: (value: boolean) => void
  }>()

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />
  }

  return <Outlet context={{ isLoggedIn, setIsLoggedIn }} />
}