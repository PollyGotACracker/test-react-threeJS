export const convertMeshName = (string) => {
  switch (string) {
    case "bread":
      return "Rye Bread";
    case "bread001":
      return "Pineapple Bun";
    case "bread002":
      return "Long Baguette";
    case "bread003":
      return "Short Baguette";
    default:
      return "";
  }
};
