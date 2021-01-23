CREATE TABLE characters (
  id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
  campaign_id INTEGER
    REFERENCES campaigns(id) ON DELETE CASCADE NOT NULL, 
  user_id INTEGER 
    REFERENCES users(id) ON DELETE CASCADE NOT NULL,
name TEXT, 
race TEXT,
class TEXT, 
level INTEGER, 
additionalInfo TEXT, 
datecreated TIMESTAMPTZ DEFAULT now() NOT NULL
);