-- StatSkill AI — Migration 006: Seed Competency Taxonomy & Role Requirements

-- Clear existing data if re-running
TRUNCATE domains CASCADE;

-- Insert 4 Core Domains
INSERT INTO domains (id, name, code, description, icon_name) VALUES
('d1111111-1111-1111-1111-111111111111', 'Statistical Methods & Analytics', 'statistical', 'Core statistical methodologies, survey design, sampling, and empirical data analysis.', 'BarChart3'),
('d2222222-2222-2222-2222-222222222222', 'Digital & Technical Tools', 'technical', 'Data processing software, programming languages, databases, and AI/ML technologies.', 'Code2'),
('d3333333-3333-3333-3333-333333333333', 'Official Statistics & Governance', 'governance', 'MoSPI frameworks, National Indicator Framework (NIF), data ethics, and regulatory compliance.', 'Building2'),
('d4444444-4444-4444-4444-444444444444', 'Behavioral & Leadership', 'behavioral', 'Analytical communication, strategic decision making, project management, and collaboration.', 'Users');

-- Insert Competencies for Domain 1: Statistical Methods & Analytics
INSERT INTO competencies (id, domain_id, name, code, description, level_1_desc, level_2_desc, level_3_desc, level_4_desc, level_5_desc) VALUES
('c1010000-0000-0000-0000-000000000000', 'd1111111-1111-1111-1111-111111111111', 'Survey Sampling & Design', 'STAT_SAMPLING', 'Principles of probability sampling, stratified sampling, and survey methodology.', 'Basic awareness of sampling terms', 'Understands simple random sampling', 'Designs standard stratified surveys', 'Optimizes sample allocation & weighting', 'Expert in complex multi-stage sampling'),
('c1020000-0000-0000-0000-000000000000', 'd1111111-1111-1111-1111-111111111111', 'Statistical Inference & Testing', 'STAT_INFERENCE', 'Hypothesis testing, confidence intervals, regression models, and significance.', 'Understands mean & standard deviation', 'Performs t-tests and Chi-square tests', 'Applies regression & ANOVA models', 'Advanced GLMs & multivariate analysis', 'Expert in Bayesian & complex inference'),
('c1030000-0000-0000-0000-000000000000', 'd1111111-1111-1111-1111-111111111111', 'Time Series & Forecasting', 'STAT_TIMESERIES', 'Decomposition, seasonal adjustment, ARIMA modeling, and economic forecasting.', 'Aware of trend vs seasonality', 'Computes moving averages', 'Builds ARIMA & Holt-Winters models', 'Applies VAR & state-space models', 'Leads macroeconomic forecasting'),
('c1040000-0000-0000-0000-000000000000', 'd1111111-1111-1111-1111-111111111111', 'Data Quality Auditing & Imputation', 'STAT_QUALITY', 'Identifying outliers, handling missing values, and validating data integrity.', 'Identifies basic data errors', 'Applies mean/median imputation', 'Uses KNN & MICE imputation', 'Designs validation & audit pipelines', 'Establishes national data quality standards');

