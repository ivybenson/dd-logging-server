CREATE TABLE posts (
  id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
character_id INTEGER
REFERENCES campaigns(id) ON DELETE CASCADE NOT NULL, 
title TEXT NOT NULL,
content TEXT NOT NULL,
completed BOOLEAN NOT NULL,
datecreated TIMESTAMPTZ DEFAULT now() NOT NULL,
);