package com.trading.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.trading.model.NewsItem;
import com.trading.model.StockQuote;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class YahooFinanceService {

    private final WebClient webClient;

    private static final String API_KEY = "3ZF5YHC2EQ1A9MOI";
    private static final String BASE_URL = "https://www.alphavantage.co/query";

    public StockQuote getQuote(String symbol) {
        String url = BASE_URL + "?function=GLOBAL_QUOTE&symbol=" + symbol.toUpperCase() + "&apikey=" + API_KEY;

        JsonNode response = webClient.get()
                .uri(url)
                .retrieve()
                .bodyToMono(JsonNode.class)
                .block();

        JsonNode quote = response.path("Global Quote");

        double price = quote.path("05. price").asDouble();
        double prevClose = quote.path("08. previous close").asDouble();
        double change = quote.path("09. change").asDouble();
        String changePercentStr = quote.path("10. change percent").asText("0%").replace("%", "");
        double changePercent = Double.parseDouble(changePercentStr);

        return StockQuote.builder()
                .symbol(symbol.toUpperCase())
                .price(price)
                .change(change)
                .changePercent(changePercent)
                .volume(quote.path("06. volume").asLong())
                .dayHigh(quote.path("03. high").asDouble())
                .dayLow(quote.path("04. low").asDouble())
                .currency("USD")
                .build();
    }

    public List<NewsItem> getNews(String symbol) {
        String url = BASE_URL + "?function=NEWS_SENTIMENT&tickers=" + symbol.toUpperCase() + "&limit=6&apikey=" + API_KEY;

        JsonNode response = webClient.get()
                .uri(url)
                .retrieve()
                .bodyToMono(JsonNode.class)
                .block();

        List<NewsItem> newsList = new ArrayList<>();
        JsonNode feed = response.path("feed");

        DateTimeFormatter inputFormatter = DateTimeFormatter.ofPattern("yyyyMMdd'T'HHmmss");
        DateTimeFormatter outputFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

        for (JsonNode item : feed) {
            String rawTime = item.path("time_published").asText("");
            String publishedAt = "Unknown";
            if (!rawTime.isBlank()) {
                try {
                    publishedAt = LocalDateTime.parse(rawTime, inputFormatter).format(outputFormatter);
                } catch (Exception e) {
                    log.warn("Could not parse date: {}", rawTime);
                }
            }

            newsList.add(NewsItem.builder()
                    .title(item.path("title").asText())
                    .link(item.path("url").asText())
                    .publisher(item.path("source").asText())
                    .publishedAt(publishedAt)
                    .build());
        }

        return newsList;
    }
}
