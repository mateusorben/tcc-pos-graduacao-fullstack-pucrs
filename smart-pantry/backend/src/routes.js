const express = require('express');
const router = express.Router();
const authMiddleware = require('./auth');

// Controllers
const UserController = require('./controllers/UserController');
const ProductController = require('./controllers/ProductController');
const CategoryController = require('./controllers/CategoryController');
const DashboardController = require('./controllers/DashboardController');

const authLimiter = require('./middlewares/authLimiter');
const { validateRegister, validateLogin } = require('./middlewares/validators');

// --- AUTH / USER ---
router.post('/login', authLimiter, validateLogin, UserController.login);
router.post('/users', authLimiter, validateRegister, UserController.register);
router.put('/users', authMiddleware, UserController.updateProfile);
router.post('/logout', UserController.logout);

// --- SUBSCRIPTIONS ---
router.get('/vapid-public-key', UserController.getVapidKey);
router.post('/subscribe', authMiddleware, UserController.subscribe);

// --- PRODUCTS ---
router.get('/products', authMiddleware, ProductController.getProducts);
router.post('/products', authMiddleware, ProductController.createProduct);
router.put('/products/:id', authMiddleware, ProductController.updateProduct);
router.delete('/products/:id', authMiddleware, ProductController.deleteProduct);
router.patch('/products/:id/quantity', authMiddleware, ProductController.updateQuantity);

// --- CATEGORIES ---
router.get('/categories', authMiddleware, CategoryController.getCategories);
router.post('/categories', authMiddleware, CategoryController.createCategory);

// --- SHOPPING LIST ---
router.get('/shopping-list', authMiddleware, ProductController.getShoppingList);

// --- DASHBOARD ---
router.get('/dashboard/stats', authMiddleware, DashboardController.getStats);

module.exports = router;