import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders
from jinja2 import Template

SMTP_SERVER_HOST = "localhost"
SMTP_SERVER_PORT = 1025
SENDER_ADDRESS = "quizo@donotreply.in"
SENDER_PASSWORD = "fun34"

def send_email(to_address, subject, message, content = "html", attachment_file = None):
    msg = MIMEMultipart()
    msg['From'] = SENDER_ADDRESS
    msg['To'] = to_address
    msg['Subject'] = subject

    # if content == "html":
    #     msg.attach(MIMEText(message, "html"))
    # else:
    #     msg.attach(MIMEText(message, "plain"))

    plain_text = "This is a fallback text version of the email."
    msg.attach(MIMEText(plain_text, "plain"))  # Fallback text version
    msg.attach(MIMEText(message, "html"))  # HTML version

    if attachment_file:
        with open(attachment_file, 'rb') as attachment:
            part = MIMEBase("application", "octet-stream") # Add file as application/
            part.set_payload(attachment.read())

        encoders.encode_base64(part) # email attachments are sent as base64 encoded.
        part.add_header("Content-Disposition", f"attachment; filename = {attachment_file}")
        msg.attach(part) #add attachment to message

    s = smtplib. SMTP(host = SMTP_SERVER_HOST, port = SMTP_SERVER_PORT)
    s.login(SENDER_ADDRESS, SENDER_PASSWORD)
    s.send_message(msg)
    s.quit()

    return True