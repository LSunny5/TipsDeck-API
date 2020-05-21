const logger = require('../src/logger');

function getTipValidationError({ tipname, sourcetitle, rating, numraters }) {
    if (tipname && (tipname.length < 3 || tipname.length > 100)) {
		logger.error(`Invalid name for tip '${tipname}' given`);
		return {
			error: {
				message: `Tip name must be greater than 3 and less than 100 characters`
			}
		};
	}

	if (sourcetitle && (sourcetitle.length < 3 || sourcetitle.length > 100)) {
		logger.error(`Invalid source title for tip '${tipname}' given`);
		return {
			error: {
				message: `Source title must be greater than 3 and less than 100 characters`
			}
		};
	}
	
	if (rating && (rating < 0 || rating > 5) && (num.toString().split('.')[1].length > 1)) {
		logger.error(`You have given an invalid rating`);
		return {
			error: {
				message: `Rating must be > 0, less than or equal to 5, and have one decimal place.`
			}
		};
	}

	if (Number.isInteger(numraters)) {
		logger.error(`You have given an invalid number of raters`);
		return {
			error: {
				message: `Number of raters must be a positive integer.`
			}
		};
	}
}

module.exports = {
	getTipValidationError
}