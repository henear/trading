package com.trading.controller;

import com.trading.entity.StockQueryRecord;
import com.trading.model.AnalysisResult;
import com.trading.model.NewsItem;
import com.trading.model.StockQuote;
import com.trading.repository.StockQueryRecordRepository;
import com.trading.service.DeepSeekService;
import com.trading.service.YahooFinanceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class StockController {

    private final YahooFinanceService yahooFinanceService;
    private final DeepSeekService deepSeekService;
    private final StockQueryRecordRepository stockQueryRecordRepository;

    /**
     * GET /api/stocks/quote?symbol=AAPL
     * Returns current price, change, volume for a stock symbol.
     */
    @GetMapping("/stocks/quote")
    public ResponseEntity<StockQuote> getQuote(@RequestParam String symbol) {
        log.info("Fetching quote for: {}", symbol);
        try {
            StockQuote quote = yahooFinanceService.getQuote(symbol);
            stockQueryRecordRepository.save(StockQueryRecord.builder()
                    .symbol(quote.getSymbol())
                    .price(quote.getPrice())
                    .change(quote.getChange())
                    .changePercent(quote.getChangePercent())
                    .volume(quote.getVolume())
                    .dayHigh(quote.getDayHigh())
                    .dayLow(quote.getDayLow())
                    .currency(quote.getCurrency())
                    .queriedAt(LocalDateTime.now())
                    .build());
            return ResponseEntity.ok(quote);
        } catch (Exception e) {
            log.error("Error fetching quote for {}: {}", symbol, e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * GET /api/stocks/news?symbol=AAPL
     * Returns recent news headlines for a stock symbol.
     */
    @GetMapping("/stocks/news")
    public ResponseEntity<List<NewsItem>> getNews(@RequestParam String symbol) {
        log.info("Fetching news for: {}", symbol);
        try {
            List<NewsItem> news = yahooFinanceService.getNews(symbol);
            return ResponseEntity.ok(news);
        } catch (Exception e) {
            log.error("Error fetching news for {}: {}", symbol, e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * GET /api/analysis?symbol=AAPL
     * Fetches recent news and asks DeepSeek to generate an investment strategy.
     */
    @GetMapping("/analysis")
    public ResponseEntity<AnalysisResult> getAnalysis(@RequestParam String symbol) {
        log.info("Running analysis for: {}", symbol);
        try {
            List<NewsItem> news = yahooFinanceService.getNews(symbol);
            if (news.isEmpty()) {
                return ResponseEntity.ok(AnalysisResult.builder()
                        .symbol(symbol.toUpperCase())
                        .analysis("No recent news found for this symbol.")
                        .news(news)
                        .analyzedAt(now())
                        .build());
            }

            String analysis = deepSeekService.analyzeNews(symbol, news);

            return ResponseEntity.ok(AnalysisResult.builder()
                    .symbol(symbol.toUpperCase())
                    .analysis(analysis)
                    .news(news)
                    .analyzedAt(now())
                    .build());
        } catch (Exception e) {
            log.error("Error running analysis for {}: {}", symbol, e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    private String now() {
        return LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
    }
}
