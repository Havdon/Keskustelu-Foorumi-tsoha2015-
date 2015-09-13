CREATE TABLE Subforum(
	subforum_id 	CHAR(20) PRIMARY KEY NOT NULL,
	name			TEXT,
	parent			CHAR(20)
);

CREATE TABLE "User"(
	username 	TEXT PRIMARY KEY NOT NULL,
	password	TEXT,
	salt		CHAR(20)
);

CREATE TABLE Thread(
	thread_id 	CHAR(20) PRIMARY KEY NOT NULL,
	title		TEXT,
	body		TEXT,
	subforum_id	CHAR(20) REFERENCES Subforum(subforum_id),
	username	TEXT	 REFERENCES "User"(username)
);

CREATE TABLE Post(
	post_id 	CHAR(20) 	PRIMARY KEY NOT NULL,
	time 		TIMESTAMP WITHOUT TIME ZONE,
	body		TEXT,
	thread_id	CHAR(20) 	REFERENCES Thread(thread_id),
	username	TEXT 		REFERENCES "User"(username)
);

CREATE TABLE Admin(
	username	TEXT 		REFERENCES "User"(username),
	subforum_id	CHAR(20) 	REFERENCES Subforum(subforum_id),
	PRIMARY KEY(username, subforum_id)
);