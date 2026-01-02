const request = require('supertest');
const app = require('../server');
const db = require('../config/db');

// Increase timeout for database operations
jest.setTimeout(30000);

describe('API Tests', () => {
  let server;
  let authToken;
  let userId;
  let adminToken;
  let adminId;
  let housingId;
  let buddyId;
  let roommateId;
  let otherUserToken; // For testing interactions between different users
  let otherUserId;

  beforeAll(async () => {
    // Start server for testing
    server = app.listen(3008); // Use different port for tests

    // Wait for server to start
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Clean up any existing test users
    await new Promise((resolve, reject) => {
      db.query('DELETE FROM users WHERE email LIKE ?', ['%@example.com'], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Register the main test user
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .field('username', 'testuser')
      .field('email', 'test@example.com')
      .field('password', 'password123')
      .field('phone', '');

    expect(registerResponse.status).toBe(201);

    // Login to get token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });

    expect(loginResponse.status).toBe(200);
    authToken = loginResponse.body.token;
    userId = loginResponse.body.user.id;

    // Register another user for interactions
    const otherRegisterResponse = await request(app)
      .post('/api/auth/register')
      .field('username', 'otheruser')
      .field('email', 'other@example.com')
      .field('password', 'password123')
      .field('phone', '');

    expect(otherRegisterResponse.status).toBe(201);

    // Login as other user
    const otherLoginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'other@example.com',
        password: 'password123'
      });

    expect(otherLoginResponse.status).toBe(200);
    otherUserToken = otherLoginResponse.body.token;
    otherUserId = otherLoginResponse.body.user.id;

    // Register an admin user
    const adminRegisterResponse = await request(app)
      .post('/api/auth/register')
      .field('username', 'adminuser')
      .field('email', 'admin@example.com')
      .field('password', 'password123')
      .field('phone', '');

    expect(adminRegisterResponse.status).toBe(201);

    // Login as admin
    const adminLoginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'password123'
      });

    expect(adminLoginResponse.status).toBe(200);
    adminToken = adminLoginResponse.body.token;
    adminId = adminLoginResponse.body.user.id;

    // Make admin user an admin in database
    await new Promise((resolve, reject) => {
      db.query('UPDATE users SET role = ? WHERE id = ?', ['admin', adminId], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  });

  afterAll(async () => {
    // Clean up test data
    await new Promise((resolve, reject) => {
      db.query('DELETE FROM users WHERE email LIKE ?', ['%@example.com'], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Close server
    if (server) {
      server.close();
    }

    // Close database connection
    db.destroy();
  }, 10000);

  describe('Auth Routes', () => {
    test('POST /api/auth/register - should register a new user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .field('username', 'testuser2')
        .field('email', 'test2@example.com')
        .field('password', 'password123')
        .field('phone', '');

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', 'User created successfully');
      expect(response.body).toHaveProperty('token');
    });

    test('POST /api/auth/login - should login user', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
    });

    test('POST /api/auth/logout - should logout user', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
    });
  });

  describe('User Routes', () => {
    test('GET /api/users/dashboard - should get user dashboard', async () => {
      const response = await request(app)
        .get('/api/users/dashboard')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
    });

    test('GET /api/users/me - should get current user profile', async () => {
      const response = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.user).toHaveProperty('id', userId);
    });

    test('PUT /api/users/me - should update current user profile', async () => {
      const response = await request(app)
        .put('/api/users/me')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Updated Name',
          age: 25
        });

      expect(response.status).toBe(200);
    });

    test('GET /api/users/:id - should get public user profile', async () => {
      const response = await request(app)
        .get(`/api/users/${userId}`);

      expect(response.status).toBe(200);
      expect(response.body.user).toHaveProperty('id', userId);
    });
  });

  describe('Housing Routes', () => {
    test('POST /api/housing - should create housing listing', async () => {
      const response = await request(app)
        .post('/api/housing')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          address: '123 Test St',
          area: 'Test Area',
          rent: 1000,
          available_from: '2024-01-01',
          rooms: 2,
          property_type: 'apartment'
        });

      expect(response.status).toBe(201);
      housingId = response.body.housing_id;
    });

    test('GET /api/housing - should get all housing listings', async () => {
      const response = await request(app)
        .get('/api/housing');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.listings)).toBe(true);
    });

    test('GET /api/housing/:id - should get housing by id', async () => {
      const response = await request(app)
        .get(`/api/housing/${housingId}`);

      expect(response.status).toBe(200);
      expect(response.body.listing).toHaveProperty('id', housingId);
    });

    test('PUT /api/housing/:id - should update housing', async () => {
      const response = await request(app)
        .put(`/api/housing/${housingId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          rent: 1200
        });

      expect(response.status).toBe(200);
    });

    test('POST /api/housing/:id/inquire - should inquire about housing', async () => {
      const response = await request(app)
        .post(`/api/housing/${housingId}/inquire`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .send({
          message: 'I am interested in this property'
        });

      expect(response.status).toBe(200);
    });

    test('DELETE /api/housing/:id - should delete housing', async () => {
      const response = await request(app)
        .delete(`/api/housing/${housingId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
    });
  });

  describe('Buddy Routes', () => {
    test('POST /api/buddies - should create buddy activity', async () => {
      const response = await request(app)
        .post('/api/buddies')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          activity_type: 'hiking',
          location: 'Mountain Trail',
          date_time: '2024-01-01 10:00:00',
          description: 'Fun hiking trip'
        });

      expect(response.status).toBe(201);
      buddyId = response.body.id;
    });

    test('GET /api/buddies - should get all buddy activities', async () => {
      const response = await request(app)
        .get('/api/buddies');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.buddies)).toBe(true);
    });

    test('GET /api/buddies/:id - should get buddy by id', async () => {
      const response = await request(app)
        .get(`/api/buddies/${buddyId}`);

      expect(response.status).toBe(200);
      expect(response.body.buddy).toHaveProperty('id', buddyId);
    });

    test('PUT /api/buddies/:id - should update buddy', async () => {
      const response = await request(app)
        .put(`/api/buddies/${buddyId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Updated description'
        });

      expect(response.status).toBe(200);
    });

    test('POST /api/buddies/:id/join - should join buddy activity', async () => {
      const response = await request(app)
        .post(`/api/buddies/${buddyId}/join`)
        .set('Authorization', `Bearer ${otherUserToken}`);

      expect(response.status).toBe(200);
    });

    test('GET /api/buddies/:id/participants - should get participants', async () => {
      const response = await request(app)
        .get(`/api/buddies/${buddyId}/participants`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.participants)).toBe(true);
    });

    test('POST /api/buddies/:id/leave - should leave buddy activity', async () => {
      const response = await request(app)
        .post(`/api/buddies/${buddyId}/leave`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
    });

    test('DELETE /api/buddies/:id - should delete buddy', async () => {
      const response = await request(app)
        .delete(`/api/buddies/${buddyId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
    });
  });

  describe('Roommate Routes', () => {
    test('POST /api/roommates - should create roommate request', async () => {
      const response = await request(app)
        .post('/api/roommates')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          preferred_location: 'Downtown',
          budget_min: 500,
          budget_max: 800,
          description: 'Looking for roommate'
        });

      expect(response.status).toBe(201);
      roommateId = response.body.id;
    });

    test('GET /api/roommates - should get all roommate requests', async () => {
      const response = await request(app)
        .get('/api/roommates')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('listings');
      expect(Array.isArray(response.body.listings)).toBe(true);
    });

    test('GET /api/roommates/:id - should get roommate by id', async () => {
      const response = await request(app)
        .get(`/api/roommates/${roommateId}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', roommateId);
    });

    test('PUT /api/roommates/:id - should update roommate request', async () => {
      const response = await request(app)
        .put(`/api/roommates/${roommateId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          budget_max: 900
        });

      expect(response.status).toBe(200);
    });

    test('POST /api/roommates/:id/contact - should contact owner', async () => {
      const response = await request(app)
        .post(`/api/roommates/${roommateId}/contact`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          message: 'Hi, I am interested'
        });

      expect(response.status).toBe(200);
    });

    test('POST /api/roommates/:id/interest - should express interest', async () => {
      const response = await request(app)
        .post(`/api/roommates/${roommateId}/interest`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
    });

    test('DELETE /api/roommates/:id - should delete roommate request', async () => {
      const response = await request(app)
        .delete(`/api/roommates/${roommateId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
    });
  });

  describe('Message Routes', () => {
    test('POST /api/messages - should send message', async () => {
      const response = await request(app)
        .post('/api/messages')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          receiver_id: adminId,
          subject: 'Test message',
          message: 'Hello from test'
        });

      expect(response.status).toBe(201);
    });

    test('GET /api/messages - should get user messages', async () => {
      const response = await request(app)
        .get('/api/messages')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    test('GET /api/messages/conversation/:userId - should get conversation', async () => {
      const response = await request(app)
        .get(`/api/messages/conversation/${adminId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    test('GET /api/messages/unread-count - should get unread count', async () => {
      const response = await request(app)
        .get('/api/messages/unread-count')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('count');
    });

    test('PUT /api/messages/conversation/:userId/read - should mark conversation as read', async () => {
      // First send a general message from admin to user (no related_type/related_id)
      await request(app)
        .post('/api/messages')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          receiver_id: userId,
          subject: 'Test unread message',
          message: 'This should be unread'
        });

      // Check unread count before marking as read
      const unreadBefore = await request(app)
        .get('/api/messages/unread-count')
        .set('Authorization', `Bearer ${authToken}`);

      expect(unreadBefore.status).toBe(200);
      expect(unreadBefore.body.unreadCount).toBeGreaterThan(0);

      // Mark general conversation as read (related_type=general, related_id=0)
      const markReadResponse = await request(app)
        .put(`/api/messages/conversation/${adminId}/read?related_type=general&related_id=0`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(markReadResponse.status).toBe(200);

      // Check unread count after marking as read
      const unreadAfter = await request(app)
        .get('/api/messages/unread-count')
        .set('Authorization', `Bearer ${authToken}`);

      expect(unreadAfter.status).toBe(200);
      expect(unreadAfter.body.unreadCount).toBe(unreadBefore.body.unreadCount - 1);
    });

    test('Multiple conversations from same user - should handle unread counts correctly', async () => {
      // Send a housing-related message (creates one conversation)
      await request(app)
        .post('/api/messages')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          receiver_id: userId,
          subject: 'Housing inquiry',
          message: 'Interested in your apartment',
          related_type: 'housing',
          related_id: 1
        });

      // Send a roommate-related message (creates another conversation)
      await request(app)
        .post('/api/messages')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          receiver_id: userId,
          subject: 'Roommate inquiry',
          message: 'Want to be roommates',
          related_type: 'roommate',
          related_id: 2
        });

      // Check total unread count (should be 2)
      const unreadTotal = await request(app)
        .get('/api/messages/unread-count')
        .set('Authorization', `Bearer ${authToken}`);

      expect(unreadTotal.status).toBe(200);
      expect(unreadTotal.body.unreadCount).toBe(2);

      // Mark housing conversation as read
      const markHousingRead = await request(app)
        .put(`/api/messages/conversation/${adminId}/read?related_type=housing&related_id=1`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(markHousingRead.status).toBe(200);

      // Check unread count after marking housing conversation read (should be 1)
      const unreadAfterHousing = await request(app)
        .get('/api/messages/unread-count')
        .set('Authorization', `Bearer ${authToken}`);

      expect(unreadAfterHousing.status).toBe(200);
      expect(unreadAfterHousing.body.unreadCount).toBe(1);

      // Mark roommate conversation as read
      const markRoommateRead = await request(app)
        .put(`/api/messages/conversation/${adminId}/read?related_type=roommate&related_id=2`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(markRoommateRead.status).toBe(200);

      // Check unread count after marking roommate conversation read (should be 0)
      const unreadAfterRoommate = await request(app)
        .get('/api/messages/unread-count')
        .set('Authorization', `Bearer ${authToken}`);

      expect(unreadAfterRoommate.status).toBe(200);
      expect(unreadAfterRoommate.body.unreadCount).toBe(0);
    });
  });

  describe('Notification Routes', () => {
    test('GET /api/notifications - should get user notifications', async () => {
      const response = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('notifications');
      expect(Array.isArray(response.body.notifications)).toBe(true);
    });

    test('GET /api/notifications/unread-count - should get unread count', async () => {
      const response = await request(app)
        .get('/api/notifications/unread-count')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('unreadCount');
    });
  });

  describe('Admin Routes', () => {
    test('GET /api/admin/stats - should get admin stats', async () => {
      const response = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
    });

    test('GET /api/admin/users - should get all users', async () => {
      const response = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    test('PUT /api/admin/users/:id - should update user', async () => {
      const response = await request(app)
        .put(`/api/admin/users/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Admin Updated Name'
        });

      expect(response.status).toBe(200);
    });

    test('GET /api/admin/housing - should get all housing', async () => {
      const response = await request(app)
        .get('/api/admin/housing')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    test('GET /api/admin/buddies - should get all buddies', async () => {
      const response = await request(app)
        .get('/api/admin/buddies')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });
});
