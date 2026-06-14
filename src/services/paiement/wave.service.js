const axios = require("axios");

class WaveService {
  static async createPayment({ amount }) {
    const response = await axios.post(
      "https://api.wave.com/checkout/session",
      {
        amount,
        currency: "XOF",
        success_url: "https://ton-site.com/success",
        error_url: "https://ton-site.com/error"
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.WAVE_SECRET_KEY}`
        }
      }
    );

    return response.data;
  }
}

module.exports = WaveService;