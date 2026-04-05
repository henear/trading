package com.trading.repository;

import com.trading.entity.StockQueryRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StockQueryRecordRepository extends JpaRepository<StockQueryRecord, Long> {
}
