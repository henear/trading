package com.trading.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "STOCK_QUERY_RECORD")
public class StockQueryRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "SYMBOL")
    private String symbol;

    @Column(name = "PRICE")
    private double price;

    @Column(name = "PRICE_CHANGE")
    private double change;

    @Column(name = "CHANGE_PERCENT")
    private double changePercent;

    @Column(name = "VOLUME")
    private long volume;

    @Column(name = "DAY_HIGH")
    private double dayHigh;

    @Column(name = "DAY_LOW")
    private double dayLow;

    @Column(name = "CURRENCY")
    private String currency;

    @Column(name = "QUERIED_AT")
    private LocalDateTime queriedAt;
}
