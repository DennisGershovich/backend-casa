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
    try {
        const deletedCount = await stayService.remove(req.params.id)
        if (deletedCount === 1) {
            res.send({ msg: 'Deleted successfully' })
        } else {
            res.status(400).send({ err: 'Cannot remove review' })
        }
    } catch (err) {
        logger.error('Failed to delete review', err)
        res.status(500).send({ err: 'Failed to delete review' })
    }
}


async function addStay(req, res) {

    var loggedinUser = authService.validateToken(req.cookies.loginToken)
 
    try {
        var review = req.body
        review.byUserId = loggedinUser._id
        review = await stayService.add(review)
        
        // prepare the updated review for sending out
        review.aboutUser = await userService.getById(review.aboutUserId)
        
        // Give the user credit for adding a review
        // var user = await userService.getById(review.byUserId)
        // user.score += 10
        loggedinUser.score += 10

        loggedinUser = await userService.update(loggedinUser)
        review.byUser = loggedinUser

        // User info is saved also in the login-token, update it
        const loginToken = authService.getLoginToken(loggedinUser)
        res.cookie('loginToken', loginToken)


        socketService.broadcast({type: 'review-added', data: review, userId: review.byUserId})
        socketService.emitToUser({type: 'review-about-you', data: review, userId: review.aboutUserId})
        
        const fullUser = await userService.getById(loggedinUser._id)
        socketService.emitTo({type: 'user-updated', data: fullUser, label: fullUser._id})

        res.send(review)

    } catch (err) {
        console.log(err)
        logger.error('Failed to add review', err)
        res.status(500).send({ err: 'Failed to add review' })
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