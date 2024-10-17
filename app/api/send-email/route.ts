/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);

const VERIFIED_SENDER_EMAIL = 'motlalepulasello5@gmail.com';

export async function POST(request: Request) {
    try {
        const { name, email, message } = await request.json();

        const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>New Contact Form Submission</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                }
                .container {
                    background-color: #f9f9f9;
                    border-radius: 5px;
                    padding: 20px;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                }
                h1 {
                    color: #2c3e50;
                    border-bottom: 2px solid #3498db;
                    padding-bottom: 10px;
                }
                .field {
                    margin-bottom: 20px;
                }
                .field strong {
                    color: #2980b9;
                }
                .message {
                    background-color: #ffffff;
                    border-left: 4px solid #3498db;
                    padding: 10px;
                    margin-top: 10px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>New Contact Form Submission</h1>
                <div class="field">
                    <strong>Name:</strong> ${name}
                </div>
                <div class="field">
                    <strong>Email:</strong> ${email}
                </div>
                <div class="field">
                    <strong>Message:</strong>
                    <div class="message">${message}</div>
                </div>
            </div>
        </body>
        </html>
        `;

        const msg = {
            to: 'motlalepulasello5@gmail.com',
            from: VERIFIED_SENDER_EMAIL,
            subject: 'New Contact Form Submission',
            text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
            html: htmlContent,
            replyTo: email,
        };
        return NextResponse.json({ message: 'Email sent successfully' }, { status: 200 });
    } catch (error: any) {
        console.error('Error sending email:', error);
        if (error.response) {
            console.error('SendGrid API Error Response:', error.response.body);
        }
        return NextResponse.json({
            message: 'Error sending email',
            error: error.message,
            details: error.response ? error.response.body : undefined
        }, { status: 500 });
    }
}
