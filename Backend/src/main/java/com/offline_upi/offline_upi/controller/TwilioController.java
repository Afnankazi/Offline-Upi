package com.offline_upi.offline_upi.controller;

import com.offline_upi.offline_upi.service.TwilioService;
import com.twilio.Twilio;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMethod;

@RestController
@RequestMapping("/api/twilio")
@CrossOrigin(origins = {
    "http://localhost:5173", 
    "http://192.168.0.6:5173", 
    "http://127.0.0.1:5173",
    "https://c137-203-194-96-188.ngrok-free.app",
    "https://offline-e0zat60ic-afnankazis-projects.vercel.app"
}, allowCredentials = "true", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS})
public class TwilioController {

    @Autowired
    private TwilioService twilioService;

    // Twilio credentials
    private static final String ACCOUNT_SID = "ACf65aa46a660c9e834796c8fcff0326eb";
    private static final String AUTH_TOKEN = "c986b0b150acd748372766074464a604";

    // Initialize Twilio SDK
    static {
        Twilio.init(ACCOUNT_SID, AUTH_TOKEN);
    }

    @PostMapping("/sms")
    public ResponseEntity<String> handleIncomingSms(
            @RequestParam("From") String from,
            @RequestParam("Body") String body,
            @RequestParam(value = "MessageSid", required = false) String messageSid) {
        
        try {
            // Log the incoming message
            System.out.println("Received SMS from: " + from);
            System.out.println("Message body: " + body);
            System.out.println("Message SID: " + messageSid);
            
            // Process the incoming SMS
            twilioService.receiveSms(from, body);
            
            // Return TwiML response
            String twimlResponse = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>" +
                    "<Response>" +
                    "<Message>Message received successfully</Message>" +
                    "</Response>";
            
            return ResponseEntity.ok()
                    .header("Content-Type", "text/xml")
                    .body(twimlResponse);
                    
        } catch (Exception e) {
            // Log the error
            System.err.println("Error processing SMS: " + e.getMessage());
            e.printStackTrace();
            
            // Return error TwiML response
            String errorTwiml = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>" +
                    "<Response>" +
                    "<Message>Error processing message. Please try again.</Message>" +
                    "</Response>";
            
            return ResponseEntity.ok()
                    .header("Content-Type", "text/xml")
                    .body(errorTwiml);
        }
    }
} 