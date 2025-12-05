import { Resend } from 'resend';

// Get API key from environment variables with fallback to empty string if missing
const resendApiKey = import.meta.env.VITE_RESEND_API_KEY || '';

// Initialize Resend with API key if available
let resend: Resend;
try {
  resend = new Resend(resendApiKey);
} catch (error) {
  console.error('Failed to initialize Resend:', error);
  // Create a mock Resend instance to prevent runtime errors
  resend = {
    emails: {
      send: async () => {
        return { 
          data: null, 
          error: { message: 'Resend API key is missing or invalid' } 
        };
      }
    }
  } as unknown as Resend;
}

/**
 * A service for sending emails with Resend
 */
export const resendService = {
  /**
   * Check if Resend is properly configured
   */
  isConfigured: () => !!resendApiKey,
  
  /**
   * Send a single email
   * @param fromEmail - Sender email address
   * @param toEmail - Recipient email address
   * @param subject - Email subject
   * @param htmlContent - HTML content of the email
   * @param textContent - Plain text content of the email
   * @returns Promise with sending result
   */
  async sendEmail(
    fromEmail: string,
    toEmail: string,
    subject: string,
    htmlContent: string,
    textContent?: string,
  ): Promise<{ success: boolean; error?: string; data?: any }> {
    try {
      // Check if Resend is configured
      if (!resendApiKey) {
        console.error('Resend API key is missing');
        return {
          success: false,
          error: 'Email service is not configured. Please add your Resend API key to the environment variables.'
        };
      }

      const { data, error } = await resend.emails.send({
        from: fromEmail,
        to: toEmail,
        subject: subject,
        html: htmlContent,
        text: textContent,
      });

      if (error) {
        throw error;
      }

      return { success: true, data };
    } catch (error: any) {
      console.error('Resend service error:', error);
      return {
        success: false,
        error: error.message || 'Failed to send email',
      };
    }
  },

  /**
   * Send a batch of emails (up to 100)
   * @param fromEmail - Sender email address
   * @param toEmails - Array of recipient email addresses (max 100)
   * @param subject - Email subject
   * @param htmlContent - HTML content of the email
   * @param textContent - Plain text content of the email
   * @returns Promise with sending result
   */
  async sendBatchEmails(
    fromEmail: string,
    toEmails: string[],
    subject: string,
    htmlContent: string,
    textContent?: string,
  ): Promise<{ success: boolean; error?: string; data?: any }> {
    try {
      // Check if Resend is configured
      if (!resendApiKey) {
        console.error('Resend API key is missing');
        return {
          success: false,
          error: 'Email service is not configured. Please add your Resend API key to the environment variables.'
        };
      }

      if (!toEmails.length || toEmails.length > 100) {
        throw new Error('Number of recipients must be between 1 and 100');
      }

      // Send batch emails
      const { data, error } = await resend.emails.send({
        from: fromEmail,
        to: toEmails,
        subject: subject,
        html: htmlContent,
        text: textContent,
      });

      if (error) {
        throw error;
      }

      return { success: true, data };
    } catch (error: any) {
      console.error('Resend batch service error:', error);
      return {
        success: false,
        error: error.message || 'Failed to send batch emails',
      };
    }
  }
}; 