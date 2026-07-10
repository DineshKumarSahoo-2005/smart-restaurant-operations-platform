import Recipe from "../models/Recipe.js";
import Menu from "../models/Menu.js";

export const createRecipe = async (req, res) => {
  try {
    const { menuItem, ingredients } = req.body;

    const menu = await Menu.findById(menuItem);

    if (!menu) {
      return res.status(404).json({
        success: false,
        message: "Menu Item Not Found",
      });
    }

    const existingRecipe = await Recipe.findOne({
      menuItem,
    });

    if (existingRecipe) {
      return res.status(400).json({
        success: false,
        message: "Recipe Already Exists",
      });
    }

    const recipe = await Recipe.create({
      menuItem,
      ingredients,
    });

    res.status(201).json({
      success: true,
      recipe,
    });

  } catch (error) {

    res.status(500).json({
      success:false,
      message:error.message
    });

  }
};

export const getRecipe = async (req,res)=>{

const recipe=await Recipe.findOne({
menuItem:req.params.menuId
})
.populate("menuItem")
.populate("ingredients.inventoryItem");

res.json({

success:true,

recipe

});

}