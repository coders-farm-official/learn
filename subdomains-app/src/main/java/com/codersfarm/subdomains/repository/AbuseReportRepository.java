package com.codersfarm.subdomains.repository;

import com.codersfarm.subdomains.model.AbuseReport;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AbuseReportRepository extends JpaRepository<AbuseReport, Long> {

    List<AbuseReport> findByStatusOrderBySubmittedAtDesc(String status);

    List<AbuseReport> findAllByOrderBySubmittedAtDesc();
}
