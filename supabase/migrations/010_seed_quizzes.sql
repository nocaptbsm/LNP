-- StatSkill AI — Migration 010: Seed Quizzes & Approved Quiz Questions

TRUNCATE quizzes CASCADE;

-- 1. Seed Quiz 1: R Programming for Survey Analysis (Target Level 3)
INSERT INTO quizzes (id, title, description, competency_id, target_level, passing_score, is_published) VALUES
('91000000-0000-0000-0000-000000000001', 'R tidyverse & survey Package Basics', 'Evaluate your skills in importing microdata, using tidyverse commands, and calculating weighted statistics using R survey package.', 'c2020000-0000-0000-0000-000000000000', 3, 66, true);

INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_option, explanation, sequence_order) VALUES
('91000000-0000-0000-0000-000000000001', 'Which R function from the `survey` package is used to specify a complex survey design (including strata, clusters, and weights)?', 'svymean()', 'svydesign()', 'survey_design()', 'design_survey()', 'B', 'The svydesign() function is the baseline configuration function in R survey package that links variables to weights and clusters.', 1),
('91000000-0000-0000-0000-000000000001', 'Which operator in R tidyverse is used to pipe outputs from one function as the first argument into the next function?', '->', '%>%', '==', '&&', 'B', 'The pipe operator %>% (or the native |>) pipes calculations in tidyverse sequences.', 2),
('91000000-0000-0000-0000-000000000001', 'If you want to handle survey data with missing values in R survey package, which parameter should be passed inside svymean() to prevent NA outputs?', 'na.rm = TRUE', 'remove.na = TRUE', 'clean = TRUE', 'dropna = TRUE', 'A', 'na.rm = TRUE is the standard R parameter passed to remove missing values from statistical calculations.', 3);


-- 2. Seed Quiz 2: Python for Statistical Analysis (Target Level 3)
INSERT INTO quizzes (id, title, description, competency_id, target_level, passing_score, is_published) VALUES
('92000000-0000-0000-0000-000000000002', 'Python Data Processing with Pandas', 'Baseline assessment for Pandas data structures, filters, groupings, and aggregating statistics.', 'c2010000-0000-0000-0000-000000000000', 3, 66, true);

INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_option, explanation, sequence_order) VALUES
('92000000-0000-0000-0000-000000000002', 'In Pandas, which method is used to group data by one or more columns and calculate summary statistics?', 'group()', 'groupby()', 'aggregate()', 'pivot()', 'B', 'groupby() is the standard Pandas DataFrame method used to group rows before applying aggregations.', 1),
('92000000-0000-0000-0000-000000000002', 'How do you check for missing values in a Pandas DataFrame?', 'df.isnull()', 'df.isnone()', 'df.empty()', 'df.missing()', 'A', 'df.isnull() (or df.isna()) returns a boolean mask indicating where values are missing (NaN).', 2),
('92000000-0000-0000-0000-000000000002', 'Which library is primarily used in Python to build statistical models (like OLS linear regression) with formulas similar to R?', 'scikit-learn', 'statsmodels', 'scipy', 'numpy', 'B', 'statsmodels contains statistical modeling packages that allow regression fitting using formulas.', 3);


-- 3. Seed Quiz 3: Data Ethics & Privacy in Government (Target Level 3)
INSERT INTO quizzes (id, title, description, competency_id, target_level, passing_score, is_published) VALUES
('93000000-0000-0000-0000-000000000003', 'Official Data Ethics & Privacy standards', 'Test your understanding of k-anonymity, differential privacy, and microdata release regulations under MoSPI frameworks.', 'c3020000-0000-0000-0000-000000000000', 3, 66, true);

INSERT INTO quiz_questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_option, explanation, sequence_order) VALUES
('93000000-0000-0000-0000-000000000003', 'What is the primary objective of applying k-anonymity to survey microdata before public dissemination?', 'To reduce file size', 'To ensure each individual cannot be distinguished from at least k-1 other individuals', 'To encrypt confidential keys', 'To impute missing data', 'B', 'k-anonymity ensures that quasi-identifiers are grouped so that individual records are indistinguishable from a group of size k.', 1),
('93000000-0000-0000-0000-000000000003', 'Which term describes adding controlled mathematical noise to statistical queries to guarantee privacy regardless of background information?', 'Encryption', 'Differential Privacy', 'Anonymization', 'Data Masking', 'B', 'Differential privacy is a rigorous mathematical standard that limits individual identification by inserting calibrated noise.', 2),
('93000000-0000-0000-0000-000000000003', 'Under official guidelines, who has the final authority to approve statistical microdata releases in MoSPI?', 'Divisional Head, DIID', 'Governing Council / Data Dissemination Committee', 'Computer Centre head', 'Junior Statistician', 'B', 'The designated Data Dissemination Committee / Governing Council regulates and approves releases of confidential microdata.', 3);
