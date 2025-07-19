package com.offline_upi.offline_upi.util;


import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class Msg91Sender {

    /**
     * Sends an SMS using the MSG91 transactional API.
     *
     * @param authKey     Your MSG91 authentication key.
     * @param mobileNumber The 10-digit recipient phone number (without country code).
     * @param templateId   The DLT template ID approved in your MSG91 account.
     */
    public static void sendSms(String authKey, String mobileNumber, String templateId) {
        String url = "https://api.msg91.com/api/v5/flow/";

        // Construct the JSON payload required by the MSG91 API
        String jsonPayload = new StringBuilder()
            .append("{")
            .append("\"template_id\": \"").append(templateId).append("\",")
            .append("\"sender\": \"YOUR_SENDER_ID\",") // Replace with your approved DLT Sender ID
            .append("\"short_url\": \"1\",") // 1 for on, 0 for off
            .append("\"mobiles\": \"91").append(mobileNumber).append("\"") // Number must have country code
            // Add any template variables here if needed, for example:
            // .append(",\"VAR1\": \"value1\",")
            // .append("\"VAR2\": \"value2\"")
            .append("}")
            .toString();

        HttpClient client = HttpClient.newHttpClient();

        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create(url))
            .header("accept", "application/json")
            .header("authkey", authKey) // Your Auth Key
            .header("content-type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
            .build();

        try {
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            System.out.println("Status Code: " + response.statusCode());
            System.out.println("Response Body: " + response.body());

        } catch (IOException | InterruptedException e) {
            System.err.println("An error occurred while sending the SMS: " + e.getMessage());
            e.printStackTrace();
        }
    }

    public static void main(String[] args) {
        // Your Auth Key. Please regenerate this key for security.
        String authKey = "460892AjCgmQx1Z687b7602P1";

        // The DLT Template ID from your MSG91 dashboard.
        // This is an example; you must replace it with your own.
        String templateId = "1";

        String recipientNumber = "9082288439"; // The 10-digit number to send the SMS to

        // Check if a template ID is provided before sending
        if (templateId.equals("YOUR_DLT_TEMPLATE_ID")) {
            System.err.println("Error: Please replace 'YOUR_DLT_TEMPLATE_ID' with your actual DLT template ID from the MSG91 dashboard.");
            return;
        }

        sendSms(authKey, recipientNumber, templateId);
    }
}