-- Insert Competencies for Domain 2: Digital & Technical Tools
INSERT INTO competencies (id, domain_id, name, code, description, level_1_desc, level_2_desc, level_3_desc, level_4_desc, level_5_desc) VALUES
('c2010000-0000-0000-0000-000000000000', 'd2222222-2222-2222-2222-222222222222', 'Python for Statistical Computing', 'TECH_PYTHON', 'Data manipulation with Pandas, NumPy, Statsmodels, and automated analysis script writing.', 'Aware of Python syntax', 'Writes basic scripts & filters data', 'Proficient in Pandas, NumPy, Seaborn', 'Builds automated data pipelines', 'Architects scalable Python packages'),
('c2020000-0000-0000-0000-000000000000', 'd2222222-2222-2222-2222-222222222222', 'R Programming & Survey Packages', 'TECH_R', 'Data processing using R, survey package, tidyverse, and statistical reporting.', 'Aware of R console & basic objects', 'Runs basic descriptive summary stats', 'Uses tidyverse & survey package', 'Creates automated R Markdown reports', 'Develops custom R packages for MoSPI'),
('c2030000-0000-0000-0000-000000000000', 'd2222222-2222-2222-2222-222222222222', 'SQL & Database Management', 'TECH_SQL', 'Querying relational databases, aggregations, window functions, and indexing.', 'Understands table structures', 'Writes simple SELECT & WHERE queries', 'Uses JOINs, GROUP BY & aggregations', 'Writes complex CTEs & Window functions', 'Designs & tunes enterprise databases'),
('c2040000-0000-0000-0000-000000000000', 'd2222222-2222-2222-2222-222222222222', 'Data Visualization & Dashboards', 'TECH_VISUALIZATION', 'Creating interactive dashboards using PowerBI, Tableau, or web frameworks.', 'Reads standard charts', 'Creates Excel/PowerPoint charts', 'Builds interactive PowerBI dashboards', 'Designs custom interactive visual tools', 'Architects national statistics portals'),
('c2050000-0000-0000-0000-000000000000', 'd2222222-2222-2222-2222-222222222222', 'AI & Machine Learning Basics', 'TECH_AIML', 'Understanding ML algorithms, NLP for text processing, and AI model evaluation.', 'Aware of AI/ML concepts', 'Uses pre-built AI tools & prompts', 'Applies Scikit-Learn classification', 'Tunes ML models & evaluates accuracy', 'Deploys AI models for official stats');

-- Insert Competencies for Domain 3: Official Statistics & Governance
INSERT INTO competencies (id, domain_id, name, code, description, level_1_desc, level_2_desc, level_3_desc, level_4_desc, level_5_desc) VALUES
('c3010000-0000-0000-0000-000000000000', 'd3333333-3333-3333-3333-333333333333', 'National Indicator Framework (NIF)', 'GOV_NIF', 'Monitoring Sustainable Development Goals (SDGs) and national statistical metrics.', 'Aware of SDG goals', 'Tracks specific indicator targets', 'Maps surveys to NIF requirements', 'Evaluates national SDG progress', 'Formulates national indicator policies'),
('c3020000-0000-0000-0000-000000000000', 'd3333333-3333-3333-3333-333333333333', 'Official Data Ethics & Privacy', 'GOV_ETHICS', 'Data protection regulations, confidentiality preserving techniques, and microdata release.', 'Aware of privacy guidelines', 'Applies anonymization protocols', 'Implements k-anonymity & differential privacy', 'Drafts data governance policies', 'Leads national statistical ethics committee'),
('c3030000-0000-0000-0000-000000000000', 'd3333333-3333-3333-3333-333333333333', 'MoSPI Survey Frameworks', 'GOV_MOSPI', 'Standards of NSS, CPI, IIP, ASI, and National Accounts Statistics.', 'Basic awareness of NSS/CPI', 'Understands collection schedules', 'Manages field data validation', 'Analyzes sectoral survey outputs', 'Oversees national survey methodologies');

-- Insert Competencies for Domain 4: Behavioral & Leadership
INSERT INTO competencies (id, domain_id, name, code, description, level_1_desc, level_2_desc, level_3_desc, level_4_desc, level_5_desc) VALUES
('c4010000-0000-0000-0000-000000000000', 'd4444444-4444-4444-4444-444444444444', 'Analytical Communication', 'BEH_COMMUNICATION', 'Presenting complex statistical findings to policy makers and non-technical stakeholders.', 'Communicates basic data facts', 'Drafts clear statistical summaries', 'Presents insights to division heads', 'Translates data into policy briefs', 'Represents MoSPI at global forums'),
('c4020000-0000-0000-0000-000000000000', 'd4444444-4444-4444-4444-444444444444', 'Statistical Project Management', 'BEH_PM', 'Planning field surveys, managing timelines, budgets, and team coordination.', 'Tracks personal deliverables', 'Coordinates field team schedules', 'Manages division survey projects', 'Oversees multi-region survey operations', 'Directs national statistical initiatives');

-- Seed Role Requirements for Common Designations (Target Level out of 5)

