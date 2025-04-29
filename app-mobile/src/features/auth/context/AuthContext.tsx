// "use client"

// import { createContext, useContext, type ReactNode } from "react"
// import { useAuth as useAuthHook } from "../hooks/useAuth"
// import type { User, LoginCredentials, RegisterCredentials } from "../types"

// interface AuthContextType {
//   user: User | null | undefined
//   userProfile: any | null | undefined
//   hasSelectedInterests: boolean | undefined
//   loading: boolean
//   login: (credentials: LoginCredentials) => void
//   signup: (credentials: RegisterCredentials) => void
//   logout: () => void
//   error: Error | null
//   clearError: () => void
//   refetchUser: () => void
//   saveUserLocation: (location: string) => Promise<void> // Thêm hàm này
//   isOffline?: boolean
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined)

// export const AuthProvider = ({ children }: { children: ReactNode }) => {
//   const auth = useAuthHook()

//   return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
// }

// export const useAuth = () => {
//   const context = useContext(AuthContext)
//   if (context === undefined) {
//     throw new Error("useAuth must be used within an AuthProvider")
//   }
//   return context
// }
