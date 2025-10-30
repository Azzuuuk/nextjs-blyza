// data/gameCategories.js - Game category mappings for Local Play filtering

// Map existing categories to new subcategory system
const CATEGORY_MAPPING = {
  "Social & Deception": "social_interception",
  "Brain Busters": "brain_busters", 
  "Quickfire": "quick_fire"
};

// Subcategory display names
export const SUBCATEGORIES = {
  brain_busters: "Brain Busters",
  social_interception: "Social Interception", 
  quick_fire: "Quick Fire"
};

// Map each game to its subcategory
export const GAME_CATEGORIES = {
  1: "social_interception",   // Guess the Price
  2: "social_interception",   // Meme or Real
  3: "brain_busters",         // Real or AI
  4: "brain_busters",         // Odd One Out
  5: "social_interception",   // Fact or Cap
  6: "social_interception",   // Hot Takes
  7: "quick_fire",            // This or That
  8: "social_interception",   // Would You Rather
  9: "quick_fire",            // Rapid Fire Riddles
  10: "quick_fire",           // Quick Math
  11: "quick_fire",           // Speed Sort
  12: "brain_busters",        // Pattern Pro
  13: "brain_busters",        // Logic Puzzles
  14: "quick_fire",           // Word Lightning
  15: "quick_fire",           // Number Ninja
  16: "brain_busters",        // Mind Bender
  17: "brain_busters",        // Think Tank
  18: "quick_fire"            // Flash Reflexes (assuming game 18 exists)
};

// Get subcategory for a game
export function getGameSubcategory(gameId) {
  return GAME_CATEGORIES[gameId] || "brain_busters";
}

// Filter games by subcategory
export function filterGamesBySubcategory(games, subcategory) {
  if (subcategory === "all") {
    return games;
  }
  
  return games.filter(game => getGameSubcategory(game.id) === subcategory);
}
