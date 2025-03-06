require('dotenv').config(); // Load environment variables
require('./config/database')
const app = require('./app-server'); // Adjust the path if necessary
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    const PORT = process.env.PORT || 6003;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(error => {
    console.error('Error connecting to MongoDB:', error);
  });
