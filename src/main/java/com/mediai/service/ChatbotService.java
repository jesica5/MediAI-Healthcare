package com.mediai.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mediai.dto.ChatRequest;
import com.mediai.dto.ChatResponse;
import com.mediai.entity.ChatMessage;
import com.mediai.repository.ChatMessageRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class ChatbotService {

    private static final Logger log = LoggerFactory.getLogger(ChatbotService.class);

    private final ChatMessageRepository chatMessageRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${gemini.api.key:}")
    private String geminiApiKey;

    @Value("${gemini.model:gemini-2.5-flash}")
    private String geminiModel;

    public ChatbotService(ChatMessageRepository chatMessageRepository) {
        this.chatMessageRepository = chatMessageRepository;
    }

    @Transactional
    public ChatResponse processUserMessage(ChatRequest request) {
        String message = request.getMessage().trim();
        String language = "ta".equalsIgnoreCase(request.getLanguage()) ? "ta" : "en";
        String conversationId = (request.getConversationId() != null && !request.getConversationId().isBlank())
                ? request.getConversationId()
                : UUID.randomUUID().toString();

        // 1. Check for Critical Emergency Red-Flag Symptoms
        boolean isEmergency = checkEmergencyKeywords(message);

        String reply;
        List<String> suggestedActions = new ArrayList<>();

        if (isEmergency) {
            if ("ta".equals(language)) {
                reply = "🚨 **அவசர மருத்துவ எச்சரிக்கை (EMERGENCY ALERT)**:\n\n" +
                        "நீங்கள் குறிப்பிட்ட அறிகுறிகள் உயிருக்கு ஆபத்தான அவசர நிலையைக் குறிக்கலாம்.\n\n" +
                        "• **உடனடி நடவடிக்கை**: உடனடியாக அவசர ஊர்தி சேவையை (**108** / **112**) அழைக்கவும் அல்லது அருகிலுள்ள மருத்துவமனை அவசர சிகிச்சைப் பிரிவுக்குச் செல்லவும்.\n" +
                        "• மருத்துவ சிகிச்சை பெறுவதில் தாமதிக்க வேண்டாம்.\n" +
                        "• நீங்கள் ஏற்கனவே மருத்துவமனையில் இருந்தால், உடனடியாக அவசரப் பிரிவு மருத்துவர் அல்லது செவிலியரிடம் தெரிவிக்கவும்.";
                suggestedActions.addAll(List.of("🚨 அவசர உதவி (108)", "அவசர சிகிச்சைப் பிரிவு", "உடல்நிலை மதிப்பீடு"));
            } else {
                reply = "🚨 **EMERGENCY MEDICAL ALERT**:\n\n" +
                        "The symptoms you described may indicate an immediate life-threatening medical emergency.\n\n" +
                        "• **Immediate Action Required**: Call Emergency Services (**108** / **112** / **911**) or proceed directly to the nearest Emergency Department.\n" +
                        "• Do not delay physical emergency evaluation.\n" +
                        "• If you are currently in the hospital triage reception, immediately notify the attending triage nurse or clinician.";
                suggestedActions.addAll(List.of("🚨 Call Emergency (108/911)", "Proceed to ER Immediately", "Start Intake Triage"));
            }
        } else {
            // 2. Try Gemini API if key is configured, otherwise fallback to clinical rule engine
            String apiKey = (geminiApiKey != null) ? geminiApiKey.trim() : "";
            if (!apiKey.isEmpty() && !"YOUR_GEMINI_API_KEY".equalsIgnoreCase(apiKey)) {
                reply = queryGeminiForChat(message, language);
                suggestedActions = generateSuggestedActions(message, language);
            } else {
                reply = generateDeterministicClinicalReply(message, language);
                suggestedActions = generateSuggestedActions(message, language);
            }
        }

        // 3. Persist messages for session continuity
        try {
            ChatMessage userMsg = new ChatMessage(
                UUID.randomUUID().toString(),
                conversationId,
                "USER",
                message,
                language,
                isEmergency,
                null
            );
            chatMessageRepository.save(userMsg);

            ChatMessage botMsg = new ChatMessage(
                UUID.randomUUID().toString(),
                conversationId,
                "ASSISTANT",
                reply,
                language,
                isEmergency,
                String.join(";", suggestedActions)
            );
            chatMessageRepository.save(botMsg);
        } catch (Exception e) {
            log.warn("Could not persist chat message: {}", e.getMessage());
        }

        return new ChatResponse(
            reply,
            isEmergency,
            suggestedActions,
            conversationId,
            LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)
        );
    }

    public List<ChatMessage> getConversationHistory(String conversationId) {
        return chatMessageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId);
    }

    @Transactional
    public void clearConversation(String conversationId) {
        chatMessageRepository.deleteByConversationId(conversationId);
    }

    private boolean checkEmergencyKeywords(String text) {
        String lower = text.toLowerCase();
        List<String> emergencyPatterns = List.of(
            "chest pain", "heart attack", "difficulty breathing", "shortness of breath",
            "cant breathe", "can't breathe", "suffocating", "severe bleeding", "unconscious",
            "stroke", "facial droop", "slurred speech", "sudden paralysis", "anaphylaxis",
            "choking", "severe chest pressure", "bluish lips", "cyanosis",
            "நெஞ்சு வலி", "மூச்சுத்திணறல்", "சுவாசிக்க முடியவில்லை", "கடுமையான இரத்தப்போக்கு",
            "மயக்கம்", "பக்கவாதம்", "வலிப்பு"
        );

        for (String pattern : emergencyPatterns) {
            if (lower.contains(pattern)) {
                return true;
            }
        }
        return false;
    }

    private String queryGeminiForChat(String userMessage, String language) {
        try {
            String langName = "ta".equals(language) ? "Tamil" : "English";
            String systemPrompt = String.format(
                "You are MediAI Clinical Assistant, an intelligent, empathetic academic decision-support medical assistant.\n" +
                "You assist patients and healthcare staff with clinical symptom understanding, normal vital signs ranges, triage prioritization (P1 Critical, P2 High, P3 Moderate, P4 Low), and hospital triage instructions.\n" +
                "Answer clearly, concisely (max 3 short paragraphs), and accurately in %s.\n" +
                "Always include a brief clinical safety disclaimer advising formal consultation with healthcare professionals.\n\n" +
                "User Inquiry: %s",
                langName, userMessage
            );

            String requestUrl = "https://generativelanguage.googleapis.com/v1beta/models/" + geminiModel + ":generateContent?key=" + geminiApiKey.trim();

            Map<String, Object> textPart = Map.of("text", systemPrompt);
            Map<String, Object> contents = Map.of("parts", List.of(textPart));
            Map<String, Object> reqBody = Map.of("contents", List.of(contents));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(reqBody, headers);

            ResponseEntity<String> response = restTemplate.exchange(requestUrl, HttpMethod.POST, entity, String.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                JsonNode candidate = root.path("candidates").path(0).path("content").path("parts").path(0).path("text");
                if (!candidate.isMissingNode()) {
                    return candidate.asText().trim();
                }
            }
        } catch (Exception e) {
            log.warn("Gemini Chat query failed: {}. Falling back to deterministic medical assistant.", e.getMessage());
        }
        return generateDeterministicClinicalReply(userMessage, language);
    }

    private String generateDeterministicClinicalReply(String userMessage, String language) {
        String lower = userMessage.toLowerCase().trim();
        boolean isTamil = "ta".equals(language);

        // Fever / காய்ச்சல் (Prioritize clinical symptoms first)
        if (lower.contains("fever") || lower.contains("temperature") || lower.contains("pyrexia") || lower.contains("காய்ச்சல்") || lower.contains("வெப்பநிலை")) {
            if (isTamil) {
                return "🌡️ **காய்ச்சல் (Fever) தகவல்**:\n\n" +
                       "• **சாதாரண உடல் வெப்பநிலை**: 36.5°C - 37.5°C (97.7°F - 99.5°F).\n" +
                       "• **கடுமையான காய்ச்சல் (High Fever)**: 38.5°C (101.3°F) அல்லது அதற்கு மேல் இருந்தால் மருத்துவ கண்காணிப்பு தேவை.\n" +
                       "• **பரிந்துரை**: போதுமான நீர் அருந்தி ஓய்வெடுக்கவும். அறிகுறிகளைப் பதிவு செய்ய எங்கள் **Health Assessment** பக்கத்தில் உள்ளீடு செய்யவும்.";
            }
            return "🌡️ **Fever & Core Temperature Guidance**:\n\n" +
                   "• **Normal Core Range**: 36.5°C - 37.5°C (97.7°F - 99.5°F).\n" +
                   "• **High-Grade Pyrexia**: Temperatures ≥ 38.5°C (101.3°F) are categorized as heightened acuity in our triage protocol, especially if accompanied by persistent tachycardia or chills.\n" +
                   "• **Recommendation**: Ensure hydration, rest, and complete our Health Assessment terminal to calculate your clinical acuity score.";
        }

        // Greetings (Check with word boundaries when not a specific symptom inquiry)
        if (lower.matches(".*\\b(hello|hi|hey|greetings|good morning|good evening|good afternoon)\\b.*") || lower.contains("வணக்கம்")) {
            if (isTamil) {
                return "வணக்கம்! நான் உங்கள் **MediAI மருத்துவ உதவியாளர் (Clinical Assistant)**.\n\n" +
                       "உங்களின் மருத்துவ அறிகுறிகள், நாடித் துடிப்பு மற்றும் இரத்த அழுத்த அளவுகள், அவசர சிகிச்சை வகைப்பாடு (Triage Acuity) பற்றிய சந்தேகங்களுக்கு என்னிடம் கேட்கலாம். நான் எவ்வாறு உதவ முடியும்?";
            }
            return "Hello! I am your **MediAI Clinical Assistant**.\n\n" +
                   "I can help you understand symptoms, vital signs ranges, triage acuity priorities (P1 Critical to P4 Low), and guide you through your health assessment. How can I assist you today?";
        }

        // Body Pain / உடல் வலி
        if (lower.contains("body pain") || lower.contains("pain") || lower.contains("ache") || lower.contains("வலி") || lower.contains("உடல் வலி")) {
            if (isTamil) {
                return "🩺 **உடல் வலி (Body Pain) வழிகாட்டுதல்**:\n\n" +
                       "• வலியை 1 முதல் 10 வரை மதிப்பிடலாம் (1-3 லேசானது, 4-6 மிதமானது, 7-10 கடுமையானது).\n" +
                       "• கடுமையான உடல் வலி மற்றும் அதிக காய்ச்சல் இருந்தால் டெங்கு, வைரஸ் அல்லது தீவிர தொற்றுநோய்க்கான அறிகுறியாக இருக்கலாம்.\n" +
                       "• எங்கள் **Health Assessment** பக்கத்தில் வலியின் தீவிரம் மற்றும் பகுதியைக் குறிப்பிட்டு மதிப்பீடு பெறவும்.";
            }
            return "🩺 **Clinical Pain Assessment Guidance**:\n\n" +
                   "• Acute pain is clinically scored from 0 (no pain) to 10 (worst imaginable). Severe pain (scores 7-10) elevates triage priority from Ambulatory to Urgent.\n" +
                   "• If acute severe generalized body pain is accompanied by fever, it frequently indicates viral illness or systemic inflammatory responses.\n" +
                   "• Please log your symptoms in the Health Assessment tab to receive priority queuing.";
        }

        // Vital Signs / Normal Ranges / இயல்பு நிலைகள்
        if (lower.contains("vital") || lower.contains("bp") || lower.contains("blood pressure") || lower.contains("spo2") ||
            lower.contains("pulse") || lower.contains("heart rate") || lower.contains("துடிப்பு") || lower.contains("இரத்த அழுத்தம்")) {
            if (isTamil) {
                return "📊 **முக்கிய உடலியல் அளவுகள் (Normal Vital Signs Ranges)**:\n\n" +
                       "• **இதயத் துடிப்பு (Heart Rate)**: நிமிடத்திற்கு 60 - 100 bpm\n" +
                       "• **இரத்த அழுத்தம் (Blood Pressure)**: 90-120 (Systolic) / 60-80 (Diastolic) mmHg\n" +
                       "• **ஆக்சிஜன் செறிவு (SpO2)**: 95% - 100% (90%க்குக் கீழ் இருந்தால் அவசரம்)\n" +
                       "• **சுவாச வீதம் (Respiratory Rate)**: நிமிடத்திற்கு 12 - 20 breaths/min\n" +
                       "• **வெப்பநிலை (Temperature)**: 36.5°C - 37.5°C";
            }
            return "📊 **Clinical Vital Signs Reference Ranges**:\n\n" +
                   "• **Heart Rate**: 60 - 100 bpm (Tachycardia > 100 bpm, Bradycardia < 60 bpm)\n" +
                   "• **Blood Pressure**: Systolic 90 - 120 mmHg, Diastolic 60 - 80 mmHg\n" +
                   "• **Oxygen Saturation (SpO2)**: 95% - 100% (Desaturation < 90% triggers Tier-1 Critical Red Flag)\n" +
                   "• **Respiratory Rate**: 12 - 20 breaths/min (Tachypnea > 22 breaths/min)\n" +
                   "• **Body Temperature**: 36.5°C - 37.5°C (Fever > 38.0°C)";
        }

        // Triage / Acuity / எப்படி செயல்படுகிறது
        if (lower.contains("triage") || lower.contains("acuity") || lower.contains("priority") || lower.contains("வகைப்பாடு") || lower.contains("முன்னுரிமை")) {
            if (isTamil) {
                return "🏥 **MediAI அவசர சிகிச்சை வகைப்பாடு (Triage Protocol)**:\n\n" +
                       "1. **P1 CRITICAL (சிவப்பு)**: உடனடி மறுஉயிரூட்டல் அவசரம் (Immediate Resuscitation).\n" +
                       "2. **P2 HIGH (ஆரஞ்சு)**: கடுமையான நிலை, 10-15 நிமிடங்களில் மருத்துவர் கவனிப்பு.\n" +
                       "3. **P3 MODERATE (மஞ்சள்)**: மிதமான தீவிர நிலை, 30-60 நிமிடங்களில் மதிப்பீடு.\n" +
                       "4. **P4 LOW (பச்சை)**: லேசான பாதிப்பு, சாதாரண வரிசை.\n\n" +
                       "இவ்வகைப்பாடு மல்டி-பராமீட்டர் உடலியல் அளவுகள் மற்றும் TreeSHAP AI இயந்திரக் கற்றல் மூலம் துல்லியமாக கணக்கிடப்படுகிறது.";
            }
            return "🏥 **MediAI Triage Acuity Classification Protocol**:\n\n" +
                   "• **P1 CRITICAL (Resuscitation)**: Immediate life-threatening physiological instability (e.g. SpO2 < 90%, extreme shock).\n" +
                   "• **P2 HIGH (Emergency)**: High risk of clinical deterioration requiring prompt physician evaluation within 15 minutes.\n" +
                   "• **P3 MODERATE (Urgent)**: Clinically significant symptoms requiring evaluation within 30-60 minutes.\n" +
                   "• **P4 LOW (Ambulatory)**: Non-urgent conditions managed in routine workflow.\n\n" +
                   "Calculations use physiological vital signs combined with TreeSHAP transparent attribution drivers.";
        }

        // Assessment or Queue Navigation / உதவி
        if (lower.contains("assessment") || lower.contains("queue") || lower.contains("doctor") || lower.contains("workstation") || lower.contains("எப்படி")) {
            if (isTamil) {
                return "🧭 **MediAI அமைப்பைப் பயன்படுத்துவது எப்படி**:\n\n" +
                       "• **உடல்நிலை மதிப்பீடு (Health Assessment)**: மேல் மெனுவில் உள்ள 'Health Assessment' சென்று அறிகுறிகள் மற்றும் நாடித் துடிப்பை உள்ளிடவும். நீங்கள் குரல்வழி (Voice Input) மூலமும் பேசலாம்!\n" +
                       "• **நோயாளி வரிசை (Patient Queue)**: அவசர முன்னுரிமை அடிப்படையில் வரிசைப்படுத்தப்பட்ட நோயாளிகள் பட்டியலைக் காண 'Patient Queue' செல்லவும்.\n" +
                       "• **மருத்துவர் தளம் (Doctor Workstation)**: மருத்துவர்கள் மதிப்பீடுகளைச் சரிபார்க்கவும் கூடுதல் பரிந்துரைகள் வழங்கவும் பயன்படும்.";
            }
            return "🧭 **Navigating MediAI Features**:\n\n" +
                   "• **Health Assessment (`/intake.html`)**: Enter demographics, symptoms (via typing or the new Voice Input mic button in English/Tamil), and vital signs to calculate your risk score.\n" +
                   "• **Patient Queue (`/queue.html`)**: Real-time triage tracking sorted strictly by clinical acuity priority.\n" +
                   "• **Doctor Workstation (`/doctor.html`)**: Verified physicians can review assessments, audit TreeSHAP explainability drivers, and confirm triage tiers.";
        }

        // Default clinical assistance
        if (isTamil) {
            return "நான் MediAI மருத்துவ உதவியாளர். நீங்கள் குறிப்பிட்ட தகவல் பதிவு செய்யப்பட்டுள்ளது.\n\n" +
                   "உங்களின் காய்ச்சல், இருமல், உடல் வலி, இரத்த அழுத்தம், அல்லது மருத்துவமனை முன்னுரிமை பற்றி விரிவாகக் கேட்கலாம். அவசர சிகிச்சை தேவைப்பட்டால் உடனடியாக 'Health Assessment' தாவலில் உங்கள் விவரங்களைப் பதிவு செய்யவும்.\n\n" +
                   "*குறிப்பு: இது கல்வி சார்ந்த மருத்துவ முடிவெடுக்கும் மாதிரி அமைப்பு ஆகும். தகுதியான மருத்துவரை எப்போதும் அணுகவும்.*";
        }
        return "I am the MediAI Clinical Assistant. I am here to help you understand your symptoms, vital measurements, and emergency triage priorities.\n\n" +
               "You can ask about fever, body pain, normal blood pressure ranges, pulse oximetry, or how to navigate our intake terminal.\n\n" +
               "*Academic clinical decision-support prototype. Always consult a qualified medical professional for diagnosis and treatment.*";
    }

    private List<String> generateSuggestedActions(String userMessage, String language) {
        boolean isTamil = "ta".equals(language);
        String lower = userMessage.toLowerCase();

        if (lower.contains("fever") || lower.contains("pain") || lower.contains("காய்ச்சல்") || lower.contains("வலி")) {
            return isTamil 
                ? List.of("உடல்நிலை மதிப்பீடு தொடங்க", "இயல்பு வெப்பநிலை அளவுகள்", "மருத்துவர் உதவி")
                : List.of("Start Health Assessment", "Normal Temperature Range", "Emergency Contacts");
        } else if (lower.contains("vital") || lower.contains("bp") || lower.contains("அழுத்தம்")) {
            return isTamil
                ? List.of("இயல்பு நிலைகள் சரிபார்க்க", "மதிப்பீடு தொடங்க", "அவசர உதவி")
                : List.of("View All Vital Normals", "Start Triage Intake", "Explain Acuity P1-P4");
        } else {
            return isTamil
                ? List.of("உடல்நிலை மதிப்பீடு", "முக்கிய உடலியல் அளவுகள்", "தமிழ் உதவி")
                : List.of("Start Health Assessment", "Normal Vital Signs", "How Triage Works");
        }
    }
}
