-- Seed data for Bachelor_Society (realistic user profiles)

INSERT INTO users (username, email, phone, password_hash, role, name, age, gender, occupation, preferred_location, budget_min, budget_max, interests) VALUES
('alex_chen', 'alex.chen@email.com', '+1-555-0123', '$2a$10$7QzYQX6h1Jgq0KcQ3u6p7u0u1QvXxQv1Uu0wqG6a', 'user', 'Alex Chen', 28, 'male', 'Software Engineer', 'San Francisco, CA', 2000, 3500, 'Hiking, photography, cooking, tech meetups, basketball'),
('sarah_johnson', 'sarah.johnson@email.com', '+1-555-0456', '$2a$10$7QzYQX6h1Jgq0KcQ3u6p7u0u1QvXxQv1Uu0wqG6a', 'user', 'Sarah Johnson', 25, 'female', 'Marketing Coordinator', 'Austin, TX', 1500, 2800, 'Yoga, live music, craft beer, reading, hiking'),
('mike_rodriguez', 'mike.rodriguez@email.com', '+1-555-0789', '$2a$10$7QzYQX6h1Jgq0KcQ3u6p7u0u1QvXxQv1Uu0wqG6a', 'user', 'Mike Rodriguez', 32, 'male', 'Graphic Designer', 'Portland, OR', 1800, 3200, 'Street art, coffee shops, indie music, gaming, urban exploration'),
('emma_davis', 'emma.davis@email.com', '+1-555-0321', '$2a$10$7QzYQX6h1Jgq0KcQ3u6p7u0u1QvXxQv1Uu0wqG6a', 'user', 'Emma Davis', 26, 'female', 'Teacher', 'Seattle, WA', 1600, 2900, 'Teaching, environmental causes, hiking, book clubs, volunteering'),
('david_kim', 'david.kim@email.com', '+1-555-0654', '$2a$10$7QzYQX6h1Jgq0KcQ3u6p7u0u1QvXxQv1Uu0wqG6a', 'user', 'David Kim', 29, 'male', 'Financial Analyst', 'New York, NY', 2500, 4500, 'Finance, jazz music, fine dining, gym workouts, travel'),
('lisa_wong', 'lisa.wong@email.com', '+1-555-0987', '$2a$10$7QzYQX6h1Jgq0KcQ3u6p7u0u1QvXxQv1Uu0wqG6a', 'user', 'Lisa Wong', 27, 'female', 'UX Designer', 'Los Angeles, CA', 2200, 3800, 'Design, meditation, vegan cooking, art galleries, beach volleyball'),
('admin', 'admin@bachelorsociety.com', '+1-555-0000', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 'Admin User', 35, 'other', 'System Administrator', 'Remote', 0, 0, 'System administration, technology, community building');

-- Housing listings with realistic addresses and area details
INSERT INTO housing (user_id, address, area, rent, available_from, rooms) VALUES
(1, 'House 45, Road 27, Dhanmondi R/A', 'Dhanmondi, Dhaka', 25000.00, '2026-02-01', 2),
(2, 'Plot 12, Block A, Bashundhara R/A', 'Bashundhara, Dhaka', 18000.00, '2026-01-15', 1),
(3, 'House 123, Road 8, Gulshan 1', 'Gulshan, Dhaka', 35000.00, '2026-03-01', 2),
(4, 'Flat B2, House 56, Banani DOHS', 'Banani, Dhaka', 28000.00, '2026-01-20', 2),
(5, 'House 78, Road 12, Sector 10, Uttara', 'Uttara, Dhaka', 22000.00, '2026-02-15', 2);

-- Activity listings with diverse and realistic activities
INSERT INTO buddies (owner_id, activity_type, location, date_time, description, max_participants) VALUES
(1, 'Hiking', 'Mount Sutro Open Space Reserve, San Francisco', '2026-01-18 09:00:00', 'Weekend morning hike through redwood groves and city views. Moderate difficulty, about 3 miles round trip. Great way to start the weekend!', 6),
(2, 'Live Music', 'Container Bar, Austin TX', '2026-01-25 20:30:00', 'Local indie rock show at one of Austin\'s favorite venues. Come for the music, stay for the craft beer selection. All genres welcome!', 4),
(3, 'Street Art Tour', 'Downtown Portland Arts District', '2026-02-02 14:00:00', 'Self-guided walking tour of Portland\'s famous street art scene. Learn about local artists and see some of the city\'s most impressive murals. Comfortable walking shoes required.', 8),
(4, 'Book Club', 'Third Place Commons, Seattle', '2026-01-22 19:00:00', 'Monthly book discussion group focusing on contemporary fiction and memoirs. This month: "The Midnight Library" by Matt Haig. Light snacks provided.', 12),
(5, 'Jazz Night', 'Blue Note Jazz Club, New York', '2026-01-28 21:00:00', 'Intimate jazz performance at one of NYC\'s legendary venues. Come enjoy live music, craft cocktails, and good conversation in a sophisticated atmosphere.', 6),
(6, 'Beach Volleyball', 'Santa Monica Beach, Los Angeles', '2026-02-08 16:00:00', 'Casual beach volleyball games on a beautiful Saturday afternoon. All skill levels welcome - we\'ll have multiple courts and can split into teams. Bring water and sunscreen!', 16);







