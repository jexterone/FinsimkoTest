
DROP TABLE IF EXISTS inputs CASCADE;
CREATE TABLE inputs (
    id SERIAL PRIMARY KEY,
    term TEXT NOT NULL,
    value NUMERIC NOT NULL
);

INSERT INTO inputs (term, value) VALUES
('EBITDA', 100.0),
('Multiple', 5.0),
('Factor Score', 0.8);

DROP TABLE IF EXISTS status CASCADE;
CREATE TABLE status (
    term TEXT NOT NULL,
    team TEXT NOT NULL,
    approved BOOLEAN NOT NULL,
    PRIMARY KEY (term, team)
);

INSERT INTO status (term, team, approved) VALUES
('EBITDA', 'team1', FALSE),
('EBITDA', 'team2', FALSE),
('Multiple', 'team1', FALSE),
('Multiple', 'team2', FALSE),
('Factor Score', 'team1', FALSE),
('Factor Score', 'team2', FALSE);

DROP TABLE IF EXISTS output CASCADE;
CREATE TABLE output (
    valuation NUMERIC,
    agreed BOOLEAN
);

INSERT INTO output (valuation, agreed) VALUES (0, FALSE);