-- 1. Junior Statistical Officer (JSO) / Statistical Assistant
INSERT INTO role_competencies (designation, competency_id, required_level) VALUES
('Junior Statistical Officer', 'c1010000-0000-0000-0000-000000000000', 3), -- Survey Sampling
('Junior Statistical Officer', 'c1020000-0000-0000-0000-000000000000', 3), -- Inference
('Junior Statistical Officer', 'c1040000-0000-0000-0000-000000000000', 3), -- Data Quality
('Junior Statistical Officer', 'c2010000-0000-0000-0000-000000000000', 2), -- Python
('Junior Statistical Officer', 'c2030000-0000-0000-0000-000000000000', 3), -- SQL
('Junior Statistical Officer', 'c3030000-0000-0000-0000-000000000000', 4), -- MoSPI Frameworks
('Junior Statistical Officer', 'c4010000-0000-0000-0000-000000000000', 2); -- Communication

-- 2. Senior Statistical Officer (SSO)
INSERT INTO role_competencies (designation, competency_id, required_level) VALUES
('Senior Statistical Officer', 'c1010000-0000-0000-0000-000000000000', 4), -- Survey Sampling
('Senior Statistical Officer', 'c1020000-0000-0000-0000-000000000000', 4), -- Inference
('Senior Statistical Officer', 'c1030000-0000-0000-0000-000000000000', 3), -- Time Series
('Senior Statistical Officer', 'c2010000-0000-0000-0000-000000000000', 3), -- Python
('Senior Statistical Officer', 'c2020000-0000-0000-0000-000000000000', 3), -- R
('Senior Statistical Officer', 'c2030000-0000-0000-0000-000000000000', 4), -- SQL
('Senior Statistical Officer', 'c3010000-0000-0000-0000-000000000000', 3), -- NIF
('Senior Statistical Officer', 'c3030000-0000-0000-0000-000000000000', 4), -- MoSPI Frameworks
('Senior Statistical Officer', 'c4010000-0000-0000-0000-000000000000', 3), -- Communication
('Senior Statistical Officer', 'c4020000-0000-0000-0000-000000000000', 3); -- PM

-- 3. Data Analyst / Scientist
INSERT INTO role_competencies (designation, competency_id, required_level) VALUES
('Data Analyst', 'c1020000-0000-0000-0000-000000000000', 4),
('Data Analyst', 'c1030000-0000-0000-0000-000000000000', 4),
('Data Analyst', 'c2010000-0000-0000-0000-000000000000', 4),
('Data Analyst', 'c2030000-0000-0000-0000-000000000000', 4),
('Data Analyst', 'c2040000-0000-0000-0000-000000000000', 4),
('Data Analyst', 'c2050000-0000-0000-0000-000000000000', 3),
('Data Analyst', 'c3020000-0000-0000-0000-000000000000', 3);

-- 4. Director / Assistant Director / Divisional Head
INSERT INTO role_competencies (designation, competency_id, required_level) VALUES
('Director', 'c1010000-0000-0000-0000-000000000000', 4),
('Director', 'c2050000-0000-0000-0000-000000000000', 3),
('Director', 'c3010000-0000-0000-0000-000000000000', 5),
('Director', 'c3020000-0000-0000-0000-000000000000', 4),
('Director', 'c4010000-0000-0000-0000-000000000000', 5),
('Director', 'c4020000-0000-0000-0000-000000000000', 5);

-- 5. Default Requirement Set (Fallback for any user without a specific designation mapped)
INSERT INTO role_competencies (designation, competency_id, required_level) VALUES
('Default', 'c1010000-0000-0000-0000-000000000000', 3),
('Default', 'c1020000-0000-0000-0000-000000000000', 3),
('Default', 'c2010000-0000-0000-0000-000000000000', 3),
('Default', 'c2030000-0000-0000-0000-000000000000', 3),
('Default', 'c2040000-0000-0000-0000-000000000000', 3),
('Default', 'c3010000-0000-0000-0000-000000000000', 3),
('Default', 'c3030000-0000-0000-0000-000000000000', 3),
('Default', 'c4010000-0000-0000-0000-000000000000', 3);
