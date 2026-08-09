import type { EmailMessage, EmailSender } from './types'

const consoleSender: EmailSender = {
  send: async (message: EmailMessage) => {
    console.log('\n========== EMAIL (dev) ==========')
    console.log(`To: ${message.to}`)
    console.log(`Subject: ${message.subject}`)
    console.log(`HTML:\n${message.html}`)
    console.log('=================================\n')
  },
}

export { consoleSender }
