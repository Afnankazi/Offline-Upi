package com.offline_upi.offline_upi.util;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;
import lombok.extern.slf4j.Slf4j;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.core.io.ClassPathResource;

@Slf4j
@Component
public class MailUtil {
    @Autowired
    private JavaMailSender mailSender;

    private static final String LOGO_CID = "logo";
    
    private void sendHtmlEmail(String to, String subject, String htmlContent) {
        try {
            log.info("Attempting to send email to: {}", to);
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            // Set basic email properties
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);
            
            // Add logo as inline image
            helper.addInline(LOGO_CID, new ClassPathResource("static/images/logo.png"));
            
            // Add authentication headers
            message.addHeader("X-Mailer", "Offline-UPI");
            message.addHeader("Precedence", "bulk");
            message.addHeader("List-Unsubscribe", "<mailto:support@offline-upi.com>");
            message.addHeader("X-Auto-Response-Suppress", "OOF, AutoReply");
            
            mailSender.send(message);
            log.info("Email sent successfully to: {}", to);
        } catch (MessagingException e) {
            log.error("Failed to send email to: {}", to, e);
            throw new RuntimeException("Failed to send email: " + e.getMessage(), e);
        }
    }

    public void sendTransactionConfirmation(String to, String transactionId, String amount, String receiverUpiId) {
        String subject = "Pay Seva - Debit Transaction Confirmation";
        String htmlContent = String.format(
            "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;'>" +
            "<div style='text-align: center; margin-bottom: 20px;'>" +
            "<img src='cid:%s' alt='Pay Seva Logo' style='width: 100px; height: 100px;'>" +
            "<h1 style='color: #009B77; margin: 10px 0;'>Pay Seva</h1>" +
            "</div>" +
            "<div style='background-color: #009B77; color: white; padding: 15px; border-radius: 5px; margin-bottom: 20px;'>" +
            "<h2 style='margin: 0; color: white;'>Transaction Confirmation</h2>" +
            "</div>" +
            "<p style='color: #444;'>Dear User,</p>" +
            "<p style='color: #444;'>Your account has been debited for the following transaction:</p>" +
            "<div style='background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #009B77;'>" +
            "<p style='margin: 5px 0;'><strong>Transaction ID:</strong> %s</p>" +
            "<p style='margin: 5px 0;'><strong>Amount Debited:</strong> ₹%s</p>" +
            "<p style='margin: 5px 0;'><strong>Sent To:</strong> %s</p>" +
            "</div>" +
            "<p style='color: #444;'>Thank you for using Pay Seva.</p>" +
            "<hr style='border: none; border-top: 1px solid #eee; margin: 20px 0;'>" +
            "<p style='color: #888; font-size: 12px; text-align: center;'>This is an automated message from Pay Seva. Please do not reply.</p>" +
            "</div>",
            LOGO_CID, transactionId, amount, receiverUpiId
        );
        sendHtmlEmail(to, subject, htmlContent);
    }

    public void sendTransactionFailure(String to, String transactionId, String amount, String reason) {
        String subject = "Pay Seva - Transaction Failed";
        String htmlContent = String.format(
            "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;'>" +
            "<div style='text-align: center; margin-bottom: 20px;'>" +
            "<img src='cid:%s' alt='Pay Seva Logo' style='width: 100px; height: 100px;'>" +
            "<h1 style='color: #009B77; margin: 10px 0;'>Pay Seva</h1>" +
            "</div>" +
            "<div style='background-color: #dc3545; color: white; padding: 15px; border-radius: 5px; margin-bottom: 20px;'>" +
            "<h2 style='margin: 0; color: white;'>Transaction Failed</h2>" +
            "</div>" +
            "<p style='color: #444;'>Dear User,</p>" +
            "<p style='color: #444;'>Your transaction could not be processed:</p>" +
            "<div style='background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #dc3545;'>" +
            "<p style='margin: 5px 0;'><strong>Transaction ID:</strong> %s</p>" +
            "<p style='margin: 5px 0;'><strong>Amount:</strong> ₹%s</p>" +
            "<p style='margin: 5px 0;'><strong>Reason:</strong> %s</p>" +
            "</div>" +
            "<p style='color: #444;'>Please contact our support if you need assistance.</p>" +
            "<hr style='border: none; border-top: 1px solid #eee; margin: 20px 0;'>" +
            "<p style='color: #888; font-size: 12px; text-align: center;'>This is an automated message from Pay Seva. Please do not reply.</p>" +
            "</div>",
            LOGO_CID, transactionId, amount, reason
        );
        sendHtmlEmail(to, subject, htmlContent);
    }

    public void sendCreditNotification(String toEmail, String senderUpi, String amount, String transactionId) {
        String subject = "Pay Seva - Credit Transaction Confirmation";
        String htmlContent = String.format(
            "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;'>" +
            "<div style='text-align: center; margin-bottom: 20px;'>" +
            "<img src='cid:%s' alt='Pay Seva Logo' style='width: 100px; height: 100px;'>" +
            "<h1 style='color: #009B77; margin: 10px 0;'>Pay Seva</h1>" +
            "</div>" +
            "<div style='background-color: #009B77; color: white; padding: 15px; border-radius: 5px; margin-bottom: 20px;'>" +
            "<h2 style='margin: 0; color: white;'>Credit Transaction Confirmation</h2>" +
            "</div>" +
            "<p style='color: #444;'>Dear User,</p>" +
            "<p style='color: #444;'>Your account has been credited for the following transaction:</p>" +
            "<div style='background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #009B77;'>" +
            "<p style='margin: 5px 0;'><strong>Transaction ID:</strong> %s</p>" +
            "<p style='margin: 5px 0;'><strong>Amount Credited:</strong> ₹%s</p>" +
            "<p style='margin: 5px 0;'><strong>Sent By:</strong> %s</p>" +
            "</div>" +
            "<p style='color: #444;'>Thank you for using Pay Seva.</p>" +
            "<hr style='border: none; border-top: 1px solid #eee; margin: 20px 0;'>" +
            "<p style='color: #888; font-size: 12px; text-align: center;'>This is an automated message from Pay Seva. Please do not reply.</p>" +
            "</div>",
            LOGO_CID, transactionId, amount, senderUpi
        );
        sendHtmlEmail(toEmail, subject, htmlContent);
    }
} 