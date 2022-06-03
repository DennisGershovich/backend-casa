const dbService = require("../../services/db.service")
const logger = require("../../services/logger.service")
const ObjectId = require("mongodb").ObjectId
const asyncLocalStorage = require("../../services/als.service")

async function query(filterBy = {}) {
  try {
    const criteria = _buildCriteria(filterBy)
    const collection = await dbService.getCollection("order")
    let orders = await collection
      .aggregate([
        { $match: criteria },
        {
          $lookup: {
            localField: "stayId",
            from: "stay",
            foreignField: "_id",
            as: "stay",
          },
        },
        {
          $unwind: "$stay",
        },
        {
          $lookup: {
            localField: "userId",
            from: "user",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $unwind: "$user",
        },
      ])
      .toArray()
    orders = orders.map((order) => {
      order.user = {
        _id: order.user._id,
        fullname: order.user.fullname,
        imgUrl: order.user.imgUrl,
      }
      delete order.userId
      delete order.stayId
      delete order.hostId
      return order
    })
    return orders
  } catch (err) {
    logger.error("cannot find orders", err)
    throw err
  }
}

async function getById(orderId) {
  try {
    const collection = await dbService.getCollection("order")
    const order = await collection.findOne({ _id: ObjectId(orderId) })
    return order
  } catch (err) {
    logger.error(`while finding order ${orderId}`, err)
    throw err
  }
}

async function remove(orderId,loggedInUser) {
  try {
    const collection = await dbService.getCollection("order")
    // remove only if user is owner/admin
    const criteria = { _id: ObjectId(orderId) }
    criteria.userId = ObjectId(loggedInUser._id)
    const { deletedCount } = await collection.deleteOne(criteria)
    return deletedCount
  } catch (err) {
    logger.error(`cannot remove order ${orderId}`, err)
    throw err
  }
}

async function add(order) {
  try {
    const orderToAdd = {
      startDate: order.startDate,
      endDate: order.endDate,
      userId: ObjectId(order.byUserId),
      stayId: ObjectId(order.stayId),
      hostId: order.hostId,
      status: "pending",
    }
    const collection = await dbService.getCollection("order")
    await collection.insertOne(orderToAdd)
    return orderToAdd
  } catch (err) {
    logger.error("cannot insert order", err)
    throw err
  }
}

async function update(order) {
  try {
    const orderToSave = {
            _id: ObjectId(order._id), 
            status: order.status,
            startDate: order.startDate,
            endDate: order.endDate,
        }
    const collection = await dbService.getCollection("order")
    await collection.updateOne({ _id: ObjectId(order._id) }, { $set: { ...orderToSave } })
    return order
  } catch (err) {
    logger.error(`cannot update order ${orderId}`, err)
    throw err
  }
}

function _buildCriteria(filterBy) {
  console.log(filterBy);
  const criteria = {}
  if (filterBy.hostId) {
    criteria.hostId =filterBy.hostId
  }
  if (filterBy.userId) {
    criteria.userId = ObjectId(filterBy.userId)
  }
  if (filterBy.stayId) {
    criteria.stayId = ObjectId(filterBy.stayId)
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
