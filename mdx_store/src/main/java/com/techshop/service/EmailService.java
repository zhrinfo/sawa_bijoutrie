package com.techshop.service;

import com.techshop.entity.Order;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import java.math.BigDecimal;

@Service
public class EmailService {
    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;
    private final String adminEmail;
    private final String senderEmail;

    public EmailService(
            JavaMailSender mailSender,
            @Value("${spring.mail.username}") String senderEmail) {
        this.mailSender = mailSender;
        this.adminEmail = senderEmail;
        this.senderEmail = senderEmail;
    }

    public void sendOrderNotifications(Order order) {
        send(
                adminEmail,
                "Nouvelle commande #" + order.getId(),
                "Nouvelle commande recue",
                order);
        send(
                order.getUser().getEmail(),
                "Confirmation de votre commande #" + order.getId(),
                "Votre commande est confirmee",
                order);
    }

    private void send(String recipient, String subject, String heading, Order order) {
        try {
            MimeMessageHelper message = new MimeMessageHelper(mailSender.createMimeMessage(), true, "UTF-8");
            message.setFrom(senderEmail);
            message.setTo(recipient);
            message.setSubject(subject);
            message.setText(plainText(order), htmlContent(order, heading));
            mailSender.send(message.getMimeMessage());
        } catch (MailException | MessagingException exception) {
            logger.warn("Unable to send order email to {}", recipient, exception);
        }
    }

    private String plainText(Order order) {
        return "Commande #" + order.getId() + "\n"
                + "Client : " + order.getUser().getFullName() + "\n"
                + "Email : " + order.getUser().getEmail() + "\n"
                + "Montant total : " + order.getTotalAmount() + "\n"
                + "Adresse de livraison : " + order.getShippingAddress() + "\n"
                + "Ville : " + (order.getDeliveryAddress() == null ? "" : order.getDeliveryAddress().getCity()) + "\n"
                + "Frais de livraison : " + order.getDeliveryFee() + "\n"
                + "Telephone : " + order.getPhoneNumber();
    }

    private String htmlContent(Order order, String heading) {
        StringBuilder items = new StringBuilder();
        order.getItems().forEach(item -> items.append("<tr>")
                .append("<td style='padding:12px;border-bottom:1px solid #e5e7eb;'>")
                .append(escape(item.getProduct().getName()))
                .append(variantLabel(item))
                .append("</td><td style='padding:12px;text-align:center;border-bottom:1px solid #e5e7eb;'>")
                .append(item.getQuantity())
                .append("</td><td style='padding:12px;text-align:right;border-bottom:1px solid #e5e7eb;'>")
                .append(format(item.getPriceAtPurchase()))
                .append(" EUR</td></tr>"));

        return "<div style='margin:0;background:#d7e5df;padding:32px 12px;font-family:Arial,sans-serif;color:#1f2937;'>"
                + "<div style='max-width:620px;margin:auto;background:#ffffff;border-radius:12px;overflow:hidden;'>"
                + "<div style='background:#1f7c6c;padding:28px;color:#ffffff;'><img src='https://imagur.org/wp-content/uploads/2026/09/sawa.jpeg' alt='SawaBijoutrie' style='display:block;max-width:220px;width:100%;height:auto;margin:0 0 18px;border-radius:8px;'><h1 style='margin:0;font-size:24px;'>SawaBijoutrie</h1>"
            + "<p style='margin:8px 0 0;color:#d7e5df;'>" + escape(heading) + "</p></div>"
                + "<div style='padding:28px;'><p style='font-size:16px;'>Bonjour "
                + escape(order.getUser().getFullName()) + ",</p>"
                + "<p>Merci pour votre commande. Voici son resume :</p>"
            + "<div style='background:#d7e5df;border-left:4px solid #d4af37;padding:16px;border-radius:8px;margin:20px 0;'>"
            + "<strong style='color:#1f7c6c;'>Commande #" + order.getId() + "</strong><br>"
            + "Total : <strong style='color:#d4af37;'>" + format(order.getTotalAmount()) + " EUR</strong></div>"
            + "<table style='width:100%;border-collapse:collapse;font-size:14px;'><thead><tr style='background:#6f9f93;color:#ffffff;'>"
            + "<th style='padding:12px;text-align:left;'>Article</th><th style='padding:12px;'>Qte</th>"
            + "<th style='padding:12px;text-align:right;'>Prix</th></tr></thead><tbody>"
                + items + "</tbody></table>"
            + "<h3 style='margin-top:28px;color:#1f7c6c;'>Livraison</h3><p style='line-height:1.6;'>"
                + escape(order.getShippingAddress()) + "<br>Ville : "
                + escape(order.getDeliveryAddress() == null ? "" : order.getDeliveryAddress().getCity())
                + "<br>Frais : " + format(order.getDeliveryFee()) + " EUR<br>Tel : "
                + escape(order.getPhoneNumber()) + "</p>"
                + "<p style='margin-top:28px;'>Merci pour votre confiance.</p></div>"
            + "<div style='padding:18px 28px;background:#d7e5df;color:#1f7c6c;font-size:12px;'>SawaBijoutrie - Confirmation automatique</div>"
                + "</div></div>";
    }

    private String variantLabel(com.techshop.entity.OrderItem item) {
        StringBuilder variant = new StringBuilder("<br><small style='color:#64748b;'>");
        if (item.getSize() != null) {
            variant.append("Taille : ").append(escape(item.getSize().getSize().getName())).append(" ");
        }
        if (item.getColor() != null) {
            variant.append("Couleur : ").append(escape(item.getColor().getColor().getName()));
        }
        return variant.append("</small>").toString();
    }

    private String format(BigDecimal value) {
        return value == null ? "0.00" : value.toPlainString();
    }

    private String escape(String value) {
        if (value == null) {
            return "";
        }
        return value.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }
}