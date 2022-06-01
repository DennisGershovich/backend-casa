const dbService = require('../../services/db.service')
const logger = require('../../services/logger.service')
const ObjectId = require('mongodb').ObjectId
const asyncLocalStorage = require('../../services/als.service')

async function query(filterBy = {}) {
  
    try {
        const criteria = _buildCriteria(filterBy)
        const collection = await dbService.getCollection('stay')
        const stays = await collection.find(criteria).toArray()
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

        return stays
    } catch (err) {
        logger.error('cannot find stays', err)
        throw err
    }

}

async function getById(stayId) {
  try {
    const collection = await dbService.getCollection('stay');
    const stay = collection.findOne({ _id: ObjectId(stayId) });
    return stay;
  } catch (err) {
    logger.error(`while finding stay ${stayId}`, err);
    throw err;
  }
}

async function remove(stayId) {
    try {
        const store = asyncLocalStorage.getStore()
        const { loggedinUser } = store
        const collection = await dbService.getCollection('review')
        // remove only if user is owner/admin
        const criteria = { _id: ObjectId(reviewId) }
        if (!loggedinUser.isAdmin) criteria.byUserId = ObjectId(loggedinUser._id)
        const {deletedCount} = await collection.deleteOne(criteria)
        return deletedCount
    } catch (err) {
        logger.error(`cannot remove review ${stayId}`, err)
        throw err
    }
}


async function add(stay) {
    try {
        const stayToAdd = {
  
        }
        const collection = await dbService.getCollection('stay')
        await collection.insertOne(stayToAdd)
        return stayToAdd;
    } catch (err) {
        logger.error('cannot insert stay', err)
        throw err
    }
}

async function update(stay) {
  try {
    const collection = await dbService.getCollection('stay');
    collection.updateOne({ _id: stay._id }, { $set: { ...stay } });
    return stay;
  } catch (err) {
    logger.error(`cannot update stay ${stayId}`, err);
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


