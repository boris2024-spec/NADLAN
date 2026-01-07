import nodemailer from 'nodemailer';

class EmailService {
    constructor() {
        this.transporter = null;
        this.initTransporter();
    }

    initTransporter() {
        // Unified SMTP settings (Gmail STARTTLS on 587 or SMTPS on 465)
        const host = process.env.SMTP_HOST || 'smtp.gmail.com';
        const port = Number(process.env.SMTP_PORT || 587);
        const user = process.env.SMTP_USER;
        const pass = process.env.SMTP_PASS;
        const secure = port === 465; // 465 = SSL, 587 = STARTTLS


        const options = {
            host,
            port,
            secure,
            auth: { user, pass },
            // Enable STARTTLS for 587
            requireTLS: !secure,
            pool: true,
            maxConnections: 5,
            maxMessages: 100,
            // Ignore self-signed certificates only in development
            ...(process.env.NODE_ENV !== 'production' && { tls: { rejectUnauthorized: false } })
        };

        if (process.env.NODE_ENV !== 'production') {
            options.logger = false; // disable logging to console
            options.debug = true;
        }

        this.transporter = nodemailer.createTransport(options);

        // Instant SMTP availability check - log but don't fail
        this.transporter.verify()
            .then(() => console.log('SMTP verify OK:', { host, port, user, secure }))
            .catch(err => console.error('SMTP verify FAILED:', {
                code: err.code,
                responseCode: err.responseCode,
                command: err.command,
                message: err.message
            }));

        console.log('Email transporter initialized with:', {
            host,
            port,
            user,
            secure,
            requireTLS: !secure,
            hasPassword: !!pass
        });
    }

    getFromAddress() {
        // For Gmail, From must match the authenticated user
        const user = process.env.SMTP_USER;
        const configured = process.env.FROM_EMAIL || user;
        const host = (this?.transporter?.options?.host || '').toLowerCase();
        const mustUseUser = host.includes('gmail.com');
        return mustUseUser ? user : configured;
    }

    async sendVerificationEmail(userEmail, verificationToken, userName) {
        try {
            console.log("process.env.FRONTEND_URL", process.env.FRONTEND_URL)
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
            const verificationUrl = `${frontendUrl}/verify-email/${verificationToken}`;

            const mailOptions = {
                from: `"Nadlan Platform" <${this.getFromAddress()}>`,
                to: userEmail,
                subject: 'אימות כתובת האימייל שלך - Nadlan',
                html: this.getVerificationEmailTemplate(userName, verificationUrl),
                text: `שלום ${userName},\n\nבכדי להשלים את הרישום שלך בפלטפורמת Nadlan, אנא לחץ על הקישור הבא לאימות כתובת האימייל:\n\n${verificationUrl}\n\nהקישור תקף למשך 24 שעות.\n\nאם לא ביקשת לפתוח חשבון, אנא התעלם ממייל זה.\n\nבברכה,\nצוות Nadlan`
            };

            console.log("mailOptions:", mailOptions);

            const result = await this.transporter.sendMail(mailOptions);

            console.log('Email sent successfully:', result.messageId);

            // In development mode, display preview link
            if (process.env.NODE_ENV !== 'production') {
                console.log('Preview URL:', nodemailer.getTestMessageUrl(result));
            }

            return result;
        } catch (error) {
            console.error('Error sending verification email:', {
                code: error.code,
                responseCode: error.responseCode,
                command: error.command,
                message: error.message,
                response: error.response
            });
            // Throw original error so controller can log and respond correctly
            throw error;
        }
    }

    async sendPasswordResetEmail(userEmail, resetToken, userName) {
        try {
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
            const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

            const mailOptions = {
                from: `"Nadlan Platform" <${this.getFromAddress()}>`,
                to: userEmail,
                subject: 'איפוס סיסמה - Nadlan',
                html: this.getPasswordResetEmailTemplate(userName, resetUrl),
                text: `שלום ${userName},\n\nקיבלנו בקשה לאיפוס הסיסמה שלך.\n\nלחץ על הקישור הבא כדי ליצור סיסמה חדשה:\n\n${resetUrl}\n\nהקישור תקף למשך 10 דקות בלבד.\n\nאם לא ביקשת איפוס סיסמה, אנא התעלם ממייל זה.\n\nבברכה,\nצוות Nadlan`
            };

            const result = await this.transporter.sendMail(mailOptions);

            console.log('Password reset email sent successfully:', result.messageId);

            if (process.env.NODE_ENV !== 'production') {
                console.log('Preview URL:', nodemailer.getTestMessageUrl(result));
            }

            return result;
        } catch (error) {
            console.error('Error sending password reset email:', {
                code: error.code,
                responseCode: error.responseCode,
                command: error.command,
                message: error.message,
                response: error.response
            });
            throw error;
        }
    }

