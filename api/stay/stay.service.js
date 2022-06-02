const dbService = require("../../services/db.service")
const logger = require("../../services/logger.service")
const authService = require("../auth/auth.service")
const ObjectId = require("mongodb").ObjectId
const asyncLocalStorage = require("../../services/als.service")

async function query(filterBy = {}) {
  try {
    const criteria = _buildCriteria(filterBy)
    const collection = await dbService.getCollection("stay")
    const stays = await collection.find(criteria).toArray()
    return stays
  } catch (err) {
    logger.error("cannot find stays", err)
    throw err
  }
}

async function getById(stayId) {
  try {
    const collection = await dbService.getCollection("stay")
    const stay = await collection.findOne({ _id: ObjectId(stayId) })
    return stay
  } catch (err) {
    logger.error(`while finding stay ${stayId}`, err)
    throw err
  }
}

async function remove(stayId, loggedInUser) {
  try {
    const collection = await dbService.getCollection("stay")
    const criteria = { _id: ObjectId(stayId) }
    if (!loggedInUser.isAdmin) criteria["host._id"] = ObjectId(loggedInUser._id)
    const { deletedCount } = await collection.deleteOne({ $and: [criteria] })
    return deletedCount
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
    const updatedStay = {
      ...stay,
      _id: ObjectId(stay._id),
    }
    collection.updateOne({ _id: ObjectId(stay._id) }, { $set: updatedStay })
    return stay
  } catch (err) {
    logger.error(`cannot update stay ${stayId}`, err)
    throw err
  }
}

function _buildCriteria(filterBy) {
  let criteria = { $and: [{}] }
  if (filterBy.stayLocation) {
    const regexLocation = new RegExp(filterBy.stayLocation, "i")
    criteria.$and.push({
      $or: [
        { "address.country": { $regex: regexLocation } },
        { "address.street": { $regex: regexLocation } },
        { "address.city": { $regex: regexLocation } },
      ],
    })
  }
  if (filterBy.label) {
    const regexLabel = new RegExp(filterBy.label, "i")
    criteria.$and.push({
      $or: [
        { name: { $regex: regexLabel } },
        { summary: { $regex: regexLabel } },
        { amenities: { $regex: regexLabel } },
      ],
    })
  }
  return criteria
}

module.exports = {
  query,
  remove,
  add,
  getById,
  update,
}
