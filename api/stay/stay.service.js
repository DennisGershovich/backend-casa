const dbService = require("../../services/db.service")
const logger = require("../../services/logger.service")
const authService=require("../auth/auth.service")
const ObjectId = require("mongodb").ObjectId
const asyncLocalStorage = require("../../services/als.service")

async function query(filterBy = {}) {
  try {
    const criteria = _buildCriteria(filterBy)
    const collection = await dbService.getCollection("stay")
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
    logger.error("cannot find stays", err)
    throw err
  }
}

async function getById(stayId) {
  try {
    const collection = await dbService.getCollection("stay")
    const stay = collection.findOne({ _id: ObjectId(stayId) })
    return stay
  } catch (err) {
    logger.error(`while finding stay ${stayId}`, err)
    throw err
  }
}

async function remove(stayId,loggedInUser) {
  try {
    const collection = await dbService.getCollection("stay")
    // remove only if user is owner/admin
    const criteria = { _id: ObjectId(stayId) }
    if (!loggedInUser.isAdmin) criteria.host = {_id:ObjectId(loggedInUser._id)}
    const { deletedCount } = await collection.deleteOne(criteria)
    return stay
  } catch (err) {
    logger.error(`cannot remove review ${stayId}`, err)
    throw err
  }
}

async function add(stay) {
  try {
    const stayToAdd = {
      name: stay.name,
      summary: stay.summary,
      houseRules: stay.houseRules,
      propertyType: stay.propertyType,
      roomType: stay.roomType,
      capacity: stay.capacity,
      bedrooms: stay.bedrooms,
      beds: stay.beds,
      numOfReviews: 0,
      amenities: stay.amenities,
      address: stay.address,
      host: stay.host,
      bathrooms: stay.bedrooms,
      price: stay.price,
      reviewScores: {
        accuracy: 0,
        cleanliness: 0,
        checkin: 0,
        communication: 0,
        location: 0,
        value: 0,
        rating: 0,
      },
      reviews: [],
      imgUrls: stay.imgUrls,
    }
    const collection = await dbService.getCollection("stay")
    await collection.insertOne(stayToAdd)
    return stayToAdd
  } catch (err) {
    logger.error("cannot insert stay", err)
    throw err
  }
}

async function update(stay) {
  try {
    const collection = await dbService.getCollection("stay")
    collection.updateOne({ _id: stay._id }, { $set: { ...stay } })
    return stay
  } catch (err) {
    logger.error(`cannot update stay ${stayId}`, err)
    throw err
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
  update,
}
