import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { emailConfig } from '../config/email.config';

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    content?: Buffer;
    path?: string;
  }>;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    switch (emailConfig.provider) {
      case 'mailhog':
      case 'smtp':
        this.transporter = nodemailer.createTransport({
          host: emailConfig.smtp.host,
          port: emailConfig.smtp.port,
          secure: emailConfig.smtp.secure,
          auth: emailConfig.smtp.auth,
        });
        break;
      
      // Add other providers later (Resend, SendGrid, etc.)
      default:
        // Default to MailHog for development
        this.transporter = nodemailer.createTransport({
          host: 'localhost',
          port: 1025,
          secure: false,
        });
    }

    this.logger.log(`Email service initialized with provider: ${emailConfig.provider}`);
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      // In test mode, redirect emails to test addresses
      let recipients = options.to;
      if (emailConfig.testMode) {
        this.logger.log(`Test mode: Original recipients: ${options.to}`);
        recipients = emailConfig.testRecipients.customer;
        this.logger.log(`Test mode: Redirected to: ${recipients}`);
      }

      const mailOptions = {
        from: `${emailConfig.from.name} <${emailConfig.from.email}>`,
        to: Array.isArray(recipients) ? recipients.join(',') : recipients,
        subject: options.subject,
        text: options.text || '',
        html: options.html,
        attachments: options.attachments,
      };

      const result = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email sent successfully: ${result.messageId}`);
      
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email: ${error.message}`, error.stack);
      return false;
    }
  }

  async sendOemPriceRequest(
    vehicleMake: string,
    jobDetails: any,
    parts: any[],
    pdfBuffer: Buffer
  ): Promise<boolean> {
    const recipients = emailConfig.testMode 
      ? [emailConfig.testRecipients.oem]
      : emailConfig.defaultOemRoutes[vehicleMake] || [];

    if (recipients.length === 0) {
      this.logger.warn(`No email recipients found for vehicle make: ${vehicleMake}`);
      return false;
    }

    const subject = `Parts Price Request - Claim ${jobDetails.claimNo} - Job ${jobDetails.jobNo}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif;">
        <h2>Parts Price Request</h2>
        <p>Dear Supplier,</p>
        <p>Please provide pricing for the following OEM parts:</p>
        <ul>
          <li><strong>Job Number:</strong> ${jobDetails.jobNo}</li>
          <li><strong>Claim Number:</strong> ${jobDetails.claimNo}</li>
          <li><strong>Vehicle:</strong> ${jobDetails.vehicleMake} ${jobDetails.vehicleModel} (${jobDetails.vehicleYear})</li>
        </ul>
        <p>Please see the attached PDF for complete parts list.</p>
        <p>Thank you,<br>MPT System</p>
      </div>
    `;

    return this.sendEmail({
      to: recipients,
      subject,
      html,
      attachments: [{
        filename: `Price_Request_${jobDetails.jobNo}.pdf`,
        content: pdfBuffer,
      }],
    });
  }

  async sendAltUsedPriceRequest(
    jobDetails: any,
    parts: any[],
    pdfBuffer: Buffer
  ): Promise<boolean> {
    const recipients = emailConfig.testMode 
      ? [emailConfig.testRecipients.alt]
      : emailConfig.altUsedEmails;

    const subject = `Alternative/Used Parts Request - Job ${jobDetails.jobNo}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif;">
        <h2>Alternative/Used Parts Price Request</h2>
        <p>Dear Supplier,</p>
        <p>Please provide pricing for alternative or used parts for:</p>
        <ul>
          <li><strong>Job Number:</strong> ${jobDetails.jobNo}</li>
          <li><strong>Vehicle:</strong> ${jobDetails.vehicleMake} ${jobDetails.vehicleModel} (${jobDetails.vehicleYear})</li>
        </ul>
        <p>Please see the attached PDF for complete parts list.</p>
        <p>Thank you,<br>MPT System</p>
      </div>
    `;

    return this.sendEmail({
      to: recipients,
      subject,
      html,
      attachments: [{
        filename: `Alt_Parts_Request_${jobDetails.jobNo}.pdf`,
        content: pdfBuffer,
      }],
    });
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      this.logger.log('Email service connection verified successfully');
      return true;
    } catch (error) {
      this.logger.error(`Email service connection failed: ${error.message}`);
      return false;
    }
  }
}