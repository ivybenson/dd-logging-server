CREATE TABLE posts (
  id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
  character_id INTEGER
    REFERENCES characters(id) ON DELETE CASCADE NOT NULL, 
  character_name TEXT, 
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  completed BOOLEAN NOT NULL,
  datecreated TIMESTAMPTZ DEFAULT now() NOT NULL
);

--MOVE TO FRONT END WITH DATA FOR CHARACTER_NAME - POST WITH CHARACTER_NAME ON FRONT END AS IT IS POSTED 