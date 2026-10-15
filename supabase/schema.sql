-- Run this in the Supabase SQL editor to create the tables

CREATE TABLE profiles (
  id uuid REFERENCES auth.users on delete cascade not null primary key,
  name text,
  target_role text,
  experience_level text,
  skills text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

CREATE TABLE interviews (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  role text,
  difficulty text,
  type text,
  questions jsonb,
  answers jsonb,
  scores jsonb,
  overall_score integer,
  duration_minutes integer,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

CREATE TABLE questions (
  id uuid default uuid_generate_v4() primary key,
  category text,
  topic text,
  difficulty text,
  question text,
  sample_answer text,
  tags text[]
);

-- RLS Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can insert their own profile." ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile." ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can select their own profile." ON profiles FOR SELECT USING (auth.uid() = id);

ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can insert their own interviews." ON interviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can select their own interviews." ON interviews FOR SELECT USING (auth.uid() = user_id);

ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read questions." ON questions FOR SELECT USING (true);

-- Insert Initial 30 Questions
INSERT INTO questions (category, topic, difficulty, question, sample_answer, tags) VALUES
('dsa', 'Arrays', 'easy', 'Find the maximum and minimum element in an array.', 'I would iterate through the array once keeping track of the current min and max. O(n) time complexity.', ARRAY['arrays', 'basic logic']),
('dsa', 'Arrays', 'medium', 'Find the "Kth" max and min element of an array.', 'I would use a min-heap or max-heap of size K, or use QuickSelect for O(n) average time complexity.', ARRAY['arrays', 'sorting', 'heap']),
('dsa', 'Strings', 'easy', 'Check whether a given string is a Palindrome.', 'I would use two pointers, one at the start and one at the end, comparing characters and moving them towards the center.', ARRAY['strings', 'two pointer']),
('dsa', 'Strings', 'medium', 'Find all permutations of a given string.', 'I would use backtracking/recursion, swapping characters at different indices to generate all permutations.', ARRAY['strings', 'backtracking']),
('dsa', 'Linked Lists', 'easy', 'Reverse a linked list.', 'I would iterate using three pointers: prev, current, and next, explicitly reversing the next pointer of each node.', ARRAY['linked list', 'pointers']),
('dsa', 'Linked Lists', 'medium', 'Detect loop in a linked list.', 'Flyods cycle-finding algorithm: using a slow and fast pointer. If they meet, there is a cycle.', ARRAY['linked list', 'two pointer']),
('dsa', 'Trees', 'easy', 'Find the maximum depth or height of a tree.', 'Use recursion to find the max of the left and right subtree heights plus 1. Or use level-order traversal queue.', ARRAY['trees', 'dfs', 'bfs']),
('dsa', 'Trees', 'medium', 'Check if a binary tree is a valid Binary Search Tree (BST).', 'Perform a DFS passing min and max allowed values to each node to validate them.', ARRAY['trees', 'bst']),
('dsa', 'Dynamic Programming', 'medium', 'Find the longest common subsequence of two strings.', 'Initialize a 2D array matrix and populate it based on character matches to solve the subproblems.', ARRAY['dp', 'strings']),
('dsa', 'Dynamic Programming', 'hard', '0-1 Knapsack Problem.', 'I would use a 2D DP array where rows correspond to items and columns to weights, deciding whether to include an item or not.', ARRAY['dp']),

('core-cs', 'OS', 'easy', 'What is the difference between a process and a thread?', 'A process is an executing program with its own memory space. A thread is a lightweight sub-process sharing the same memory within a process.', ARRAY['os', 'process', 'thread']),
('core-cs', 'OS', 'medium', 'Explain various process scheduling algorithms.', 'There is FCFS, SJF, Round Robin, and Priority Scheduling. Round Robin is commonly used giving time quantums to processes.', ARRAY['os', 'scheduling']),
('core-cs', 'OS', 'hard', 'What is a deadlock and what are the 4 necessary conditions?', 'Deadlock occurs when processes are blocked waiting for resources. Conditions: Mutual Exclusion, Hold and Wait, No Preemption, Circular Wait.', ARRAY['os', 'deadlock']),
('core-cs', 'DBMS', 'easy', 'What are ACID properties?', 'Atomicity, Consistency, Isolation, Durability. They ensure reliable transaction processing in databases.', ARRAY['dbms', 'transactions']),
('core-cs', 'DBMS', 'medium', 'Explain different types of JOINs.', 'INNER JOIN returns matches. LEFT JOIN returns all left side. RIGHT JOIN returns all right side. FULL OUTER returns everything.', ARRAY['dbms', 'sql', 'joins']),
('core-cs', 'DBMS', 'medium', 'What is Normalization? Explain 1NF, 2NF, 3NF.', 'It reduces redundancy. 1NF: atomic values. 2NF: no partial dependencies. 3NF: no transitive dependencies.', ARRAY['dbms', 'design']),
('core-cs', 'Networks', 'easy', 'What is the difference between TCP and UDP?', 'TCP is connection-oriented, reliable, and slower (HTTP). UDP is connectionless, unreliable, but fast (video streaming).', ARRAY['networks', 'protocols']),
('core-cs', 'Networks', 'medium', 'Explain the OSI model layers.', 'Physical, Data Link, Network, Transport, Session, Presentation, Application. (Please Do Not Throw Sausage Pizza Away).', ARRAY['networks', 'osi']),
('core-cs', 'OOP', 'easy', 'What are the 4 pillars of OOP?', 'Encapsulation, Abstraction, Inheritance, and Polymorphism.', ARRAY['oop', 'basics']),
('core-cs', 'OOP', 'medium', 'Explain SOLID principles briefly.', 'Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion.', ARRAY['oop', 'design patterns']),

('hr', 'General', 'easy', 'Tell me about yourself.', 'I am a passionate software engineer with experience in React and Node.js. In my previous role I built... [Focus on professional story].', ARRAY['hr', 'intro']),
('hr', 'General', 'easy', 'What are your greatest strengths AND weaknesses?', 'Strength: Fast learner and adaptable. Weakness: Sometimes I dive too deep into technical details, but I am learning to prioritize better.', ARRAY['hr', 'self-awareness']),
('hr', 'General', 'easy', 'Why do you want to work for this company?', 'I have followed your company''s work in AI tech, specifically product X, and the engineering challenges align perfectly with my goals.', ARRAY['hr', 'culture']),
('hr', 'General', 'medium', 'Where do you see yourself in 5 years?', 'I see myself as a senior developer leading small to mid-sized teams, mentoring juniors, and contributing to system architecture.', ARRAY['hr', 'goals']),
('hr', 'General', 'medium', 'How do you handle conflict with a coworker?', 'I prefer direct but polite communication. I would schedule a 1-on-1 to understand their perspective and find a compromise.', ARRAY['hr', 'conflict']),

('behavioral', 'Experience', 'medium', 'Tell me about a time you showed leadership.', 'While working on project Y, our tech lead was out. I stepped up to run the standups and coordinate with the product manager...', ARRAY['behavioral', 'leadership', 'star']),
('behavioral', 'Experience', 'medium', 'Describe a time you failed and what you learned.', 'I once pushed a bug to production that broke the login page. I learned to implement stricter CI/CD checks and always write unit tests.', ARRAY['behavioral', 'failure', 'star']),
('behavioral', 'Experience', 'medium', 'Tell me about a time you worked on a difficult team.', 'One team member wasn''t delivering. I reached out privately to assist, discovered they were blocked, and helped pair program.', ARRAY['behavioral', 'teamwork', 'star']),
('behavioral', 'Experience', 'hard', 'Describe a time you had to learn a new technology independently quickly.', 'For the hackathon, we needed GraphQL. I spent the weekend reading the docs, created a POC, and successfully integrated it within 2 days.', ARRAY['behavioral', 'adaptability', 'star']),
('behavioral', 'Experience', 'hard', 'Tell me about a time you disagreed with your manager.', 'My manager wanted to deploy an unoptimized feature. I presented data showing it would crash under load. We agreed to delay it by one day to fix it.', ARRAY['behavioral', 'communication', 'star']);
