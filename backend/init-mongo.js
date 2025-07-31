// MongoDB initialization script
db = db.getSiblingDB('easybook');

// Create collections
db.createCollection('users');
db.createCollection('services');
db.createCollection('bookings');

// Create indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "role": 1 });

db.services.createIndex({ "type": 1 });
db.services.createIndex({ "location": 1 });
db.services.createIndex({ "isActive": 1 });

db.bookings.createIndex({ "userId": 1 });
db.bookings.createIndex({ "serviceId": 1 });
db.bookings.createIndex({ "time": 1 });
db.bookings.createIndex({ "status": 1 });

print('MongoDB database "easybook" initialized successfully!'); 