export const validateOrder = (body) => {
  if (!body.items) {
    return {
      valid: false,
      message: "Order items are required",
    };
  }

  if (!Array.isArray(body.items)) {
    return {
      valid: false,
      message: "Items must be an array",
    };
  }

  if (body.items.length === 0) {
    return {
      valid: false,
      message: "Order cannot be empty",
    };
  }

  for (const item of body.items) {
    if (!item.menuItem) {
      return {
        valid: false,
        message: "Menu Item Required",
      };
    }

    if (item.quantity <= 0) {
      return {
        valid: false,
        message: "Quantity must be greater than zero",
      };
    }
  }

  return {
    valid: true,
  };
};
