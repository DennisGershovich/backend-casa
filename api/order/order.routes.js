const express = require('express')
const {requireAuth} = require('../../middlewares/requireAuth.middleware')
const {log} = require('../../middlewares/logger.middleware')
//const {addStay, getStays, deleteStay,getStayById,updateStay} = require('./stay.controller')
const router = express.Router()

router.get('/', log, getOrder)
router.get('/:orderId', getOrderById)
router.post('/',  log, requireAuth, addOrder)
router.put('/:orderId', requireAuth , updateOrder)
router.delete('/:id',  requireAuth, deleteOrder)

module.exports = router