const express = require('express');
const router = express.Router();
const axios = require('axios');
const auth = require('../middleware/auth');

// @GET /api/food/search?q=apple
router.get('/search', auth, async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ success: false, message: 'Query required' });
  try {
    const response = await axios.get('https://world.openfoodfacts.org/cgi/search.pl', {
      params: {
        search_terms: q,
        search_simple: 1,
        action: 'process',
        json: 1,
        page_size: 10,
        fields: 'product_name,brands,nutriments,image_small_url,quantity,serving_size'
      },
      timeout: 8000
    });
    const products = (response.data.products || [])
      .filter(p => p.product_name && p.nutriments)
      .map(p => ({
        id: p.code,
        name: p.product_name,
        brand: p.brands || '',
        image: p.image_small_url || null,
        servingSize: p.serving_size || '100g',
        nutrition: {
          calories: Math.round(p.nutriments['energy-kcal_100g'] || p.nutriments['energy-kcal'] || 0),
          protein:  parseFloat((p.nutriments.proteins_100g  || 0).toFixed(1)),
          carbs:    parseFloat((p.nutriments.carbohydrates_100g || 0).toFixed(1)),
          fat:      parseFloat((p.nutriments.fat_100g        || 0).toFixed(1)),
          fiber:    parseFloat((p.nutriments.fiber_100g      || 0).toFixed(1)),
          sugar:    parseFloat((p.nutriments.sugars_100g     || 0).toFixed(1)),
          sodium:   parseFloat((p.nutriments.sodium_100g     || 0).toFixed(2))
        }
      }));
    res.json({ success: true, products });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Food search failed', error: err.message });
  }
});

// @GET /api/food/barcode/:code
router.get('/barcode/:code', auth, async (req, res) => {
  try {
    const response = await axios.get(
      `https://world.openfoodfacts.org/api/v0/product/${req.params.code}.json`,
      { timeout: 8000 }
    );
    if (response.data.status !== 1)
      return res.status(404).json({ success: false, message: 'Product not found' });
    const p = response.data.product;
    res.json({
      success: true,
      product: {
        id: req.params.code,
        name: p.product_name || 'Unknown',
        brand: p.brands || '',
        image: p.image_small_url || null,
        nutrition: {
          calories: Math.round(p.nutriments?.['energy-kcal_100g'] || 0),
          protein:  parseFloat((p.nutriments?.proteins_100g || 0).toFixed(1)),
          carbs:    parseFloat((p.nutriments?.carbohydrates_100g || 0).toFixed(1)),
          fat:      parseFloat((p.nutriments?.fat_100g || 0).toFixed(1)),
          fiber:    parseFloat((p.nutriments?.fiber_100g || 0).toFixed(1)),
          sugar:    parseFloat((p.nutriments?.sugars_100g || 0).toFixed(1)),
          sodium:   parseFloat((p.nutriments?.sodium_100g || 0).toFixed(2))
        }
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
