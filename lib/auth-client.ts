import { createAuthClient } from "better-auth/react"
import { auth } from "./auth"
import { inferAdditionalFields } from "better-auth/client/plugins";
export const authClient = createAuthClient({
    /** The base URL of the server (optional if you're using the same domain) */
    baseURL: process.env.BASE_URI,
    plugins: [inferAdditionalFields<typeof auth>()],
})

export const { signIn, signUp, useSession,signOut } = authClient