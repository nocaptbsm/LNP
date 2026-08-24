-- StatSkill AI — Migration 008: Seed Authentic iGOT Karmayogi & NSSTA Training Catalogue

TRUNCATE courses CASCADE;

-- Insert 16 Authentic MoSPI, iGOT Karmayogi, and NSSTA Courses
INSERT INTO courses (id, title, code, provider, description, duration_hours, level, external_url, rating, enrolled_count) VALUES
-- Statistical Domain
('a1010000-0000-0000-0000-000000000001', 'Advanced Survey Sampling & Estimation Techniques', 'NSSTA-STAT-101', 'NSSTA', 'Comprehensive training on stratified multi-stage sampling, design effects, and sample weights calculation for national household surveys.', 12.0, 'Advanced', 'https://nssta.gov.in/training-calendar', 4.9, 1420),
('a1020000-0000-0000-0000-000000000002', 'Applied Statistical Inference & Hypothesis Testing', 'IGOT-STAT-201', 'iGOT Karmayogi', 'Practical inferential statistics for public sector analysts covering parametric tests, ANOVA, regression models, and confidence intervals.', 6.5, 'Intermediate', 'https://igotkarmayogi.gov.in/learn', 4.8, 2850),
('a1030000-0000-0000-0000-000000000003', 'Macroeconomic Time Series Analysis & Forecasting', 'NSSTA-STAT-301', 'NSSTA', 'Seasonal adjustment techniques, ARIMA modeling, and forecasting methodology for CPI, IIP, and GDP quarterly estimates.', 10.0, 'Advanced', 'https://nssta.gov.in/courses', 4.7, 980),
('a1040000-0000-0000-0000-000000000004', 'Data Quality Auditing, Validation & Imputation Protocols', 'IGOT-STAT-104', 'iGOT Karmayogi', 'Techniques for survey data cleaning, handling item non-response, statistical imputation, and consistency checking in large-scale datasets.', 5.0, 'Intermediate', 'https://igotkarmayogi.gov.in/learn', 4.8, 1750),

-- Technical Domain
('a2010000-0000-0000-0000-000000000005', 'Python for Statistical Computing & Data Pipelines', 'IGOT-TECH-101', 'iGOT Karmayogi', 'Automating official data processing using Pandas, NumPy, and Statsmodels. Covers data cleaning, transformation, and automated reporting.', 8.0, 'Intermediate', 'https://igotkarmayogi.gov.in/learn', 4.9, 4320),
('a2020000-0000-0000-0000-000000000006', 'R Programming for National Sample Survey Data', 'NSSTA-TECH-201', 'NSSTA', 'Hands-on R programming utilizing tidyverse and the survey package to analyze microdata from NSS, PLFS, and Annual Survey of Industries.', 14.0, 'Intermediate', 'https://nssta.gov.in/r-training', 4.9, 1890),
('a2030000-0000-0000-0000-000000000007', 'Enterprise SQL & Relational Database Querying for MoSPI', 'IGOT-TECH-103', 'iGOT Karmayogi', 'Writing complex SQL queries, JOINs, CTEs, Window Functions, and managing official statistical databases with indexing and performance optimization.', 7.5, 'Intermediate', 'https://igotkarmayogi.gov.in/learn', 4.8, 3100),
('a2040000-0000-0000-0000-000000000008', 'Interactive Data Storytelling & Dashboard Design with PowerBI', 'TPAC-TECH-401', 'TPAC', 'Designing high-impact dashboards for statistical bulletins, executive summaries, and public indicator monitoring.', 6.0, 'Beginner', 'https://tpac.gov.in/courses', 4.7, 2450),
('a2050000-0000-0000-0000-000000000009', 'Fundamentals of AI & Machine Learning for Official Statistics', 'IGOT-TECH-501', 'iGOT Karmayogi', 'Introduction to classification algorithms, automated text coding of occupational data, and responsible AI practices in government.', 9.0, 'Intermediate', 'https://igotkarmayogi.gov.in/learn', 4.8, 1620),

-- Governance Domain
('a3010000-0000-0000-0000-000000000010', 'National Indicator Framework (NIF) & SDG Localization', 'NSSTA-GOV-101', 'NSSTA', 'Comprehensive overview of the UN Sustainable Development Goals (SDGs) and MoSPI National Indicator Framework metadata and reporting.', 8.5, 'Intermediate', 'https://nssta.gov.in/sdg-nif', 4.9, 2100),
('a3020000-0000-0000-0000-000000000011', 'Data Ethics, Privacy & Anonymization in Official Statistics', 'IGOT-GOV-201', 'iGOT Karmayogi', 'Principles of statistical confidentiality, microdata dissemination standards, k-anonymity, and the Digital Personal Data Protection (DPDP) Act.', 4.5, 'Beginner', 'https://igotkarmayogi.gov.in/learn', 4.9, 3600),
('a3030000-0000-0000-0000-000000000012', 'MoSPI Survey Frameworks & Field Operations Management', 'NSSTA-GOV-301', 'NSSTA', 'Operational standards for Periodic Labour Force Survey (PLFS), Household Consumption Expenditure Survey (HCES), and ASI.', 15.0, 'Advanced', 'https://nssta.gov.in/field-operations', 4.8, 1340),

