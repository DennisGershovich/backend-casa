const dbService = require('../../services/db.service')
const logger = require('../../services/logger.service')
const ObjectId = require('mongodb').ObjectId
const asyncLocalStorage = require('../../services/als.service')

async function query(filterBy = {}) {
  
    try {
        const criteria = _buildCriteria(filterBy)
        const collection = await dbService.getCollection('order')
        const orders = await collection.find(criteria).toArray()
        // var stays = await collection.aggregate([
        // //     {
        // //         $match: criteria
        // //     },
        // //     {
        // //         $lookup:
        // //         {
        // //             localField: 'byUserId',
        // //             from: 'user',
        // //             foreignField: '_id',
        // //             as: 'byUser'
        // //         }
        // //     },
        // //     {
        // //         $unwind: '$byUser'
        // //     },
        // //     {
        // //         $lookup:
        // //         {
        // //             localField: 'aboutUserId',
        // //             from: 'user',
        // //             foreignField: '_id',
        // //             as: 'aboutUser'
        // //         }
        // //     },
        // //     {
        // //         $unwind: '$aboutUser'
        // //     }
        // // ]).toArray()
        // // reviews = reviews.map(review => {
        // //     review.byUser = { _id: review.byUser._id, fullname: review.byUser.fullname }
        // //     review.aboutUser = { _id: review.aboutUser._id, fullname: review.aboutUser.fullname }
        // //     delete review.byUserId
        // //     delete review.aboutUserId
        // //     return review
        // // })

        return orders
    } catch (err) {
        logger.error('cannot find orders', err)
        throw err
    }

}

async function getById(orderId) {
  try {
    const collection = await dbService.getCollection('order');
    const order = collection.findOne({ _id: ObjectId(orderId) });
    return order;
  } catch (err) {
    logger.error(`while finding order ${orderId}`, err);
    throw err;
  }
}

async function remove(orderId) {
    try {
        const store = asyncLocalStorage.getStore()
        const { loggedinUser } = store
        const collection = await dbService.getCollection('order')
        // remove only if user is owner/admin
        const criteria = { _id: ObjectId(orderId) }
        if (!loggedinUser.isAdmin) criteria.byUserId = ObjectId(loggedinUser._id)
        const {deletedCount} = await collection.deleteOne(criteria)
        return deletedCount
    } catch (err) {
        logger.error(`cannot remove order ${orderId}`, err)
        throw err
    }
}


async function add(order) {
    try {
        const orderToAdd = {
  
        }
        const collection = await dbService.getCollection('order')
        await collection.insertOne(orderToAdd)
        return orderToAdd;
    } catch (err) {
        logger.error('cannot insert order', err)
        throw err
    }
}

async function update(orderId) {
  try {
    const collection = await dbService.getCollection('order');
    collection.updateOne({ _id: order._id }, { $set: { ...order } });
    return order;
  } catch (err) {
    logger.error(`cannot update order ${orderId}`, err);
    throw err;
  }
}

function _buildCriteria(filterBy) {
    const criteria = {}
    return criteria
}

module.exports = {
    query,
    remove,
    add,
    getById,
    update
}


