const SibApiV3Sdk = require('@getbrevo/brevo');
const fs = require('fs');

class Emailer {
	constructor(key, from) {
		this.from = from;
		this.apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
		this.apiInstance.setApiKey(
			SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey,
			key
		);
	}

	async sendEmail(to, subject, body) {
		try {
			const sendSmtpEmail = {
				sender: {
					name: this.from.name,
					email: this.from.email,
				},
				to: [
					{
						email: to,
					},
				],
				subject: subject,
				htmlContent: body,
			};
			const response = await this.apiInstance.sendTransacEmail(sendSmtpEmail);
			return { status: true, response };
		} catch (error) {
			return { status: false, error: error };
		}
	}

	async sendBulkEmail(to, subject, body) {
		try {
			const sendSmtpEmail = {
				sender: {
					name: this.from.name,
					email: this.from.email,
				},
				to: to.map((email) => ({ email })), // Convert array of emails to array of objects
				subject: subject,
				htmlContent: body,
			};
			const response = await this.apiInstance.sendTransacEmail(sendSmtpEmail);
			return { status: true, response };
		} catch (error) {
			return { status: false, error: error };
		}
	}

	renderEmailTemplate(name, vars, folder = 'email-templates') {
		let html = fs.readFileSync(
			`${__dirname}/public/${folder}/${name}.html`,
			'utf8'
		);
		const keys = Object.keys(vars);
		keys.forEach((key) => {
			const reg = new RegExp(`{{${key}}}`, 'g');
			html = html.replace(reg, vars[key]);
		});
		return html;
	}

	renderRawTemplate(text = '', varsToReplace = []) {
		let html = text;
		varsToReplace.forEach((v, _) => {
			const reg = new RegExp(v[0], 'g');
			html = html.replace(reg, v[1]);
		});
		return html;
	}
}

const API_KEY = `YOUR-BREVO-API-KEY-HERE`;
const from = { name: 'Test Sender', email: 'test@example.com' };
const emailer = new Emailer(API_KEY, from);

const otp = Math.floor(100000 + Math.random() * 900000);
const varsToReplace = { OTP_CODE: otp, USERNAME: 'Zuber Khan' };
const otpEmailHtml = emailer.renderEmailTemplate(
	'otp_email',
	varsToReplace,
	'email-templates'
);

emailer
	.sendEmail('zuberkhan034@gmail.com', 'Test Email', otpEmailHtml)
	.then((res) => console.log(res))
	.catch((err) => console.log(err));
