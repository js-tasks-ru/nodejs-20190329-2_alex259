const Message = require('../models/Message');

module.exports = async function messages(ctx, next) {
  let messages = [];
  await Message.find({})
    .populate('user')
    .sort({date: -1})
    .limit(20)
    .then(msgs => {
      msgs.forEach(msg => 
        messages.push({
          "date": msg.date,
          "text": msg.text,
          "id":   msg._id,
          "user": msg.user.displayName
        })
      )
    });

  ctx.body = {messages};
};
