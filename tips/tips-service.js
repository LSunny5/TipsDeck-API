const TipsService = {
    getAllTips(knex) {
      return knex.select('*').from('tipsdeck_tips')
    },
    getById(knex, id) {
      return knex.from('tipsdeck_tips').select('*').where('id', id).first()
    },
    insertTip(knex, newTip) {
      return knex
        .insert(newTip)
        .into('tipsdeck_tips')
        .returning('*')
        .then(rows => {
          return rows[0]
        })
    },
    deleteTip(knex, id) {
      return knex('tipsdeck_tips')
        .where({ id })
        .delete()
    },
    updateTip(knex, id, newTipFields) {
      return knex('tipsdeck_tips')
        .where({ id })
        .update(newTipFields)
    },
  }
  
  module.exports = TipsService;
