import { Controller, Post, Body, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { EmailService } from '../services/email.service';

@ApiTags('Test')
@Controller('test')
export class TestEmailController {
  constructor(private readonly emailService: EmailService) {}

  @Get('email/connection')
  @ApiOperation({ summary: 'Test email connection' })
  @ApiResponse({ status: 200, description: 'Connection status' })
  async testEmailConnection() {
    const isConnected = await this.emailService.testConnection();
    return {
      success: isConnected,
      message: isConnected 
        ? 'Email service is connected and ready' 
        : 'Email service connection failed',
      provider: process.env.EMAIL_PROVIDER || 'mailhog',
      testMode: process.env.NODE_ENV === 'development',
    };
  }

  @Post('email/send')
  @ApiOperation({ summary: 'Send a test email' })
  @ApiResponse({ status: 200, description: 'Email sent successfully' })
  async sendTestEmail(
    @Body() body: { to?: string; subject?: string; message?: string }
  ) {
    const to = body.to || process.env.TEST_CUSTOMER_EMAIL || 'test@mptsystem.com';
    const subject = body.subject || 'MPT System - Test Email';
    const message = body.message || 'This is a test email from MPT System.';

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">MPT System</h1>
        </div>
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #1e3a8a;">Test Email</h2>
          <p style="color: #333; line-height: 1.6;">${message}</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="color: #666; font-size: 14px;">
            <strong>Environment:</strong> ${process.env.NODE_ENV || 'development'}<br>
            <strong>Email Provider:</strong> ${process.env.EMAIL_PROVIDER || 'mailhog'}<br>
            <strong>Test Mode:</strong> ${process.env.NODE_ENV === 'development' ? 'Yes' : 'No'}
          </p>
        </div>
        <div style="background: #1e3a8a; padding: 15px; text-align: center;">
          <p style="color: white; margin: 0; font-size: 12px;">
            © 2025 MPT System. All rights reserved.
          </p>
        </div>
      </div>
    `;

    const success = await this.emailService.sendEmail({
      to,
      subject,
      html,
      text: message,
    });

    return {
      success,
      message: success 
        ? `Test email sent to ${to}` 
        : 'Failed to send test email',
      recipient: to,
      provider: process.env.EMAIL_PROVIDER || 'mailhog',
    };
  }

  @Post('email/oem-request')
  @ApiOperation({ summary: 'Send a test OEM price request email' })
  async sendTestOemRequest() {
    const testJobDetails = {
      jobNo: 'MPT25-0001',
      claimNo: 'TEST-CLAIM-001',
      vehicleMake: 'Toyota',
      vehicleModel: 'Corolla',
      vehicleYear: 2023,
    };

    const testParts = [
      { description: 'Front Bumper', quantity: 1 },
      { description: 'Headlight Assembly (Left)', quantity: 1 },
    ];

    // Create a simple test PDF buffer
    const pdfBuffer = Buffer.from('Test PDF Content for OEM Request');

    const success = await this.emailService.sendOemPriceRequest(
      testJobDetails.vehicleMake,
      testJobDetails,
      testParts,
      pdfBuffer
    );

    return {
      success,
      message: success 
        ? 'Test OEM request email sent' 
        : 'Failed to send OEM request email',
      details: testJobDetails,
    };
  }
}