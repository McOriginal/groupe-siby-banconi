const app = require('./app');
const connectToDatabase = require('./config/db');

require('dotenv').config();

// ######### connexion au PORT par defaut ##################
const PORT = process.env.PORT || 5000;

// ########### Execution de mongoose Connexion ##################
connectToDatabase();

// ############# Listen to APP ##############################
app.listen(PORT, () => {
  console.log(`Connexion au port: ${PORT}`);
});
