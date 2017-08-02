const Papa = require("papaparse");
const _ = require("lodash");
const fs = require("fs");

//recipes is dictionary, get recipe by recipes[num] (num is the key)
//and then to get the objects within the recipe use .[ObjetName]
//Description has Name, Directions, Time, People
//Ingredients contains all of the Ingredients
const recipes = [];

function parseFile(file) {
  let allRecipeIngredients = [];
  let recipeDirections = {};
  let fileTypeIngredients = false;
  if (file.includes("ingredients")) {
    fileTypeIngredients = true;
  }
  const num = parseInt(file.substr(6, 1));

  const content = fs.readFileSync(file).toString();
  Papa.parse(content, {
    header: true,
    dynamicTyping: true,
    delimiter: "\n",
    complete: function (results) {
      _.chain(results.data)
        .filter(entry => !!entry[Object.keys(entry)[0]])
        .map(entry => {
          if (fileTypeIngredients) {
            // entry = console.log("key: ", Object.keys(entry)[1],
            //   "\nvalue: ", entry[Object.keys(entry)[1]]);
            const recipeIngredientRow = {
              Amount: entry[Object.keys(entry)[0]],
              Unit: entry[Object.keys(entry)[1]],
              Ingredient: entry[Object.keys(entry)[2]]
            };
            allRecipeIngredients.push(recipeIngredientRow);
            //if already exists an entry
          } else {
            recipeDirections = {
              Name: entry[Object.keys(entry)[0]],
              Directions: entry[Object.keys(entry)[1]],
              Time: entry[Object.keys(entry)[2]],
              People: entry[Object.keys(entry)[3]]
            };
          }
        })
        .value();
      if (fileTypeIngredients) {
        if (recipes[num] != null) {
          recipes[num]["Ingredients"] = allRecipeIngredients;
        } else {
          const recipe = {
            Ingredients: allRecipeIngredients,
            Description: {}
          };
          recipes[num] = recipe;
        }
      } else {
        if (recipes[num] != null) {
          recipes[num].Description = recipeDirections;
        } else {
          const recipe = {
            Ingredients: null,
            Directions: recipeDirections
          };
          recipes[num] = recipe;
        }
      }
    }
  });
}

function recipesAndIngredients(fileNumber) {
  const file1 = "recipe" + fileNumber + "_ingredients.csv";
  const file2 = "recipe" + fileNumber + "_directions.csv";
  parseFile(file1);
  parseFile(file2);
}

function readListOfRecipes(list) {
  list.map(num => {
    recipesAndIngredients(num);
  });
}

function printListOfRecipes(list) {
  list.map(num => {
    printRecipe(num);
  });
}

function alphatizeByName(recipeList) {
  const sorted = _.orderBy(
    recipeList,
    function (e) {
      return e.Description.Name;
    }, ["asc"]
  );
  return sorted;
}

function lessThanIngredienst(recipeList, numIngredients) {
  const filtered = _.filter(
    recipeList,
    function (recipe) {
      return Object.keys(recipe.Ingredients).length < numIngredients
    }
  )
  return filtered;
}

function recipeContains(recipeList, keyWord) {
  const filtered = _.filter(
    recipeList,
    function (recipe) {
      return (recipe.Description.Directions).search(keyWord) > 0 ||
        (recipe.Description.Name).search(keyWord) > 0
      // ||
      // (recipe.Ingredients).map(ingredient =>
      //   ingredient.Ingredient.search(keyWord) > 0
      // )
    }
  )
  return filtered;
}

function printRecipe(num) {
  console.log("\n\n\nPRINTING RECIPE " + recipes[num].Description.Name);
  console.log("\n ---INGREDIENTS --- \n", recipes[num].Ingredients);
  console.log(
    "\n\n ---NUMBER OF PEOPLE --- \n",
    recipes[num].Description.People
  );
  console.log("\n\n ---TIME --- \n", recipes[num].Description.Time);
  console.log("\n\n ---DIRECTIONS --- \n", recipes[num].Description.Directions);
}

recipesToRead = [0, 1, 2, 3];

readListOfRecipes(recipesToRead);
//printListOfRecipes(recipesToRead);

console.log("LIST:::: ", recipes[0].Ingredients);

sorted = alphatizeByName(recipes);
const toPrint = sorted.map(recipe => recipe.Description.Name);
console.log("sorted", toPrint);

fewIngredients = lessThanIngredienst(recipes, 7);
const toPrint2 = fewIngredients.map(recipe => recipe.Description.Name);
console.log("filtered", toPrint2);

recipesWithKeyWord = recipeContains(recipes, "meat");
const toPrint3 = recipesWithKeyWord.map(recipe => recipe.Description.Name);
console.log("filtered", toPrint3);