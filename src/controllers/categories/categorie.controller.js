const CategorieService = require('../../services/categories/categorie.service');

class CategorieController {

  static async getAllCategories(req, res) {
    try {
      const result = await CategorieService.getAllCategories();
      return res.status(200).json({ success: true, ...result });
    } catch (err) {
      console.error('Erreur getAllCategories:', err);
      return res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  }

  static async getCategorieById(req, res) {
    try {
      const { id } = req.params;
      const result = await CategorieService.getCategorieById(id);
      return res.status(200).json({ success: true, ...result });
    } catch (err) {
      console.error('Erreur getCategorieById:', err);
      const status = err.message === 'Catégorie introuvable' ? 404 : 500;
      return res.status(status).json({ success: false, message: err.message });
    }
  }
}

module.exports = CategorieController;
