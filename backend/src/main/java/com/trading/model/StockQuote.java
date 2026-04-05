package com.trading.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockQuote {
    private String symbol;
    private double price;
    private double change;
    private double changePercent;
    private long volume;
    private double dayHigh;
    private double dayLow;
    private String currency;
}
