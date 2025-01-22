const express = require('express');
const { getAuditLog, getAllModules, createAuditLog } = require('../controllers/auditLogController');
const router = express.Router();

router.post('/create', createAuditLog);
router.post('/get', getAuditLog);
router.post('/list',getAllModules)

module.exports = router;
