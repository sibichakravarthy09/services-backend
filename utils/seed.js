// utils/seed.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Service = require('../models/Service');
const User = require('../models/User');
const Booking = require('../models/Booking');

dotenv.config();

// Sample Services Data
const services = [
  {
    name: 'Basic Car Wash',
    description: 'Exterior wash, interior vacuum, tire shine, and window cleaning. Perfect for regular maintenance.',
    category: 'car_wash',
    price: 29.99,
    duration: 30,
    image: 'car-wash-basic.jpg',
    isActive: true
  },
  {
    name: 'Premium Car Detailing',
    description: 'Complete interior and exterior detailing with wax coating, leather conditioning, and engine cleaning.',
    category: 'car_wash',
    price: 99.99,
    duration: 120,
    image: 'car-wash-premium.jpg',
    isActive: true
  },
  {
    name: 'Express Car Wash',
    description: 'Quick exterior wash and dry. Great for when you\'re in a hurry!',
    category: 'car_wash',
    price: 15.99,
    duration: 15,
    image: 'car-wash-express.jpg',
    isActive: true
  },
  {
    name: 'Deep Home Cleaning',
    description: 'Thorough cleaning of all rooms including kitchen, bathrooms, bedrooms, and living areas.',
    category: 'home_cleaning',
    price: 149.99,
    duration: 180,
    image: 'home-cleaning-deep.jpg',
    isActive: true
  },
  {
    name: 'Basic Home Cleaning',
    description: 'Standard cleaning service covering dusting, vacuuming, and mopping of main areas.',
    category: 'home_cleaning',
    price: 79.99,
    duration: 120,
    image: 'home-cleaning-basic.jpg',
    isActive: true
  },
  {
    name: 'Kitchen Deep Clean',
    description: 'Specialized kitchen cleaning including appliances, cabinets, and countertops.',
    category: 'home_cleaning',
    price: 89.99,
    duration: 90,
    image: 'kitchen-cleaning.jpg',
    isActive: true
  },
  {
    name: 'Haircut & Styling',
    description: 'Professional haircut with styling consultation and blow-dry.',
    category: 'salon',
    price: 35.00,
    duration: 45,
    image: 'salon-haircut.jpg',
    isActive: true
  },
  {
    name: 'Hair Coloring',
    description: 'Full hair coloring service with professional products and color consultation.',
    category: 'salon',
    price: 89.99,
    duration: 120,
    image: 'salon-color.jpg',
    isActive: true
  },
  {
    name: 'Spa Facial Package',
    description: 'Relaxing facial treatment with cleansing, exfoliation, and moisturizing.',
    category: 'salon',
    price: 79.99,
    duration: 60,
    image: 'salon-facial.jpg',
    isActive: true
  },
  {
    name: 'Full Spa Package',
    description: 'Complete spa experience with massage, facial, and body treatment.',
    category: 'salon',
    price: 199.99,
    duration: 150,
    image: 'salon-spa.jpg',
    isActive: true
  }
];

// Admin user only (password in plain text)
const adminUser = {
  name: 'Admin User',
  email: 'admin@servicebooking.com',
  password: 'admin123',
  phone: '+1234567890',
  role: 'admin'
};

// Seed function
const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');

    // Clear existing services and bookings (keep users)
    await Service.deleteMany();
    await Booking.deleteMany();
    console.log('🗑️ Cleared services and bookings');

    // Insert services
    const createdServices = await Service.insertMany(services);
    console.log(`✅ ${createdServices.length} Services seeded`);

    // Handle admin user
    const existingAdmin = await User.findOne({ email: adminUser.email });
    if (!existingAdmin) {
      await User.create(adminUser); // ← do NOT hash manually
      console.log('✅ Admin user created');
    } else {
      console.log('⚠️ Admin already exists, skipping creation');
    }

    console.log('\n🎉 Database seeded successfully!');
    console.log('📝 Admin Login Credentials:');
    console.log('👤 Email: admin@servicebooking.com');
    console.log('👤 Password: admin123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding Error:', error);
    process.exit(1);
  }
};

// Run seeder
seedDatabase();
