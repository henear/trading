package com.trading.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.trading.model.NewsItem;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DeepSeekService {

    private final WebClient webClient;

    @Value("${deepseek.api.key}")
    private String apiKey;

    @Value("${deepseek.api.url}")
    private String apiUrl;

    @Value("${deepseek.model}")
    private String model;

    public String analyzeNews(String symbol, List<NewsItem> news) {
        String newsText = news.stream()
                .map(n -> "- [" + n.getPublishedAt() + "] " + n.getTitle() + " (" + n.getPublisher() + ")")
                .collect(Collectors.joining("\n"));

        String userPrompt = "Analyze the following recent news for stock symbol **" + symbol + "** and provide a concise investment strategy:\n\n" +
                "News:\n" + newsText + "\n\n" +
                "Please respond with:\n" +
                "1. **Sentiment**: Overall market sentiment (Bullish / Bearish / Neutral)\n" +
                "2. **Key Insights**: 2-3 key takeaways from the news\n" +
                "3. **Short-term Recommendation**: What to do in the next 1-7 days (Buy / Hold / Sell) with reasoning\n" +
                "4. **Risks**: Key risks to monitor\n\n" +
                "Keep it concise and actionable.";

        Map<String, Object> requestBody = Map.of(
                "model", model,
                "messages", List.of(
                        Map.of("role", "system",
                               "content", "You are an expert stock market analyst with deep knowledge of fundamental and technical analysis. Provide clear, data-driven investment insights."),
                        Map.of("role", "user", "content", userPrompt)
                ),
                "max_tokens", 800,
                "temperature", 0.7
        );

        JsonNode response = webClient.post()
                .uri(apiUrl)
                .header("Authorization", "Bearer " + apiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(JsonNode.class)
                .block();

        return response.path("choices").get(0).path("message").path("content").asText();
    }
}
