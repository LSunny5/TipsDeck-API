const CategoriesService = {
    getAllCategories (knex) {
      return knex.select('*').from('tipsdeck_categories');
    },

    getById(knex, id) {
      return knex.from('tipsdeck_categories').select('*').where('id', id).first()
    },

    insertCategory(knex, newCategory) {
      return knex
        .insert(newCategory)
        .into('tipsdeck_categories')
        .returning('*')
        .then(rows => {
          return rows[0]
        })
    },

    deleteCategory(knex, id) {
      return knex('tipsdeck_categories')
        .where({ id })
        .delete()
    },

    updateCategory(knex, id, newCategoryField) {
      return knex('tipsdeck_categories')
        .where({ id })
        .update(newCategoryField)
    },
  }
  
  module.exports = CategoriesService