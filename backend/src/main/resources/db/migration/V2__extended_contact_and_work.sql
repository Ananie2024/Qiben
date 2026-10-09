ALTER TABLE contact_messages
    ADD COLUMN phone VARCHAR(40) NULL AFTER email,
    ADD COLUMN budget VARCHAR(60) NULL AFTER subject,
    ADD COLUMN timeline VARCHAR(60) NULL AFTER budget,
    ADD COLUMN service_category VARCHAR(100) NULL AFTER timeline;
