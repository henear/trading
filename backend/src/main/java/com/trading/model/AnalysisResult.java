package com.trading.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalysisResult {
    private String symbol;
    private String analysis;
    private List<NewsItem> news;
    private String analyzedAt;
}
