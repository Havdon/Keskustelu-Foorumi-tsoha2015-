-- Inserts test data into database

-- SUBFORTUMS
INSERT INTO Subforum (subforum_id, name, parent)
VALUES 	('0', 'Games', 	'root'),
		('1', 'News', 	'root'),
		('2', 'AskFoorumi', 'root'),
		('00','Call of Duty', '0');

-- USERS
INSERT INTO "User" (username, password)
VALUES 	('admin', 'password'),
		('billy', 'password');

-- THREADS
INSERT INTO Thread (thread_id, title, body, subforum_id, username)
VALUES ('00', 'Call of Duty is the best game ever!', 'Whos with me?', '0', 	'admin'),
		('01', 'Thread by Billy', 'Best thread', '0', 	'billy');

-- POSTS
INSERT INTO Post (post_id, time, body, thread_id, username)
 VALUES ('002', to_timestamp(1442170851), 'Are you kidding me? Of course I''m with you!\nBest thing ever!', '00', 'billy');

-- ADMINS
INSERT INTO Admin (username, subforum_id)
VALUES 	('admin', '0'),
		('admin', '00'),
		('admin', '1'),
		('admin', '2');