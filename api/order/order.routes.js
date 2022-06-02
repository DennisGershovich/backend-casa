const express = require('express')
const {requireAuth} = require('../../middlewares/requireAuth.middleware')
const {log} = require('../../middlewares/logger.middleware')
const {getOrders,deleteOrder,addOrder,getOrderById,updateOrder} = require('./order.controller')
const router = express.Router()

router.get('/', log, getOrders)
router.get('/:orderId', getOrderById)
router.post('/',  log, requireAuth, addOrder)
router.put('/:orderId', requireAuth , updateOrder)
router.delete('/:orderId',  requireAuth, deleteOrder)

module.exports = router