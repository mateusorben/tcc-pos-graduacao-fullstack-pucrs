const express = require('express');
const router = express.Router();
const authMiddleware = require('./auth');

// Controllers
const UserController = require('./controllers/UserController');
const ProductController = require('./controllers/ProductController');
const CategoryController = require('./controllers/CategoryController');
const DashboardController = require('./controllers/DashboardController');
const StorageLocationController = require('./controllers/StorageLocationController');

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

// Batches
router.get('/products/:id/batches', authMiddleware, ProductController.getBatches);
router.post('/products/:id/batches', authMiddleware, ProductController.addBatch);
router.put('/products/:id/batches/:batchId', authMiddleware, ProductController.updateBatch);
router.delete('/products/:id/batches/:batchId', authMiddleware, ProductController.deleteBatch);

// --- CATEGORIES ---
router.get('/categories', authMiddleware, CategoryController.getCategories);
router.post('/categories', authMiddleware, CategoryController.createCategory);

// --- SHOPPING LIST ---
router.get('/shopping-list', authMiddleware, ProductController.getShoppingList);

// --- DASHBOARD ---
router.get('/dashboard/stats', authMiddleware, DashboardController.getStats);

// --- STORAGE LOCATIONS ---
router.get('/storage-locations', authMiddleware, StorageLocationController.getAll);
router.post('/storage-locations', authMiddleware, StorageLocationController.create);
router.put('/storage-locations/:id', authMiddleware, StorageLocationController.update);
router.delete('/storage-locations/:id', authMiddleware, StorageLocationController.delete);

module.exports = router;