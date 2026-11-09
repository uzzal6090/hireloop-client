import { client } from "./auth"

export const db = client.db("hireloopdb")
export { client }
