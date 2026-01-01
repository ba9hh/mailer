import Product from "../models/Product.js";

export const createProduct = async (req, res) => {
  console.log(req.body)
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getProducts = async (req, res) => {
  const products = await Product.find().populate("category");
  res.json(products);
};
export const getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    const products = await Product.find()
      .populate({
        path: "category",
        match: { name: { $regex: new RegExp(`^${category}$`, "i") } } // case insensitive
      });

    // filter out products with no matched category
    const filtered = products.filter(p => p.category);

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getProductBySlug = async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug }).populate("category");
  if (!product) return res.status(404).json({ message: "Product not found" });
  res.json(product);
};

export const updateProduct = async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(product);
};

export const deleteProduct = async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ message: "Product deleted" });
};