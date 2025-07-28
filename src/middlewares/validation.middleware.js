export default (schema) => (req, res, next) => {
  console.log('=== Validation Middleware ===');
  console.log('Request Body:', JSON.stringify(req.body, null, 2));
  
  const { error } = schema.validate(req.body);
  if (error) {
    console.log('Validation Error:', error.details[0].message);
    console.log('Full error details:', error.details);
    return res.status(400).json({ message: error.details[0].message });
  }
  
  console.log('Validation passed');
  next();
}; 