-- Behavioral & Leadership Domain
('a4010000-0000-0000-0000-000000000013', 'Communicating Statistical Insights to Policy Makers', 'IGOT-BEH-101', 'iGOT Karmayogi', 'Translating quantitative findings into concise policy briefs, executive summaries, and clear visual narratives for senior administrators.', 4.0, 'Beginner', 'https://igotkarmayogi.gov.in/learn', 4.8, 2900),
('a4020000-0000-0000-0000-000000000014', 'Statistical Project Management & Survey Operations', 'NSSTA-BEH-201', 'NSSTA', 'Budgeting, scheduling, logistical management, and quality control protocols for large-scale multi-state field statistical operations.', 10.0, 'Advanced', 'https://nssta.gov.in/pm', 4.7, 1150),

-- Specialized Cross-Domain Courses
('a5010000-0000-0000-0000-000000000015', 'Python for Automated National Accounts & Index Computation', 'MoSPI-TECH-302', 'MoSPI DIID', 'Specialized course on building computational pipelines for Consumer Price Index (CPI) and Index of Industrial Production (IIP).', 8.0, 'Advanced', 'https://mospi.gov.in/diid-training', 4.9, 870),
('a5020000-0000-0000-0000-000000000016', 'Modern Data Governance for Public Statistical Portals', 'TPAC-GOV-402', 'TPAC', 'Best practices in data lineage, metadata cataloging, and secure API data exchange across government ministries.', 5.5, 'Intermediate', 'https://tpac.gov.in/governance', 4.8, 1530);

-- Map Courses to Competencies (Target Proficiency Level 1-5)
INSERT INTO course_competencies (course_id, competency_id, target_level, relevance_weight) VALUES
-- Survey Sampling (c101)
('a1010000-0000-0000-0000-000000000001', 'c1010000-0000-0000-0000-000000000000', 4, 1.00),
-- Statistical Inference (c102)
('a1020000-0000-0000-0000-000000000002', 'c1020000-0000-0000-0000-000000000000', 3, 1.00),
-- Time Series (c103)
('a1030000-0000-0000-0000-000000000003', 'c1030000-0000-0000-0000-000000000000', 4, 1.00),
-- Data Quality (c104)
('a1040000-0000-0000-0000-000000000004', 'c1040000-0000-0000-0000-000000000000', 3, 1.00),
-- Python (c201)
('a2010000-0000-0000-0000-000000000005', 'c2010000-0000-0000-0000-000000000000', 3, 1.00),
('a5010000-0000-0000-0000-000000000015', 'c2010000-0000-0000-0000-000000000000', 4, 0.95),
-- R (c202)
('a2020000-0000-0000-0000-000000000006', 'c2020000-0000-0000-0000-000000000000', 4, 1.00),
-- SQL (c203)
('a2030000-0000-0000-0000-000000000007', 'c2030000-0000-0000-0000-000000000000', 4, 1.00),
-- Visualization (c204)
('a2040000-0000-0000-0000-000000000008', 'c2040000-0000-0000-0000-000000000000', 3, 1.00),
-- AI/ML (c205)
('a2050000-0000-0000-0000-000000000009', 'c2050000-0000-0000-0000-000000000000', 3, 1.00),
-- NIF (c301)
('a3010000-0000-0000-0000-000000000010', 'c3010000-0000-0000-0000-000000000000', 4, 1.00),
-- Ethics & Privacy (c302)
('a3020000-0000-0000-0000-000000000011', 'c3020000-0000-0000-0000-000000000000', 3, 1.00),
('a5020000-0000-0000-0000-000000000016', 'c3020000-0000-0000-0000-000000000000', 4, 0.90),
-- MoSPI Frameworks (c303)
('a3030000-0000-0000-0000-000000000012', 'c3030000-0000-0000-0000-000000000000', 4, 1.00),
-- Communication (c401)
('a4010000-0000-0000-0000-000000000013', 'c4010000-0000-0000-0000-000000000000', 3, 1.00),
-- Project Management (c402)
('a4020000-0000-0000-0000-000000000014', 'c4020000-0000-0000-0000-000000000000', 4, 1.00);
