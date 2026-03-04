package com.codersfarm.subdomains.repository;

import com.codersfarm.subdomains.model.CurriculumProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface CurriculumProgressRepository extends JpaRepository<CurriculumProgress, Long> {

    List<CurriculumProgress> findByUserId(Long userId);

    Optional<CurriculumProgress> findByUserIdAndLessonId(Long userId, String lessonId);

    long countByUserIdAndCompletedTrue(Long userId);
}
