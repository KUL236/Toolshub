# EmailJS setup (Feedback & Support forms)

All four tabs (Feedback, Feature Request, Bug Report, Contact) send one email through EmailJS.
Free plan is enough to start. Until the 3 values below are filled, the forms work as before and no email is sent.

## 1. Create the EmailJS pieces (https://dashboard.emailjs.com)
1. **Email Services -> Add New Service** (Gmail etc.) -> copy the **Service ID**.
2. **Email Templates -> Create New Template** -> copy the **Template ID**. Use this:

   - **To Email:** your own inbox
   - **Reply-To:** `{{reply_to}}`   (so pressing Reply answers the visitor)
   - **From Name:** `{{from_name}}`
   - **Subject:** `{{subject}}`
   - **Content:**
     ```
     Type: {{form_type}}
     From: {{from_name}} <{{from_email}}>
     Rating: {{rating}}
     Account: {{user_account}}
     Page: {{page_url}}
     Sent: {{submitted_at}}

     {{message}}
     ```
3. **Account -> General -> Public Key** -> copy it.

## 2. Put the values in `js/email-config.js`
```js
window.EMAILJS_CONFIG = {
  serviceId:  'service_xxxxxxx',
  templateId: 'template_xxxxxxx',
  publicKey:  'xxxxxxxxxxxxxxxx'
};
```
The public key is meant to be public. Never put a *private* key in front-end code.

## 3. Lock it down (recommended)
- EmailJS dashboard -> **Security**: add your real domain to allowed origins and turn on a rate limit.
- `netlify.toml` already allows `https://api.emailjs.com` in the Content-Security-Policy (`connect-src`). Without it browsers block the request.

## Built-in protections
- 30-second wait between sends per browser, hidden bot-trap field, 15-second timeout, input length limits.
- Contact tab requires a valid email so you can reply.
- If sending fails, the visitor sees an error and keeps what they typed.