-- Roommate requests with detailed, realistic profiles
INSERT INTO roommate_requests (owner_id, preferred_location, budget_min, budget_max, lifestyle, move_in_date, description, smoking_preference, pet_preference) VALUES
(1, 'San Francisco, CA', 1600.00, 2000.00, 'Tech professional seeking quiet, respectful roommate', '2026-02-01', '28-year-old software engineer looking for a roommate for a 2-bedroom apartment in SOMA. I work long hours at a tech startup but maintain a healthy work-life balance. I enjoy hiking on weekends, cooking Asian cuisine, and attending tech meetups. Looking for someone clean, respectful of shared spaces, and who values privacy. Non-smoker, light social drinker. The apartment has in-unit laundry, modern kitchen, and is close to BART and tech companies.', 'Non-smoking preferred', 'Cat-friendly'),
(2, 'Austin, TX', 900.00, 1300.00, 'Creative professional seeking fun, social roommate', '2026-01-15', '25-year-old marketing coordinator ready to find an awesome roommate! I love Austin\'s live music scene, trying new food trucks, and weekend yoga sessions. I work in digital marketing and enjoy creative projects in my spare time. Looking for someone who\'s outgoing, loves trying new things, and doesn\'t mind occasional music practice. The space is a charming bungalow with a private backyard, perfect for BBQs and small gatherings. Let\'s make some memories together!', 'Non-smoking', 'Dog-friendly'),
(3, 'Portland, OR', 1100.00, 1500.00, 'Artist seeking like-minded creative roommate', '2026-03-01', '32-year-old graphic designer and street art enthusiast looking for a roommate who appreciates creativity and urban exploration. I spend my days designing for local businesses and evenings sketching in coffee shops or exploring Portland\'s incredible street art scene. The loft space has exposed brick, high ceilings, and tons of natural light - perfect for creative pursuits. Looking for someone who respects art materials, doesn\'t mind occasional late nights, and enjoys Portland\'s indie music and craft beer culture.', 'Non-smoking preferred', 'Flexible on pets'),
(4, 'Seattle, WA', 1200.00, 1600.00, 'Educator seeking environmentally conscious roommate', '2026-01-20', '26-year-old elementary school teacher passionate about education and environmental causes. I spend my days inspiring young minds and weekends volunteering with local conservation groups or hiking in nearby parks. I practice yoga daily, enjoy book clubs, and love hosting small dinner parties. The 2-bedroom condo has stunning water views and is near public transit. Looking for someone who shares my values around sustainability, education, and community involvement. Non-smoker, occasional wine with dinner.', 'Non-smoking', 'Small pets okay'),
(5, 'New York, NY', 1900.00, 2500.00, 'Finance professional seeking sophisticated roommate', '2026-02-15', '29-year-old financial analyst working in Manhattan. I enjoy fine dining, jazz clubs, international travel, and staying fit at high-end gyms. I travel frequently for work but maintain a sophisticated lifestyle when home. The luxury 1-bedroom is in a doorman building with concierge service, perfect for someone who appreciates quality and convenience. Looking for a professional roommate who respects privacy, maintains the space well, and enjoys an urban lifestyle. Occasional entertaining is fine but prefer quiet evenings.', 'Non-smoking', 'No pets'),
(6, 'Los Angeles, CA', 1400.00, 1900.00, 'Designer seeking mindful, creative roommate', '2026-02-08', '27-year-old UX designer who practices meditation and follows a vegan lifestyle. I spend my days creating beautiful digital experiences and evenings practicing yoga, cooking plant-based meals, or visiting art galleries. Love beach volleyball on weekends and exploring LA\'s diverse cultural scene. The apartment is near the beach with plenty of natural light and a peaceful atmosphere. Looking for someone mindful, creative, and who appreciates a calm, intentional living space. Non-smoker, wellness-focused lifestyle preferred.', 'Non-smoking', 'Small pets welcome');
