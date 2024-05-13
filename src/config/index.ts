import { config } from "dotenv";

config({
    path: ".env",
})

export const { API_PORT, API_KEY, FE_URL, NODEMAILER_EMAIL, NODEMAILER_PASS } =
    process.env;