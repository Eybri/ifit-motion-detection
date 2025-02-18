import os
from flask_mail import Mail

mail = Mail()

def configure_mail(app):
    mail_settings = {
        "MAIL_SERVER": "smtp.mailtrap.io",
        "MAIL_PORT": 587,
        "MAIL_USERNAME": os.getenv("MAILTRAP_USERNAME"),
        "MAIL_PASSWORD": os.getenv("MAILTRAP_PASSWORD"),
        "MAIL_USE_TLS": True,
        "MAIL_USE_SSL": False
    }
    app.config.update(mail_settings)
    mail.init_app(app)
