package com.trading.repository;

import com.trading.entity.StockNewsRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StockNewsRecordRepository extends JpaRepository<StockNewsRecord, Long> {
}
