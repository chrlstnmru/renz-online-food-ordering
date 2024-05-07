import { dev } from '$app/environment';
import { NODEMAILER_PASS, NODEMAILER_USER } from '$env/static/private';
import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
	host: 'smtp.gmail.com',
	port: dev ? 587 : 465,
	secure: !dev,
	auth: {
		user: NODEMAILER_USER,
		pass: NODEMAILER_PASS
	}
});
