import { EventEmitter } from 'node:events'
import { sendEmail } from '../email/send.email.js'
import {verifyEmailTemplate} from '../email/verify.email.template.js'
export const emailEvent = new EventEmitter()

emailEvent.on("confirmEmail", async (data) => {
    await sendEmail({
      from: data.from||process.env.APP_EMAIL,
      to: data.to,
      subject: data.subject || "confirm email",
      text: data.text,
      html: verifyEmailTemplate({otp:data.otp})
    }).catch((error) => {
      console.log(`fail to send email tp ${data.to}`);
    });  
})