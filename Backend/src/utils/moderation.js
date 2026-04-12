const badWords = [
  'abuse', 'offensive', 'adult', 'badword1', 'badword2', // Add real bad words here or use a library
  'inhibit', 'harassment', 'sexual'
];

/**
 * Basic content moderation using a word-list filter.
 * Returns true if clean, false if abusive content found.
 */
const checkAbusiveContent = (text) => {
  if (!text) return true;
  
  const normalizedText = text.toLowerCase();
  
  // Simple word check
  const isAbusive = badWords.some(word => normalizedText.includes(word));
  
  return !isAbusive;
};

module.exports = {
  checkAbusiveContent
};