    async sendWelcomeEmail(userEmail, userName) {
        try {
            const mailOptions = {
                from: `"Nadlan Platform" <${this.getFromAddress()}>`,
                to: userEmail,
                subject: 'Welcome to Nadlan!',
                html: this.getWelcomeEmailTemplate(userName),
                text: `שלום ${userName},\n\nברוכים הבאים לפלטפורמת Nadlan!\n\nכעת תוכל לגלות מגוון רחב של נכסי נדל"ן, לשמור על מועדפים ולקבל התראות על הזדמנויות חדשות.\n\nתחילת דרך נעימה!\n\nבברכה,\nצוות Nadlan`
            };

            const result = await this.transporter.sendMail(mailOptions);
            console.log('Welcome email sent successfully:', result.messageId);

            return result;
        } catch (error) {
            console.error('Error sending welcome email:', {
                code: error.code,
                responseCode: error.responseCode,
                command: error.command,
                message: error.message,
                response: error.response
            });
            // Don't throw error as it's not critical
            return null;
        }
    }

    async sendContactEmail({ name, email, phone, message }, ticketId) {
        try {
            const supportEmail = process.env.SUPPORT_EMAIL || this.getFromAddress();
            const mailOptions = {
                from: `"Nadlan Contact" <${this.getFromAddress()}>`,
                to: supportEmail,
                replyTo: email,
                subject: `הודעת צור קשר חדשה ${ticketId ? `(#${String(ticketId).slice(0, 8)}) ` : ''}מאת ${name}`,
                html: `
                    <div dir="rtl" style="font-family:Arial,sans-serif;line-height:1.6">
                        <h2>הודעה חדשה מטופס צור קשר</h2>
                        ${ticketId ? `<p><strong>מספר פנייה:</strong> ${ticketId}</p>` : ''}
                        <p><strong>שם:</strong> ${name}</p>
                        <p><strong>אימייל:</strong> ${email}</p>
                        ${phone ? `<p><strong>טלפון:</strong> ${phone}</p>` : ''}
                        <p><strong>תוכן ההודעה:</strong></p>
                        <div style="white-space:pre-wrap;background:#f9f9f9;padding:12px;border:1px solid #ddd;border-radius:6px">${message}</div>
                        <hr />
                        <p style="font-size:12px;color:#666">נשלח אוטומטית ממערכת Nadlan</p>
                    </div>
                `,
                text: `${ticketId ? `מספר פנייה: ${ticketId}\n` : ''}שם: ${name}\nאימייל: ${email}\n${phone ? `טלפון: ${phone}\n` : ''}הודעה:\n${message}`
            };
            const result = await this.transporter.sendMail(mailOptions);
            return result;
        } catch (error) {
            console.error('Error sending contact email:', error.message);
            throw error;
        }
    }

    async sendConsultingEmail({ name, email, phone, consultingType, propertyType, message }) {
        try {
            const supportEmail = process.env.SUPPORT_EMAIL || this.getFromAddress();

            const consultingTypeLabels = {
                'buying': 'רכישת נכס',
                'selling': 'מכירת נכס',
                'investment': 'השקעות נדל"ן',
                'legal': 'ייעוץ משפטי',
                'taxation': 'ייעוץ מיסוי',
                'other': 'אחר'
            };

            const consultingLabel = consultingTypeLabels[consultingType] || consultingType;

            const mailOptions = {
                from: `"Nadlan Consulting" <${this.getFromAddress()}>`,
                to: supportEmail,
                replyTo: email,
                subject: `בקשה לייעוץ: ${consultingLabel} מאת ${name}`,
                html: `
                    <div dir="rtl" style="font-family:Arial,sans-serif;line-height:1.6">
                        <h2>בקשה חדשה לייעוץ נדל"ן</h2>
                        <p><strong>שם:</strong> ${name}</p>
                        <p><strong>אימייל:</strong> ${email}</p>
                        <p><strong>טלפון:</strong> ${phone}</p>
                        <p><strong>סוג הייעוץ:</strong> ${consultingLabel}</p>
                        ${propertyType ? `<p><strong>סוג הנכס:</strong> ${propertyType}</p>` : ''}
                        <p><strong>פרטי הבקשה:</strong></p>
                        <div style="white-space:pre-wrap;background:#f9f9f9;padding:12px;border:1px solid #ddd;border-radius:6px">${message}</div>
                        <hr />
                        <p style="font-size:12px;color:#666">נשלח אוטומטית ממערכת Nadlan - טופס ייעוץ</p>
                    </div>
                `,
                text: `בקשה לייעוץ נדל"ן\n\nשם: ${name}\nאימייל: ${email}\nטלפון: ${phone}\nסוג הייעוץ: ${consultingLabel}\n${propertyType ? `סוג הנכס: ${propertyType}\n` : ''}פרטי הבקשה:\n${message}`
            };

            const result = await this.transporter.sendMail(mailOptions);
            console.log('Consulting email sent successfully:', result.messageId);
            return result;
        } catch (error) {
            console.error('Error sending consulting email:', error.message);
            throw error;
        }
    }

    getVerificationEmailTemplate(userName, verificationUrl) {
        return `
        <!DOCTYPE html>
        <html dir="rtl" lang="he">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>אימות אימייל - Nadlan</title>
            <style>
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    background-color: #f4f4f4;
                    margin: 0;
                    padding: 0;
                    direction: rtl;
                }
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #ffffff;
                    padding: 20px;
                    border-radius: 10px;
                    box-shadow: 0 0 10px rgba(0,0,0,0.1);
                    margin-top: 20px;
                }
                .header {
                    text-align: center;
                    padding: 20px 0;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border-radius: 10px 10px 0 0;
                    margin: -20px -20px 30px -20px;
                }
                .logo {
                    font-size: 28px;
                    font-weight: bold;
                    margin-bottom: 10px;
                }
                .subtitle {
                    font-size: 16px;
                    opacity: 0.9;
                }
                .content {
                    padding: 0 40px;
                    text-align: right;
                }
                .greeting {
                    font-size: 18px;
                    margin-bottom: 20px;
                    color: #2c3e50;
                    text-align: right;
                    padding-right: 20px;
                }
                .message {
                    font-size: 16px;
                    margin-bottom: 30px;
                    line-height: 1.8;
                    text-align: right;
                    padding-right: 20px;
                }
                .button-container {
                    text-align: center;
                    margin: 30px 0;
                }
                .verify-button {
                    display: inline-block;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 15px 30px;
                    text-decoration: none;
                    border-radius: 25px;
                    font-weight: bold;
                    font-size: 16px;
                    transition: transform 0.2s;
                }
                .verify-button:hover {
                    transform: translateY(-2px);
                }
                .warning {
                    background-color: #fff3cd;
                    border: 1px solid #ffeaa7;
                    color: #856404;
                    padding: 15px;
                    border-radius: 5px;
                    margin: 20px 20px 20px 0;
                    font-size: 14px;
                    text-align: right;
                }
                .footer {
                    text-align: right;
                    margin-top: 40px;
                    padding: 20px 40px 20px 20px;
                    background-color: #f8f9fa;
                    border-radius: 5px;
                    color: #6c757d;
                    font-size: 14px;
                }
                .url-fallback {
                    word-break: break-all;
                    color: #6c757d;
                    font-size: 12px;
                    margin-top: 15px;
                    text-align: right;
                }
                ul {
                    text-align: right;
                    padding-right: 40px;
                    list-style-position: inside;
                }
                li {
                    text-align: right;
                    margin-bottom: 8px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="logo">🏠 Nadlan</div>
                    <div class="subtitle">פלטפורמת הנדל"ן המובילה</div>
                </div>
                
                <div class="content">
                    <div class="greeting">שלום ${userName},</div>
                    
                    <div class="message">
                        תודה על ההרשמה לפלטפורמת Nadlan!<br>
                        כדי להשלים את תהליך הרישום ולהתחיל ליהנות מכל השירותים שלנו, 
                        אנא אמת את כתובת האימייל שלך על ידי לחיצה על הכפתור למטה.
                    </div>

                    <div class="button-container">
                        <a href="${verificationUrl}" class="verify-button">
                            ✓ אמת את האימייל שלי
                        </a>
                    </div>

                    <div class="warning">
                        <strong>שימו לב:</strong> קישור האימות תקף למשך 24 שעות בלבד. 
                        לאחר מכן תצטרך לבקש קישור חדש.
                    </div>

                    <div class="message">
                        לאחר האימות תוכל:
                        <ul style="text-align: right; padding-right: 40px; list-style-position: inside;">
                            <li style="text-align: right; margin-bottom: 8px;">🔍 לחפש ולגלות נכסים מתאימים</li>
                            <li style="text-align: right; margin-bottom: 8px;">❤️ לשמור נכסים במועדפים</li>
                            <li style="text-align: right; margin-bottom: 8px;">🔔 לקבל התראות על הזדמנויות חדשות</li>
                            <li style="text-align: right; margin-bottom: 8px;">💬 ליצור קשר עם סוכני נדל"ן</li>
                        </ul>
                    </div>
                </div>

                <div class="footer">
                    אם לא יצרת חשבון בפלטפורמת Nadlan, אנא התעלם מהודעה זו.<br>
                    <div class="url-fallback">
                        אם הכפתור לא עובד, העתק והדבק את הקישור הבא לדפדפן:<br>
                        ${verificationUrl}
                    </div>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    getPasswordResetEmailTemplate(userName, resetUrl) {
        return `
        <!DOCTYPE html>
        <html dir="rtl" lang="he">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>איפוס סיסמה - Nadlan</title>
            <style>
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    background-color: #f4f4f4;
                    margin: 0;
                    padding: 0;
                    direction: rtl;
                }
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #ffffff;
                    padding: 20px;
                    border-radius: 10px;
                    box-shadow: 0 0 10px rgba(0,0,0,0.1);
                    margin-top: 20px;
                }
                .header {
                    text-align: center;
                    padding: 20px 0;
                    background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
                    color: white;
                    border-radius: 10px 10px 0 0;
                    margin: -20px -20px 30px -20px;
                }
                .logo {
                    font-size: 28px;
                    font-weight: bold;
                    margin-bottom: 10px;
                }
                .subtitle {
                    font-size: 16px;
                    opacity: 0.9;
                }
                .content {
                    padding: 0 40px;
                    text-align: right;
                }
                .greeting {
                    font-size: 18px;
                    margin-bottom: 20px;
                    color: #2c3e50;
                    text-align: right;
                    padding-right: 20px;
                }
                .message {
                    font-size: 16px;
                    margin-bottom: 30px;
                    line-height: 1.8;
                    text-align: right;
                    padding-right: 20px;
                }
                .button-container {
                    text-align: center;
                    margin: 30px 0;
                }
                .reset-button {
                    display: inline-block;
                    background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
                    color: white;
                    padding: 15px 30px;
                    text-decoration: none;
                    border-radius: 25px;
                    font-weight: bold;
                    font-size: 16px;
                    transition: transform 0.2s;
                }
                .reset-button:hover {
                    transform: translateY(-2px);
                }
                .warning {
                    background-color: #f8d7da;
                    border: 1px solid #f1aeb5;
                    color: #721c24;
                    padding: 15px;
                    border-radius: 5px;
                    margin: 20px 20px 20px 0;
                    font-size: 14px;
                    text-align: right;
                }
                .footer {
                    text-align: right;
                    margin-top: 40px;
                    padding: 20px 40px 20px 20px;
                    background-color: #f8f9fa;
                    border-radius: 5px;
                    color: #6c757d;
                    font-size: 14px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="logo">🔐 Nadlan</div>
                    <div class="subtitle">איפוס סיסמה</div>
                </div>
                
                <div class="content">
                    <div class="greeting">שלום ${userName},</div>
                    
                    <div class="message">
                        קיבלנו בקשה לאיפוס הסיסמה עבור החשבון שלך.<br>
                        לחץ על הכפתור למטה כדי ליצור סיסמה חדשה.
                    </div>

                    <div class="button-container">
                        <a href="${resetUrl}" class="reset-button">
                            🔄 איפוס סיסמה
                        </a>
                    </div>

                    <div class="warning">
                        <strong>חשוב:</strong> קישור איפוס הסיסמה תקף למשך 10 דקות בלבד מסיבות אבטחה.
                    </div>

                    <div class="message">
                        אם לא ביקשת איפוס סיסמה, אנא התעלם מהודעה זו. 
                        הסיסמה שלך תישאר ללא שינוי.
                    </div>
                </div>

                <div class="footer">
                    צוות האבטחה של Nadlan<br>
                    הודעה זו נשלחה באופן אוטומטי, אין להשיב עליה
                </div>
            </div>
        </body>
        </html>
        `;
    }

    getWelcomeEmailTemplate(userName) {
        return `
        <!DOCTYPE html>
        <html dir="rtl" lang="he">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>ברוכים הבאים ל-Nadlan</title>
            <style>
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    background-color: #f4f4f4;
                    margin: 0;
                    padding: 0;
                    direction: rtl;
                }
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #ffffff;
                    padding: 20px;
                    border-radius: 10px;
                    box-shadow: 0 0 10px rgba(0,0,0,0.1);
                    margin-top: 20px;
                }
                .header {
                    text-align: center;
                    padding: 20px 0;
                    background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
                    color: white;
                    border-radius: 10px 10px 0 0;
                    margin: -20px -20px 30px -20px;
                }
                .logo {
                    font-size: 28px;
                    font-weight: bold;
                    margin-bottom: 10px;
                }
                .subtitle {
                    font-size: 16px;
                    opacity: 0.9;
                }
                .content {
                    padding: 0 40px;
                    text-align: right;
                }
                .greeting {
                    font-size: 20px;
                    margin-bottom: 20px;
                    color: #2c3e50;
                    text-align: right;
                    padding-right: 20px;
                }
                .message {
                    font-size: 16px;
                    margin-bottom: 25px;
                    line-height: 1.8;
                    text-align: right;
                    padding-right: 20px;
                }
                .features {
                    background-color: #f8f9fa;
                    padding: 20px 40px 20px 20px;
                    border-radius: 8px;
                    margin: 20px 20px 20px 0;
                    text-align: right;
                }
                .feature-item {
                    display: flex;
                    align-items: center;
                    margin-bottom: 15px;
                    font-size: 16px;
                    justify-content: flex-end;
                    text-align: right;
                }
                .feature-icon {
                    font-size: 24px;
                    margin-right: 15px;
                    margin-left: 0;
                    width: 30px;
                }
                .footer {
                    text-align: right;
                    margin-top: 30px;
                    padding: 20px 40px 20px 20px;
                    background-color: #f8f9fa;
                    border-radius: 5px;
                    color: #6c757d;
                    font-size: 14px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="logo">🎉 Nadlan</div>
                    <div class="subtitle">ברוכים הבאים!</div>
                </div>
                
                <div class="content">
                    <div class="greeting">שלום ${userName}! 👋</div>
                    
                    <div class="message">
                        מזל טוב! החשבון שלך בפלטפורמת Nadlan אומת בהצלחה וכעת תוכל ליהנות מכל השירותים שלנו.
                    </div>

                    <div class="features">
                        <h3 style="color: #2c3e50; margin-top: 0;">מה תוכל לעשות עכשיו:</h3>
                        
                        <div class="feature-item">
                            <span class="feature-icon">🔍</span>
                            <span>חיפוש מתקדם של נכסים לפי העדפותיך</span>
                        </div>
                        
                        <div class="feature-item">
                            <span class="feature-icon">❤️</span>
                            <span>שמירת נכסים מועדפים לצפייה מאוחרת</span>
                        </div>
                        
                        <div class="feature-item">
                            <span class="feature-icon">🔔</span>
                            <span>קבלת התראות על נכסים חדשים המתאימים לך</span>
                        </div>
                        
                        <div class="feature-item">
                            <span class="feature-icon">💬</span>
                            <span>יצירת קשר ישיר עם סוכני נדל"ן</span>
                        </div>
                        
                        <div class="feature-item">
                            <span class="feature-icon">📊</span>
                            <span>מעקב אחר מגמות השוק וכלים מתקדמים</span>
                        </div>
                    </div>

                    <div class="message">
                        אנחנו כאן כדי לעזור לך למצוא את הבית החדש שלך או את ההשקעה המושלמת. 
                        צוות התמיכה שלנו זמין 24/7 לכל שאלה או בעיה.
                    </div>

                    <div class="message" style="text-align: center; font-weight: bold; color: #2ecc71;">
                        בהצלחה במציאת הנכס המושלם! 🏠✨
                    </div>
                </div>

                <div class="footer">
                    בברכה,<br>
                    צוות Nadlan 💙<br>
                    <small>הודעה זו נשלחה באופן אוטומטי</small>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    // Check connection to mail server
    async verifyConnection() {
        try {
            await this.transporter.verify();
            console.log('Email service is ready to send emails');
            return true;
        } catch (error) {
            console.error('Email service connection failed:', {
                code: error.code,
                responseCode: error.responseCode,
                command: error.command,
                message: error.message
            });
            return false;
        }
    }
}

// Create singleton instance
const emailService = new EmailService();

export default emailService;