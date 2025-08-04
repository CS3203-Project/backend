/**
 * Validation middleware that can validate different parts of the request
 * @param {Object} schema - Joi validation schema
 * @param {string} source - Source to validate: 'body', 'query', 'params' (default: 'body')
 */
export default (schema, source = 'body') => (req, res, next) => {
  console.log(`=== Validation Middleware (${source}) ===`);
  
  let dataToValidate;
  switch (source) {
    case 'query':
      dataToValidate = req.query;
      break;
    case 'params':
      dataToValidate = req.params;
      break;
    case 'body':
    default:
      dataToValidate = req.body;
      break;
  }
  
  console.log(`${source.charAt(0).toUpperCase() + source.slice(1)} data:`, JSON.stringify(dataToValidate, null, 2));
  
  const { error, value } = schema.validate(dataToValidate, { 
    abortEarly: false,
    allowUnknown: false,
    stripUnknown: true
  });
  
  if (error) {
    console.log('Validation Error:', error.details[0].message);
    console.log('Full error details:', error.details);
    
    return res.status(400).json({ 
      success: false,
      message: 'Validation failed',
      errors: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    });
  }
  
  // Replace the validated data with the sanitized version
  switch (source) {
    case 'query':
      req.query = value;
      break;
    case 'params':
      req.params = value;
      break;
    case 'body':
    default:
      req.body = value;
      break;
  }
  
  console.log('Validation passed');
  next();
}; 

