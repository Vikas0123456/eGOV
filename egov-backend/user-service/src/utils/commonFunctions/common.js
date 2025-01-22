const axios = require("axios");
const bcrypt = require("bcryptjs");

const getblockedDomainsCheck = async (email) => {
  const returnObject = {
    SiteId:  process.env.NMAIL_SITE_ID, // Define Site ID
    SiteTocken: process.env.NMAIL_SITE_TOCKEN, // Define SiteKey
  };

  const headers = {
    Authorization:
    process.env.NMAIL_HEADER_TOKEN,
  }; 
  try {
    const response = await axios.post(
      process.env.NMAIL_BLOCKED_API_URL,
      returnObject,
      {
        headers,
      }
    );

    const blockedData = response.data;
    // Check if the email or its domain is in the blocked lists
    const isEmailBlocked = blockedData.blockemail.includes(email);
    const isDomainBlocked = blockedData.blockdomain.some((blockedDomain) =>
      email.endsWith(blockedDomain)
    );

    if (isEmailBlocked || isDomainBlocked) {
      if (isEmailBlocked) {
        return {
          status: "blocked",
          message: "email",
        };
      } else {
        return {
          status: "blocked",
          message: "domain",
        };
      }
    }
    return {
      status: false,
      message: "Email is not blocked.",
    };
  } catch (error) {
    console.error(error);
  }
};
const generateHashPassword = async (password) => {
  const saltRounds = 10;
  const hash = await bcrypt.hash(password, saltRounds);
  return hash;
};

const decryptPassword = async (plaintextPassword, hashedPassword) => {
  try {
    // Compare plaintext password with hashed password
    const match = await bcrypt.compare(plaintextPassword, hashedPassword);

    // Return true if passwords match, false otherwise
    return match;
  } catch (error) {
    // Handle error
    console.error("Error decrypting password:", error);
    throw error;
  }
};



module.exports = {
  getblockedDomainsCheck,
  generateHashPassword,
  decryptPassword,
};
