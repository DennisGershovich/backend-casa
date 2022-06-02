const logger = require('../../services/logger.service')
const userService = require('../user/user.service')
const authService = require('../auth/auth.service')
const socketService = require('../../services/socket.service')
const stayService = require('./stay.service')

async function getStays(req, res) {
    try {
        const stays = await stayService.query(req.query)
        res.send(stays)
    } catch (err) {
        logger.error('Cannot get stays', err)
        res.status(500).send({ err:'Failed to get stays' })
    }
}

// GET BY ID 
async function getStayById(req, res) {
  try {
    const {stayId} = req.params
    const stay = await stayService.getById(stayId)
    res.json(stay)
  } catch (err) {
    logger.error('Failed to get stay', err)
    res.status(500).send({ err: 'Failed to get stay' })
  }
}


async function deleteStay(req, res) {
  var loggedInUser = authService.validateToken(req.cookies.loginToken)
    try {
        const deletedCount = await stayService.remove(req.params.stayId,loggedInUser)
        if (deletedCount === 1) {
            res.send({ msg: 'Deleted successfully' })
        } else {
            res.status(400).send({ err: 'Cannot remove stay' })
        }
    } catch (err) {
        logger.error('Failed to delete stay', err)
        res.status(500).send({ err: 'Failed to delete stay' })
    }
}


async function addStay(req, res) {
    var loggedinUser = authService.validateToken(req.cookies.loginToken)

    try {
        var stay = req.body
        stay.host = await userService.getById(loggedinUser._id)
        const newStay = await stayService.add(stay)

        // socketService.broadcast({type: 'review-added', data: review, userId: review.byUserId})
        // socketService.emitToUser({type: 'review-about-you', data: review, userId: review.aboutUserId})
        
        // const fullUser = await userService.getById(loggedinUser._id)
        // socketService.emitTo({type: 'user-updated', data: fullUser, label: fullUser._id})

        res.json(newStay)

    } catch (err) {
        console.log(err)
        logger.error('Failed to add stay', err)
        res.status(500).send({ err: 'Failed to add stay' })
    }
}

// Update stay
async function updateStay(req, res) {
  try {
    const stay = req.body;
    const updatedStay = await stayService.update(stay)
    res.json(updatedStay)
  } catch (err) {
    logger.error('Failed to update stay', err)
    res.status(500).send({ err: 'Failed to update stay' })

  }
}

module.exports = {
    getStays,
    deleteStay,
    addStay,
    getStayById,
    updateStay
}