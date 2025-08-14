export const emailConfig = {
  // Email provider: 'mailhog' | 'smtp' | 'resend' | 'sendgrid'
  provider: process.env.EMAIL_PROVIDER || 'mailhog',
  
  // SMTP Configuration (for MailHog or regular SMTP)
  smtp: {
    host: process.env.SMTP_HOST || 'localhost',
    port: parseInt(process.env.SMTP_PORT || '1025'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: process.env.SMTP_USER ? {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD || '',
    } : undefined,
  },

  // Resend Configuration
  resend: {
    apiKey: process.env.RESEND_API_KEY || '',
  },

  // SendGrid Configuration
  sendgrid: {
    apiKey: process.env.SENDGRID_API_KEY || '',
  },

  // Default sender
  from: {
    email: process.env.EMAIL_FROM || 'noreply@mptsystem.com',
    name: process.env.EMAIL_FROM_NAME || 'MPT System',
  },

  // Test mode - redirect all emails to test addresses
  testMode: process.env.NODE_ENV === 'development',
  testRecipients: {
    oem: process.env.TEST_OEM_EMAIL || 'test-oem@mptsystem.com',
    alt: process.env.TEST_ALT_EMAIL || 'test-alt@mptsystem.com',
    customer: process.env.TEST_CUSTOMER_EMAIL || 'test-customer@mptsystem.com',
  },

  // OEM Supplier Email Routes (will be overridden by database values)
  defaultOemRoutes: {
    'BMW': ['dmotupa@cfaomotors.co.za'],
    'VW': ['blebusa@cfaomotors.co.za'],
    'Audi': ['blebusa@cfaomotors.co.za'],
    'Hyundai': ['patrick@hyundai.co.za'],
    'Nissan': ['mphala@cfaomotors.co.za'],
    'Renault': ['mphala@cfaomotors.co.za'],
    'Haval': ['prs892@cmh.co.za'],
    'Suzuki': ['prs892@cmh.co.za'],
    'Volvo': ['prs892@cmh.co.za'],
    'Kia': ['KIverson@cfaomotors.co.za'],
    'Honda': ['KIverson@cfaomotors.co.za'],
    'Isuzu': ['Imogomotsi@cfaomotors.co.za'],
    'Chevrolet': ['Imogomotsi@cfaomotors.co.za'],
    'Chery': ['ergarner@cfaomotors.co.za'],
    'Ford': ['pws491@cmh.co.za'],
    'Toyota': ['sosman@cfaomotors.co.za'],
    'Mercedes': ['mmashilo@motus.co.za'],
  },

  // ALT/USED Supplier Emails
  altUsedEmails: [
    'sales@onetimeauto.co.za',
    'sales4@partssupport.co.za',
    'marcus@partssupport.co.za',
  ],
};