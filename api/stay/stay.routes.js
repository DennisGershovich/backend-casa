const express = require('express')
const {requireAuth} = require('../../middlewares/requireAuth.middleware')
const {log} = require('../../middlewares/logger.middleware')
const {addStay, getStays, deleteStay,getStayById,updateStay} = require('./stay.controller')
const router = express.Router()

// middleware that is specific to this router
//router.use(requireAuth)

router.get('/', log, getStays)
router.get('/:stayId', getStayById)
router.post('/',  log, requireAuth, addStay)
router.put('/:stayId', requireAuth , updateStay)
router.delete('/:stayId',  requireAuth, deleteStay)

module.exports = router